const MAX_TITLE_LENGTH = 60;

/** Drop trailing "Notes" / "Note" the model often appends. */
export function stripNotesSuffix(title: string): string {
  return title
    .replace(/\s+[-\u2013\u2014|:·]?\s*notes?\s*$/i, "")
    .trim();
}

export function compactTitle(rawTitle: string, site?: string): string {
  let title = rawTitle.trim().replace(/\s+/g, " ");
  if (!title) {
    return "Untitled clip";
  }

  if (site) {
    const host = site.replace(/^www\./, "");
    const patterns = [
      new RegExp(`\\s+[\\-|–—|:·]\\s+${escapeRegExp(host)}.*$`, "i"),
      new RegExp(`\\s+[\\-|–—|:·]\\s+${escapeRegExp(host.split(".")[0] ?? "")}.*$`, "i"),
    ];
    for (const pattern of patterns) {
      title = title.replace(pattern, "").trim();
    }
  }

  title = title
    .replace(/\s+[|\-–—]\s+(Home|Docs|Documentation|Blog|News).*$/i, "")
    .trim();
  title = stripNotesSuffix(title);

  if (title.length <= MAX_TITLE_LENGTH) {
    return title || "Untitled clip";
  }

  const sliced = title.slice(0, MAX_TITLE_LENGTH);
  const boundary = sliced.lastIndexOf(" ");
  const clipped =
    boundary > 24 ? sliced.slice(0, boundary) : sliced;
  return `${stripNotesSuffix(clipped.trim()) || clipped.trim()}…`;
}

export function extractH1Title(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match?.[1]) {
    return null;
  }
  const title = stripNotesSuffix(match[1].trim().replace(/\s+/g, " "));
  return title || null;
}

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "clip";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
