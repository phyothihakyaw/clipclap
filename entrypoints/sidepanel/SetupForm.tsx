import { TONE_OPTIONS } from "../../lib/harness";
import type { Settings, ToneHarness } from "../../lib/types";
import { ApiKeyField } from "./ApiKeyField";
import { ModelPicker } from "./ModelPicker";

interface SetupFormProps {
  settings: Settings;
  vaultName: string;
  onChange: (patch: Partial<Settings>) => void | Promise<void>;
  onChooseVault: () => void | Promise<void>;
  onClearVault: () => void | Promise<void>;
}

export function SetupForm({
  settings,
  vaultName,
  onChange,
  onChooseVault,
  onClearVault,
}: SetupFormProps) {
  return (
    <div className="setup-form">
      <ApiKeyField
        hasKey={Boolean(settings.apiKey)}
        onSaveKey={(apiKey) => onChange({ apiKey })}
        onClearKey={() =>
          onChange({ apiKey: "", setupComplete: false })
        }
      />

      <ModelPicker
        apiKey={settings.apiKey}
        selectedModelId={settings.modelId}
        onSelect={(modelId) => void onChange({ modelId })}
      />

      <div className="field">
        <label htmlFor="tone">Tone harness</label>
        <select
          id="tone"
          className="input"
          value={settings.tone}
          onChange={(event) =>
            void onChange({ tone: event.target.value as ToneHarness })
          }
        >
          {TONE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} — {option.description}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="custom">Custom instructions</label>
        <textarea
          id="custom"
          className="input textarea"
          rows={3}
          value={settings.customInstructions}
          onChange={(event) =>
            void onChange({ customInstructions: event.target.value })
          }
          placeholder="Optional. Example: extract only the API surface"
        />
      </div>

      <div className="field">
        <label>Obsidian vault folder</label>
        <div className="row">
          <button type="button" onClick={() => void onChooseVault()}>
            {vaultName ? "Change folder" : "Choose folder"}
          </button>
          {vaultName && (
            <button
              type="button"
              className="ghost"
              onClick={() => void onClearVault()}
            >
              Clear
            </button>
          )}
        </div>
        <p className="hint">
          {vaultName
            ? `Saving into: ${vaultName}`
            : "Pick the vault folder (or a subfolder) where notes should land."}
        </p>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={settings.citationEnabled}
          onChange={(event) =>
            void onChange({ citationEnabled: event.target.checked })
          }
        />
        Include citation block
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={settings.autoRewrite}
          onChange={(event) =>
            void onChange({ autoRewrite: event.target.checked })
          }
        />
        Auto rewrite after clip
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={settings.autoSaveToObsidian}
          onChange={(event) =>
            void onChange({ autoSaveToObsidian: event.target.checked })
          }
        />
        Auto save rewritten notes to Obsidian
      </label>
    </div>
  );
}
