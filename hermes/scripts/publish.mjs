#!/usr/bin/env node
// Turn built live pages into a deployable folder: share-card meta with absolute URLs, a 1200x630 card per page
// rendered from its film at a chosen second, an index page, vercel.json and the licence. Deploy the folder after.
//
//   node hermes/scripts/publish.mjs hermes/publish/examples.json [outDir]   (build the pages and films first)
//   spec: {"site": "https://<project>.vercel.app", "out": "teardown-out/site", "title": "...", "intro": "...",
//          "pages": [{"name": "v8-live", "film": "v8-film", "og": 12.5, "slug": "v8-engine",
//                     "title": "...", "description": "..."}]}
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DIST, FFMPEG, OUT} from '../../paths.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MAX = 1024 * 1024; // link crawlers give up on bigger pages, so the share card never shows
const specFile = process.argv[2];
if (!specFile) {
  console.error('usage: node hermes/scripts/publish.mjs <spec.json>');
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const site = spec.site.replace(/\/$/, '');
if (!/^https:\/\//.test(site)) throw new Error('site must be an absolute https URL: crawlers ignore relative card URLs');
const out = path.resolve(process.argv[3] ?? spec.out ?? path.join(OUT, 'site'));
fs.mkdirSync(out, {recursive: true});

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const meta = ({title, description, image, url}) =>
  [
    `<meta name="description" content="${esc(description)}">`,
    `<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}">`,
  ].join('\n');

const card = (film, t, file) => {
  const still = path.join(OUT, `publish-${film}-${t}.png`);
  // 1600x900 at dpr 0.75 is 1200x675; crop the centre 630 rows for the 1.91:1 card
  execFileSync('node', [path.join(ROOT, 'sims/capture.mjs'), film, '--size', '1600x900', '--dpr', '0.75', '--still', String(t), '--out', still], {stdio: 'inherit'});
  execFileSync(FFMPEG, ['-loglevel', 'error', '-y', '-i', still, '-vf', 'crop=1200:630', path.join(out, file)]);
};

const rows = [];
for (const p of spec.pages) {
  const src = path.join(DIST, `${p.name}.html`);
  if (!fs.existsSync(src)) throw new Error(`missing ${src}: run node sims/build.mjs ${p.name}`);
  const image = `${site}/${p.slug}-og.png`;
  const html = fs
    .readFileSync(src, 'utf8')
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace('</head>', `${meta({title: p.title, description: p.description, image, url: `${site}/${p.slug}`})}\n</head>`);
  if (Buffer.byteLength(html) > MAX) throw new Error(`${p.slug}.html is ${Buffer.byteLength(html)} bytes, over 1 MB: move models out (build.json external)`);
  if (!html.includes(`content="${image}"`)) throw new Error(`${p.slug}: meta not injected (no </head>?)`);
  fs.writeFileSync(path.join(out, `${p.slug}.html`), html);
  card(p.film, p.og, `${p.slug}-og.png`);
  rows.push(p);
  console.log(`${p.slug}.html  ${Math.round(Buffer.byteLength(html) / 1024)} KB  card at t=${p.og}`);
}

const first = rows[0];
const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(spec.title)}</title>
${meta({title: spec.title, description: spec.intro, image: `${site}/${first.slug}-og.png`, url: site})}
<style>
body{margin:0;background:#efeee6;color:#23263a;font:15px/1.5 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
main{max-width:1180px;margin:0 auto;padding:48px 24px}
h1{font-size:34px;margin:0 0 8px;letter-spacing:-.01em}
.intro{max-width:720px;color:#4b4f5c;margin:0 0 32px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
a.card{display:block;background:#fff;border:1px solid #d6d6cb;border-radius:8px;overflow:hidden;color:inherit;text-decoration:none}
a.card:hover{border-color:#e8491d}
a.card img{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover;background:#e6e5dc}
.txt{padding:14px 16px 18px}.name{font-weight:700;font-size:17px}
.go{font:600 11px ui-monospace,Consolas,monospace;letter-spacing:.08em;color:#e8491d;margin-top:8px}
footer{margin-top:40px;font:12px ui-monospace,Consolas,monospace;color:#6c7266}
footer a{color:inherit}
</style></head><body><main>
<h1>${esc(spec.title)}</h1>
<p class="intro">${esc(spec.intro)}</p>
<div class="grid">
${rows.map((p) => `<a class="card" href="/${p.slug}"><img src="/${p.slug}-og.png" alt="${esc(p.title)}" loading="lazy"><div class="txt"><div class="name">${esc(p.title)}</div><div>${esc(p.description)}</div><div class="go">DRIVE IT →</div></div></a>`).join('\n')}
</div>
<footer>${spec.credits ?? ''} <a href="/LICENSE.txt">MIT licence</a>. First load compiles the shaders and takes a few seconds on built-in graphics.</footer>
</main></body></html>
`;
fs.writeFileSync(path.join(out, 'index.html'), index);
fs.copyFileSync(path.join(ROOT, 'LICENSE'), path.join(out, 'LICENSE.txt'));
fs.writeFileSync(path.join(out, 'vercel.json'), JSON.stringify({cleanUrls: true}, null, 2) + '\n');
console.log(`→ ${out}  (${rows.length} pages, index, vercel.json, LICENSE.txt). Deploy: cd "${out}" && vercel deploy --prod --yes`);
