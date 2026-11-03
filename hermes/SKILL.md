---
name: teardown
description: Use when a machine should be a 3D simulator to take apart.
version: 2.0.0
author: Elvar (elvarofficial), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [three.js, simulator, 3d, mechanism, explainer, video, cutaway]
    related_skills: [anatomy, claude-design, p5js]
---

# Teardown

Builds a real machine as one offline three.js page people take apart: the part doing the work opens up while live panels read the same model that moves the parts, and an auto tour hands control to the visitor. The same code records the tour frame by frame to a 60 fps film with a procedural score.

Two layers. This file is the Hermes layer: paths, the brief, the console, the review loop, publishing, pitfalls. The kit manual, `$TD/SKILL.md`, is the author's build guide: how a machine is split into files, the seven rules, the `render(t)` contract, the commands, the three.js traps, sound and taste. **Read the kit manual in full with `read_file` before writing any machine code.** Where the two disagree, this file wins.

## Layout

- `TD="${USERPROFILE:-$HOME}/.local/share/teardown"`: a clone of `CoeusInstitute/teardown`, the fork of `elvarofficial/teardown` (MIT). In the kit manual, `SKILL_DIR` means `$TD`.
- Upstream files are never edited. Everything Hermes adds lives in `$TD/hermes/`, and that folder is this skill (`skills/creative/teardown` is a junction to it). So merging the author's updates cannot conflict.
- Build in a working folder outside `$TD`; outputs land in `./teardown-out` (or `$TEARDOWN_OUT`). Deliverables go to `${HERMES_OUTPUT_DIR}/generated/teardown/`.

## When to Use

- Someone asks how a machine works and wants to see it: a simulator, cutaway, exploded view, visual explainer, interactive 3D lesson.
- A mechanism with moving parts and real numbers: engines, gear trains, linkages, landing gear, pumps, escapements, robots, or an invented machine with a defined model.
- A 60 fps video of a machine running, with a synced score, for a feed.

Don't use for: isometric SVG figures of software or data systems (`anatomy`), architecture or flow diagrams (`architecture-diagram`, `diagram-design`), generic landing pages or decks (`claude-design`), generative art (`p5js`).

## First run

```
terminal(command='cd "$USERPROFILE/.local/share/teardown" && npm install && npx playwright install chromium', timeout=600)
```

Needs Node 20+. The video needs `ffmpeg` and `ffprobe` on PATH and the score needs Python 3 (standard library only). `FFMPEG`, `FFPROBE`, `PYTHON`, `CHROMIUM`, `TEARDOWN_OUT` and `TEARDOWN_DEPS` override the defaults. `node_modules/` and `teardown-out/` are gitignored.

## Brief before you build

Most of the quality is decided before the first line of geometry. Settle these five with the user, or answer them yourself and say so:

1. **The machine and its one input.** Crank angle, stroke 0..1, wind speed, gait phase. A whole mechanism posed from one number is a mechanism; twelve parts animated by hand are twelve animations.
2. **A reference.** A cutaway from a manual, a photo, a clip of the real thing. Without one the build comes out a generic toy; with one clip of a real V8 the same model rebuilt it panel by panel. If the user has none, find one with `web_search` and read it with `vision_analyze` before modelling. For console and layout patterns, open the closest page in the local mirror (below).
3. **The real numbers, checked by hand.** Write the model as pure functions of the input first and show the check. Cessna: 32 teeth at module 4 mm is a 128 mm pitch diameter; half its circumference is 201 mm, the rack's stroke, so the legs turn exactly 180°. Mark any number you are not sure is real and say where it comes from.
4. **The console.** The big live number, the charts that move with the machine, the 2D schematic, one button per subsystem, the camera views.
5. **The deliverable.** Live page only, page plus film, or page, film and a public URL.

`references/field-guide.md` holds the paste-ready brief for every stage (build, console, look, critic pass, live page, film, score, publish, break-it slider) with the numbers behind each line. A new machine is a multi-hour build: copy the closest example, have a page that opens in the browser within the first hour, and deepen it from there.

## The console

Lay it out at 1600 x 900 around the machine, which fills 60-70% of its view:

