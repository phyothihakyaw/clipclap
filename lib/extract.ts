import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import {
  audioToMarkdown,
  iframeToMarkdown,
  imgToMarkdown,
  videoToMarkdown,
} from "./media";
import type { ClipMetadata, ClipPayload } from "./types";

function createTurndown(baseUrl: string, pageUrl: string): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  turndown.use(gfm);

  turndown.addRule("clipclapImage", {
    filter: "img",
    replacement(_content, node) {
      return imgToMarkdown(node as HTMLElement, baseUrl);
    },
  });

  turndown.addRule("clipclapVideo", {
    filter: "video",
    replacement(_content, node) {
      return videoToMarkdown(node as HTMLElement, baseUrl, pageUrl);
    },
  });

  turndown.addRule("clipclapAudio", {
    filter: "audio",
    replacement(_content, node) {
      return audioToMarkdown(node as HTMLElement, baseUrl, pageUrl);
    },
  });

  turndown.addRule("clipclapIframe", {
    filter: "iframe",
    replacement(_content, node) {
      return iframeToMarkdown(node as HTMLElement, baseUrl);
    },
  });

  return turndown;
}

function readMeta(): ClipMetadata {
  const canonical =
    document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href") ?? location.href;
  const author =
    document
      .querySelector('meta[name="author"]')
      ?.getAttribute("content") ??
    document
      .querySelector('meta[property="article:author"]')
      ?.getAttribute("content") ??
    undefined;
  let site = location.hostname;
  try {
    site = new URL(canonical).hostname;
  } catch {
    // keep hostname
  }

  return {
    title: document.title || "Untitled",
    url: canonical,
    site,
    author: author?.trim() || undefined,
    clippedAt: new Date().toISOString(),
  };
}

function selectionHtml(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }
  const container = document.createElement("div");
  for (let i = 0; i < selection.rangeCount; i += 1) {
    container.appendChild(selection.getRangeAt(i).cloneContents());
  }
  const html = container.innerHTML.trim();
  return html || null;
}

function pageHtml(): string {
  const clone = document.cloneNode(true) as Document;
  const article = new Readability(clone).parse();
  if (article?.content?.trim()) {
    return article.content;
  }
  const main =
    document.querySelector("main") ??
    document.querySelector("article") ??
    document.body;
  return main?.innerHTML ?? "";
}

export function extractClip(preferSelection = true): ClipPayload {
  const meta = readMeta();
  const baseUrl = document.baseURI || meta.url || location.href;
  const turndown = createTurndown(baseUrl, meta.url);
  const selected = preferSelection ? selectionHtml() : null;
  const html = selected ?? pageHtml();
  const markdown = turndown.turndown(html).trim();

  if (selected) {
    const text = window.getSelection()?.toString().trim();
    if (text && text.length < 120) {
      meta.title = `${meta.title} - selection`;
    }
  }

  return {
    markdown: markdown || "(empty clip)",
    mode: selected ? "selection" : "page",
    meta,
  };
}
