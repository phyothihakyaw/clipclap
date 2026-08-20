import { OUTPUT_FORMAT_OPTIONS, TONE_OPTIONS } from "../../lib/harness";
import type { OutputFormat, Settings, ToneHarness } from "../../lib/types";
import { ApiKeyField } from "./ApiKeyField";
import { ModelPicker } from "./ModelPicker";

interface SetupFormProps {
  settings: Settings;
  folderName: string;
  onChange: (patch: Partial<Settings>) => void | Promise<void>;
  onChooseFolder: () => void | Promise<void>;
  onClearFolder: () => void | Promise<void>;
}

export function SetupForm({
  settings,
  folderName,
  onChange,
  onChooseFolder,
  onClearFolder,
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
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="output-format">Save format</label>
        <select
          id="output-format"
          className="input"
          value={settings.outputFormat}
          onChange={(event) =>
            void onChange({
              outputFormat: event.target.value as OutputFormat,
            })
          }
        >
          {OUTPUT_FORMAT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
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
          placeholder="Optional. Example: Always write short and simple sentences. Avoid lists and emojis."
        />
      </div>

      <div className="field">
        <label>Save folder</label>
        <div className="row">
          <button type="button" onClick={() => void onChooseFolder()}>
            {folderName ? "Change folder" : "Choose folder"}
          </button>
          {folderName && (
            <button
              type="button"
              className="ghost"
              onClick={() => void onClearFolder()}
            >
              Clear
            </button>
          )}
        </div>
        <p className="hint">
          {folderName
            ? `Saving into: ${folderName}`
            : "Pick any local folder for .md or .txt files."}
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
        Include citation / source line
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
          checked={settings.autoSave}
          onChange={(event) =>
            void onChange({ autoSave: event.target.checked })
          }
        />
        Auto save after rewrite
      </label>
    </div>
  );
}
