# Clipclap

**Local-first web clipper: rewrite clips and save as notes or text.**

**v1.0.0** ships as a Chromium extension that clips a page or selection, rewrites it with your API key, and writes a file into a local folder you choose (Obsidian-friendly markdown today).

The product direction is broader: more browsers, more note targets, and plain-text saves — without accounts, backends, or telemetry.

Clipclap does not phone home.
Your API key, clips, and saved files stay under your control.

## Features (v1)

- Small pinned-extension popup for status (harness, save folder, last result)
- Settings in the side panel only (gear or setup warning)
- Clip via right-click menu or keyboard shortcuts — not from the popup or sidebar
- Rewrite review in a dedicated floating window
- Tone harnesses, searchable model picker, optional auto rewrite / auto save
- Compact titles, YAML frontmatter, and citations (markdown notes)
- Masked, non-copyable API key after save

## Roadmap (not all in v1)

- Additional browsers beyond Chromium
- More note destinations and formats
- Plain-text save option alongside structured notes

## Requirements (v1)

- Chromium browser (Chrome, Edge, Brave, and similar)
- An API key for an OpenAI-compatible provider (v1 uses OpenRouter under the hood)
- A local folder to save into (Obsidian vault or any markdown/text folder)

## Install from source

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start a development build:

```bash
npm run dev
```

4. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `.output/chrome-mv3-dev`
5. Pin Clipclap, open the popup, click the gear (or the setup warning), and finish settings:
   - Paste your API key
   - Choose a model
   - Pick a local save folder
   - Optionally enable auto rewrite / auto save

Production build:

```bash
npm run build
```

Load `.output/chrome-mv3` the same way.

## How to clip

- Right-click → **Clip page with Clipclap** or **Clip selection with Clipclap**
- `Alt+Shift+C` — clip page
- `Alt+Shift+S` — clip selection

A rewrite window opens so you can rewrite, edit, save, copy, or dismiss.

## Note format (v1 markdown)

Filenames use a compact title slug (no date prefix), for example `react-server-components.md`.
If that name already exists, Clipclap writes `react-server-components-1.md` instead of overwriting.

```markdown
---
title: "React Server Components"
source: "https://example.com/…"
site: "example.com"
clipped: 2026-08-20
tone: compact
tags:
  - clipclap
---

# React Server Components

Rewritten content…

## Citation
"React Server Components." example.com. https://example.com/…. Accessed 20 Aug 2026.
```

## Privacy and data handling

Clipclap is local-first.

| Data | Where it lives | Who receives it |
| --- | --- | --- |
| API key | Extension storage on your device | Only the rewrite API when you rewrite |
| Settings (model, harness, flags) | Extension storage | Nobody else |
| Save-folder permission | IndexedDB (File System Access handle) | Local only |
| Last clip / status | Session storage (cleared when the browser session ends) | Local only |
| Saved files | The folder you chose | Local only |

What Clipclap does **not** do:

- No Clipclap servers, analytics, ads, or telemetry
- No account or signup
- No reading your disk beyond the folder you grant
- No deleting or overwriting existing files in that folder (new unique filenames only)
- No shipping API keys or secrets in the repository

After you save an API key, the UI shows a mask and blocks copy/cut of that field.
Error text is redacted so keys are not echoed back into the UI.

Uninstalling the extension removes extension storage.
Files already written to your folder remain on disk (they are your files).

See [SECURITY.md](SECURITY.md) for reporting issues.

## Permissions (why they exist)

- `activeTab` / `scripting` / host access — extract the page or selection you clip
- `storage` — save settings and the last clip on device
- `contextMenus` — right-click clip actions
- `sidePanel` — settings UI
- `windows` — open the rewrite review window
- Network to your model provider — rewrite only when you ask (or when auto-rewrite is on)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
Agent / AI contributor guidance lives in [AGENTS.md](AGENTS.md).

## Releases

CI runs on every push and pull request (`npm run compile` + `npm run build`).

To cut a release:

1. Push the repo to GitHub and open **Actions → Release → Run workflow**
2. Choose a semver bump (`patch`, `minor`, or `major`)
3. The workflow bumps `package.json` (and thus the extension manifest version), builds `.output/clipclap-X.Y.Z-chrome.zip`, pushes tag `vX.Y.Z`, and creates a GitHub Release with the zip attached

Browser **auto-updates** for installed users typically require a store listing (for Chromium, the Chrome Web Store).
A GitHub Release zip alone does not update sideloaded / Load unpacked installs.

### Optional Chrome Web Store upload

After you have a [Chrome Web Store developer account](https://developer.chrome.com/docs/webstore) and an extension listing, add these repository secrets:

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

Setup guide: [Using the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api).
When all four secrets are set, the Release workflow also uploads and auto-publishes the zip.
If any secret is missing, that step is skipped and the GitHub Release still succeeds.

Never commit OAuth client secrets or refresh tokens.

## License

MIT — see [LICENSE](LICENSE).

## Extension icon

WXT auto-discovers PNGs in `public/`.
Add these files (square, opaque background works best in the toolbar):

```text
public/
  icon-16.png
  icon-32.png
  icon-48.png
  icon-128.png
```

Then rebuild (`npm run dev` or `npm run build`).
The browser picks them up for the toolbar, extensions page, and store listing.

Easiest path: design one master image at **128×128** (or larger), export the sizes above, and drop them into `public/`.
Alternatively, install [`@wxt-dev/auto-icons`](https://www.npmjs.com/package/@wxt-dev/auto-icons) and put a single `assets/icon.png` (or SVG) so WXT generates the sizes for you.
