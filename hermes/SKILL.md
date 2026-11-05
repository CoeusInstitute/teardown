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
- Build in a working folder outside `$TD`; outputs land in `./teardown-out` (or `$TEARDOWN_OUT`). Deliverables go to `$HERMES_OUTPUT_DIR/generated/teardown/` (default `Documents/Hermes_Output`; the 3 example films, live pages, sheets and the deploy folder `site/` already sit there).

## When to Use

- Someone asks how a machine works and wants to see it: a simulator, cutaway, exploded view, visual explainer, interactive 3D lesson.
- A mechanism with moving parts and real numbers: engines, gear trains, linkages, landing gear, pumps, escapements, robots, or an invented machine with a defined model.
- A 60 fps video of a machine running, with a synced score, for a feed.

- A hover-driven 3D asset that another page embeds (a website section themed by the host's tokens, no film): see **Variant: an embeddable hover asset** below.

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

`references/visual-learning.md` catalogues the author's gallery (7 simulators, 40 SVG step-explainer figures) and its conventions. A local mirror of every page sits in `$TD/hermes/site/`: per slug a 1600 x 900 screenshot (`.jpg`), the visible text (`.json`), the HTML as served, the share card and the gallery card, with `index.json` listing them (47 pages, 40 MB, mirrored 2026-11-03). Read the screenshot with `vision_analyze` and the JSON for the panel inventory. The simulator HTML runs offline from `file://` (models are inlined; checked on the sandworm and jellyfish), so you can drive a reference without the network. Refresh or extend it:

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
- **Delete the `.env.local` that `vercel link` writes into the deploy folder.** Why: it holds a live `VERCEL_OIDC_TOKEN`, and the folder sits in OneDrive-synced `Hermes_Output`, which the weekly backup zips. Fix: `rm <out>/.env.local` right after linking; a static deploy never needs it (the CLI did not upload it, `/.env.local` returned 404).

## Variant: an embeddable hover asset

The kit builds a full page plus a film. A section of someone else's site needs a module instead, and the kit's rules still hold: one pure model drives every motion and every number, the part doing the work opens up, one accent, and the review loop runs on real renders. Reference build: `Hermes_Output\generated\teardown\coeus-pipeline` (coeus.institute landing asset, 2026-11-04). Copy its shape:

- `src/model.js` (pure, two clocks: a stream clock for continuous motion and counters, a tour clock for what is open) plus `model.check.mjs` asserting counters step exactly when the motion crosses the point that defines them.
- `src/<name>.js` exporting `mount(element, options) -> { destroy, refreshTheme }`: renderer with `alpha`, DOM label layer projected from 3D anchors, hover via invisible proxy boxes, auto tour that pauses on pointer entry and resumes 1.5 s after leave, IntersectionObserver gating, `prefers-reduced-motion` freezing on the final state, colours read live from the host's CSS tokens through a 1x1 canvas (`fillStyle = token; getImageData`, handles oklch) with a MutationObserver on `<html>`.
- A React wrapper that lazy-`import()`s the module, a `.d.ts`, an offline demo that inlines the host's real token file and fonts, and a README for the placing agent.
- `tools/review.mjs` (frozen stills per tour beat and per theme, real-mouse hover runs, reduced motion, destroy check) and `tools/lum.py` (content bbox and luminance percentiles), so composition and exposure are measured, not guessed.

Michai's bar for these explainer graphics: he supplies reference photos of the real equipment and expects the models rebuilt to look polished and somewhat realistic, checked with `vision_analyze` against those photos; the test he applies is whether a first-time viewer can watch the graphic and understand what the system does with the data. He judges clutter hard: structural props that carry no part of the story (arches over a belt, brackets, funnels, cable trays, leader lines, extra legs) read as visual chaos and should not be there in the first place; a ranked result belongs in ordered rows, not at scattered heights, and an intermediate object whose meaning is not obvious at a glance is better folded into the payoff. The payoff should show what the system produced: a screen squared to the camera whose views are drawn from the records that actually arrived (cycling the delivery formats), not a static picture. Hovering or touring one part should lift it and gently dim the rest, and the tour should open on the whole scene unfocused for a few seconds.

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
- **At a near-orthographic lens (fov 24) a card turned about its vertical axis still reads as a flat icon.** Why: there is no convergence, and a 12 mm edge projects to under a pixel. Fix, for cards that stay in the scene: 30 mm thickness, about 30 degrees of turn plus a small tip, and `castShadow` so it sits on what it came out of. Cards that exist to be read (hover details, legends) go the other way: render them as flat DOM elements animated in screen space from the projected point they come out of, because even a 7 degree turn on a 3D card reads as skew to a viewer and its edges render soft (Michai's fourth note on the Coeus asset).
- **Spotlight a focused part with three render passes, not recoloured materials.** Why: materials are shared across parts, and cloning per part to dim the rest doubles state and breaks theme updates. Fix: `renderer.autoClear = false`; render the scene; draw a full-screen `ShaderMaterial` quad outputting `vec4(pageColour * k, k)` with `CustomBlending`, `blendSrc: DstAlphaFactor`, `blendDst: OneMinusSrcAlphaFactor`, `blendSrcAlpha: ZeroFactor`, `blendDstAlpha: OneFactor`, so drawn pixels fade toward the page and transparent ones (the host page) stay untouched; then `camera.layers.set(1)` and render again, with the focused objects enabled on layer 1 (default `LessEqualDepth` lets the equal-depth redraw win, occluders stay dimmed). The lights must also be enabled on layer 1, and set `shadowMap.autoUpdate = false` with `needsUpdate = true` once per frame, or the focus pass rebuilds shadows from the focused objects alone. A light page washes out sooner, so use a weaker veil there (0.32 against 0.42).
- **Fit the camera to the points that carry content, not to a bounding box.** Why: empty box corners cost about 10 percent of the frame. Fix: binary-search the distance on the projected extent of real points (plinth corners, the top of each exploded column plus its label width), then `camera.setViewOffset` to centre the result.
- **One light rig cannot serve a host's dark and light themes.** Why: the same intensities left dark albedos murky (median luminance 61 on a 29 background) and clipped light mode (median 255). Fix: set light intensities per mode inside the palette function and re-measure with `lum.py`.
- **Clamp `dt` at zero when the first frame is called with `performance.now()`.** Why: the next rAF timestamp can be earlier, so `dt` goes negative and any index built from accumulated time goes to -1. Fix: `Math.max(0, ...)` and a positive modulo.
- **Do not act on a whole-frame `vision_analyze` critique alone.** Why: at full-frame scale it misreads small parts and can report lines or labels as missing that a crop shows are there. Fix: re-check every claimed defect on a `region` crop, and measure coverage and exposure with pixels before changing lighting or layout.
- **Make "kinds of data" and "data in motion" look different.** Why: catalog cards and moving records sharing one paper face and edge read as the same objects flying into the intake (Michai's first note on the Coeus asset). Fix: catalog cards larger and accent-framed; records small and plain with neutral edges, gaining the accent only as a score bar or when they pass.
- **Put hover details in one tray row below the diorama, never over the models.** Why: cards, captions and example chips floating above or beside the scene overlapped the models and were hard to read (Michai's second note). Fix: anchor every detail (a source's cards, a stage's example, the answer and its formats) to a row below the plinth, under the hovered part; a tray proxy keeps the last subject open, a 450 ms grace covers the gap on the way down, and each hover box is its object's own footprint, because at a three-quarter camera a deep box (an open door's swing, the space in front of a router) projects under a neighbour and hijacks the path. Prove it with a probe that moves a real mouse in 25 ms steps and reads the DOM label opacity at each step (`tools/tray-probe.mjs` in the reference build).
- **Check interactive state from the DOM, not from a contact-sheet thumbnail.** Why: `vision_analyze` reported the wrong tray contents for one tile of a 12-tile sheet; the DOM probe showed the state was correct. Fix: read opacity or class state with `page.evaluate`, and use vision for appearance only.
- **Thin dark props vanish on a dark page at web scale.** Why: a router at real size had 85 x 20 px of body and 3 px antennas the same tone as the page. Fix: draw hero props 1.3 to 1.5 times real size, lift their tone a step from the page, keep thin parts at 25 mm or more, and copy real proportions from a reference photo (racks 0.6 to 0.7 m wide, not 1.4 m fridges).
- **Collapse overlay labels by measured spacing, not a width breakpoint, and degrade to numbers, not to nothing.** Why: a 1100 px rule overlapped at 1200 x 900 and would have hidden names at 1600 x 900, because crowding depends on aspect as well as width; later, hiding every stage label below the threshold left the belt unlabelled inside the host's 1200 px container, and a single source-name threshold hid all four names because perspective makes the far-left pair project tighter (86 px against 95 px for the same 0.9 m). Fix: after each camera fit, project neighbouring anchors and compare each pair against half of each label's measured `offsetWidth` plus a small gap; when names collide keep the step numbers visible and show the full name only on the active step; refit when the web fonts arrive. `tools/probe.mjs` in the reference build prints numbers, names and overlapping boxes at nine sizes.
- **Start the stream clock one period in, and test a fresh load in a real mount.** Why: frozen-time review stills always showed a full payoff screen, but a fresh page load sat empty for 16 s until the first record arrived, and reduced motion froze at 14 s, before any arrival, so its screen stayed empty for good. Fix: `streamT = PERIOD` at mount (the schedule repeats, so the motion is identical) and the reduced-motion freeze at `PERIOD + 14`; check a live mount screenshot a few seconds after load, not only frozen stills.
- **Prove readiness for the host in a scratch project at the host's exact versions.** Why: a separate placing agent will build the real site, and failures there cost a round trip. Fix: read the host's `vite.config`, ESLint config, `tsconfig` and container width (read only), then build a scratch Vite + React project at those versions, mounting the wrapper inside `React.StrictMode` (which double-mounts in dev). Check one WebGL canvas, one root, a clean console and a lazy 3D chunk, in both dev and preview. Run the host's own ESLint config at its exact versions on copies, and run its type check read-only for a baseline. Hand over a README that opens with a paste-ready kickoff prompt and lists the owner decisions, such as host rules the asset brushes against (the Coeus site's "never fabricate dashboards or metrics").

## Verification

- `build.mjs` prints each page and its size; under 1 MB for anything published.
- `capture.mjs` prints a real GPU (`ANGLE (NVIDIA ...)` or the like), not SwiftShader.
- The final film: `ffprobe` shows h264 `yuv420p` `color_range=tv` at 60 fps plus aac; `wave.mjs` shows −14 ±1 LUFS and a true peak ≤ −1 dBFS.
- Every sheet read with `vision_analyze`; every published URL fetched after deploy.

## Credits

Built by Elvar ([elvarofficial/teardown](https://github.com/elvarofficial/teardown), MIT), forked at [CoeusInstitute/teardown](https://github.com/CoeusInstitute/teardown). The kit, frame capture, sfx engine and review rules come from [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT); recorded samples are CC0 from Freesound via [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics). The Hermes layer (this folder): the brief, the field guide, the visual-learning catalogue and mirror, `reference.mjs`, `publish.mjs` and the Pitfalls.
