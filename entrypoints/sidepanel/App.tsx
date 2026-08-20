import { useEffect, useState } from "react";
import {
  clearVaultHandle,
  getVaultHandle,
  pickVaultFolder,
} from "../../lib/obsidian";
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
  const [vaultName, setVaultName] = useState("");
  const [hasVaultHandle, setHasVaultHandle] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    void (async () => {
      const loaded = await loadSettings();
      setSettings(loaded);
      const handle = await getVaultHandle();
      setHasVaultHandle(Boolean(handle));
      if (handle) {
        setVaultName(handle.name);
      } else if (loaded.vaultFolderName) {
        setVaultName(loaded.vaultFolderName);
      }
    })();
  }, []);

  async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
    const next = await saveSettings(patch);
    setSettings(next);
    return next;
  }

  async function handleChooseVault() {
    try {
      const handle = await pickVaultFolder();
      setVaultName(handle.name);
      setHasVaultHandle(true);
      await patchSettings({ vaultFolderName: handle.name });
      setStatus({
        kind: "success",
        message: `Vault folder set to ${handle.name}`,
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

  async function handleClearVault() {
    await clearVaultHandle();
    setVaultName("");
    setHasVaultHandle(false);
    await patchSettings({ vaultFolderName: "", setupComplete: false });
    setStatus({ kind: "info", message: "Vault folder cleared." });
  }

  async function finishOrSave() {
    if (!settings) {
      return;
    }
    if (!settings.apiKey.trim()) {
      setStatus({ kind: "error", message: "Add an API key." });
      return;
    }
    if (!settings.modelId.trim()) {
      setStatus({ kind: "error", message: "Choose a model." });
      return;
    }
    if (!hasVaultHandle || !settings.vaultFolderName.trim()) {
      setStatus({ kind: "error", message: "Choose an Obsidian vault folder." });
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

  if (!settings) {
    return <div className="app loading">Loading…</div>;
  }

  const incomplete = !isSetupReady(settings, hasVaultHandle);

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

      {incomplete && (
        <div className="status info">
          Clip page and selection live in the right-click menu and shortcuts
          (Alt+Shift+C / Alt+Shift+S). This panel is for setup only.
        </div>
      )}

      <section className="card">
        <SetupForm
          settings={settings}
          vaultName={vaultName}
          onChange={(patch) => void patchSettings(patch)}
          onChooseVault={() => void handleChooseVault()}
          onClearVault={() => void handleClearVault()}
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
