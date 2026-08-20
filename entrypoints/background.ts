import type { ClipResponse, ExtensionMessage } from "../lib/messages";
import {
  publishClipResult,
  REWRITE_WINDOW_ID_KEY,
  setLastStatus,
} from "../lib/messages";
import { getSaveFolderHandle } from "../lib/saveFolder";
import { loadSettings } from "../lib/settings";
import { isSetupReady } from "../lib/types";

const MENU_CLIP_PAGE = "clipclap-clip-page";
const MENU_CLIP_SELECTION = "clipclap-clip-selection";

async function openSidePanel(tabId?: number): Promise<void> {
  if (tabId != null) {
    await browser.sidePanel.open({ tabId });
    return;
  }
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    await browser.sidePanel.open({ tabId: tab.id });
  }
}

async function openRewriteWindow(): Promise<void> {
  const url = browser.runtime.getURL("/rewrite.html");
  const stored = await browser.storage.session.get(REWRITE_WINDOW_ID_KEY);
  const existingId = stored[REWRITE_WINDOW_ID_KEY] as number | undefined;

  if (existingId != null) {
    try {
      const win = await browser.windows.get(existingId);
      if (win.id != null) {
        await browser.windows.update(win.id, { focused: true });
        return;
      }
    } catch {
      // Window gone.
    }
  }

  const created = await browser.windows.create({
    url,
    type: "popup",
    width: 520,
    height: 640,
    focused: true,
  });
  if (created?.id != null) {
    await browser.storage.session.set({ [REWRITE_WINDOW_ID_KEY]: created.id });
  }
}

async function clipActiveTab(
  preferSelection: boolean,
): Promise<ClipResponse> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { ok: false, error: "No active tab to clip." };
  }
  if (
    tab.url?.startsWith("chrome://") ||
    tab.url?.startsWith("chrome-extension://") ||
    tab.url?.startsWith("edge://") ||
    tab.url?.startsWith("about:")
  ) {
    return { ok: false, error: "This page cannot be clipped." };
  }

  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["/content-scripts/content.js"],
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to inject content script.",
    };
  }

  const response = (await browser.tabs.sendMessage(tab.id, {
    type: "CLIP_ACTIVE_TAB",
    preferSelection,
  } satisfies ExtensionMessage)) as ClipResponse | undefined;

  return (
    response ?? {
      ok: false,
      error: "Content script did not respond.",
    }
  );
}

async function clipAndReview(preferSelection: boolean): Promise<ClipResponse> {
  const settings = await loadSettings();
  const handle = await getSaveFolderHandle();
  if (!isSetupReady(settings, Boolean(handle))) {
    await setLastStatus("error", "Finish setup before clipping.");
    await openSidePanel();
    return { ok: false, error: "Finish setup before clipping." };
  }

  const result = await clipActiveTab(preferSelection);
  await publishClipResult(result);
  if (result.ok) {
    await setLastStatus(
      "info",
      `Clipped ${result.payload.mode} from ${result.payload.meta.site}`,
    );
    await openRewriteWindow();
  }
  return result;
}

export default defineBackground(() => {
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => undefined);

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll().then(() => {
      browser.contextMenus.create({
        id: MENU_CLIP_PAGE,
        title: "Clip page with Clipclap",
        contexts: ["page", "action"],
      });
      browser.contextMenus.create({
        id: MENU_CLIP_SELECTION,
        title: "Clip selection with Clipclap",
        contexts: ["selection"],
      });
    });
  });

  browser.contextMenus.onClicked.addListener(async (info) => {
    const preferSelection = info.menuItemId === MENU_CLIP_SELECTION;
    await clipAndReview(preferSelection);
  });

  browser.commands.onCommand.addListener(async (command) => {
    if (command === "clip-page") {
      await clipAndReview(false);
      return;
    }
    if (command === "clip-selection") {
      await clipAndReview(true);
    }
  });

  browser.windows.onRemoved.addListener(async (windowId) => {
    const stored = await browser.storage.session.get(REWRITE_WINDOW_ID_KEY);
    if (stored[REWRITE_WINDOW_ID_KEY] === windowId) {
      await browser.storage.session.remove(REWRITE_WINDOW_ID_KEY);
    }
  });

  browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.type === "OPEN_SIDEPANEL" || message.type === "OPEN_SETTINGS") {
      return openSidePanel().then(() => undefined);
    }
    if (message.type === "CLIP_ACTIVE_TAB") {
      return clipAndReview(message.preferSelection !== false);
    }
  });
});
