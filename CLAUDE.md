# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page Snake Game built with **React + JavaScript + Vite**. No TypeScript, no tests.

## Development

- **Install**: `npm install`
- **Run locally**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview production build**: `npm run preview`
- No test or lint commands are configured.

## Deployment

GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Any push to `main` runs `npm ci && npm run build` and publishes `dist/` to Pages. The workflow assumes Pages **Source** is set to "GitHub Actions" in the repo settings.

Vite `base` is `'./'` ([vite.config.js](vite.config.js)), producing relative asset paths so the build works under any GitHub Pages subdirectory.

## Code Architecture

All game logic lives in [src/App.jsx](src/App.jsx). The file is intentionally a single component — the game engine runs imperatively inside a `useEffect(() => {...}, [])`, and React state drives only the UI chrome (score, level, high score, overlay, button labels).

Key things to know before editing:

- **Imperative engine, declarative UI**: the tick loop, canvas drawing, and direction buffer live in closure inside the mount-time `useEffect`. They never trigger re-renders. Only the scoreboard and overlay are React state. Do not move `snake`/`direction`/`food` into `useState` — a 60–150 ms tick would cause a re-render every frame.
- **Grid model**: fixed 20×20 grid; `CELL` is `CANVAS_SIZE / COLS`. Snake segments and food are `{x, y}` cell coordinates; only draw functions multiply by `CELL`.
- **State machine**: `phaseLocal` inside the effect is one of `idle | running | paused | over`. Transitions go through `startGame` / `pauseGame` / `endGame` / `restartGame`, which also call the React setters to update button/overlay UI. Mirror any new transition in both the local variable and the React state.
- **Direction buffering**: input writes to `nextDirection`; `tick` copies it into `direction` at the start of each step. This prevents two rapid key presses within one tick from reversing the snake into itself. Reversal guards in `turn()` must check the *current* `direction`, not `nextDirection`.
- **Speed/level coupling**: `getSpeed()` derives interval from `levelLocal`. When the level changes mid-game, `startLoop()` must be re-called to apply the new interval — `setInterval` does not re-read the delay.
- **High score persistence**: `localStorage` key is `snakeHighScore`. Reset flows should not clear it.
- **Input sources**: keyboard (arrows + WASD + P/Space), on-screen touch buttons, and canvas swipe gestures all funnel through the shared `turn(dx, dy)` helper. Add new input methods the same way; never mutate `direction` directly.
- **Imperative listeners**: `touchstart`/`touchend` on the canvas use `addEventListener` with `{ passive: false }` because React's synthetic touch events are passive and cannot call `preventDefault`. Keep them inside the `useEffect` so cleanup runs on unmount.
- **Control surface**: React event handlers (buttons, touch-pad) call through `apiRef.current` (`start`, `pause`, `restart`, `turn`), which the effect populates. This is the contract between the JSX and the engine — don't reach into the engine from outside the effect any other way.

## Files

- [prompt.md](prompt.md) — the original spec the game was generated from. Historical context only; the code is the source of truth.
- [snake-game.txt](snake-game.txt) — one-line seed that produced `prompt.md`.
- `ti-claude-code-*.png`, `screenshot.png` — screenshots at the repo root. They are **not** included in the deploy artifact (only `dist/` is uploaded), so they don't leak to Pages.
