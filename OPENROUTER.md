# Get an OpenRouter API key for Clipclap

Clipclap v1 rewrites clips through [OpenRouter](https://openrouter.ai/) only.
You need an OpenRouter API key.
Keys from OpenAI, Anthropic, Google, and other providers do not work in Clipclap yet.

This guide walks through account signup, creating a key, and pasting it into Clipclap.

## What OpenRouter is

OpenRouter is a third-party service that routes chat requests to many AI models behind one API.
Clipclap sends rewrite requests to OpenRouter when you rewrite (or when auto-rewrite is on).
Clipclap does not create an OpenRouter account for you, and it never stores your key on Clipclap servers.

## 1. Create an OpenRouter account

1. Open [https://openrouter.ai/](https://openrouter.ai/).
2. Sign up with email, Google, GitHub, or another option OpenRouter offers.
3. Complete any email verification OpenRouter asks for.

Official docs for API auth: [Authentication](https://openrouter.ai/docs/api/reference/authentication).

## 2. Create an API key

1. Open [https://openrouter.ai/keys](https://openrouter.ai/keys) while signed in.
2. Create a new key.
3. Give it a name you will recognize later (for example `clipclap`).
4. Optionally set a credit limit or expiration so a leaked key cannot spend freely.
5. Create the key, then **copy it immediately**.
   OpenRouter usually shows the full key only once.

Store the key in a password manager.
Do not commit it to git, paste it into public chats, or share screenshots that show the full value.

## 3. Add credits if needed

Some models on OpenRouter are free or low-cost; many paid models need account credits.

1. Open OpenRouter’s credits or billing area from your account dashboard (often [https://openrouter.ai/settings/credits](https://openrouter.ai/settings/credits)).
2. Add a small amount of credit if rewrites fail with billing or credit errors.
3. Prefer models whose pricing fits your budget when you pick a model in Clipclap.

Pricing and availability change on OpenRouter’s side.
Clipclap’s model picker shows what OpenRouter returns for your key.

## 4. Paste the key into Clipclap

1. Open Clipclap settings (popup gear → side panel, or the extension’s settings UI).
2. Find **OpenRouter API key**.
3. Paste the key and save.
4. After save, Clipclap masks the key and does not let you copy it back out.
5. Load models, pick one, then finish setup (save folder and other options).

You can replace or clear the key later from the same settings screen.

## 5. Confirm it works

1. Clip a short page or selection.
2. In the review window, run a rewrite.
3. If rewrite succeeds, the key and model are working.

If model loading or rewrite fails:

- Confirm the key is an OpenRouter key (often starts with `sk-or-`), not an OpenAI or other vendor key.
- Confirm the key still exists and is not revoked on [https://openrouter.ai/keys](https://openrouter.ai/keys).
- Confirm the account has enough credit for the model you chose.
- Try a cheaper or free model from the Clipclap picker.

## Privacy notes

- The key stays in Clipclap’s extension storage on your device.
- Clipclap sends it to OpenRouter only when loading models or rewriting.
- Clip text you rewrite is sent to OpenRouter (and then to the model provider behind the model you chose).
- See [README.md](README.md) and [SECURITY.md](SECURITY.md) for how Clipclap handles data.

## Official OpenRouter links

| Resource | URL |
| --- | --- |
| Home | [https://openrouter.ai/](https://openrouter.ai/) |
| API keys | [https://openrouter.ai/keys](https://openrouter.ai/keys) |
| Auth docs | [https://openrouter.ai/docs/api/reference/authentication](https://openrouter.ai/docs/api/reference/authentication) |
| Models | [https://openrouter.ai/models](https://openrouter.ai/models) |

OpenRouter’s UI labels can change.
If a button name differs, look for Keys / API keys in the account menu and follow their current create-key flow.
