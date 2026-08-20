import type { ClipMetadata, OutputFormat, ToneHarness } from "./types";

const SHARED_RULES = [
  "Do not invent facts, numbers, names, or quotes that were not in the source.",
  "Leave code blocks, commands, shell output, and error messages unchanged.",
  "Drop navigation, ads, cookie banners, footers, and other boilerplate.",
  "Do not invent or alter the source URL. Citation details will be added separately.",
  "Keep figure, image, video, and audio references from the source, including their URLs.",
  "Do not drop, invent, download, transcribe, or describe media that is not already labeled in the source.",
].join("\n");

const MARKDOWN_RULES = [
  SHARED_RULES,
  "Start with a single markdown H1 heading that is a short, specific title (about 3 to 8 words).",
  "Do not append words like Notes, Note, Summary, or Clipping to the H1 title.",
  "Preserve markdown image and media links (for example ![alt](url) and [Video: title](url)).",
  "Return markdown only. No preamble or closing remarks.",
].join("\n");

const PLAINTEXT_RULES = [
  SHARED_RULES,
  "Start with a short, specific title on the first line (about 3 to 8 words), then a blank line, then the body.",
  "Do not append words like Notes, Note, Summary, or Clipping to the title.",
  "Return plain text only. No markdown headings, bold, italic, links, or bullet markers unless they appear as literal source text.",
  "Convert image and media references to plain lines like Image: alt (url) or Video: title (url).",
  "No preamble or closing remarks.",
].join("\n");

const HARNESS_PROMPTS: Record<ToneHarness, string> = {
  personal:
    "Rewrite as if I wrote these notes myself. Use first person from my point of view. Keep it natural and honest, not stiff.",
  public:
    "Rewrite for public sharing. Polished, clear, and attributable. Not diary-like. Keep a professional but readable voice.",
  compact:
    "Rewrite as accurate, compact notes. Keep claims, steps, numbers, and code. Drop fluff and repetition.",
  none: "",
};

export function buildSystemPrompt(
  tone: ToneHarness,
  customInstructions: string,
  outputFormat: OutputFormat = "markdown",
): string {
  const parts = [
    outputFormat === "plaintext" ? PLAINTEXT_RULES : MARKDOWN_RULES,
  ];
  const harness = HARNESS_PROMPTS[tone];
  if (harness) {
    parts.push(harness);
  }
  const custom = customInstructions.trim();
  if (custom) {
    parts.push(`Additional instructions from the user:\n${custom}`);
  }
  return parts.join("\n\n");
}

export function buildUserPrompt(
  meta: ClipMetadata,
  markdown: string,
  outputFormat: OutputFormat = "markdown",
): string {
  const fence = outputFormat === "plaintext" ? "text" : "markdown";
  return [
    `Title: ${meta.title}`,
    `URL: ${meta.url}`,
    `Site: ${meta.site}`,
    meta.author ? `Author: ${meta.author}` : null,
    "",
    "Source content:",
    `\`\`\`${fence}`,
    markdown,
    "```",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export const TONE_OPTIONS: Array<{
  id: ToneHarness;
  label: string;
  description: string;
}> = [
  {
    id: "personal",
    label: "Personal",
    description: "First person, as if you wrote it",
  },
  {
    id: "public",
    label: "Public",
    description: "Polished for sharing",
  },
  {
    id: "compact",
    label: "Compact notes",
    description: "Accurate and dense",
  },
  {
    id: "none",
    label: "None",
    description: "Custom instructions only",
  },
];

export const OUTPUT_FORMAT_OPTIONS: Array<{
  id: OutputFormat;
  label: string;
}> = [
  {
    id: "markdown",
    label: "Markdown (*.md)",
  },
  {
    id: "plaintext",
    label: "Plain text (*.txt)",
  },
];
