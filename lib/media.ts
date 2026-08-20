/** Target width for srcset picks: modest, not full-res. */
const SRCSET_TARGET_W = 640;
/** Never prefer a candidate wider than this when a smaller one exists. */
const SRCSET_MAX_W = 1280;

const LAZY_SRC_ATTRS = [
  "data-src",
  "data-original",
  "data-lazy-src",
  "data-lazy",
  "data-url",
] as const;

export function absolutizeUrl(raw: string, baseUrl: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return null;
  }
}

export function isSkippableMediaUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return (
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("javascript:")
  );
}

export function isTrackingPixel(
  widthAttr: string | null,
  heightAttr: string | null,
): boolean {
  const w = widthAttr != null ? Number.parseInt(widthAttr, 10) : NaN;
  const h = heightAttr != null ? Number.parseInt(heightAttr, 10) : NaN;
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    return false;
  }
  return w <= 2 && h <= 2;
}

interface SrcsetCandidate {
  url: string;
  width?: number;
  density?: number;
}

function parseSrcset(srcset: string): SrcsetCandidate[] {
  const candidates: SrcsetCandidate[] = [];
  for (const part of srcset.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const tokens = trimmed.split(/\s+/);
    const url = tokens[0];
    if (!url) {
      continue;
    }
    const candidate: SrcsetCandidate = { url };
    for (let i = 1; i < tokens.length; i += 1) {
      const descriptor = tokens[i];
      if (/^\d+w$/i.test(descriptor)) {
        candidate.width = Number.parseInt(descriptor, 10);
      } else if (/^\d+(\.\d+)?x$/i.test(descriptor)) {
        candidate.density = Number.parseFloat(descriptor);
      }
    }
    candidates.push(candidate);
  }
  return candidates;
}

/**
 * Pick a modest URL from srcset: prefer ~640w, never above 1280w when a
 * smaller candidate exists. Prefer 1x over 2x/3x density descriptors.
 */
export function pickSrcsetUrl(srcset: string): string | null {
  const candidates = parseSrcset(srcset);
  if (candidates.length === 0) {
    return null;
  }

  const withWidth = candidates.filter(
    (c) => c.width != null && Number.isFinite(c.width),
  );
  if (withWidth.length > 0) {
    const underCap = withWidth.filter((c) => (c.width as number) <= SRCSET_MAX_W);
    const pool = underCap.length > 0 ? underCap : withWidth;
    pool.sort(
      (a, b) =>
        Math.abs((a.width as number) - SRCSET_TARGET_W) -
        Math.abs((b.width as number) - SRCSET_TARGET_W),
    );
    return pool[0]?.url ?? null;
  }

  const withDensity = candidates.filter(
    (c) => c.density != null && Number.isFinite(c.density),
  );
  if (withDensity.length > 0) {
    withDensity.sort(
      (a, b) =>
        Math.abs((a.density as number) - 1) - Math.abs((b.density as number) - 1),
    );
    return withDensity[0]?.url ?? null;
  }

  return candidates[0]?.url ?? null;
}

function firstAttr(
  el: Element,
  names: readonly string[],
): string | null {
  for (const name of names) {
    const value = el.getAttribute(name)?.trim();
    if (value) {
      return value;
    }
  }
  return null;
}

export function resolveImageUrl(el: Element, baseUrl: string): string | null {
  const srcset =
    el.getAttribute("srcset")?.trim() ||
    el.getAttribute("data-srcset")?.trim() ||
    null;
  if (srcset) {
    const picked = pickSrcsetUrl(srcset);
    if (picked) {
      const absolute = absolutizeUrl(picked, baseUrl);
      if (absolute && !isSkippableMediaUrl(absolute)) {
        return absolute;
      }
    }
  }

  const raw =
    el.getAttribute("src")?.trim() ||
    firstAttr(el, LAZY_SRC_ATTRS) ||
    null;
  if (!raw) {
    return null;
  }
  const absolute = absolutizeUrl(raw, baseUrl);
  if (!absolute || isSkippableMediaUrl(absolute)) {
    return null;
  }
  return absolute;
}

function escapeMarkdownLabel(text: string): string {
  return text.replace(/[[\]]/g, "\\$&").replace(/\r?\n/g, " ").trim();
}

function escapeMarkdownUrl(url: string): string {
  return url.replace(/[()]/g, "\\$&");
}

export function imageMarkdown(
  alt: string,
  url: string | null,
  caption?: string,
): string {
  const label = escapeMarkdownLabel(alt || caption || "image");
  if (!url) {
    if (alt.trim() || caption?.trim()) {
      return `\n\nImage: ${escapeMarkdownLabel(alt || caption || "")}\n\n`;
    }
    return "";
  }
  const link = `![${label}](${escapeMarkdownUrl(url)})`;
  if (caption?.trim() && caption.trim() !== alt.trim()) {
    return `\n\n${link}\n\n*${escapeMarkdownLabel(caption)}*\n\n`;
  }
  return `\n\n${link}\n\n`;
}

export function normalizeYoutubeUrl(url: string): {
  watchUrl: string;
  posterUrl: string;
  id: string;
} | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (parsed.pathname.startsWith("/embed/")) {
      id = parsed.pathname.split("/")[2] ?? null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.split("/")[2] ?? null;
    } else if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    }
  }

  if (!id || !/^[\w-]{6,}$/.test(id)) {
    return null;
  }
  return {
    id,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

export function normalizeVimeoUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "vimeo.com" && host !== "player.vimeo.com") {
    return null;
  }
  const parts = parsed.pathname.split("/").filter(Boolean);
  // player.vimeo.com/video/123 or vimeo.com/123
  const id =
    parts[0] === "video" ? parts[1] : parts[0] === "embed" ? parts[1] : parts[0];
  if (!id || !/^\d+$/.test(id)) {
    return null;
  }
  return `https://vimeo.com/${id}`;
}

