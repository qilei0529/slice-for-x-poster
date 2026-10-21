# Slice for X

Slice one picture into portrait tiles for an X post. Everything runs in the browser.

Each tile is **1646 × 2048**. Choose 1–4 tiles, set a background and corner radius, preview the post, then download a zip of JPGs.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3004](http://localhost:3004).

## Computer use / agent API

Agents (e.g. Codex computer use) can drive the editor without guessing the canvas:

- Manifest: [http://localhost:3004/agent.json](http://localhost:3004/agent.json) — DOM `[data-agent]` selectors and JS method docs.
- Page global: `window.SliceForX` after the editor mounts — `loadImage`, `setConfig`, `setFrame`, `preview`, `export`, `getState`, `help`, …

Prefer `loadImage({ base64 })` when a remote URL is blocked by CORS. Prefer `setFrame` over screenshot-based dragging on the canvas.

## Shot

![](./public/welcome.jpg)


## Changelog

### 0.2.5 — 2026-10-21

- Move the theme toggle to the top-right of the screen, with a GitHub link beside it.

### 0.2.4 — 2026-10-21

- Add a computer-use control surface: `/agent.json`, stable `data-agent` markers, and `window.SliceForX` (URL/base64 load, config, frames, export).

### 0.2.3 — 2026-10-21

- Export tiles as JPEG instead of PNG for smaller Twitter-ready uploads.
- Zoom the stage with the mouse wheel and pan by dragging empty space; initial scale fits the viewport.
- Use the hand cursor only when a selected image is hovered or moved.

### 0.2.2 — 2026-10-14

- Remove a selected image from a dot above its top-left corner. Hover turns the dot into an X.

### 0.2.1 — 2026-10-14

- Add a dark / light toggle in the top-right of the side panel.

### 0.2.0 — 2026-10-14

- Group canvas and image controls in the side panel.
- Show the app version next to the panel title.

### 0.1.2 — 2026-10-13

- Make each tile's width and height editable.
- Keep a custom background separate from the presets.

### 0.1.1 — 2026-10-12

- Place multiple images, move them, and delete the selection.
- Preview the X post before export.
- Add a welcome dialog and a New action that clears the canvas.
- Rename the app to Slice for X.

### 0.1.0 — 2026-10-12

- Slice one picture into portrait tiles and download a zip of PNGs.
- Set the background and corner radius.