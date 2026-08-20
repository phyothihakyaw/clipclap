# Clipclap 1.0.0

First public release of Clipclap — a local-first web clipper that rewrites clips with your API key and saves them as notes (markdown to a local folder in v1).

Direction beyond v1: more browsers, more note targets, and plain-text saves — still without accounts or telemetry.

## Highlights

- **Popup-first UX** — pinned icon shows harness, save folder, and last status; settings live in the side panel
- **Clip from the page** — right-click menu or `Alt+Shift+C` (page) / `Alt+Shift+S` (selection)
- **Rewrite window** — review, edit, save, copy, or dismiss after each clip
- **Tone harnesses** — Personal, Public, Compact, or custom instructions
- **Model picker** — searchable catalog from your API key
- **Optional autos** — auto rewrite and auto save
- **Compact titles** — filenames without date prefixes; no trailing “Notes” suffix
- **Privacy-first** — no Clipclap servers, accounts, or telemetry; keys stay on device and stay masked after save
- **Safe local writes** — creates new unique files only; does not overwrite or delete existing files

## Install (v1 Chromium)

1. `npm install && npm run build`
2. Chromium browser → extensions → Developer mode → Load unpacked → `.output/chrome-mv3`
3. Pin Clipclap, open the popup gear, add API key + model + save folder

See [README.md](README.md) for full setup and privacy details.

## Notes for packagers

- Extension version: `1.0.0` (from `package.json`)
- License: MIT
- Manifest permissions are documented in the README
