import { client } from "@/lib/sanity";
import { routing } from "@/i18n/routing";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const localized = (path: string, locale: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const suffix = normalized === "/" ? "" : normalized;
    return `${base}/${locale}${suffix}`;
  };

  const staticPaths = [
    { path: "/", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/contact", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/us", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/services", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/formation", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/blog", changeFrequency: "daily" as const, priority: 0.8 },
  ];
  const slugs: string[] = await client.fetch(
    '*[_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())].slug.current',
    {},
    { next: { tags: ["blog"] } },
  );

  const fetchApiCollection = async (path: string) => {
    if (!apiBase) return [];
    try {
      const res = await fetch(`${apiBase}${path}`, { next: { revalidate: 60 * 60 } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const services =
    (await fetchApiCollection("/api/services/")).filter((s: any) => !s?.draft);
  const courses = await fetchApiCollection("/api/courses/courses/");

  const entries = [];
  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      entries.push({
        url: localized(p.path, locale),
        changeFrequency: p.changeFrequency,
        priority: p.priority,
      });
    }
    for (const slug of slugs) {
      entries.push({
        url: localized(`/blog/${slug}`, locale),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const service of services) {
      const identifier = service?.slug || service?.id;
      if (!identifier) continue;
      entries.push({
        url: localized(`/services/${identifier}`, locale),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const course of courses) {
      const identifier = course?.slug || course?.id;
      if (!identifier) continue;
      entries.push({
        url: localized(`/formation/${identifier}`, locale),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
