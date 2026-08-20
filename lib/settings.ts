import type { Settings } from "./types";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "./types";

/** Older installs used vault / Obsidian-oriented setting keys. */
type LegacySettings = Partial<Settings> & {
  vaultFolderName?: string;
  autoSaveToObsidian?: boolean;
};

function migrateSettings(raw: LegacySettings | undefined): Settings {
  const {
    vaultFolderName,
    autoSaveToObsidian,
    ...rest
  } = raw ?? {};

  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    saveFolderName:
      rest.saveFolderName?.trim() ||
      vaultFolderName?.trim() ||
      DEFAULT_SETTINGS.saveFolderName,
    autoSave:
      rest.autoSave ??
      autoSaveToObsidian ??
      DEFAULT_SETTINGS.autoSave,
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  return migrateSettings(stored[SETTINGS_KEY] as LegacySettings | undefined);
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await browser.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}
