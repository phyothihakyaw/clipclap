import { useEffect, useMemo, useState } from "react";
import { TONE_OPTIONS } from "../../lib/harness";
import type { ExtensionMessage, LastStatus } from "../../lib/messages";
import { LAST_STATUS_KEY } from "../../lib/messages";
import { getSaveFolderHandle } from "../../lib/saveFolder";
import { loadSettings } from "../../lib/settings";
import { DEFAULT_SETTINGS, isSetupReady, type Settings } from "../../lib/types";
import "./style.css";

async function openSettingsPanel(): Promise<void> {
  // Must run from this popup click stack. Routing through the background
  // drops the user gesture and Chrome rejects sidePanel.open().
  const currentWindow = await browser.windows.getCurrent();
  if (currentWindow.id != null) {
    await browser.sidePanel.open({ windowId: currentWindow.id });
    return;
  }
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    await browser.sidePanel.open({ tabId: tab.id });
  }
}

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [folderName, setFolderName] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<LastStatus | null>(null);
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const harnessLabel = useMemo(() => {
    return (
      TONE_OPTIONS.find((option) => option.id === settings.tone)?.label ??
      settings.tone
    );
  }, [settings]);

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

        if (handle) {
          setFolderName(handle.name);
        } else if (loaded.saveFolderName) {
          setFolderName(loaded.saveFolderName);
        }
        setReady(isSetupReady(loaded, Boolean(handle)));

        try {
          const session = await browser.storage.session.get(LAST_STATUS_KEY);
          setStatus(
            (session[LAST_STATUS_KEY] as LastStatus | undefined) ?? null,
          );
        } catch {
          // session storage unavailable
        }
      } catch (error) {
        setBootError(
          error instanceof Error ? error.message : "Failed to load settings",
        );
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  useEffect(() => {
    const listener = (message: ExtensionMessage) => {
      if (message.type === "STATUS_UPDATE") {
        setStatus(message.status);
      }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  async function openSettings() {
    try {
      await openSettingsPanel();
    } catch (error) {
      setBootError(
        error instanceof Error
          ? error.message
          : "Could not open settings panel",
      );
      return;
    }
    window.close();
  }

  return (
    <div className="popup">
      <header className="popup-header">
        <div>
          <h1>Clipclap</h1>
          <p className="muted">
            {!booted ? "Loading…" : ready ? "Ready" : "Setup needed"}
          </p>
        </div>
        <button
          type="button"
          className="ghost icon-btn"
          aria-label="Settings"
          title="Settings"
          onClick={() => void openSettings()}
        >
          <span aria-hidden="true">⚙</span>
        </button>
      </header>

      {bootError && <div className="status error">{bootError}</div>}

      {booted && !ready && (
        <button
          type="button"
          className="warning"
          onClick={() => void openSettings()}
        >
          Finish setup to clip. Right-click or use shortcuts after setup.
        </button>
      )}

      {booted && ready && (
        <section className="card summary-card">
          <div className="summary-row">
            <span className="summary-label">Tone</span>
            <span className="summary-value">{harnessLabel}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Folder</span>
            <span className="summary-value">{folderName || "Not set"}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Format</span>
            <span className="summary-value">
              {settings.outputFormat === "plaintext"
                ? "Plain text (*.txt)"
                : "Markdown (*.md)"}
            </span>
          </div>
          {(settings.autoRewrite || settings.autoSave) && (
            <div className="badge-row">
              {settings.autoRewrite && (
                <span className="badge">Auto rewrite</span>
              )}
              {settings.autoSave && (
                <span className="badge">Auto save</span>
              )}
            </div>
          )}
        </section>
      )}

      {status && (
        <div className={`status ${status.kind}`}>{status.message}</div>
      )}

      <section className="usage-card" aria-label="How to clip">
        <p className="usage-title">How to clip</p>
        <ul className="usage-list">
          <li>
            Right-click → <strong>Clip page</strong> or{" "}
            <strong>Clip selection</strong>
          </li>
          <li>
            Shortcuts: <kbd>Alt+Shift+C</kbd> page, <kbd>Alt+Shift+S</kbd>{" "}
            selection
          </li>
        </ul>
      </section>
    </div>
  );
}
