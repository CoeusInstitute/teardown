---
name: teardown
description: Use when a machine should be a 3D simulator to take apart.
version: 1.1.0
author: Elvar (elvarofficial), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [three.js, simulator, 3d, mechanism, explainer, video, cutaway]
    related_skills: [anatomy, claude-design, p5js]
---

# Teardown

One machine, one page. The visitor sees the thing run, presses a button, and the part doing the work opens up while the gauges around it read the real numbers. Left alone, the page tours itself with a cursor. The same code records a film of the tour, frame by frame, with a score built on the same timeline.

`SKILL_DIR` is this skill's folder (`skill_view` returns it as `skill_dir`; on Windows it is `$LOCALAPPDATA/hermes/skills/creative/teardown`, elsewhere `~/.hermes/skills/creative/teardown`). Builds and renders go to `./teardown-out` of the folder you run from, so `cd` into the machine's working folder first and never build inside `SKILL_DIR`.

## When to Use

- Someone asks how a machine works and wants to see it: a simulator, cutaway, exploded view, visual explainer, interactive 3D lesson.
- A mechanism with moving parts and real numbers: engines, gear trains, linkages, landing gear, pumps, escapements, robots, or an invented machine with a defined model.
- A 60 fps video of a machine running, with a synced score, for a feed.

Don't use for: isometric SVG figures of software or data systems (`anatomy`), architecture or flow diagrams (`architecture-diagram`, `diagram-design`), generic landing pages or decks (`claude-design`), generative art (`p5js`).

## First run

```
terminal(command='cd "$LOCALAPPDATA/hermes/skills/creative/teardown" && npm install && npx playwright install chromium', timeout=600)
```

Needs Node 20+. The pages need nothing else. The video needs `ffmpeg` and `ffprobe` on PATH and the score needs Python 3 (standard library only). Set `FFMPEG`, `FFPROBE`, `PYTHON`, `CHROMIUM`, `TEARDOWN_OUT` or `TEARDOWN_DEPS` to override. `node_modules/` and `teardown-out/` are gitignored.

## Brief before you build

Most of the quality is decided before the first line of geometry. Settle these five with the user, or answer them yourself and say so:

