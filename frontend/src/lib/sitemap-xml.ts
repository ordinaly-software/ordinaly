// Serializes sitemap entries as plain, indented XML.
//
// Deliberately minimal: no stylesheet and no extra namespaces (e.g. xhtml:link for hreflang).
// With plain sitemap XML, browsers show their built-in collapsible tree, which is easy to read;
// an XSLT stylesheet would be removed from Chrome soon, and xhtml:link elements make Chrome
// fall back to one unreadable line of text. Language alternates are declared in each page's <head>.

export type SitemapUrl = {
  url: string;
  changeFrequency?: string;
  priority?: number;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function buildSitemapXml(entries: SitemapUrl[]): string {
  const urls = entries.map((entry) => {
    const lines = [`    <loc>${escapeXml(entry.url)}</loc>`];
    if (entry.changeFrequency) lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
    if (entry.priority !== undefined) lines.push(`    <priority>${entry.priority}</priority>`);
    return `  <url>\n${lines.join("\n")}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
