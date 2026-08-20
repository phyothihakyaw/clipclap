import { useEffect, useState } from "react";
import {
  clearSaveFolderHandle,
  getSaveFolderHandle,
  pickSaveFolder,
} from "../../lib/saveFolder";
import { loadSettings, saveSettings } from "../../lib/settings";
import type { Settings } from "../../lib/types";
import { isSetupReady } from "../../lib/types";
import { SetupForm } from "./SetupForm";

type Status =
  | { kind: "idle" }
  | { kind: "info"; message: string }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [folderName, setFolderName] = useState("");
  const [hasSaveFolderHandle, setHasSaveFolderHandle] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await loadSettings();
        setSettings(loaded);

        let handle = null;
        try {
          handle = await getSaveFolderHandle();
        } catch {
          handle = null;
        }

        setHasSaveFolderHandle(Boolean(handle));
        if (handle) {
          setFolderName(handle.name);
        } else if (loaded.saveFolderName) {
          setFolderName(loaded.saveFolderName);
        }
      } catch (error) {
        setBootError(
          error instanceof Error ? error.message : "Failed to load settings",
        );
      }
    })();
  }, []);

  async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
    const next = await saveSettings(patch);
    setSettings(next);
    return next;
  }

  async function handleChooseFolder() {
    try {
      const handle = await pickSaveFolder();
      setFolderName(handle.name);
      setHasSaveFolderHandle(true);
      await patchSettings({ saveFolderName: handle.name });
      setStatus({
        kind: "success",
        message: `Save folder set to ${handle.name}`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function handleClearFolder() {
    await clearSaveFolderHandle();
    setFolderName("");
    setHasSaveFolderHandle(false);
    await patchSettings({ saveFolderName: "", setupComplete: false });
    setStatus({ kind: "info", message: "Save folder cleared." });
  }

  async function finishOrSave() {
    if (!settings) {
      return;
    }
    if (!settings.apiKey.trim()) {
      setStatus({ kind: "error", message: "Add an OpenRouter API key." });
      return;
    }
    if (!settings.modelId.trim()) {
      setStatus({ kind: "error", message: "Choose a model." });
      return;
    }
    if (!hasSaveFolderHandle || !settings.saveFolderName.trim()) {
      setStatus({ kind: "error", message: "Choose a save folder." });
      return;
    }

    const next = await patchSettings({ setupComplete: true });
    setStatus({
      kind: "success",
      message: isSetupReady(next, true)
        ? "Setup saved. Clip via right-click or shortcuts."
        : "Settings saved.",
    });
  }

  if (bootError) {
    return (
      <div className="app">
        <div className="status error">{bootError}</div>
      </div>
    );
  }

  if (!settings) {
    return <div className="app loading">Loading…</div>;
  }

  const incomplete = !isSetupReady(settings, hasSaveFolderHandle);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Clipclap</h1>
          <p className="muted">
            {incomplete ? "Finish setup to start clipping" : "Settings"}
          </p>
        </div>
      </header>

      <section className="card">
        <SetupForm
          settings={settings}
          folderName={folderName}
          onChange={(patch) => void patchSettings(patch)}
          onChooseFolder={() => void handleChooseFolder()}
          onClearFolder={() => void handleClearFolder()}
        />
        <button type="button" onClick={() => void finishOrSave()}>
          {incomplete ? "Finish setup" : "Save settings"}
        </button>
      </section>

      {status.kind !== "idle" && (
        <div className={`status ${status.kind}`}>{status.message}</div>
      )}
    </div>
  );
}
