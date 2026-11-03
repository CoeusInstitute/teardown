#!/usr/bin/env node
// Study a reference page before building: a 1600x900 screenshot plus the page's visible text (panel titles,
// buttons, readouts, keyboard hints) after its shaders have compiled. Read the PNG with your eyes, the JSON for the
// panel inventory. Patterns only: the live pages on visual-learning.app are not MIT source.
//
//   node reference.mjs hexapod v8-engine            visual-learning.app slugs
//   node reference.mjs https://example.com/sim      any URL
//   options: --wait 9000 (ms after load)  --size 1600x952 (52 px site bar + a 1600x900 console)
//   → teardown-out/reference/<slug>.png and <slug>.json
import fs from 'node:fs';
import path from 'node:path';
import {CHROMIUM, CHROMIUM_ARGS, OUT, playwright} from './paths.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i === -1 ? d : argv.splice(i, 2)[1];
};
const wait = Number(opt('wait', 9000));
const [W, H] = opt('size', '1600x952').split('x').map(Number);
if (!argv.length) {
  console.error('usage: node reference.mjs <slug|url> [...] [--wait ms] [--size WxH]');
  process.exit(1);
}
const dir = path.join(OUT, 'reference');
fs.mkdirSync(dir, {recursive: true});

const browser = await playwright().chromium.launch({executablePath: CHROMIUM, args: CHROMIUM_ARGS});
let failed = 0;
for (const arg of argv) {
  const url = /^https?:/.test(arg) ? arg : `https://visual-learning.app/${arg}`;
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'index';
  const page = await browser.newPage({viewport: {width: W, height: H}});
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const res = await page.goto(url, {waitUntil: 'load', timeout: 60000});
    if (!res?.ok()) throw new Error(`HTTP ${res?.status()}`);
    await page.waitForTimeout(wait);
    const info = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name=description]')?.content ?? null,
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? null,
      canvases: document.querySelectorAll('canvas').length,
      buttons: [...document.querySelectorAll('button,[role=button]')].map((b) => b.innerText.trim()).filter(Boolean),
      text: document.body.innerText.replace(/\n\s*\n/g, '\n').trim(),
      bytes: document.documentElement.outerHTML.length,
    }));
    await page.screenshot({path: path.join(dir, `${slug}.png`)});
    fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({url, ...info, errors}, null, 2));
    console.log(`${slug}: ${info.canvases ? 'webgl' : 'svg/dom'}, ${info.text.split('\n').length} text lines → ${path.join(dir, slug)}.png`);
  } catch (e) {
    failed++;
    console.error(`${slug}: ${e.message}`);
  }
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
