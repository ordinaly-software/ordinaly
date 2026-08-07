import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { paginatedPosts, paginatedPostsAsc, highlightedPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasParams = !!resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;

  const base = createPageMetadata({
    locale: "es",
    path: "/blog",
    title: "Blog de automatización e IA",
    description: "Noticias, ideas y actualizaciones sobre transformación digital, inteligencia artificial y automatización para empresas. Mantente al día con el blog de Ordinaly.",
    image: "/static/backgrounds/blog_background.webp",
    alternateLocales: ["es"],
  });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function BlogIndex({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (locale === "en") notFound();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageSize = 12;

  // Read URL params so SSR always returns the correct page/filter data
  const rawPage = resolvedSearchParams?.page;
  const rawCat = resolvedSearchParams?.category;
  const rawQ = resolvedSearchParams?.q;
  const rawOrder = resolvedSearchParams?.order;

  const pageParam = Number(Array.isArray(rawPage) ? rawPage[0] : (rawPage ?? '1'));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const offset = (page - 1) * pageSize;
  const end = offset + pageSize;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ) ?? '';
  const cat = (Array.isArray(rawCat) ? rawCat[0] : rawCat) ?? null;
  const order = (Array.isArray(rawOrder) ? rawOrder[0] : rawOrder) === 'asc' ? 'asc' : 'desc';

  const queryParams = {
    offset,
    end,
    q,
    tag: null,
    cat,
  } as unknown as QueryParams;

  const query = order === 'asc' ? paginatedPostsAsc : paginatedPosts;

  const [{ items, total }, highlighted] = await Promise.all([
    client.fetch(query, queryParams, { next: { tags: ['blog'] } }),
    client.fetch(highlightedPosts, {}, { next: { tags: ['blog'] } })
  ]);

  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return (
    <>
      <BreadcrumbSchema locale="es" items={[{ name: "Inicio", path: "/" }, { name: "Blog" }]} />
      <BlogClient posts={items} total={total} pageSize={pageSize} highlightedPosts={highlighted} />
    </>
  );
}
