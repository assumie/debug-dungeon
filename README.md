# Debug Dungeon

**Three rooms. Three patches. One way out.** A tiny playable code adventure by [Esther Lee Qian Hui](https://github.com/assumie).

**[Play the game](https://assumie.github.io/debug-dungeon/)** · [See Clutch Lab](https://assumie.github.io/clutch-lab/) · [Explore FoodSnap](https://github.com/assumie/foodsnap-body)

## The quest

| Room | Challenge | What it demonstrates |
| --- | --- | --- |
| Logic Gate | Trace a JavaScript condition | Reading code carefully |
| Broken Corridor | Fix a cramped mobile grid | Responsive CSS |
| Final Boss | Repair a real Clutch Lab form bug | Debugging DOM selectors |

The final boss comes from a real error I encountered while building [Clutch Lab](https://github.com/assumie/clutch-lab). My `$` helper used `getElementById`, but I passed it a CSS selector. The result was `null`, and the form failed to open. The game turns that mistake and its fix into a small puzzle.

## Features

- Three short rooms with immediate feedback and optional hints.
- Progress map, collected patch shards, timer, and a finish screen.
- Best clear time saved on your own device with `localStorage`; no account, leaderboard, tracking, or server.
- Keyboard options **1**, **2**, and **3**, visible focus indicators, accessible status messages, and reduced-motion support.
- Links to the real project behind the final puzzle.

## Run locally

No framework or build step is needed. From this folder:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The app uses plain HTML, CSS, and JavaScript. `index.html` contains the layout, `styles.css` contains the responsive design, and `game.js` contains the puzzle data and state. Best-time storage may behave differently if you open the file using `file://` instead of a local server.

## Design notes

The visual style echoes my purple and neon GitHub profile, but the puzzles carry the story. A wrong choice can be retried without a penalty. Hints are counted for reflection, not used to block progress. All code examples are rendered as text, and the game never asks visitors to run unknown code.

This is an original educational mini-game, not an official Counter-Strike or GitHub product.
