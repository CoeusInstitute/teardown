# visual-learning.app: the reference shelf

The author's public gallery of everything built with this kit and its SVG sibling (https://visual-learning.app, observed 2026-11-03). Use it to study layout, console vocabulary and interaction before building. Patterns only: the live pages are compiled bundles without a licence; the MIT source is the 3 machines in `sims/`.

Study a page: open its files in the local mirror `$TD/hermes/site/` (`<slug>.jpg` screenshot of the 1600 x 900 console, `<slug>.json` visible text with panel titles, buttons, readouts and keyboard hints, `<slug>.html` as served, `<slug>-og.png` share card, `<slug>-card.webp` gallery card; `index.json` lists all 47). Read the screenshot with `vision_analyze`. The saved simulator pages run offline from `file://` with their models inlined; the figure pages lose only their navigation thumbnails. Refresh with `node "$TD/hermes/scripts/reference.mjs" --all --out "$TD/hermes/site"`. Live URLs: `https://visual-learning.app/<slug>`, cards at `https://visual-learning.app/<slug>-og.png` (1200 x 630) and `https://visual-learning.app/cards/<slug>.webp`.

## Simulators (3D, this skill's format)

One WebGL canvas plus a DOM console, 830 KB to 1.05 MB per page, about 9-12 s to first full frame on a fresh load while shaders compile.

| Slug | Machine | Input and controls | Study it for |
|---|---|---|---|
| `v8-engine` | Cross-plane V8, 5.8 L | Crank angle. ↑↓ engine speed, ←→ ±15°, H hides the overlay, views 1-5 | Source in `sims/v8-*`. Slider-crank formula drawn on the panel (`s = r·cos φ + √(L² − r² sin²φ)`), cutaway GLASS/SECTION/SOLID, overlay toggles (CALLOUTS, CHARGE, ARROWS, ISOLATE, REFRACT, CHARTS), firing order as a cylinder picker. |
| `cessna-337-landing-gear` | Cessna 337 main gear | Stroke 0..1. T takeoff, L landing, F fuselage, X x-ray, E exploded, views 1-6 | Source in `sims/cessna-*`. Seven numbered panel groups (01 mechanism state … 07 gear operation with a scrub bar), a plain-words system overview, a footer that states the method ("single degree of freedom", "built from the traced plate"). |
| `strandbeest` | Jansen walker SB-10 | Wind. ←→ wind, I isolate leg, T trace feet, views 1-5 | Source in `sims/strandbeest-*`. Spec block, "the eleven holy numbers" table, leg linkage schematic, 20-leg foot contact strip, wind history chart. |
| `hexapod` | HX-7 walking robot | Gait phase. WASD QE move, X stop, 1-3 gaits | Three-column console (telemetry, viewport, controls), gait phase diagram with a playhead, direction pad, parameter sliders, theme switch (STUDIO / ACID / CYAN), solver overlays on the floor (planted-foot lines, landing markers, swing trails). |
| `sandworm` | MK-X borer, 1,300 m | Travel. Views 1-6, X x-ray | Invented machine with a real-looking spec sheet, head cross-section that turns with the drill, subsurface profile and surface map tracking the body, numbered segment-detail callouts. |
| `robotic-jellyfish` | HM-4 deep-sea robot | Pulse. 1-3 isolate (dome, spine, limb), 0 back | Isolate buttons that explode one subsystem while the rest steps aside, power and battery breakdown. Carries fiction panels (operator name, neural activity). |
| `robotic-bee` | HB-7 flapping drone | Wing beat 7.5 Hz. 1 hero, 2-6 assemblies, E exploded, T turntable, L labels, B blur | Assemblies as camera presets, motion-blur toggle, a subsystem list with live status per row, a flight log scrub bar with operator actions. |

Shared conventions on every simulator page:

- A 52 px site bar: `← Visual Learning`, the keyboard hint line centred (`1–6 views · X x-ray · space pause · drag to orbit · scroll to zoom`), `Full guide ↗` and the author badge on the right.
- A poster image of the best frame covers the page while shaders compile, then fades (`.poster`, opacity transition), so the first second is never blank.
- `AUTO TOUR · CLICK TO TAKE OVER` chip over the viewport while the tour runs.
- Numbered panel groups (01-08), uppercase monospace labels at 10-11 px with wide tracking, tabular numerals, one large display title.
- Warm off-white or sand ground, white cards with thin borders, exactly one accent (orange-red on the Cessna and hexapod) for active buttons, live values and the working part.
- Leader lines are thin, dotted, square-cornered and arrowless, running from a card to an anchor on the part.

## Figures (SVG step explainers, a different format)

40 figures (Fig. 01-41) of everyday machines: SVG and DOM, no canvas, 225 KB to 2.4 MB. Not what this kit builds, but the best reference for teaching structure, and the format to propose when a 3D simulator is more than the question needs.

- A card with a left control column and a wide drawing: eyebrow `FIG. 18 · WATCH`, a title, an `Auto / Manual` toggle, then 5-7 numbered steps pressed in order (later steps disabled until reached), plus `↺` for the after-state and `⟲ Start over`.
- One question as the hook ("How does one coiled spring keep a watch ticking for a whole day? Press the steps in order.").
- A row of live readout pills under the drawing (`BEATS/HOUR 28,800`, `POWER RESERVE 16.0 h`).
- "The big idea" paragraph that hedges honestly: "typical figures for a modern hand-wound movement", "inner layout typical", "(arithmetic)".
- A colour swatch row, `Space or Enter runs the next step · ← → switch machines`.

Slugs: `espresso-machine` 01, `claw-machine` 02, `car-engine` 03, `vending-machine` 04, `washing-machine` 05, `toaster` 06, `microwave` 07, `pencil-sharpener` 08, `smoke-alarm` 09, `fridge` 10, `capsule-toy-machine` 11, `photo-booth` 12, `roller-coaster` 13, `elevator` 14, `rubiks-cube` 15, `instant-camera` 16, `lava-lamp` 17, `mechanical-watch` 18, `atom` 19, `iphone` 20, `macbook` 21, `airpods` 22, `apple-watch` 23, `ps-controller` 24, `dgx-spark` 25, `mac-mini` 26, `rtx-5090` 27, `vision-pro` 28, `dji-drone` 29, `spot` 30, `switch-2` 32, `starlink` 33, `f1-wheel` 34, `atlas` 35, `dji-neo` 36, `meta-glasses` 37, `rolex` 38, `combination-lock` 39, `robot-vacuum` 40, `ipad-pro` 41.

## What to take and what to leave

- Take: the panel vocabulary, the numbered groups, the hint line, the poster-while-compiling, the tour chip, the honest hedges, the question-first hook.
- Leave: fiction telemetry on a real machine. The jellyfish and bee consoles fill space with invented operators and network metrics; on a real machine every number comes from the model or is labelled typical.
