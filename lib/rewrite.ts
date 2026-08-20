import { buildSystemPrompt, buildUserPrompt } from "./harness";
import { redactSecrets } from "./security";
import type { ClipMetadata, OutputFormat, ToneHarness } from "./types";

export interface RewriteInput {
  apiKey: string;
  modelId: string;
  tone: ToneHarness;
  customInstructions: string;
  outputFormat?: OutputFormat;
  meta: ClipMetadata;
  markdown: string;
}

export { redactSecrets } from "./security";

export async function rewriteClip(input: RewriteInput): Promise<string> {
  const {
    apiKey,
    modelId,
    tone,
    customInstructions,
    outputFormat = "markdown",
    meta,
    markdown,
  } = input;

  if (!apiKey.trim()) {
    throw new Error("Add your OpenRouter API key in settings.");
  }
  if (!modelId.trim()) {
    throw new Error("Choose a model before rewriting.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/phyothihakyaw/clipclap",
      "X-Title": "Clipclap",
    },
    body: JSON.stringify({
      model: modelId,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(tone, customInstructions, outputFormat),
        },
        {
          role: "user",
          content: buildUserPrompt(meta, markdown, outputFormat),
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      redactSecrets(
        `Rewrite failed (${response.status}): ${text || response.statusText}`,
      ),
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Rewrite returned an empty response.");
  }
  return content;
}
