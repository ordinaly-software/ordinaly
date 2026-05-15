import React from "react";

export type KeywordLink = { regex: RegExp; url: string };

// Ordered longest → shortest so more-specific phrases match before their substrings.
// Use relative URLs so Next.js handles routing and the domain doesn't matter.
export const SITE_KEYWORD_LINKS: KeywordLink[] = [
  { regex: /inteligencia artificial en sevilla/gi, url: "/inteligencia-artificial-sevilla" },
  { regex: /inteligencia artificial sevilla/gi,    url: "/inteligencia-artificial-sevilla" },
  { regex: /agencia de automatizaci[oó]n/gi,       url: "/" },
  { regex: /empresa de inteligencia artificial/gi, url: "/empresa-inteligencia-artificial" },
  { regex: /inteligencia artificial para empresas/gi, url: "/inteligencia-artificial-empresas" },
  { regex: /automatizaci[oó]n de facturas/gi,      url: "/automatizacion-facturas" },
  { regex: /automatizaci[oó]n inteligente/gi,      url: "/automatizacion-inteligente" },
  { regex: /automatizar facturas/gi,               url: "/automatizacion-facturas" },
  { regex: /automatizaci[oó]n n8n/gi,              url: "/automatizacion-n8n-sevilla" },
  { regex: /formaci[oó]n ia\b/gi,                  url: "/formacion-ia-sevilla" },
  { regex: /\bautomatizaciones\b/gi,               url: "/" },
];

/**
 * Replaces keyword phrases in `text` with anchor elements.
 * Matches are found greedily (no overlaps); longer patterns take priority.
 */
export function linkifyText(
  text: string,
  links: KeywordLink[] = SITE_KEYWORD_LINKS,
): React.ReactNode {
  type Span = { start: number; end: number; url: string; matched: string };
  const spans: Span[] = [];

  for (const { regex, url } of links) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const overlaps = spans.some((s) => start < s.end && end > s.start);
      if (!overlaps) spans.push({ start, end, url, matched: m[0] });
    }
    regex.lastIndex = 0;
  }

  if (spans.length === 0) return text;

  spans.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < spans.length; i++) {
    const { start, end, url, matched } = spans[i];
    if (cursor < start) nodes.push(text.slice(cursor, start));
    nodes.push(
      <a
        key={i}
        href={url}
        className="text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay transition-colors"
      >
        {matched}
      </a>,
    );
    cursor = end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <>{nodes}</>;
}
