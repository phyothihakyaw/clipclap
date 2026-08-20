import { useEffect, useState } from "react";
import {
  buildFilename,
  buildNoteDocument,
  resolveNoteTitle,
} from "../../lib/citation";
import type { ExtensionMessage } from "../../lib/messages";
import {
  LAST_CLIP_ERROR_KEY,
  LAST_CLIP_KEY,
  setLastStatus,
} from "../../lib/messages";
import { writeSavedFile } from "../../lib/saveFolder";
import { redactSecrets, rewriteClip } from "../../lib/rewrite";
import { loadSettings, saveSettings } from "../../lib/settings";
import { compactTitle } from "../../lib/title";
import type { ClipPayload, Settings } from "../../lib/types";
import {
  RewriteModal,
  type ModalPhase,
} from "../sidepanel/RewriteModal";
import "../sidepanel/style.css";
import "./style.css";

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clip, setClip] = useState<ClipPayload | null>(null);
  const [modalBody, setModalBody] = useState("");
  const [modalPhase, setModalPhase] = useState<ModalPhase>("ask");
  const [savedFilename, setSavedFilename] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function beginWithClip(payload: ClipPayload, current: Settings) {
    setClip(payload);
    setModalBody(payload.markdown);
    setSavedFilename(null);
    setModalError(null);

    if (current.autoRewrite) {
      await runRewrite(payload, current);
      return;
    }
    setModalPhase("ask");
  }

  async function runRewrite(payload: ClipPayload, current: Settings) {
    setBusy(true);
    setModalError(null);
    setModalPhase("rewriting");
    try {
      const rewritten = await rewriteClip({
        apiKey: current.apiKey,
        modelId: current.modelId,
        tone: current.tone,
        customInstructions: current.customInstructions,
        outputFormat: current.outputFormat,
        meta: payload.meta,
        markdown: payload.markdown,
      });
      setModalBody(rewritten);
      setModalPhase("result");
      await setLastStatus(
        "success",
        `Rewrote: ${resolveNoteTitle(payload.meta, rewritten, current.outputFormat)}`,
      );

      if (current.autoSave) {
        await saveBody(payload, rewritten, current);
      }
    } catch (error) {
      const message = redactSecrets(
        error instanceof Error ? error.message : String(error),
      );
      setModalError(message);
      setModalPhase("ask");
      await setLastStatus("error", message);
    } finally {
      setBusy(false);
    }
  }

  async function saveBody(
    payload: ClipPayload,
    body: string,
    current: Settings,
  ): Promise<string> {
    const document = buildNoteDocument({
      meta: payload.meta,
      body,
      tone: current.tone,
      citationEnabled: current.citationEnabled,
      outputFormat: current.outputFormat,
    });
    const filename = buildFilename(
      payload.meta,
      body,
      current.outputFormat,
    );
    const result = await writeSavedFile(filename, document);
    await saveSettings({ saveFolderName: result.folderName });
    setSavedFilename(result.filename);
    await setLastStatus(
      "success",
      `Saved ${result.filename} to ${result.folderName}`,
    );
    return result.filename;
  }

  useEffect(() => {
    void (async () => {
      const current = await loadSettings();
      setSettings(current);

      const session = await browser.storage.session.get([
        LAST_CLIP_KEY,
        LAST_CLIP_ERROR_KEY,
      ]);
      const lastClip = session[LAST_CLIP_KEY] as ClipPayload | null | undefined;
      const lastError = session[LAST_CLIP_ERROR_KEY] as
        | string
        | null
        | undefined;

      if (lastClip) {
        await beginWithClip(lastClip, current);
      } else if (lastError) {
        setModalError(lastError);
      }
    })();
  }, []);

  useEffect(() => {
    const listener = (message: ExtensionMessage) => {
      if (message.type === "CLIP_RESULT") {
        void (async () => {
          const current = settings ?? (await loadSettings());
          setSettings(current);
          await beginWithClip(message.payload, current);
        })();
      }
      if (message.type === "CLIP_ERROR") {
        setModalError(message.error);
      }
    };
    browser.runtime.onMessage.addListener(listener);

    function onFocus() {
      void (async () => {
        const session = await browser.storage.session.get(LAST_CLIP_KEY);
        const lastClip = session[LAST_CLIP_KEY] as ClipPayload | null | undefined;
        if (!lastClip || !settings) {
          return;
        }
        if (
          !clip ||
          clip.meta.url !== lastClip.meta.url ||
          clip.meta.clippedAt !== lastClip.meta.clippedAt
        ) {
          await beginWithClip(lastClip, settings);
        }
      })();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
      window.removeEventListener("focus", onFocus);
    };
  }, [settings, clip]);

  if (!settings) {
    return <div className="rewrite-app loading">Loading…</div>;
  }

  if (!clip) {
    return (
      <div className="rewrite-app">
        <h1>Rewrite</h1>
        <p className="muted">
          {modalError ?? "Waiting for a clip. Use right-click or shortcuts."}
        </p>
      </div>
    );
  }

  return (
    <div className="rewrite-app">
      <RewriteModal
        clip={clip}
        phase={modalPhase}
        body={modalBody}
        busy={busy}
        savedFilename={savedFilename}
        error={modalError}
        embedded
        onBodyChange={setModalBody}
        onRewrite={() => void runRewrite(clip, settings)}
        onSaveRaw={() => {
          void (async () => {
            setBusy(true);
            setModalError(null);
            try {
              await saveBody(clip, clip.markdown, settings);
              setModalBody(clip.markdown);
              setModalPhase("result");
            } catch (error) {
              const message = redactSecrets(
                error instanceof Error ? error.message : String(error),
              );
              setModalError(message);
              await setLastStatus("error", message);
            } finally {
              setBusy(false);
            }
          })();
        }}
        onSave={() => {
          void (async () => {
            setBusy(true);
            setModalError(null);
            try {
              await saveBody(clip, modalBody, settings);
            } catch (error) {
              const message = redactSecrets(
                error instanceof Error ? error.message : String(error),
              );
              setModalError(message);
              await setLastStatus("error", message);
            } finally {
              setBusy(false);
            }
          })();
        }}
        onCopy={() => {
          void (async () => {
            try {
              const document = buildNoteDocument({
                meta: clip.meta,
                body: modalBody,
                tone: settings.tone,
                citationEnabled: settings.citationEnabled,
                outputFormat: settings.outputFormat,
              });
              await navigator.clipboard.writeText(document);
              await setLastStatus("success", "Copied note to clipboard.");
            } catch (error) {
              setModalError(
                error instanceof Error ? error.message : String(error),
              );
            }
          })();
        }}
        onDismiss={() => {
          window.close();
        }}
      />
      <p className="muted footer-meta">
        {compactTitle(clip.meta.title, clip.meta.site)}
      </p>
    </div>
  );
}
