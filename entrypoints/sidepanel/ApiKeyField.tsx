import { useState } from "react";

interface ApiKeyFieldProps {
  hasKey: boolean;
  onSaveKey: (apiKey: string) => void | Promise<void>;
  onClearKey: () => void | Promise<void>;
}

export function ApiKeyField({
  hasKey,
  onSaveKey,
  onClearKey,
}: ApiKeyFieldProps) {
  const [draft, setDraft] = useState("");
  const [replacing, setReplacing] = useState(!hasKey);

  async function commitDraft() {
    const next = draft.trim();
    if (!next) {
      return;
    }
    await onSaveKey(next);
    setDraft("");
    setReplacing(false);
  }

  if (hasKey && !replacing) {
    return (
      <div className="field">
        <label>OpenRouter API key</label>
        <div
          className="api-key-mask"
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="OpenRouter API key is set and hidden"
        >
          ••••••••••••••••••••
        </div>
        <div className="row">
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setReplacing(true);
              setDraft("");
            }}
          >
            Replace key
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => void onClearKey()}
          >
            Clear key
          </button>
        </div>
        <p className="hint">
          The key stays on this device and is never shown again after saving.
        </p>
      </div>
    );
  }

  return (
    <div className="field">
      <label htmlFor="api-key">OpenRouter API key</label>
      <input
        id="api-key"
        className="input"
        type="password"
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore="true"
        data-lpignore="true"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commitDraft()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commitDraft();
          }
        }}
        placeholder="Paste your OpenRouter API key, then leave the field"
      />
      <div className="row">
        <button
          type="button"
          onClick={() => void commitDraft()}
          disabled={!draft.trim()}
        >
          Save key
        </button>
        {hasKey && (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setReplacing(false);
              setDraft("");
            }}
          >
            Cancel
          </button>
        )}
      </div>
      <p className="hint">
          Paste your OpenRouter key, then save.
          After save, the key is masked and not copyable.
          Need help getting a key?{" "}
          <a
            href="https://github.com/phyothihakyaw/clipclap/blob/main/OPENROUTER.md"
            target="_blank"
            rel="noreferrer"
          >
            OpenRouter setup guide
          </a>
          .
        </p>
    </div>
  );
}
