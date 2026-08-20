import {
  compactTitle,
  extractH1Title,
  slugifyTitle,
  stripNotesSuffix,
} from "./title";
import type { ClipMetadata, ToneHarness } from "./types";

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatAccessDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function resolveNoteTitle(meta: ClipMetadata, body: string): string {
  return extractH1Title(body) ?? compactTitle(meta.title, meta.site);
}

function normalizeBodyTitle(body: string, noteTitle: string): string {
  const trimmed = body.trim();
  if (/^#\s+/m.test(trimmed)) {
    return trimmed.replace(/^#\s+.+$/m, `# ${noteTitle}`);
  }
  return trimmed;
}

export function buildCitation(meta: ClipMetadata): string {
  const accessed = formatAccessDate(meta.clippedAt);
  const author = meta.author ? `${meta.author}. ` : "";
  const title = compactTitle(meta.title, meta.site);
  return `${author}"${title}." ${meta.site}. ${meta.url}. Accessed ${accessed}.`;
}

export function buildNoteDocument(options: {
  meta: ClipMetadata;
  body: string;
  tone: ToneHarness;
  citationEnabled: boolean;
}): string {
  const { meta, body, tone, citationEnabled } = options;
  const clipped = meta.clippedAt.slice(0, 10);
  const noteTitle = stripNotesSuffix(resolveNoteTitle(meta, body));
  const frontmatter = [
    "---",
    `title: "${escapeYaml(noteTitle)}"`,
    `source: "${escapeYaml(meta.url)}"`,
    `site: "${escapeYaml(meta.site)}"`,
    `clipped: ${clipped}`,
    `tone: ${tone}`,
    "tags:",
    "  - clipclap",
    "---",
    "",
  ].join("\n");

  const citationSection = citationEnabled
    ? `\n\n## Citation\n${buildCitation(meta)}\n`
    : "\n";

  const trimmedBody = normalizeBodyTitle(body, noteTitle);
  const hasHeading = /^#\s/m.test(trimmedBody);
  const heading = hasHeading ? "" : `# ${noteTitle}\n\n`;

  return `${frontmatter}${heading}${trimmedBody}${citationSection}`;
}

export function buildFilename(meta: ClipMetadata, body = ""): string {
  const title = stripNotesSuffix(resolveNoteTitle(meta, body));
  return `${slugifyTitle(title)}.md`;
}
