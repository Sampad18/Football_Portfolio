---
name: pitch-portfolio
description: Recipes for changing Sampad's football-pitch portfolio. Use when adding or editing a section, a prop, a character, a pose, a sound or a control on the pitch, or when testing and deploying the site. Read CLAUDE.md in the project root first for the design rules.
---

# Pitch portfolio recipes

These are the steps for the common changes to this project. `CLAUDE.md` in the project root has the rules these recipes follow. Read it first.

## Before any change: think it through in this order

1. **What does the visitor see or do differently?** Say it in one sentence. If you can't, ask Sampad.
2. **Where on the pitch does it belong?** Near side is by the camera, so only low things go there. Tall things go on the far side or behind the goals. Reachable things must be inside the walls (x ±35.5, z -21.6 to 23.5).
3. **Is it scenery, a physics object, or a character?** That decides the file:
   - scenery with no collisions → `Stadium.jsx`, outside `<Physics>`
   - something that collides or gets knocked → its own file, inside `<Physics>` in `Experience.jsx`
   - a person → a `<Footballer>` in `Npcs.jsx`
4. **Does it need an interface part?** If the visitor triggers it, it needs a key, a touch control and a visible button.
5. **Does it work on a phone and with sound off?**
6. **How will you prove it works?** Decide what you will move, trigger and screenshot before writing code.

## Change the text or add an item to a section

Edit `src/content.js` only. `CONTENT[zoneId]` supports these fields, and `Panel.jsx` renders whichever are present:

- `kicker`, `title`: the small label and the heading
- `intro`: a lead paragraph
- `stats`: `[{ value, label }]`, shown as three tiles
- `body`: an array of paragraphs
- `items`: `[{ title, org, meta, points: [], link: { label, href } }]`, shown as cards
- `groups`: `[{ name, tags: [] }]`, shown as tag clouds
- `contact: true`: shows the email, LinkedIn and CV buttons from `PROFILE`

Use only facts from Sampad's resume or that he gives you. Keep bullets to one sentence each.

## Add a new section

1. Pick a real place on the pitch that suits the content, and build a landmark there if there isn't one (see "Add scenery").
2. Add an entry to `ZONES` in `content.js`: `id`, `label`, `hint` (the place name), a `color` no other zone uses, `position: [x, z]` and `radius` (3 to 4). Keep rings from overlapping each other.
3. Add `CONTENT[id]` with the fields above.
4. Nothing else is needed: the ring, label, prompt, panel and Sections menu all read from these two lists.
5. Test: teleport the player into the ring, confirm the prompt appears, open the panel, and check it at phone size.

## Add scenery (no collisions)

1. Write a small component in `Stadium.jsx` and add it to `<Stadium>`.
2. Build it from boxes, cones and cylinders with `meshStandardMaterial`. Add `flatShading` on round shapes and `castShadow` on anything above the ground.
3. For many copies of one shape (like the crowd), use one `instancedMesh`, not hundreds of meshes.
4. Place random things with `seeded(n)` so they don't move between loads.
5. For words on a surface, use `makeTextTexture()` on a plane placed just in front of a plain box.

## Add a physics prop (like the cones)

1. Create `src/game/YourProp.jsx`. Follow `Cones.jsx`:
   - a `RigidBody` with `colliders={false}`
   - explicit colliders (`CuboidCollider`, `BallCollider`, `ConeCollider`) with a small `mass`, some `friction`, low `restitution`
   - `linearDamping` and `angularDamping` so it settles
   - the visible meshes inside the same `RigidBody`
2. List positions in an array at the top of the file. Keep them inside the walls.
3. Add the component inside `<Physics>` in `Experience.jsx`.
4. Test by running the player through it and taking a screenshot that shows it has moved.

For something solid that never moves, use `type="fixed"`. For something that should detect the ball or player without blocking them, add a `sensor` collider with `onIntersectionEnter` (see the goal detector in `Goals.jsx`).

## Add a character

1. In `Npcs.jsx`, add an entry to `SQUAD` for a wandering teammate, or write a new component modelled on `Referee` for someone with their own behaviour.
2. The pattern is always:
   - a `kinematicPosition` `RigidBody` with a `CapsuleCollider`
   - a `state` ref holding position and facing angle
   - a `motion` object from `useMemo`
   - in `useFrame`: pick a target, step toward it by `speed * dt`, set `motion.speed`, call `setNextKinematicTranslation`, and smooth `rotation.y` with `lerpAngle`
