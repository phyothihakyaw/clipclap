# AGENTS.md

Guidance for AI coding agents and automated contributors working on Clipclap.

## Product intent

Clipclap is a local-first web clipper.
Users clip a page or selection, optionally rewrite it with their own API key, and save the result as notes or text into a destination they control.

**v1** targets Chromium and local-folder markdown writes (Obsidian-friendly).
The longer-term scope includes more browsers, more note destinations, and plain-text output.

Priorities: privacy, save-folder safety, simple UX, and long-term maintainability.

## Non-negotiables

- Do not add telemetry, analytics, crash reporters, or remote logging of clip text or API keys.
- Do not commit secrets, sample keys, `.env` files, or real user notes.
- Do not overwrite or delete existing files in the user’s chosen save folder.
  Writes must use unique filenames.
- Do not ship a Clipclap backend or require an account for core clipping.
- Do not put provider or destination brand names in primary UI copy.
  Say “API key”, “model”, “rewriting”, and “save folder”.
- Do not expand host permissions or extension permissions without documenting why in the PR and README.
- Prefer abstractions that leave room for other browsers and save formats; avoid hard-coding “Obsidian-only” or “Chrome-only” into new public APIs when a neutral name works.

## Architecture map

- Popup (`entrypoints/popup/`): status only.
  No clip buttons.
- Side panel (`entrypoints/sidepanel/`): settings and first-run setup only.
- Rewrite window (`entrypoints/rewrite/`): ask / rewrite / edit / save after a clip.
- Background (`entrypoints/background.ts`): context menus, shortcuts, open rewrite window.
- Content script (`entrypoints/content.ts`): Readability + selection extract.
- `lib/obsidian.ts`: File System Access writes into the user-picked folder (v1 local save path).
- `lib/rewrite.ts`: OpenAI-compatible chat completions (OpenRouter host in v1).

## UX constraints

- Clipping happens from the context menu and shortcuts only.
- Settings open from the popup gear or setup warning into the side panel.
- `chrome.sidePanel.open()` must be invoked from a user gesture in the popup when possible.
  Do not rely on the background script for that path.
- After save, API keys stay masked and must not be copyable from the UI.

## Engineering preferences

- Prefer quality, simplicity, and robustness over short-term shortcuts.
- Keep TypeScript strict and run `npm run compile` plus `npm run build` after meaningful changes.
- Match existing code style.
  Avoid drive-by refactors unrelated to the task.
- For long Markdown docs in this repo, put each full sentence on its own line.

## Privacy checklist before finishing a change

1. Does any new code send data off-device?
   If yes, it must be explicit, optional where possible, and documented.
2. Can a user’s save folder be damaged?
   Prefer create-only unique paths; never silent overwrite or delete.
3. Could an API key appear in UI, logs, or error strings?
   Redact it.
4. Are sample docs free of real keys and personal content?
