#!/usr/bin/env node
// Study reference pages before building: a 1600x900 screenshot after the shaders compile, the page's visible text
// (panel titles, buttons, readouts, keyboard hints), the HTML as served, and its share card. Read the JPG with
// vision, the JSON for the panel inventory.
//
//   node hermes/scripts/reference.mjs hexapod v8-engine        visual-learning.app slugs
//   node hermes/scripts/reference.mjs https://example.com/sim  any URL
//   node hermes/scripts/reference.mjs --all --out hermes/site   mirror every page listed on visual-learning.app
//   options: --wait 9000 (ms after load)  --size 1600x952 (52 px site bar + a 1600x900 console)  --out <dir>
//   → <out>/<slug>.jpg .json .html -og.png -card.webp, plus <out>/index.json (default out: teardown-out/reference)
//
// The visual-learning pages carry no licence: a mirror is a private study copy. hermes/site/ is gitignored; never
// commit or publish it.
import fs from 'node:fs';
import path from 'node:path';
import {CHROMIUM, CHROMIUM_ARGS, OUT, playwright} from '../../paths.mjs';

const SITE = 'https://visual-learning.app';
const argv = process.argv.slice(2);
const flag = (k) => {
  const i = argv.indexOf(`--${k}`);
  return i !== -1 && argv.splice(i, 1).length > 0;
};
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i === -1 ? d : argv.splice(i, 2)[1];
};
const wait = Number(opt('wait', 9000));
const [W, H] = opt('size', '1600x952').split('x').map(Number);
const dir = path.resolve(opt('out', path.join(OUT, 'reference')));
const all = flag('all');

// Gallery cards by slug, read from the home page (only needed for --all or visual-learning slugs).
const cards = {};
if (all || argv.some((a) => !/^https?:/.test(a) || a.startsWith(SITE))) {
  const home = await (await fetch(SITE)).text();
  for (const [, slug, card] of home.matchAll(/<a class="fig-card" href="\/([a-z0-9-]+)">[\s\S]*?<img src="([^"]+)"/g)) cards[slug] = SITE + card;
  if (all) argv.push(...Object.keys(cards));
}
if (!argv.length) {
  console.error('usage: node reference.mjs <slug|url> [...] | --all  [--out dir] [--wait ms] [--size WxH]');
  process.exit(1);
}
fs.mkdirSync(dir, {recursive: true});

const download = async (url, file) => {
  const res = await fetch(url);
  if (!res.ok) return null;
  fs.writeFileSync(path.join(dir, file), Buffer.from(await res.arrayBuffer()));
  return file;
};

const indexFile = path.join(dir, 'index.json');
const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : {};
const browser = await playwright().chromium.launch({executablePath: CHROMIUM, args: CHROMIUM_ARGS});
let failed = 0;
for (const arg of argv) {
  const url = /^https?:/.test(arg) ? arg : `${SITE}/${arg}`;
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'index';
  const page = await browser.newPage({viewport: {width: W, height: H}});
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const res = await page.goto(url, {waitUntil: 'load', timeout: 60000});
    if (!res?.ok()) throw new Error(`HTTP ${res?.status()}`);
    fs.writeFileSync(path.join(dir, `${slug}.html`), await res.body());
    await page.waitForTimeout(wait);
    const info = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name=description]')?.content ?? null,
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? null,
      canvases: document.querySelectorAll('canvas').length,
      buttons: [...document.querySelectorAll('button,[role=button]')].map((b) => b.innerText.trim()).filter(Boolean),
      text: document.body.innerText.replace(/\n\s*\n/g, '\n').trim(),
    }));
    await page.screenshot({path: path.join(dir, `${slug}.jpg`), type: 'jpeg', quality: 85});
    const files = [`${slug}.jpg`, `${slug}.json`, `${slug}.html`];
    if (info.ogImage) files.push(await download(new URL(info.ogImage, url).href, `${slug}-og.png`));
    if (cards[slug]) files.push(await download(cards[slug], `${slug}-card.webp`));
    const kind = info.canvases ? 'webgl' : 'svg';
    fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({url, kind, ...info, errors}, null, 2));
    index[slug] = {url, kind, title: info.title, description: info.description, files: files.filter(Boolean), fetched: new Date().toISOString()};
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2)); // per page, so a crash keeps what is done
    console.log(`${slug}: ${kind}, ${info.text.split('\n').length} text lines, ${files.filter(Boolean).length} files`);
  } catch (e) {
    failed++;
    console.error(`${slug}: ${e.message}`);
  }
  await page.close().catch(() => {});
}
await browser.close();
console.log(`${Object.keys(index).length} pages in ${indexFile}${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
