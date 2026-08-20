import {
  compactTitle,
  extractH1Title,
  slugifyTitle,
  stripNotesSuffix,
} from "./title";
import type { ClipMetadata, OutputFormat, ToneHarness } from "./types";

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

function extractPlainTitle(body: string): string | null {
  const firstLine = body.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  if (!firstLine || firstLine.length > 120) {
    return null;
  }
  if (/^#+\s/.test(firstLine)) {
    return firstLine.replace(/^#+\s+/, "").trim() || null;
  }
  return firstLine || null;
}

export function resolveNoteTitle(
  meta: ClipMetadata,
  body: string,
  outputFormat: OutputFormat = "markdown",
): string {
  if (outputFormat === "plaintext") {
    return extractPlainTitle(body) ?? compactTitle(meta.title, meta.site);
  }
  return extractH1Title(body) ?? compactTitle(meta.title, meta.site);
}

function normalizeBodyTitle(body: string, noteTitle: string): string {
  const trimmed = body.trim();
  if (/^#\s+/m.test(trimmed)) {
    return trimmed.replace(/^#\s+.+$/m, `# ${noteTitle}`);
  }
  return trimmed;
}

function normalizePlainBody(body: string, noteTitle: string): string {
  const trimmed = body.trim();
  const lines = trimmed.split(/\r?\n/);
  const first = lines[0]?.trim() ?? "";
  if (!first) {
    return noteTitle;
  }
  if (/^#+\s/.test(first) || first === noteTitle || first.length <= 120) {
    lines[0] = noteTitle;
    if (lines.length === 1) {
      return noteTitle;
    }
    if ((lines[1] ?? "").trim() !== "") {
      lines.splice(1, 0, "");
    }
    return lines.join("\n").trim();
  }
  return `${noteTitle}\n\n${trimmed}`;
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
  outputFormat?: OutputFormat;
}): string {
  const {
    meta,
    body,
    tone,
    citationEnabled,
    outputFormat = "markdown",
  } = options;
  const clipped = meta.clippedAt.slice(0, 10);
  const noteTitle = stripNotesSuffix(
    resolveNoteTitle(meta, body, outputFormat),
  );

  if (outputFormat === "plaintext") {
    const citationSection = citationEnabled
      ? `\n\nCitation\n${buildCitation(meta)}\n`
      : "\n";
    return `${normalizePlainBody(body, noteTitle)}${citationSection}`;
  }

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

export function buildFilename(
  meta: ClipMetadata,
  body = "",
  outputFormat: OutputFormat = "markdown",
): string {
  const title = stripNotesSuffix(resolveNoteTitle(meta, body, outputFormat));
  const extension = outputFormat === "plaintext" ? "txt" : "md";
  return `${slugifyTitle(title)}.${extension}`;
}
