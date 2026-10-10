import { absoluteUrl } from "@/lib/metadata";
import { client } from "@/lib/sanity";
import type { SitemapUrl } from "@/lib/sitemap-xml";

const PUBLIC_LANDING_SLUGS = [
  "agente-de-llamadas-ia",
  "automatizaciones-personalizadas-empresas-n8n",
  "automatizacion-redes-sociales",
  "automatizacion-facturas",
  "automatizacion-informes",
  "implantacion-odoo",
  "auditoria-cumplimiento-ia",
  "desarrollo-de-app-webs",
  "consultora-tecnologica-sevilla",
] as const;

type ChangeFrequency = "daily" | "weekly" | "monthly";

// The /blog listing and individual blog/news posts render es-only (they call
// notFound() for the en locale), so they get no /en entry.
const STATIC_PATHS: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number; esOnly?: boolean }> = [
  { path: "/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contacto", changeFrequency: "weekly", priority: 0.7 },
  { path: "/nosotros", changeFrequency: "weekly", priority: 0.7 },
  { path: "/servicios", changeFrequency: "weekly", priority: 0.8 },
  { path: "/formacion", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.75 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8, esOnly: true },
  { path: "/news", changeFrequency: "daily", priority: 0.7 },
  { path: "/legal", changeFrequency: "monthly", priority: 0.4 },
];

// A slug is a single URL segment. Anything with whitespace, "#", "?" or "/" is bad data in
// the CMS (e.g. article text pasted into the slug field) and would produce a broken URL.
const isValidSlug = (value?: string | null): value is string =>
  !!value && value.length >= 4 && value.length <= 200 && !value.endsWith("-") && !/[\s#?/\\]/.test(value);

const fetchApiCollection = async <T,>(path: string, apiBase?: string): Promise<T[]> => {
  if (!apiBase) return [];
  try {
    const res = await fetch(`${apiBase}${path}`, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
};

const fetchPostSlugs = async (): Promise<string[]> => {
  try {
    return (
      (await client.fetch(
        '*[_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())].slug.current',
        {},
        { next: { tags: ["blog"] } },
      )) ?? []
    );
  } catch {
    return [];
  }
};

/**
 * Every public URL, grouped (pages, landings, courses, blog/news posts), alphabetical inside each
 * group. Posts come from Sanity and courses from the API at request time, so new content shows up
 * without touching this file.
 */
export async function getSitemapEntries(): Promise<SitemapUrl[]> {
  const [postSlugs, courses] = await Promise.all([
    fetchPostSlugs(),
    fetchApiCollection<{ slug?: string }>("/api/courses/courses/", process.env.NEXT_PUBLIC_API_URL),
  ]);

  // Every page is listed in Spanish (no prefix) and, unless it is es-only, again under /en.
  // Language alternates themselves are declared in each page's <head>, not here.
  const entry = (path: string, changeFrequency: ChangeFrequency, priority: number, esOnly?: boolean): SitemapUrl[] => {
    const locales = esOnly ? (["es"] as const) : (["es", "en"] as const);
    return locales.map((loc) => ({ url: absoluteUrl(path, loc), changeFrequency, priority }));
  };

  // Alphabetical by Spanish URL, each page followed by its /en twin.
  const bySlug = (a: string, b: string) => a.localeCompare(b);

  const pages = STATIC_PATHS.flatMap(({ path, changeFrequency, priority, esOnly }) =>
    entry(path, changeFrequency, priority, esOnly),
  );
  const landings = [...PUBLIC_LANDING_SLUGS]
    .sort(bySlug)
    .flatMap((slug) => entry(`/${slug}`, "weekly", 0.85));

  const courseEntries = courses
    .map((course) => course?.slug?.trim())
    .filter(isValidSlug)
    .sort(bySlug)
    .flatMap((slug) => entry(`/formacion/${encodeURIComponent(slug)}`, "weekly", 0.7));

  const postEntries = postSlugs
    .filter((slug) => {
      if (isValidSlug(slug)) return true;
      console.warn(`[sitemap] skipping post with an invalid slug: ${String(slug).slice(0, 80)}`);
      return false;
    })
    .sort(bySlug)
    // Blog and news posts render es-only (they call notFound() for the en locale).
    .flatMap((slug) => entry(`/${encodeURIComponent(slug)}`, "weekly", 0.7, true));

  // Dedupe exact URLs, keeping the first (highest-priority group) occurrence.
  const unique = new Map<string, SitemapUrl>();
  [...pages, ...landings, ...courseEntries, ...postEntries].forEach((e) => {
    if (!unique.has(e.url)) unique.set(e.url, e);
  });
  return [...unique.values()];
}
