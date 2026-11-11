# Radical Rush — separated source code

This is the latest mobile-paths-fixed, 300-question Radical Rush game with the **English and Filipino YouTube lesson buttons** on the opening menu. The English YouTube video starts at 0:00.

## Folder structure
- `index.html`: HTML structure, game screens, menus, and built-in images.
- `assets/css/`: 5 stylesheets in their original cascade order. Edit game looks and responsive layouts here.
- `assets/js/`: 35 original JavaScript sections, each in a separate named file, in the same execution order as the standalone version. Edit gameplay, question bank, powers, tools, and interactions here.

**File count: 41 files** (1 HTML + 5 CSS + 35 JS) plus this README = **42 files total**, under 100.

## Start playing
1. Extract the ZIP **before opening the game**. Do not move just `index.html` to a different folder; it requires the `assets` folder.
2. Open `index.html` in Chrome or Edge. The gameplay assets are local. Watching the YouTube lessons requires internet access.
3. If you prefer HTTP (recommended for development), run `python -m http.server 8000` from this folder, then open `http://localhost:8000/`.

## Publish to GitHub Pages
Upload **index.html and the entire assets folder**, retaining exactly these paths, to your repository root. Enable Pages for the main branch root if needed. Opening only index.html without its folder will leave the game unstyled or nonfunctional.

## Important notes
- The source order of existing scripts and CSS has been preserved; do not shuffle JS `<script>` tags without testing. Some later files intentionally enhance/override earlier functions.
- CSS remains in five chronological batches to preserve the original visual priorities.
- `game-core.js` and `embedded-original-music.js` include the original inlined art/audio data so there are no extra asset dependencies.
- Keep an intact backup before editing. YouTube tutorial links open externally, not inside an iframe.

## Latest mobile paths fix
- The default phone board mode is **Fit Whole Map** so curved paths remain visible at first load.
- **Large Tiles** remains available for swipeable zoomed viewing.
- The original wheel, character abilities, and other gameplay systems are preserved.

## What to edit
- Menus and screen structure: `index.html`
- Styling and mobile/fullscreen layouts: `assets/css/`
- Wheel, questions, powers, portals, tile interaction and mobile navigation: `assets/js/`
- The phone board view controller is `assets/js/rr-larger-board-logic.js`.

## Quick checklist after updating GitHub Pages
- `index.html` lives in the website root.
- Both `assets/css/` and `assets/js/` are uploaded in full.
- Do a hard refresh if the browser caches an old stylesheet or script.