- Title and the main live number top left, big.
- Live charts that move with the machine; a chart that moves with the part is the reason people stay (the V8's p-V loop closes once every 720° of crank and you watch it close).
- A schematic panel that redraws the mechanism in 2D from the same model.
- One button per subsystem (isolate, cut, show alone) and camera views as buttons.
- Callouts with thin leader lines into the parts they name.
- A keyboard hint line, numbered panel groups, a spec block of real figures and an `AUTO TOUR · CLICK TO TAKE OVER` chip: the published pages' conventions, catalogued in `references/visual-learning.md`.

## Reference shelf

`references/visual-learning.md` catalogues the author's gallery (7 simulators, 40 SVG step-explainer figures) and its conventions. A local mirror of every page sits in `$TD/hermes/site/`: per slug a 1600 x 900 screenshot (`.jpg`), the visible text (`.json`), the HTML as served, the share card and the gallery card, with `index.json` listing them. Read the screenshot with `vision_analyze` and the JSON for the panel inventory. Refresh or extend it:

```
node "$TD/hermes/scripts/reference.mjs" --all --out "$TD/hermes/site"     # every page, about 10 minutes
node "$TD/hermes/scripts/reference.mjs" hexapod https://example.com/sim   # one-offs → ./teardown-out/reference
```

The pages carry no licence, so the mirror is a private study copy: `hermes/site/` is gitignored and must never be committed, published or shipped. Take patterns, not code; the MIT source is the 3 machines in `$TD/sims/`.

## Commands that differ from the kit manual

- **Review sheet:** `--stills every:1` instead of `--stills beats` until the machine's `timeline.json` carries beats (the shipped ones hold only `duration`).
- **Final mux converts the colour range.** `capture.mjs` pipes full-range JPEG frames, so the silent film is `yuvj420p` (`color_range=pc`). Re-encode once while muxing:

```
ffmpeg -y -i teardown-out/v8-silent.mp4 -i teardown-out/v8-score.wav -map 0:v -map 1:a -vf scale=out_range=tv -pix_fmt yuv420p -c:v libx264 -preset slow -crf 16 -c:a aac -b:a 256k -shortest -movflags +faststart teardown-out/v8.mp4
```

- A 26 s film at 1920 x 1080 takes about 1.5 minutes to capture on a discrete GPU; run full films with `terminal(background=True, notify=True)`.

## Review loop

You cannot watch the video; you can look at frames. Follow the kit manual's review loop and read every sheet with `vision_analyze`. Never report a machine as done without reading sheets of the current render. Then tell the user what you checked and what you fixed, and show the sheets.

## Deliver and publish

- In the desktop app, hand over the page and the film as `MEDIA:/absolute/path` lines; the HTML opens offline from `file://`.
- Publishing is a public, external action: deploy only when the user asks.
- `hermes/scripts/publish.mjs <spec.json>` turns built live pages into a deploy folder: title and share-card meta with absolute URLs, a 1200 x 630 card per page rendered from its film at a chosen second, an index page, `vercel.json` (clean URLs) and the licence. It refuses a page over 1 MB or a relative site URL. `hermes/publish/examples.json` is the spec for the 3 shipped machines, live at https://coeus-teardown.vercel.app (Vercel project `coeus-teardown`, team `coeusinstitutes-projects`).
- Deploy: `cd <out> && vercel link --yes --project <project> --scope <team>` once, then `vercel deploy --prod --yes`. Afterwards fetch every page, card and the index from the public URL and confirm 200s and the `og:image` meta before reporting it live.

## Updating upstream

```
git -C "$TD" fetch upstream && git -C "$TD" merge upstream/main && git -C "$TD" push origin main
git -C "$TD" diff ORIG_HEAD HEAD -- SKILL.md package.json sims/capture.mjs
```

The merge cannot conflict while Hermes only adds files under `hermes/`. Read the second command's output: adjust this layer if a kit rule now contradicts it, re-run `npm install` if `package.json` changed, and drop the mux re-encode once `capture.mjs` writes `yuv420p` itself (reported upstream as elvarofficial/teardown#8 on 2026-11-03; that repository does not accept pull requests from outside collaborators).

## Pitfalls

- **Never edit an upstream file in `$TD`.** Why: every upstream edit is a future merge conflict, which is why the fork was restructured into the `hermes/` overlay. Fix: put Hermes behaviour in this file, in `hermes/scripts/`, or in the documented commands.
- **`write_file` may refuse a file under the junction even after a full read.** Why: the stale-read guard sees two paths for one file. Fix: write through the real `$TD/hermes/...` path, or delete and re-create.
- **The shipped `timeline.json` files hold only `duration`.** The example films and scores keep their beat times in `film.js` `SCRIPT` and `score.py` constants, so `--stills beats` renders frame 0 alone and `wave.mjs` draws 0 beat lines. A new machine writes its beats into its timeline and reads them in `score.py`.
- **`npm install` warns that esbuild's install script was blocked.** Harmless on npm 11: the platform binary arrives as an optional dependency and `build.mjs` bundles fine.
- **A loudness warning on a clip shorter than the score is expected.** `wave.mjs` measures what it is given; check the full-length mux.
- **`vision_analyze` can 403 while chat still works.** It shares the OpenRouter key's spend cap. Wait for the reset; never skip the review and call it done.
- **The published simulators carry fiction panels** (operator names, "neural node activity") on invented machines. A real machine gets no invented telemetry: every number comes from the model, and typical figures are labelled as typical.

## Verification

- `build.mjs` prints each page and its size; under 1 MB for anything published.
- `capture.mjs` prints a real GPU (`ANGLE (NVIDIA ...)` or the like), not SwiftShader.
- The final film: `ffprobe` shows h264 `yuv420p` `color_range=tv` at 60 fps plus aac; `wave.mjs` shows −14 ±1 LUFS and a true peak ≤ −1 dBFS.
- Every sheet read with `vision_analyze`; every published URL fetched after deploy.

## Credits

Built by Elvar ([elvarofficial/teardown](https://github.com/elvarofficial/teardown), MIT), forked at [CoeusInstitute/teardown](https://github.com/CoeusInstitute/teardown). The kit, frame capture, sfx engine and review rules come from [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT); recorded samples are CC0 from Freesound via [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics). The Hermes layer (this folder): the brief, the field guide, the visual-learning catalogue and mirror, `reference.mjs`, `publish.mjs` and the Pitfalls.
