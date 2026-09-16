# AGENTS.md — poolclone

## What this is
Scraped MillionBalls build, serverless. Playable bundle + clean sidecar modules. No backend. Deploy: push to main → Actions runs `npm run build` → `dist/` → Pages.

## Run
- `npm install`, `npm run dev` (Vite, port 3000)
- `npm run build && npm start` (preview `dist/`, no server needed on Pages)

## Map
- `index.html` — entry. Loads `/src/main.js` (sidecar) + `./assets/index-C0Zrrk4C.js` (frozen legacy bundle mounts `#app`). Keep both.
- `assets/` — frozen vendor bundle. DO NOT EDIT.
- `src/main.js` — agent entry. Exposes `window.__poolclone = { api, storage }`, adds the trainer link, imports the in-game aim-aid panel.
- `src/aim-assist.js` — in-game aid panel. Finds the live `SimulatorView` (production Vue hides `app._instance`, so walk `#app._vnode` + `.component`) and toggles the game's OWN props: `showGhost` / `showTarget` / `showShotPreview`. Only user-set toggles are forced (localStorage `mb_aim_aids`), so tutorial steps keep their scripted `show: [...]`.
- `src/physics/engine.js` — FROZEN vendor, minified names. Tune via `src/physics/constants.js` only.
- `src/services/api.js` — drills/tutorials/sessions, client-side. Tutorials bundled via `import.meta.glob`; `public/tutorials/*.json` fallback.
- `src/services/storage.js` — localStorage only.
- `src/graphics/`, `src/data/` — safe to edit. `src/components/`, `src/views/` empty (no Vue source extracted).
- `server.js` — local `dist/` preview only.
- `trainer.html` + `src/trainer.js` — 3D aim trainer (three.js). Ghost ball + fractions, drag balls/pockets, loads `src/data/drills.json` layouts, and `Shoot` runs the real engine simulation (`sim.cue` + `sim.shoot()`) and reports pot/miss + throw. Sessions from `storage` (`mb_drill_sessions`: `{drill, attempts:[{ball_pocketed, error, first_hit_object}]}`). Multi-page build via `vite.config.js` input.
- Engine gap: `engine.js` has no `He` binding, so `placeCue()`/`findGhostBallPosition()` throw. Set `sim.cue.position` / `sim.cue.axis` and call `shoot()` instead.

## Rules
- Never hand-edit `assets/*`, `dist/*`, `engine.js`.
- New tutorial JSON goes in BOTH `src/data/tutorials/` and `public/tutorials/` (same filename).
- Drills schema: see `src/data/drills.json`.
- Base must stay `'./'` in `vite.config.js` (Pages subpath).