1. **The machine and its one input.** Crank angle, stroke 0..1, wind speed, gait phase. A whole mechanism posed from one number is a mechanism; twelve parts animated by hand are twelve animations.
2. **A reference.** A cutaway from a manual, a photo, a clip of the real thing. Without one the build comes out a generic toy (the author's pangolin, armadillo and scorpion all did); with one clip of a real V8 the same model rebuilt it panel by panel. If the user has none, find one with `web_search` and read it with `vision_analyze` before modelling. For layout and console patterns, study the closest page on visual-learning.app with `node "$SKILL_DIR/reference.mjs" <slug>` (`references/visual-learning.md`).
3. **The real numbers, checked by hand.** Write the model as pure functions of the input first and show the hand check. Cessna: 32 teeth at module 4 mm is a 128 mm pitch diameter; half its circumference is 201 mm, the rack's stroke, so the legs turn exactly 180°. Mark any number you are not sure is real and say where it comes from.
4. **The console.** The big live number, the charts that move with the machine, the 2D schematic, one button per subsystem, the camera views.
5. **The deliverable.** Live page only, page plus film, or page, film and a public URL.

`references/field-guide.md` holds the paste-ready brief for every stage (build, console, look, critic pass, live page, film, score, publish, break-it slider) and the numbered lessons behind each line. A new machine is a multi-hour build: copy the closest example, have a page that opens in the browser within the first hour, and deepen it from there.

## The 3 examples

Build one, open the HTML, press buttons. Copy the closest one when you start a new machine.

| | The machine | What drives it | Worth stealing |
|---|---|---|---|
| `v8-*` | A cross-plane V8 with glass liners: the charge burns inside the cylinder you track, valves lift on their cams, 8 pistons move from the exact slider-crank. | Crank angle. Firing order 1-8-4-3-6-5-7-2, a chamber pressure model for the indicator diagram. | Cutaway modes (glass, section, solid), the firing order as a cylinder picker, live charts synced to the crank. |
| `cessna-*` | The Cessna 337 main landing gear folding into the airframe on takeoff and dropping on landing. | Stroke 0..1: a 201 mm rack turns a 32-tooth pinion (module 4 mm) through exactly 180°. | One degree of freedom posing a whole mechanism, flight phases as functions of time, a runway that rolls under the model. |
| `strandbeest-*` | Theo Jansen's Strandbeest, 20 legs on one crankshaft, walking broadside over sand. | Wind. The crank speed is integrated from it; every joint follows by circle intersection from Jansen's 11 link lengths. | An exact linkage solver in 67 lines, instanced tubes, foot traces, a contact chart of all 20 feet. |

Each comes in 3 folders: `<name>-shared/` holds the machine, `<name>-film/` the recorded tour, `<name>-live/` the page you drive.

```
node "$SKILL_DIR/sims/build.mjs" v8-live          # → teardown-out/dist/v8-live.html, offline, ~800 KB
node "$SKILL_DIR/sims/build.mjs"                  # all 6
```

## How a machine is built

One folder per machine, split by job. The examples follow this exactly:

| File | Job |
|---|---|
| `kin.js` / `gear.js` / `jansen.js` | The math. Real dimensions in real units, one input (crank angle, stroke, wind) and every pose and readout as a function of it. No three.js in here. |
| `engine.js` / `gear.js` / `beast.js` | The geometry, built from code: lathed parts, tubes, instanced links. `update(input)` poses it. |
| `stage.js` | Studio, lights, shadows, post (GTAO, bloom). `frame(state, cam)` draws one frame. |
| `console.js` | The overlay: fixed 1600 x 900 CSS layout of panels, charts, toggles, callouts with leaders. `update(state)` redraws it from the frame's state. |
| `film.js` | A `SCRIPT` of operator moves (views, isolate, cutaway, throttle) and `render(t)` as a pure function of time. |
| `live.js` | The same machine in real time: buttons, sliders, orbit, zoom, keys. With no input it plays `film.js`'s script as an auto tour with a cursor; any click, drag, wheel or key hands control over, 25 s of quiet hands it back. |
| `score.py` | The sound on the film's timeline. |

For a machine outside `SKILL_DIR`, make a folder with a `main.js` and import the kit by name: `import {runSim} from 'teardown-kit/runtime.js'`. Build it with `node "$SKILL_DIR/sims/build.mjs" ./my-machine`.

## Rules that decide whether it works

1. **Start from a reference, never from imagination.** Build against it and compare frame by frame.
2. **Real numbers, one source.** Every gauge, chart and label reads from the same function that poses the parts, so nothing on screen can disagree with the motion. No number on screen is typed in.
3. **One input drives everything.** Nothing is keyframed by hand, so the film, the live page and the score never drift.
4. **The part doing the work opens up.** Isolate it, cut it, x-ray it. A camera that goes inside is worth more than ten orbits.
5. **Light studio, one accent.** Pale backgrounds read in a feed; dark ones lose the first second. The accent marks the thing that is changing. Watch near-white parts on a pale backdrop: give them an ink outline or a darker ground (the Strandbeest's white tubes vanished into cream until it moved onto sand with an outline).
6. **Pick the camera for the mechanism.** A planar linkage seen face-on collapses into a lattice; a 3/4 view along the spine keeps every leg readable.
7. **Fix collisions with a number.** When a part pokes through another, scale or move it in the parameter block. Never hide it with the camera.

## The console

Lay it out at 1600 x 900 around the machine, which fills 60-70% of its view:

- Title and the main live number top left, big (engine speed in rpm).
- Live charts that move with the machine (valve lift over 720° of crank, the p-V loop of the tracked cylinder). A chart that moves with the part is the reason people stay: the V8's pressure loop closes once every 720° and you watch it close.
- A schematic panel that redraws the mechanism in 2D from the same model.
- One button per subsystem: isolate it, cut it, show it alone. Camera views as buttons (hero, front, side, top, inside).
- Callouts with thin leader lines into the parts they name.
- A keyboard hint line, numbered panel groups, a spec block of real figures and an `AUTO TOUR · CLICK TO TAKE OVER` chip: the published pages' conventions, catalogued in `references/visual-learning.md`.

## Live page rules

- **Test on an integrated GPU.** A page that runs at 60 fps on a desktop card can drop to 15 fps on a laptop's built-in one (the hexapod did; quality steps took it to 75). The examples carry quality tiers (`TIERS` in `live.js`): no AO, lower pixel ratio, smaller shadow maps, panels redrawn every other frame. Find the expensive shader first: a displacement computed 5 times per vertex costs more than every tier together.
- **Warm the shaders.** `kit/warm.js` compiles every program in parallel before the first frame, so the page never freezes on first draw.
- **Keep the page under 1 MB.** Link crawlers (X, Slack) read the share card from the HTML and give up on a 15 MB page. Big models go out as files next to the page: `build.json` → `{"external": {"heavy.glb": "light.glb"}}`.

## render(t) contract

```js
import {runSim} from '../kit/runtime.js';

const DEFAULTS = {duration: 20, fps: 60, hud: {enabled: false}, director: {enabled: false}};

runSim(DEFAULTS, async ({cfg, canvas, capture}) => {
  // build the scene, precompute anything stateful
  return {render(t) { /* draw frame t from scratch */ return {}; }, resize() {}};
});
```

- `render(t)` is pure: no `Math.random` (use `rng(seed)` from `kit/util.js` at setup), no `Date`, no state carried between frames. Capture calls it at arbitrary times.
- Anything that moves by its own rules (agents, particles) is simulated once at load into typed arrays; `render` only reads them. A quantity integrated over time (the Strandbeest's crank under a changing wind) is integrated in closed form or tabulated at load.
- Every beat goes into `<name>-film/timeline.json` in seconds, and the score reads the same file (see Pitfalls: the shipped examples do not).
- Frame 0 is the thumbnail. It must already show the machine.

## Commands

Run each through `terminal` from the machine's working folder, with `SK="$LOCALAPPDATA/hermes/skills/creative/teardown"` (or the `skill_dir` path) in place of `$SKILL_DIR`. A full 26 s film at 1920 x 1080 takes about 1.5 minutes to capture on a discrete GPU.

```
node "$SKILL_DIR/sims/build.mjs" v8-film
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --stills every:1 --cols 4 --out teardown-out/v8-sheet.png
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --still 12.5 --out teardown-out/v8-12.5.png
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --out teardown-out/v8-silent.mp4
python "$SKILL_DIR/run_sfx.py" "$SKILL_DIR/sims/v8-shared/score.py"
ffmpeg -y -i teardown-out/v8-silent.mp4 -i teardown-out/v8-score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart teardown-out/v8.mp4
node "$SKILL_DIR/wave.mjs" teardown-out/v8.mp4 --timeline "$SKILL_DIR/sims/v8-film/timeline.json"
node "$SKILL_DIR/sheet.mjs" --video teardown-out/v8.mp4 --every 1
node "$SKILL_DIR/reference.mjs" hexapod cessna-337-landing-gear
```

`--size` is the CSS layout and `--dpr` multiplies it: 1600 x 900 at 1.2 gives 1920 x 1080. Capture prints the GPU it got; a software renderer (SwiftShader) means the GPU flags in `paths.mjs` did not take.

## Review loop

You cannot watch the video; you can look at frames. Never report a machine as done without reading sheets of the current render with `vision_analyze`.

1. `--stills beats` (one tile per timeline beat, 0.3 s after it, labelled `t=`) once your timeline carries beats; `--stills every:1` until then.
2. Read every tile against the checklist below.
3. Zoom in: `--stills every:0.2 --from A --to B` for a transition, `--still T` for one full frame.
4. Fix, rebuild, go back to 1. Stop when a full pass finds nothing.
5. Final: `node "$SKILL_DIR/sheet.mjs" --video <final.mp4> --timeline <timeline.json>` and read that too: it shows what the encoder wrote.
6. Tell the user what you checked and what you fixed, and show the sheets.

Checklist:

- **The mechanism.** Every part that should touch touches; nothing passes through anything or floats off its mount; the numbers on the panels match the pose.
- **Composition.** One focal point per frame. Nothing important within 60 px of an edge. Labels never cover the part they name.
- **Type.** Nothing clipped. The key readout reads at phone width.
- **3D.** Bloom eats detail: keep emissive layers under 1.0. Near-white surfaces blow out. Glossy metal under a low light streaks: roughness ≥ 0.45 and envMapIntensity ≈ 0.5 on big surfaces.
- **Timing.** Each state holds long enough to read: 1 s for a short phrase plus 0.25 s per word beyond three.

## three.js traps the examples already hit

- `smoothstep(a, b, x)` with `a > b` returns 0 on Windows (ANGLE/D3D). Write `1.0 - smoothstep(b, a, x)`.
- A `ShadowMaterial` or a decal a fraction of a millimetre above the floor loses the depth test inside a post-processing render target. Give it `polygonOffset`.
- A quad laid into the ground with a mirrored mapping gets culled as a back face. Use `DoubleSide`.
- One NaN pixel blacks out the whole frame through bloom. Clamp every `pow()` base in a shader.
- GTAO on a clipped (cutaway) model needs the same clipping planes on `gtao.normalMaterial`, or the cut half returns as a pale ghost.

## Sound

`sfx/` synthesises every sound in pure Python (48 kHz, reproducible) and reads the film's timeline, so sound cannot drift out of sync. `python "$SKILL_DIR/run_sfx.py" --list` shows the generators. `sample()` adds the recorded CC0 sounds in `sfx/samples/`. `sfx/score_kit.py` has the beds and accents the 3 scores use: a chord bed, a soft thud per power stroke, a motor, air under a drag.

- Every time comes from the timeline or the model, never a typed number.
- Mastering is automatic: −14 LUFS, true peak ≤ −2 dBFS (`wave.mjs` flags anything over −1).
- Accent, never narrate: continuous motion stays silent. One key for every tonal sound.

## Taste, with numbers

- Easing: entrances `cubic-bezier(0.16, 1, 0.3, 1)`, exits `cubic-bezier(0.6, 0, 0.9, 0.35)` at half the entrance's length, state to state `cubic-bezier(0.65, 0, 0.35, 1)`. Linear only for continuous motion.
- The machine fills 60-70% of its viewport. Labels never under 34 px on a 1080 canvas.
- One accent, and it means something: the part that is working right now.
- Nothing dead-still: one element always alive.

## Deliver and publish

- In the desktop app, hand over the page and the film as `MEDIA:/absolute/path` lines; the HTML opens offline from `file://`.
- Publishing is a public, external action: deploy only when the user asks. Then keep the HTML under 1 MB, make a 1200 x 630 preview card from the best frame with absolute `og:image` and `twitter:image` URLs, and deploy the folder with the Vercel CLI. Open the live URL afterwards and confirm the page and the card load before reporting it.

## Pitfalls

- **The shipped `timeline.json` files hold only `duration`.** Why: the example scores and films keep their beat times in `film.js` `SCRIPT` and `score.py` constants. So `--stills beats` on an example renders frame 0 alone and `wave.mjs` draws 0 beat lines. Use `--stills every:1`, and in a new machine write the beats into its timeline and read them in `score.py`.
- **`npm install` warns that esbuild's install script was blocked.** Harmless on Windows and npm 11: the platform binary arrives as an optional dependency and `build.mjs` bundles fine. Act only if `build.mjs` throws.
- **`capture.mjs` writes `yuv420p`, `color_range=tv` because of a local patch.** Upstream piped full-range JPEG frames and ffmpeg 9 wrote `yuvj420p` (`color_range=pc`). Keep the `scale=out_range=tv` filter when rebasing; check with `ffprobe -show_entries stream=pix_fmt,color_range`.
- **A loudness warning on a clip shorter than the score is expected.** `wave.mjs` measures what it is given; master and check the full-length mux.
- **`vision_analyze` can 403 while chat still works.** It shares the OpenRouter key's spend cap. Read the frames' pixel stats or wait for the reset; never skip the review and call it done.
- **The published simulators carry fiction panels** (operator names, "neural node activity") on invented machines. A real machine gets no invented telemetry: every number comes from the model, and typical figures are labelled as typical.

## Verification

- `build.mjs` prints each page and its size; under 1 MB for anything published.
- `capture.mjs` prints a real GPU (`ANGLE (NVIDIA ...)` or the like), not SwiftShader.
- Every sheet read with `vision_analyze`, and the final mux checked with `ffprobe` (h264, `yuv420p`, 60 fps, aac) and `wave.mjs` (−14 ±1 LUFS, true peak ≤ −1 dBFS).

## Credits

Built by Elvar ([elvarofficial/teardown](https://github.com/elvarofficial/teardown), MIT), forked at [CoeusInstitute/teardown](https://github.com/CoeusInstitute/teardown). The kit, frame capture, sfx engine and review rules come from [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT). The recorded samples are CC0 from Freesound, trimmed by [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) (MIT); sources in `sfx/samples/SOURCES.md`. Hermes adaptation: the brief, the field guide, the visual-learning catalogue, `reference.mjs`, the colour-range fix and the Pitfalls.
