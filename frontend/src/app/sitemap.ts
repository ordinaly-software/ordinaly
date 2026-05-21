import type { MetadataRoute } from "next";
import { metadataBaseUrl } from "@/lib/metadata";
import { client } from "@/lib/sanity";

const PUBLIC_LANDING_SLUGS = [
  "chatbots-empresas-sevilla",
  "chatbots-personalizados-para-empresas",
  "automatizacion-n8n-sevilla",
  "agentes-ia-atencion-cliente-sevilla",
  "automatizacion-whatsapp-business-sevilla",
  "automatizacion-facturas",
  "automatizacion-inteligente",
  "formacion-ia-sevilla",
  "integraciones-crm-erp-sevilla",
  "empresa-inteligencia-artificial",
  "inteligencia-artificial-empresas",
  "inteligencia-artificial-sevilla",
] as const;

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const staticPaths: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contacto", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "weekly", priority: 0.7 },
  { path: "/servicios", changeFrequency: "weekly", priority: 0.8 },
  { path: "/formacion", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.75 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.7 },
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

    const services =
      (await fetchApiCollection<{ slug?: string; draft?: boolean }>(
        "/api/services/",
        apiBase,
      )).filter((s) => !s?.draft) ?? [];

    const courses =
      (await fetchApiCollection<{ slug?: string }>(
        "/api/courses/courses/",
        apiBase,
      )) ?? [];

    const isValidSlug = (value?: string | null) =>
      !!value && value.length >= 4 && !value.endsWith("-");

    const entries: MetadataRoute.Sitemap = [];
    const addPath = (path: string, changeFrequency: ChangeFrequency, priority: number) => {
      entries.push({
        url: canonical(path),
        changeFrequency,
        priority,
      });
    };

    staticPaths.forEach(({ path, changeFrequency, priority }) =>
      addPath(path, changeFrequency, priority),
    );

    slugs.forEach((slug) => addPath(`/${slug}`, "weekly", 0.7));

    services.forEach((service) => {
      const identifier = service?.slug?.trim();
      if (!identifier) return;
      addPath(`/${identifier}`, "weekly", 0.8);
    });

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
