# Contributing to Clipclap

Thanks for helping improve Clipclap.
This project is a local-first browser extension for clipping, rewriting, and saving notes or text.
Please keep user privacy and save-folder safety as hard requirements.

Users install from the Chrome Web Store.
This document is for people building from source or cutting releases.

## Ground rules

- Never commit API keys, tokens, `.env` files, credentials, or personal clip/note content.
- Never add telemetry, analytics, or remote logging of clip contents or keys.
- Never overwrite or delete existing files in a user’s chosen save folder.
  New files must use unique names.
- Prefer local-first behavior.
  Do not introduce a Clipclap backend unless there is a clear, optional, documented reason.
- Keep save destinations agnostic (“save folder”, not a single note app).
  For rewriting, v1 is OpenRouter-only: say “OpenRouter API key” in user-facing copy so people do not paste keys from other providers.
  Broader provider support can loosen that wording later.
- Design changes so they can grow beyond Chromium and beyond a single note app (plain text and other targets are in scope for later releases).

## Development setup

```bash
git clone https://github.com/phyothihakyaw/clipclap.git
cd clipclap
npm install
npm run dev
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `.output/chrome-mv3-dev`
4. Pin Clipclap, open settings (popup gear), and finish setup:
   - OpenRouter API key ([OPENROUTER.md](OPENROUTER.md) if you need one)
   - Model
   - Save format (Markdown or Plain text)
   - Save folder
   - Optional auto rewrite / auto save

Production build:

```bash
npm run build
```

Load `.output/chrome-mv3` the same way.

Useful scripts:

- `npm run compile` - TypeScript check
- `npm run build` - production Chromium build
- `npm run zip` - pack `.output/clipclap-*-chrome.zip`

## Project layout

- `entrypoints/popup/` - pinned action popup (status only)
- `entrypoints/sidepanel/` - settings / first-run setup
- `entrypoints/rewrite/` - rewrite review window
- `entrypoints/background.ts` - menus, shortcuts, clip orchestration
- `entrypoints/content.ts` - page/selection extraction
- `lib/` - extract, rewrite, document formatting, save-folder writes, settings

## Pull requests

1. Keep changes focused.
   Prefer small PRs over large mixed ones.
2. Update docs when behavior, privacy, or product scope changes.
3. Run `npm run compile` and `npm run build` before opening a PR.
4. Describe the user-facing impact and any permission or network changes.

## Releasing

CI runs on every push and pull request (`npm run compile` + `npm run build`).

Maintainers cut releases from GitHub Actions (**Release** workflow), not from ad-hoc local tags.

1. Ensure the default branch is green on CI
2. Actions → **Release** → **Run workflow** → choose `patch` / `minor` / `major`
3. The job bumps the version, zips the extension, pushes tag `vX.Y.Z`, and creates a GitHub Release with the Chrome zip attached
4. Download that zip from the GitHub Release and upload it manually in the Chrome Web Store developer dashboard

A GitHub Release zip does not auto-update Load unpacked installs.
Chrome Web Store listing updates installed users after you publish the package there.

## Reporting security issues

Do not open a public issue for sensitive reports.
See [SECURITY.md](SECURITY.md).
