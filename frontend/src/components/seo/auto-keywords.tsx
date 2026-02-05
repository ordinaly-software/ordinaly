"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const collectHeadingTexts = (root: ParentNode) => {
  const nodes = Array.from(root.querySelectorAll("h1, h2"));
  return nodes
    .map((node) => normalizeText(node.textContent ?? ""))
    .filter((text) => text.length > 0);
};

const dedupe = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
};

const ensureKeywordsMeta = () => {
  let meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "keywords";
    document.head.appendChild(meta);
  }
  return meta;
};

export default function AutoKeywords() {
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId: number | undefined;
    let observer: MutationObserver | null = null;

    const updateKeywords = () => {
      const main = document.querySelector("main") ?? document.body;
      const headings = dedupe(collectHeadingTexts(main));
      const fallback = normalizeText(document.title || "");
      const keywords = headings.length > 0 ? headings : fallback ? [fallback] : [];
      if (keywords.length === 0) return;
      const meta = ensureKeywordsMeta();
      meta.content = keywords.join(", ");
    };

    const scheduleUpdate = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateKeywords, 150);
    };

    scheduleUpdate();

    const target = document.querySelector("main") ?? document.body;
    observer = new MutationObserver(() => {
      scheduleUpdate();
    });
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
}
