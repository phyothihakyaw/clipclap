import { compactTitle } from "../../lib/title";
import type { ClipPayload } from "../../lib/types";

export type ModalPhase = "ask" | "rewriting" | "result";

interface RewriteModalProps {
  clip: ClipPayload;
  phase: ModalPhase;
  body: string;
  busy: boolean;
  savedFilename?: string | null;
  error?: string | null;
  embedded?: boolean;
  onBodyChange: (value: string) => void;
  onRewrite: () => void;
  onSaveRaw: () => void;
  onSave: () => void;
  onCopy: () => void;
  onDismiss: () => void;
}

export function RewriteModal({
  clip,
  phase,
  body,
  busy,
  savedFilename,
  error,
  embedded = false,
  onBodyChange,
  onRewrite,
  onSaveRaw,
  onSave,
  onCopy,
  onDismiss,
}: RewriteModalProps) {
  const title = compactTitle(clip.meta.title, clip.meta.site);

  return (
    <div
      className={embedded ? "modal-embedded" : "modal-backdrop"}
      role="presentation"
      onClick={embedded ? undefined : onDismiss}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewrite-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="rewrite-modal-title">{title}</h2>
            <p className="muted meta-line">
              {clip.mode} · {clip.meta.site}
            </p>
          </div>
          <button type="button" className="ghost icon-btn" onClick={onDismiss}>
            Close
          </button>
        </div>

        {phase === "ask" && (
          <>
            <p className="modal-copy">
              Rewrite this clip with your model and harness?
            </p>
            <pre className="modal-snippet">
              {clip.markdown.slice(0, 500)}
              {clip.markdown.length > 500 ? "…" : ""}
            </pre>
            <div className="row">
              <button type="button" onClick={onRewrite} disabled={busy}>
                Rewrite
              </button>
              <button
                type="button"
                className="ghost"
                onClick={onSaveRaw}
                disabled={busy}
              >
                Save raw
              </button>
              <button
                type="button"
                className="ghost"
                onClick={onDismiss}
                disabled={busy}
              >
                Dismiss
              </button>
            </div>
          </>
        )}

        {phase === "rewriting" && <p className="muted">Rewriting…</p>}

        {phase === "result" && (
          <>
            {savedFilename && (
              <p className="status success inline-status">
                Saved as {savedFilename}
              </p>
            )}
            <textarea
              className="input preview modal-preview"
              value={body}
              onChange={(event) => onBodyChange(event.target.value)}
            />
            <div className="row">
              <button type="button" onClick={onSave} disabled={busy || !body}>
                Save to Obsidian
              </button>
              <button
                type="button"
                className="ghost"
                onClick={onCopy}
                disabled={!body}
              >
                Copy note
              </button>
              <button type="button" className="ghost" onClick={onDismiss}>
                Close
              </button>
            </div>
          </>
        )}

        {error && <div className="status error">{error}</div>}
      </div>
    </div>
  );
}
