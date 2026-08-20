import { extractClip } from "../lib/extract";
import type { ClipResponse, ExtensionMessage } from "../lib/messages";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
      if (message.type !== "CLIP_ACTIVE_TAB") {
        return;
      }
      try {
        const payload = extractClip(message.preferSelection !== false);
        const response: ClipResponse = { ok: true, payload };
        return Promise.resolve(response);
      } catch (error) {
        const response: ClipResponse = {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
        return Promise.resolve(response);
      }
    });
  },
});
