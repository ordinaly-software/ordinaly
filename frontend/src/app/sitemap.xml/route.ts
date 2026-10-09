import { getSitemapEntries } from "@/lib/sitemap-entries";
import { buildSitemapXml } from "@/lib/sitemap-xml";

// Regenerated at most once an hour; publishing a post revalidates it sooner through the "blog" tag.
export const revalidate = 3600;

export async function GET() {
  let xml: string;
  try {
    xml = buildSitemapXml(await getSitemapEntries());
  } catch (error) {
    // If something blows up (network, Sanity...) answer with an empty sitemap instead of a 500.
    console.warn("sitemap generation failed, returning empty sitemap", error);
    xml = buildSitemapXml([]);
  }
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