function mediaTitle(el: Element, fallback: string): string {
  const title =
    el.getAttribute("title")?.trim() ||
    el.getAttribute("aria-label")?.trim() ||
    el.getAttribute("alt")?.trim() ||
    "";
  return title || fallback;
}

function nearbyCaption(el: Element): string | null {
  const figure = el.closest("figure");
  if (figure) {
    const cap = figure.querySelector("figcaption")?.textContent?.trim();
    if (cap) {
      return cap;
    }
  }
  return null;
}

export function videoMarkdown(options: {
  title: string;
  href: string;
  posterUrl?: string | null;
}): string {
  const title = escapeMarkdownLabel(options.title || "video");
  const href = escapeMarkdownUrl(options.href);
  if (options.posterUrl && !isSkippableMediaUrl(options.posterUrl)) {
    const poster = escapeMarkdownUrl(options.posterUrl);
    return `\n\n[![${title}](${poster})](${href})\n\n`;
  }
  return `\n\n[Video: ${title}](${href})\n\n`;
}

export function audioMarkdown(title: string, href: string): string {
  return `\n\n[Audio: ${escapeMarkdownLabel(title || "audio")}](${escapeMarkdownUrl(href)})\n\n`;
}

/** Build markdown for an <img> element. */
export function imgToMarkdown(el: Element, baseUrl: string): string {
  if (isTrackingPixel(el.getAttribute("width"), el.getAttribute("height"))) {
    return "";
  }
  const alt = el.getAttribute("alt")?.trim() ?? "";
  const caption = nearbyCaption(el) ?? undefined;
  const url = resolveImageUrl(el, baseUrl);
  // data:/blob: already filtered in resolveImageUrl; keep caption-only if alt exists
  if (!url) {
    const rawSrc = el.getAttribute("src")?.trim() ?? "";
    if (isSkippableMediaUrl(rawSrc) || !rawSrc) {
      return imageMarkdown(alt, null, caption);
    }
    return imageMarkdown(alt, null, caption);
  }
  return imageMarkdown(alt, url, caption);
}

/** Build markdown for a <video> element. */
export function videoToMarkdown(
  el: Element,
  baseUrl: string,
  pageUrl: string,
): string {
  const caption = nearbyCaption(el);
  const title = mediaTitle(el, caption ?? "video");
  const rawSrc =
    el.getAttribute("src")?.trim() ||
    el.querySelector("source")?.getAttribute("src")?.trim() ||
    "";
  let href: string | null = null;
  if (rawSrc) {
    const absolute = absolutizeUrl(rawSrc, baseUrl);
    if (absolute && !isSkippableMediaUrl(absolute)) {
      href = absolute;
    }
  }
  if (!href) {
    href = pageUrl;
  }

  const rawPoster = el.getAttribute("poster")?.trim() ?? "";
  let posterUrl: string | null = null;
  if (rawPoster) {
    const absolute = absolutizeUrl(rawPoster, baseUrl);
    if (absolute && !isSkippableMediaUrl(absolute)) {
      posterUrl = absolute;
    }
  }

  return videoMarkdown({ title, href, posterUrl });
}

/** Build markdown for an <audio> element. */
export function audioToMarkdown(
  el: Element,
  baseUrl: string,
  pageUrl: string,
): string {
  const title = mediaTitle(el, nearbyCaption(el) ?? "audio");
  const rawSrc =
    el.getAttribute("src")?.trim() ||
    el.querySelector("source")?.getAttribute("src")?.trim() ||
    "";
  let href: string | null = null;
  if (rawSrc) {
    const absolute = absolutizeUrl(rawSrc, baseUrl);
    if (absolute && !isSkippableMediaUrl(absolute)) {
      href = absolute;
    }
  }
  if (!href) {
    href = pageUrl;
  }
  return audioMarkdown(title, href);
}

const VIDEO_IFRAME_HINT =
  /youtube|youtu\.be|vimeo|player\.|video|wistia|dailymotion|loom\.com/i;

/** Build markdown for a video-like <iframe>, or empty string to skip. */
export function iframeToMarkdown(
  el: Element,
  baseUrl: string,
): string {
  const rawSrc = el.getAttribute("src")?.trim() ?? "";
  if (!rawSrc) {
    return "";
  }
  const absolute = absolutizeUrl(rawSrc, baseUrl);
  if (!absolute || isSkippableMediaUrl(absolute)) {
    return "";
  }

  const youtube = normalizeYoutubeUrl(absolute);
  if (youtube) {
    const title = mediaTitle(el, "YouTube video");
    return videoMarkdown({
      title,
      href: youtube.watchUrl,
      posterUrl: youtube.posterUrl,
    });
  }

  const vimeo = normalizeVimeoUrl(absolute);
  if (vimeo) {
    const title = mediaTitle(el, "Vimeo video");
    return videoMarkdown({ title, href: vimeo });
  }

  // Unknown embeds: only keep if they look like video and have a usable title
  const title =
    el.getAttribute("title")?.trim() ||
    el.getAttribute("aria-label")?.trim() ||
    "";
  if (!title) {
    return "";
  }
  if (!VIDEO_IFRAME_HINT.test(absolute) && !VIDEO_IFRAME_HINT.test(title)) {
    return "";
  }
  return videoMarkdown({ title, href: absolute });
}