3. Dress the character with `Footballer` props (`jersey`, `shorts`, `socks`, `skin`, `hair`, `number`). Add small extra meshes inside the model group for accessories, like the referee's card and whistle.
4. Characters should react to the game, not just wander: read `refs.ball`, `refs.playerPos` and `useGame.getState()`.

## Add a pose or animation to a character

1. Add a field to the `motion` object, a number from 0 to 1 (like `whistle`).
2. In the owner's `useFrame`, ease it toward its target: `motion.x += (target - motion.x) * Math.min(1, dt * 12)`.
3. In `Footballer.jsx`, after the walking swing is applied, blend the limbs toward the pose by that amount. Reset anything you changed (like `rotation.z`) when the amount is 0.
4. Rotation guide for arms and legs, which hang down from a pivot: a negative `rotation.x` swings the limb forward and up. About -1.5 is straight out in front, -2.5 brings a hand to the face.
5. Tie the pose to game state in the store (the referee whistles while `celebrating` is true), not to a private timer.

## Add or change a sound

1. Write a function in `sound.js` using oscillators and gains. Return early if there is no audio context or `muted` is true.
2. Shape every sound with a gain envelope: ramp up over about 0.02 s and down at the end, so it doesn't click.
3. Start quiet. Use a peak gain near 0.025 for high tones. If Sampad says it is too loud, cut it by a factor of three or more, not by a little.
4. Call it from the store action that represents the event (the whistle is called in `scoreGoal`), not from a component.
5. You cannot hear the result. Confirm it was triggered (`playWhistle()` returns true) and tell Sampad the sound itself needs his ears.

## Teach the chat bot something new

1. Open `knowledge/about-sampad.md` and add a section:

   ```
   ## Favourite food
   Keywords: food, eat, favourite food, dish, cuisine

   Sampad's favourite food is ...
   ```

2. Write the answer as the bot should say it: third person, one to three sentences, only facts Sampad gave you.
3. Choose keywords people would type. Single words match word by word; phrases with spaces must appear in the question as written. Avoid very general phrases such as "tell me about", which steal questions from other sections.
4. Test the local engine in the browser: open the chat, ask the new question in two or three different wordings, and ask one unrelated question to confirm it is still refused.
5. Do not edit the system prompt in `api/chat.js` or the matcher to add facts. Facts live in the knowledge file only.

## Add a control

1. Keyboard: handle the key in the `keydown` listener in `Player.jsx`, by `e.code`.
2. Touch: add a button in the `.touch` block in `Hud.jsx`, or reuse the joystick.
3. Add it to both instruction lists on the start screen (`keys-desktop` and `keys-touch`) and to the hint line.
4. Make sure it does nothing while a panel or the menu is open.

## Test in the browser

```js
// wait for physics, then start
while (!window.__game?.useGame.getState().ready) await new Promise(r => setTimeout(r, 100))
const g = window.__game
g.useGame.getState().start()

// move the player, place the ball
g.refs.player.setTranslation({ x: 0, y: 0.2, z: -15 }, true)
g.refs.ball.setTranslation({ x: 29.4, y: 0.5, z: 3.3 }, true)
g.refs.ball.setLinvel({ x: 12, y: 0, z: 0 }, true)   // rolls into the east goal

// hold a key
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))

// open a panel or hold the goal celebration
g.useGame.getState().open('contact')
g.useGame.setState({ celebrating: true })
```

- Show the Browser pane first (`show_pane` with `preview`), or the canvas stays blank.
- The preview runs slowly, so wait several seconds after moving things before taking a screenshot.
- The Kick off button must be clicked for real (not through the store) if you need sound to be unlocked.
- For phones, set the viewport to the mobile preset, reload, and reset it to desktop when done.

## Ship

Only when Sampad asks.

```bash
npm run build
```

```bash
git add -A && git commit -m "..." && git push origin main
```

```bash
npx vercel deploy --prod --yes
```

Then check that https://sampadpatra.vercel.app loads, and tell him what you verified and what you did not.
