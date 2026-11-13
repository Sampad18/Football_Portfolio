# Football-pitch portfolio: how to work on this project

This is Sampad Patra's portfolio, built as a small playable football game. A visitor runs around a low-poly pitch as a footballer in the number 11 shirt, and opens resume sections by stepping into glowing rings or scoring goals.

- Live site: https://sampadpatra.vercel.app (Vercel project `sampadpatra`)
- Repo: https://github.com/Sampad18/Football_Portfolio (branch `main`)
- Stack: Vite, React 19, React Three Fiber 9, drei, @react-three/rapier 2, zustand

Read this file before changing anything. For step-by-step recipes (add a section, a prop, a character, a sound; test; deploy), use the `pitch-portfolio` skill in `.claude/skills/`.

## What the site is for

It is a portfolio first and a game second. Every decision follows from that.

1. **A recruiter with 30 seconds must still get the content.** The Sections button lists every section without playing. Never remove it, and never put content only behind a goal or a hidden spot.
2. **The game must be instantly understandable.** One start screen, four controls, no tutorial. If a feature needs explaining, simplify it.
3. **Play is the reward, not the gate.** Kicking the ball, knocking cones over and the referee's whistle are there to make people stay and smile. They never block reading.
4. **The content is real.** All text comes from Sampad's resume. Do not invent achievements, numbers, employers or dates. If something is missing, ask.

## Visual style

The style is cute low-poly, like a toy set. Keep it consistent.

- **Everything is built from simple shapes in code**: boxes, cones, cylinders, icosahedrons. There are no model files, no textures from disk and no downloaded assets. This keeps the site fast and free of licensing questions. Do not add GLB or image assets unless Sampad asks for them.
- **Chunky proportions.** Characters have big heads and short limbs (see `Footballer.jsx`). Props are slightly oversized.
- **Flat, bright, friendly colours.** Greens for grass, a warm orange track, a sky-blue background, saturated accents. Use `flatShading` on anything round so the facets show.
- **One accent colour per section.** Each zone in `content.js` has a `color`. The ring, the floating gem, the label when active, the prompt button and the panel's top border all use it. A new section needs its own distinct colour.
- **The interface looks like the world.** Rounded pills, thick bottom borders (a pressed-button look), a rounded system font, cream paper (`--paper`) and dark navy ink (`--ink`). No thin grey outlines, no glass or blur effects on controls, no gradients.
- **Text in the 3D scene is drawn to a canvas** and used as a texture (`makeTextTexture` in `util.js`, `pill` in `Zones.jsx`). Do not use drei's `Html` or `Text`: `Html` caused React errors with this setup, and `Text` fetches a font from the network.
- **Motion is small and physical.** Things bob, pulse, hop and swing. Nothing spins wildly or flashes. Respect `prefers-reduced-motion` for interface animations.

## How the pitch is laid out

Units are roughly metres. The pitch is 60 by 40: x runs from -30 (west goal) to 30 (east goal), z runs from -20 (far side, by the stand) to 20 (near side, by the camera). y is up, and the grass is at y = 0.

- The camera sits above and behind the player, looking toward negative z. So **tall things go on the far side or the ends**, never on the near side, where they would block the view.
- Invisible walls keep the player and ball inside x ±35.5 and z from -21.6 to 23.5. Anything a player should reach must be inside those bounds.
- Sections map to real places on a pitch. Keep that logic when adding one: the place should make sense for the content.

| Place | Section |
|---|---|
| Centre circle | About Me |
| West goal | Projects & Certifications |
| East goal | Experience |
| Dugout (far side) | Skills |
| Scoreboard (far side) | Education & Highlights |
| Corner flag (near east) | Contact |

## Where the code lives

