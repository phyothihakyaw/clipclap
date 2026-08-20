import type { Settings } from "./types";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "./types";

export async function loadSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  const value = stored[SETTINGS_KEY] as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...value };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await browser.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}
