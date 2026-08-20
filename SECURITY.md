# Security Policy

## Supported versions

Security fixes are accepted against the latest `1.x` release line (currently **1.0.0**).

## What Clipclap stores

Clipclap is local-first.
It stores settings and an OpenRouter API key in extension storage on the user’s device, a save-folder handle in IndexedDB, and temporary clip state in session storage.
It does not operate Clipclap servers that receive user clips, notes, or keys.

## Data safety expectations

- Existing files in a user-selected save folder must not be overwritten or deleted by Clipclap.
- API keys must not be logged, committed, or shown in full after save.
- Network calls for rewriting should go only to OpenRouter (`https://openrouter.ai/`).
  v1 does not accept keys or endpoints from other AI providers.

## Reporting a vulnerability

Please report security issues privately.
Include steps to reproduce, impact, and affected versions when possible.

Do not open a public GitHub issue for unfixed vulnerabilities that could expose user keys or saved files.

If this repository lists a security contact or GitHub Security Advisories, prefer that channel.
Otherwise email the maintainers listed on the repository profile.
