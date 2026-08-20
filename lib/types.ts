export type ToneHarness = "personal" | "public" | "compact" | "none";

/** How rewritten clips are prompted and written to disk. */
export type OutputFormat = "markdown" | "plaintext";

export interface ClipMetadata {
  title: string;
  url: string;
  site: string;
  author?: string;
  clippedAt: string;
}

export interface ClipPayload {
  markdown: string;
  mode: "selection" | "page";
  meta: ClipMetadata;
}

export interface Settings {
  apiKey: string;
  modelId: string;
  tone: ToneHarness;
  customInstructions: string;
  /** markdown: .md with YAML attributes; plaintext: .txt body only */
  outputFormat: OutputFormat;
  citationEnabled: boolean;
  saveFolderName: string;
  setupComplete: boolean;
  autoRewrite: boolean;
  autoSave: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  modelId: "",
  tone: "compact",
  customInstructions: "",
  outputFormat: "markdown",
  citationEnabled: true,
  saveFolderName: "",
  setupComplete: false,
  autoRewrite: false,
  autoSave: false,
};

export const SETTINGS_KEY = "clipclap.settings";
export const MODELS_CACHE_KEY = "clipclap.models.cache";

export function isSetupReady(
  settings: Settings,
  hasSaveFolderHandle: boolean,
): boolean {
  return Boolean(
    settings.apiKey.trim() &&
      settings.modelId.trim() &&
      settings.saveFolderName.trim() &&
      hasSaveFolderHandle &&
      settings.setupComplete,
  );
}
