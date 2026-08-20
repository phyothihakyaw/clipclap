# Contributing to Clipclap

Thanks for helping improve Clipclap.
This project is a local-first browser extension for clipping, rewriting, and saving notes or text.
Please keep user privacy and save-folder safety as hard requirements.

## Ground rules

- Never commit API keys, tokens, `.env` files, credentials, or personal clip/note content.
- Never add telemetry, analytics, or remote logging of clip contents or keys.
- Never overwrite or delete existing files in a user’s chosen save folder.
  New files must use unique names.
- Prefer local-first behavior.
  Do not introduce a Clipclap backend unless there is a clear, optional, documented reason.
- Keep user-facing copy provider-agnostic and destination-agnostic (“API key”, “rewriting”, “save folder”).
  Provider and destination details belong in adapters and docs, not marketing UI.
- Design changes so they can grow beyond Chromium and beyond a single note app (plain text and other targets are in scope for later releases).

## Development setup

```bash
npm install
npm run dev
```

Load `.output/chrome-mv3-dev` via `chrome://extensions` → **Load unpacked**.

Useful scripts:

- `npm run compile` — TypeScript check
- `npm run build` — production Chromium build
- `npm run zip` — pack a zip for distribution

## Project layout

- `entrypoints/popup/` — pinned action popup (status only)
- `entrypoints/sidepanel/` — settings / first-run setup
- `entrypoints/rewrite/` — rewrite review window
- `entrypoints/background.ts` — menus, shortcuts, clip orchestration
- `entrypoints/content.ts` — page/selection extraction
- `lib/` — extract, rewrite, citation, local folder write, settings

## Pull requests

1. Keep changes focused.
   Prefer small PRs over large mixed ones.
2. Update docs when behavior, privacy, or product scope changes.
3. Run `npm run compile` and `npm run build` before opening a PR.
4. Describe the user-facing impact and any permission or network changes.

## Releasing

Maintainers cut releases from GitHub Actions (**Release** workflow), not from ad-hoc local tags.

1. Ensure `main`/`master` is green on CI
2. Actions → **Release** → **Run workflow** → choose `patch` / `minor` / `major`
3. The job bumps the version, zips the extension, pushes tag `vX.Y.Z`, and creates a GitHub Release

Optional Chrome Web Store publish uses repository secrets only (never commit them):

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

See the README **Releases** section and Google’s [Web Store API docs](https://developer.chrome.com/docs/webstore/using-api).

## Reporting security issues

Do not open a public issue for sensitive reports.
See [SECURITY.md](SECURITY.md).
