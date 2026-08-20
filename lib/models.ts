export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

interface ModelsApiResponse {
  data: OpenRouterModel[];
}

interface ModelsCache {
  fetchedAt: number;
  models: OpenRouterModel[];
}

import { MODELS_CACHE_KEY } from "./types";
import { redactSecrets } from "./security";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export function formatPrice(pricePerToken?: string): string {
  if (pricePerToken == null || pricePerToken === "") {
    return "—";
  }
  const perToken = Number(pricePerToken);
  if (!Number.isFinite(perToken)) {
    return "—";
  }
  if (perToken === 0) {
    return "free";
  }
  const perMillion = perToken * 1_000_000;
  if (perMillion < 0.01) {
    return `$${perMillion.toFixed(4)}/M`;
  }
  if (perMillion < 1) {
    return `$${perMillion.toFixed(3)}/M`;
  }
  return `$${perMillion.toFixed(2)}/M`;
}

export function modelPriceLabel(model: OpenRouterModel): string {
  const prompt = formatPrice(model.pricing?.prompt);
  const completion = formatPrice(model.pricing?.completion);
  if (prompt === "free" && completion === "free") {
    return "free";
  }
  return `${prompt} · ${completion}`;
}

export function filterModels(
  models: OpenRouterModel[],
  query: string,
): OpenRouterModel[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return models;
  }
  return models.filter((model) => {
    const haystack = `${model.id} ${model.name} ${model.description ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

async function readCache(): Promise<ModelsCache | null> {
  const stored = await browser.storage.local.get(MODELS_CACHE_KEY);
  return (stored[MODELS_CACHE_KEY] as ModelsCache | undefined) ?? null;
}

async function writeCache(models: OpenRouterModel[]): Promise<void> {
  const cache: ModelsCache = {
    fetchedAt: Date.now(),
    models,
  };
  await browser.storage.local.set({ [MODELS_CACHE_KEY]: cache });
}

export async function fetchModels(
  apiKey: string,
  options: { force?: boolean } = {},
): Promise<OpenRouterModel[]> {
  if (!apiKey.trim()) {
    throw new Error("API key is required to load models.");
  }

  if (!options.force) {
    const cache = await readCache();
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return cache.models;
    }
  }

  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/clipclap/clipclap",
      "X-Title": "Clipclap",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      redactSecrets(
        `Failed to load models (${response.status}): ${text || response.statusText}`,
      ),
    );
  }

  const json = (await response.json()) as ModelsApiResponse;
  const models = (json.data ?? []).slice().sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  await writeCache(models);
  return models;
}
