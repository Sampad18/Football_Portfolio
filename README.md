# Sampad Patra — football pitch portfolio

A playable 3D portfolio. Run around a low-poly football pitch, step into a glowing ring to open a section, or shoot the ball into a goal.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5183.

## Controls

- WASD or arrow keys: move
- Shift: sprint
- Space: kick
- E or Enter: open the section you are standing in
- Esc: close a panel
- Touch devices get an on-screen joystick and a Kick button
- The Sections button lists every section, for visitors who do not want to play

## Where things are

- `src/content.js`: all the text (profile, sections, zone positions). Edit this to change the content.
- `src/game/`: the 3D scene (pitch, stadium, player, ball, goals, teammates, section rings).
- `src/ui/`: the on-screen interface (start screen, top bar, section panels, joystick).
- `src/store.js`: shared game state.

Built with React Three Fiber, Rapier physics and Vite. All models are built from simple shapes in code, so there are no asset files to download.