| File | What it holds |
|---|---|
| `src/content.js` | All text and data: profile, zone positions and colours, section content. Content changes happen here only. |
| `src/store.js` | Shared state (zustand) and `refs`, the mutable handles read every frame. |
| `src/sound.js` | Sounds generated with the Web Audio API. No audio files. |
| `knowledge/about-sampad.md` | Everything the chat bot is allowed to say. |
| `src/chat/` | The bot's answer logic: `ask.js` (backend, then fallback) and `localAnswer.js` (keyword matcher). |
| `api/chat.js` | Vercel function that answers with DeepSeek, grounded in the knowledge file. |
| `src/game/Bot.jsx`, `src/ui/ChatPanel.jsx` | The robot character and its chat panel. |
| `src/game/Experience.jsx` | The canvas, lights, sky, and which objects are in the physics world. |
| `src/game/Field.jsx` | Grass, markings, ground and wall colliders. |
| `src/game/Stadium.jsx` | Scenery with no physics: stand, crowd, ad boards, scoreboard, dugout, flags, trees, clouds. |
| `src/game/Footballer.jsx` | The character model and its limb animation. Used by the player, teammates, keepers and referee. |
| `src/game/Player.jsx` | Input, movement, kicking, the follow camera, and zone detection. |
| `src/game/Ball.jsx`, `Goals.jsx`, `Npcs.jsx`, `Cones.jsx`, `Zones.jsx` | The ball, goals and keepers, teammates and referee, loose cones, section rings. |
| `src/ui/Hud.jsx` | Start screen, top bar, prompt, goal banner, touch controls. |
| `src/ui/Panel.jsx` | The section panel. It renders whatever shape of data the section has. |
| `src/ui/Joystick.jsx` | Touch joystick. |
| `src/styles.css` | All interface styling. |

## Code rules

### State and the frame loop

- **Never call React `setState` or a zustand `set` every frame.** Inside `useFrame`, change objects directly through refs (`mesh.current.rotation.y = ...`). Only write to the store when a value actually changes (see `setNearZone`, which checks before setting).
- **Read the store inside `useFrame` with `useGame.getState()`**, not with the hook. Use the hook (`useGame((s) => s.x)`) only where a component must re-render.
- **Things read every frame by other objects go in `refs`** in `store.js` (ball body, player body, player position, joystick vector, kick request). They are plain mutable values, not React state.
- **Do not create objects inside `useFrame`.** No `new THREE.Vector3()` per frame. Create them once with `useMemo` or at module level and reuse them.
- **Make animation frame-rate independent.** Multiply by `dt`, and for smoothing use `1 - Math.exp(-dt * rate)`. Clamp `dt` (for example `Math.min(dt, 0.05)`) where a long pause could cause a jump.
- **Scenery must look the same on every load.** Use `seeded()` from `util.js` for placement, not `Math.random()`.

### Characters

- Every character is a `<Footballer>` with different colours. It faces +z, with feet at y = 0.
- The owner drives it through a plain `motion` object: `speed` (leg and arm swing), `kick` (set to 1 to play a kick), `whistle` (0 to 1, the referee pose). To add a new pose, add a field to `motion` and blend toward it inside `Footballer.jsx`, the way `whistle` does.
- To face a direction, set `rotation.y = Math.atan2(dx, dz)` and smooth it with `lerpAngle`.

### Physics (Rapier)

- **The player** is a dynamic capsule with rotations locked. Its velocity is set every frame, so it cannot be pushed around.
- **Teammates, keepers and the referee** are `kinematicPosition` bodies moved with `setNextKinematicTranslation`. They push the ball and the player but nothing pushes them.
- **The ball and cones** are light dynamic bodies. Set `mass` on the collider, keep it small, and add damping so things settle.
- **Fixed things** (ground, walls, goal frames) are colliders inside a `type="fixed"` body.
- **Triggers** are sensor colliders with `onIntersectionEnter`. Identify the other body by `e.other.rigidBodyObject?.name`, which comes from the `name` prop on its `RigidBody`.
- Anything that needs physics goes inside `<Physics>` in `Experience.jsx`. Pure scenery goes outside it, in `Stadium.jsx`, so it shows before physics has loaded.
- Give fast or important bodies a safety net, like the ball's reset if it ever leaves the stadium.

### Interface

- The 3D canvas and the interface are separate layers. The interface is ordinary React and CSS on top of the canvas.
- **While a panel or the menu is open, the game ignores input.** `Player.jsx` checks `started && !openZone && !menuOpen`. Keep that check when adding controls.
- Every action must work three ways: keyboard, touch, and a visible button. A new keyboard shortcut needs a tappable equivalent.
- Panels must be readable and scrollable on a phone, closable with Esc and the ✕ button, and focus the close button when they open.
- Text in panels must be selectable. The game area is not.

### Phones

- Touch controls show under `@media (pointer: coarse)`. Layout changes for small screens go under `@media (max-width: 520px)`.
- On tall screens the camera pulls back (`zoom` in `Player.jsx`). Check portrait whenever you change the camera or add something large.
- Pushing the joystick fully is how you sprint on touch.
- Keep controls clear of the notch and home bar with `env(safe-area-inset-*)`.

