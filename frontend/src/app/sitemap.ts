import type { MetadataRoute } from "next";
import { metadataBaseUrl } from "@/lib/metadata";
import { client } from "@/lib/sanity";
import { landingsMeta } from "@/app/[locale]/landings";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const staticPaths: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services", changeFrequency: "weekly", priority: 0.8 },
  { path: "/formation", changeFrequency: "weekly", priority: 0.7 },
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
      (await fetchApiCollection<{ slug?: string; id?: string; draft?: boolean }>(
        "/api/services/",
        apiBase,
      )).filter((s) => !s?.draft) ?? [];

    const courses =
      (await fetchApiCollection<{ slug?: string; id?: string }>(
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

    slugs.forEach((slug) => addPath(`/blog/${slug}`, "weekly", 0.7));

    services.forEach((service) => {
      const identifier = service?.slug || service?.id;
      if (!identifier) return;
      addPath(`/services/${identifier}`, "weekly", 0.8);
    });

    // Local SEO landings
    landingsMeta.forEach((landing) => addPath(`/${landing.slug}`, "weekly", 0.85));

    courses.forEach((course) => {
      const identifier = course?.slug || course?.id;
      if (!isValidSlug(identifier)) return;
      addPath(`/formation/${identifier}`, "weekly", 0.7);
    });

    // Keep root and top-level sections before deeper routes.
    entries.sort((a, b) => {
      const depthA = new URL(a.url).pathname.split("/").filter(Boolean).length;
      const depthB = new URL(b.url).pathname.split("/").filter(Boolean).length;
      if (depthA !== depthB) return depthA - depthB;
      return a.url.localeCompare(b.url);
    });

    return entries;
  } catch (error) {
    // Si algo explota (red, Sanity, etc.), devolvemos un sitemap vacío en vez de 500
    console.warn("sitemap generation failed, returning empty sitemap", error);
    return [];
  }
}
