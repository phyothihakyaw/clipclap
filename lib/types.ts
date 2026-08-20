export type ToneHarness = "personal" | "public" | "compact" | "none";

export interface ClipMetadata {
  title: string;
  url: string;
  site: string;
  author?: string;
  clippedAt: string;
}

export interface ClipPayload {
  markdown: string;
  html: string;
  mode: "selection" | "page";
  meta: ClipMetadata;
}

export interface Settings {
  apiKey: string;
  modelId: string;
  tone: ToneHarness;
  customInstructions: string;
  citationEnabled: boolean;
  vaultFolderName: string;
  setupComplete: boolean;
  autoRewrite: boolean;
  autoSaveToObsidian: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  modelId: "",
  tone: "compact",
  customInstructions: "",
  citationEnabled: true,
  vaultFolderName: "",
  setupComplete: false,
  autoRewrite: false,
  autoSaveToObsidian: false,
};

export const SETTINGS_KEY = "clipclap.settings";
export const MODELS_CACHE_KEY = "clipclap.models.cache";

export function isSetupReady(settings: Settings, hasVaultHandle: boolean): boolean {
  return Boolean(
    settings.apiKey.trim() &&
      settings.modelId.trim() &&
      settings.vaultFolderName.trim() &&
      hasVaultHandle &&
      settings.setupComplete,
  );
}
