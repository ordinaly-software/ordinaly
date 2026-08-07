import type { MetadataRoute } from "next";
import { absoluteUrl, localeHrefLangs, metadataBaseUrl } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import { client } from "@/lib/sanity";

const PUBLIC_LANDING_SLUGS = [
  "agente-de-llamadas-ia",
  "automatizaciones-personalizadas-empresas-n8n",
  "automatizacion-redes-sociales",
  "automatizacion-facturas",
  "automatizacion-informes",
  "implantacion-odoo",
  "desarrollo-de-app-webs",
] as const;

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

// The /blog listing and individual blog/news posts render es-only (they call
// notFound() for the en locale), so they must not get an en hreflang alternate.
const staticPaths: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number; esOnly?: boolean }> = [
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

const stripLocalePrefix = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = normalized.replace(/^\/(es|en)(?=\/|$)/, "");
  return withoutLocale || "/";
};

const canonical = (path: string) => {
  const normalizedPath = stripLocalePrefix(path);
  if (normalizedPath === "/") return metadataBaseUrl;
  return `${metadataBaseUrl}${normalizedPath}`;
};

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    const slugs: string[] =
      (await (async () => {
        try {
          return await client.fetch(
            '*[_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())].slug.current',
            {},
            { next: { tags: ["blog"] } },
          );
        } catch {
          return [];
        }
      })()) ?? [];

    const courses =
      (await fetchApiCollection<{ slug?: string }>(
        "/api/courses/courses/",
        apiBase,
      )) ?? [];

    const isValidSlug = (value?: string | null) =>
      !!value && value.length >= 4 && !value.endsWith("-");

    const buildLanguageAlternates = (path: string, esOnly?: boolean) => {
      const locales = esOnly ? routing.locales.filter((loc) => loc === "es") : routing.locales;
      const languages = Object.fromEntries(
        locales.map((loc) => [localeHrefLangs[loc] ?? loc, absoluteUrl(path, loc)]),
      );
      languages["x-default"] = absoluteUrl(path, "es");
      return languages;
    };

    const entries: MetadataRoute.Sitemap = [];
    const addPath = (
      path: string,
      changeFrequency: ChangeFrequency,
      priority: number,
      esOnly?: boolean,
    ) => {
      entries.push({
        url: canonical(path),
        changeFrequency,
        priority,
        alternates: { languages: buildLanguageAlternates(path, esOnly) },
      });
    };

    staticPaths.forEach(({ path, changeFrequency, priority, esOnly }) =>
      addPath(path, changeFrequency, priority, esOnly),
    );

    // Blog and news posts render es-only (they call notFound() for the en locale).
    slugs.forEach((slug) => addPath(`/${slug}`, "weekly", 0.7, true));

    // Local SEO landings
    PUBLIC_LANDING_SLUGS.forEach((slug) => addPath(`/${slug}`, "weekly", 0.85));

    courses.forEach((course) => {
      const identifier = course?.slug?.trim();
      if (!isValidSlug(identifier)) return;
      addPath(`/formacion/${identifier}`, "weekly", 0.7);
    });

    // Keep root and top-level sections before deeper routes, then dedupe exact URLs.
    entries.sort((a, b) => {
      const depthA = new URL(a.url).pathname.split("/").filter(Boolean).length;
      const depthB = new URL(b.url).pathname.split("/").filter(Boolean).length;
      if (depthA !== depthB) return depthA - depthB;
      return a.url.localeCompare(b.url);
    });

    const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();
    entries.forEach((entry) => {
      if (!uniqueEntries.has(entry.url)) {
        uniqueEntries.set(entry.url, entry);
      }
    });

    return [...uniqueEntries.values()];
  } catch (error) {
    // Si algo explota (red, Sanity, etc.), devolvemos un sitemap vacío en vez de 500
    console.warn("sitemap generation failed, returning empty sitemap", error);
    return [];
  }
}
