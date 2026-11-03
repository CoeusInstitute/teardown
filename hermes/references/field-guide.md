# Field guide: from request to published simulator

Distilled from the author's guide "How I Turn Any Machine Into a 3D Simulator You Can Take Apart" (Elvar, published with the skill, late October 2026). He built 7 simulators in 2 days with it: the V8, the Cessna 337 gear and the Strandbeest ship in `sims/`; the hexapod, the sandworm, the robotic jellyfish and the robotic bee are live on visual-learning.app without source. The briefs below are written for an agent session, not a slash command: swap everything in `[brackets]`, and use them as the spec you hold yourself to when the user only says "build me X".

## What every simulator has

One HTML page, about 800 KB, that works offline. Six parts, shown on the hexapod:

| Part | On the hexapod |
|---|---|
| The machine | Built from code: a hexagonal chassis on 6 legs, 18 joints, red servo housings, slotted femurs, shins ending in a cone tip. |
| The model | One solver for every leg; it plans each step a second ahead. The legs, the panels and the floor all read from it. |
| The panels | Joint torque, the height of every foot, the load on each of the 6 legs, solver time, servo temperature. |
| The buttons | Tripod, ripple and wave gaits, a direction pad, WASD keys, sliders for speed, stride and body height. |
| The window | The floor shows the solver at work: lines to every planted foot, a marker where each foot will land, swing trails. |
| The tour | Left alone, a cursor drives the page. Click anything and it hands you control; 25 s of quiet and the tour comes back. |

## Stage 1. Pick the machine and find a reference

This decides everything. Pick a machine with one moving input and real numbers, then find one picture of it: a cutaway from a manual, a photo, a clip. With nothing to work from, the pangolin, armadillo and scorpion came out as generic toys; with one clip of a real V8 simulator the same model rebuilt the engine panel by panel.

Candidates nobody has built yet: a bicycle derailleur shifting across 11 sprockets, a mechanical watch escapement ticking at 4 Hz, a car differential on a turn, a sewing machine making a lockstitch, an excavator arm digging one bucket.

## Stage 2. Build the machine

```
Build [the Cessna 337 main landing gear] as an interactive 3D simulator. Reference: [a cutaway drawing of the gear].

Build it from code in real units: [the main plate, the hydraulic actuator, the rack, the pinion on its output shaft,
the universal joints, the side tubes, the spring legs and the wheels].

Before you draw anything, write the model as pure functions of one input: [stroke from 0 to 1]. Use the real numbers:
[the rack travels 201 mm, the pinion has 32 teeth at module 4 mm, so the legs turn exactly 180°]. Check them by hand
and show the check. If you are not sure a number is real, say so and say where it comes from.

Every part, every panel and every label reads from that one model. Nothing is animated by hand.
```

Why it holds: the model comes first, so the gear, the gauges and the timeline read one function and cannot drift apart. The check on paper: 32 teeth × 4 mm module = 128 mm pitch diameter; π × 128 / 2 = 201 mm, the rack's travel, so half a turn of the pinion swings the legs back through 180° into the airframe. The V8 and the Strandbeest came out of this same brief with new brackets; the Strandbeest's model is Theo Jansen's 11 link lengths from 1990, every joint following the crank by circle intersection.

## Stage 3. Build the console

```
Lay out a console around the machine at 1600×900:
- the title and the main live number top left, big: [engine speed in rpm]
- live charts that move with the machine: [valve lift over 720° of crank, the p-V loop of the tracked cylinder]
- a schematic panel that redraws the mechanism in 2D from the same model
- one button per subsystem: isolate it, cut it, show it alone
- camera views as buttons: [hero, front, side, top, inside the valley]
- callouts with thin leader lines into the parts they name
Every panel redraws from the frame's state. No number on screen is typed in.
```

A chart that moves with the part is the reason people stay.

## Stage 4. Give it the look

```
Style: a clean study model on a pale studio.
- light background, soft shadows on an invisible floor, one accent colour for the part that is working right now
- the machine fills 60 to 70% of its view
- dark parts glossy, liners glass, metal roughness at least 0.45 so it never streaks white
- if a part is near-white, give it a thin ink outline or a darker ground
- pick the camera for the mechanism: if it collapses into a lattice face-on, use a 3/4 view
```

Every line is a fix: the Strandbeest's white tubes vanished into cream until it moved onto sand with an ink outline; face-on its 20 legs became a fence, so the camera sits at 3/4 along the spine; a dark version of the rabbit scene lost the feed's first second.

## Stage 5. Check it like a critic

```
Before you show me anything:
1. Render a still at every beat of the tour and read each one: a part passing through another, a part floating off
   its mount, a label covering what it names, a number that disagrees with the pose.
2. Scrub every transition at 0.2 s steps and look for a jump.
3. Fix collisions with a number in the parameter block. Never hide them with the camera.
Tell me what you checked and what you fixed. Show me the stills.
```

The stills caught 2 bugs that would have shipped: a rabbit's face pushed through the wall of its hat until one number, 0.222 m, put it back inside; the hexapod's leg flew off on every gait change until its feet aimed at the next real foothold. In Hermes the stills are `capture.mjs --stills`, read with `vision_analyze`.

## Stage 6. Make it a page you drive

```
Make the simulator a page people drive:
- the tour from the film plays by itself, with a cursor that walks to each button and presses it
- any click, drag, scroll or key hands control to the visitor; 25 seconds of quiet hands it back
- drag to orbit, scroll to zoom, a key to hide the panels
- warm every shader before the first frame so the page never freezes
- test it on an integrated GPU and add quality steps: no ambient occlusion, a lower pixel ratio, smaller shadows,
  panels redrawn every other frame
```

The integrated GPU is the test most people skip. The hexapod ran at 15 fps on one; after the quality steps it ran at 75. On a sand dune page the slow part was one shader computing the same displacement 5 times per vertex.

## Stage 7. Turn it into a video

```
Record the tour: render(t) is a pure function of time, so draw every frame at 60 fps at 1920×1080 in headless
Chrome and pipe it into ffmpeg as H.264, yuv420p, faststart. Then show me a contact sheet of every beat.
```

```
Score it in code on the same timeline: [Am9 chords at 92 bpm, a soft thump on every power stroke so the beat tightens
when the throttle opens, a quiet click on every button press, rising air under the throttle drag]. Master to -14 LUFS
with the true peak under -1 dB and mux it into the video.
```

A screen recorder drops frames when the GPU works hard; a seeked tour cannot. The V8 film comes out at 26 seconds; the shipped score places 150 sounds (the author quotes 189 for his cut), every thump on its power stroke.

## Stage 8. Put it online (only when the user asks)

```
Publish the simulator as a page:
- keep the HTML under 1 MB; move any large model out as a file next to the page
- a 1200×630 preview card from the best frame, with absolute image URLs
- deploy it to Vercel
```

The 1 MB line comes from a miss: the rabbit page weighed 15.9 MB with its models inside and X never showed the link card; with the models moved out it weighed 967 KB and the card showed up.

## Bonus. Let them break it

```
Add one slider for [the wind, 0 to 15 m/s] and run the model live when it moves: [a light breeze barely turns the
crank, a gale makes the legs blur]. Show it on the same panels.
```

Whoever can push the machine past its limit learns what every number does.

## Invented machines

It works on machines nobody has built (the sandworm is 1,300 m long and 190 m across; the jellyfish is rated to 2,900 m). The rule does not relax: the invented machine still gets one model with defined numbers, and the panels read the machine's real pose (the sandworm's head section turns with the drill, the depth profile follows the buried body, the map draws its track). Say plainly which numbers are invented.
