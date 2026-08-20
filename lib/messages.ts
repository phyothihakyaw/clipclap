import type { ClipPayload } from "./types";

export const LAST_CLIP_KEY = "clipclap.lastClip";
export const LAST_CLIP_ERROR_KEY = "clipclap.lastClipError";
export const LAST_STATUS_KEY = "clipclap.lastStatus";
export const REWRITE_WINDOW_ID_KEY = "clipclap.rewriteWindowId";

export type StatusKind = "info" | "error" | "success";

export interface LastStatus {
  kind: StatusKind;
  message: string;
  at: string;
}

export type ExtensionMessage =
  | { type: "CLIP_ACTIVE_TAB"; preferSelection?: boolean }
  | { type: "OPEN_SIDEPANEL" }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLIP_RESULT"; payload: ClipPayload }
  | { type: "CLIP_ERROR"; error: string }
  | { type: "STATUS_UPDATE"; status: LastStatus };

export type ClipResponse =
  | { ok: true; payload: ClipPayload }
  | { ok: false; error: string };

export async function setLastStatus(
  kind: StatusKind,
  message: string,
): Promise<LastStatus> {
  const status: LastStatus = {
    kind,
    message,
    at: new Date().toISOString(),
  };
  await browser.storage.session.set({ [LAST_STATUS_KEY]: status });
  try {
    await browser.runtime.sendMessage({
      type: "STATUS_UPDATE",
      status,
    } satisfies ExtensionMessage);
  } catch {
    // Popup may be closed.
  }
  return status;
}

export async function publishClipResult(result: ClipResponse): Promise<void> {
  if (result.ok) {
    await browser.storage.session.set({
      [LAST_CLIP_KEY]: result.payload,
      [LAST_CLIP_ERROR_KEY]: null,
    });
    try {
      await browser.runtime.sendMessage({
        type: "CLIP_RESULT",
        payload: result.payload,
      } satisfies ExtensionMessage);
    } catch {
      // Rewrite window may open next.
    }
    return;
  }

  await browser.storage.session.set({
    [LAST_CLIP_KEY]: null,
    [LAST_CLIP_ERROR_KEY]: result.error,
  });
  await setLastStatus("error", result.error);
  try {
    await browser.runtime.sendMessage({
      type: "CLIP_ERROR",
      error: result.error,
    } satisfies ExtensionMessage);
  } catch {
    // No listeners.
  }
}