### Sound

- Sounds are made in code in `sound.js`. Browsers only allow audio after a click, so the audio context is created in `start()` (the Kick off button).
- **Keep sounds quiet.** High tones sound much louder than their number suggests. The whistle's gain is 0.025; Sampad found 0.16 and 0.08 too loud. Start new sounds at a similar level.
- Every sound must respect the Sound on/off button (`muted`).

## The chat bot

A robot stands just outside the far touchline (`Bot.jsx`). Its ring opens a chat panel (`ChatPanel.jsx`) where visitors ask about Sampad.

- **The bot answers only from `knowledge/about-sampad.md`.** That file is the single source of what it may say. If something is not written there, the bot says it doesn't know. Never loosen this: no general knowledge, no guessing, no off-topic help.
- **To teach the bot something, edit that file only.** Each topic is a `## Title`, a `Keywords:` line, and a short answer. Sampad will add personal topics (favourite food, games) himself or ask for them.
- **There are two answer engines, and both read the same file:**
  - `src/chat/localAnswer.js` matches the question against the `Keywords:` lines and returns that section's text. It runs in the browser, costs nothing, and cannot go off-topic. It is the fallback.
  - `api/chat.js` is a Vercel function that sends the question and the notes to DeepSeek's chat API (`https://api.deepseek.com/chat/completions`) with a strict system prompt. It is used only when `DEEPSEEK_API_KEY` is set in the Vercel project. Otherwise it returns 503 and the site uses the local engine.
- `src/chat/ask.js` tries the DeepSeek backend first and falls back to the local engine. A failed or unreachable backend also falls back, so the chat never breaks.
- Sampad chose DeepSeek for the backend. Do not switch providers unless he asks. The model defaults to `deepseek-flash` and can be changed with the `CHAT_MODEL` environment variable.
- The function calls DeepSeek with plain `fetch`, so there is no SDK dependency. DeepSeek renames models from time to time: check https://api-docs.deepseek.com before changing the model name.
- Sampad adds the API key himself in Vercel's settings. Never ask him to paste a key into chat, and never put one in the repo.
- The backend caps question length, conversation length and requests per minute. Keep those caps.
- When a text field has focus, game keys must not fire (`Player.jsx` checks the event target).

## Privacy and content

- **Sampad's phone number is not shown on the site.** Contact shows email, LinkedIn and city. Do not add the number unless he asks.
- The CV at `public/Sampad-Patra-CV.pdf` does contain the phone number, and the repo is public. He knows.
- Commits use the name "Sampad Patra" and GitHub's no-reply email, set in this repo's local git config. Do not put his personal email in commits or send it to other services.

## Testing a change

A successful build proves little here. Play it.

1. `npm run build` must pass.
2. Start the dev server (launch config `football-portfolio`, port 5183) and open it in the Browser pane.
3. **The Browser pane must be visible**, or the canvas never starts and the screen looks blank. Call `show_pane` with `preview` first. Even then the preview runs at only a few frames per second, so you can check that things work but not how they feel.
4. In dev mode, `window.__game` exposes `{ refs, useGame, playWhistle }`. Use it to wait for `ready`, start the game, move the player (`refs.player.setTranslation`), place the ball, and read state. Dispatch `KeyboardEvent`s on `window` with a `code` to simulate keys.
5. Take a screenshot and look at it. Check the console for new errors.
6. Check phone size (375 by 812) for anything that touches layout, camera or controls.
7. Say plainly what you could not verify. You cannot hear audio or judge speed and feel in the preview; Sampad has to check those.

## Shipping

- Commit and push only when Sampad asks. Work on `main`.
- Deploy only when he asks: from the project folder, `npx vercel deploy --prod --yes`. The folder is already linked to the `sampadpatra` project. GitHub is not connected to Vercel, so pushing does not deploy.
- After deploying, confirm https://sampadpatra.vercel.app returns the page.

## How to work with Sampad

- He describes what he wants in plain words and is not a front-end developer. Explain what changed in plain language, and skip the jargon.
- Make sensible choices and state them, in place of asking about every detail. Ask only when the choice is really his (content, privacy, anything public or hard to undo).
- When he gives feedback like "too loud", make a clear change, not a timid one, and tell him the old and new values.
- Small, safe additions that fit the request are welcome (a mute button alongside a new sound). Large unrequested features are not.
