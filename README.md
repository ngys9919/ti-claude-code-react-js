# Snake Game

A modern, responsive Snake Game built with **React + JavaScript + Vite**.

**Live demo:** https://ngys9919.github.io/ti-claude-code/

![Snake Game](screenshot.png)

![Start screen](ti-claude-code-start-game.png)

## Features

- Classic snake-and-food gameplay on a 20×20 grid
- Smooth canvas rendering with neon glow styling
- Current score, best score (persisted via `localStorage`), and level indicator
- Progressive difficulty — speed increases every 50 points
- Pause / Resume and Restart controls
- Game Over overlay with final score

![Game over screen](ti-claude-code-game-over.png)

## Controls

- **Keyboard**: Arrow keys or `W` `A` `S` `D` to move
- **Pause**: `P` or `Space` (Space also starts / restarts)
- **Touch**: on-screen directional buttons (shown on small screens)
- **Swipe**: swipe on the canvas to turn

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer

### Install and run

```bash
npm install
npm run dev
```

Then visit http://localhost:5173.

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves the built dist/ locally
```

## Files

```
index.html            — Vite entry (mounts React into #root)
src/main.jsx          — React entry point
src/App.jsx           — the game component (engine + UI)
src/style.css         — dark neon theme, responsive layout, mobile touch UI
vite.config.js        — Vite config (base: './' for GitHub Pages)
```

All game logic lives in [src/App.jsx](src/App.jsx). The tick loop, canvas drawing, and direction buffer run imperatively inside a mount-time `useEffect` (to avoid a re-render every 60–150 ms frame); only score / level / best / overlay are React state. See [CLAUDE.md](CLAUDE.md) for the full architecture notes.

## Deployment

Automatically deployed to **GitHub Pages** on every push to `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). The workflow runs `npm ci && npm run build` and publishes `dist/`.

To enable on a fork:

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` — the workflow builds and publishes the site.

## License

Feel free to play, fork, and modify.
