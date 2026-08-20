# Clipclap 2.0.0

Released 2026-08-20.

Chrome zip: `clipclap-2.0.0-chrome.zip`

---

# Clipclap 1.0.0

Local-first web clipper: rewrite clips with your OpenRouter API key and save Markdown or plain text to a local folder.

v1 uses OpenRouter only.
Keys from other AI providers (OpenAI, Anthropic, Google, and similar) do not work yet.
Setup help: [OPENROUTER.md](OPENROUTER.md).

## Features

- Clip page or selection via context menu or shortcuts (`Alt+Shift+C` / `Alt+Shift+S`)
- Rewrite, edit, save, or copy in a review window
- Tone harnesses (Personal, Public, Compact, or custom instructions)
- Searchable model picker from your OpenRouter API key
- Save as Markdown (`.md` with YAML attributes) or Plain text (`.txt`), with matching rewrite prompts
- Optional auto rewrite and auto save
- Unique filenames only (no overwrite or delete of existing files)
- Masked, non-copyable OpenRouter API key after save
- Saves into any local folder that accepts `.md` / `.txt` (tested with Obsidian)
- Pictures and videos become lightweight links (modest image URLs, watch/poster links) - not copied files or high-res binaries
