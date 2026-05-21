import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { paginatedPosts, highlightedPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

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
    image: "/static/backgrounds/blog_background.png",
    alternateLocales: ["es"],
  });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export const revalidate = 300;

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale === "en") notFound();
  const pageSize = 12;
  const queryParams = {
    offset: 0,
    end: pageSize,
    q: "",
    tag: null,
    cat: null,
  } as unknown as QueryParams;

  const [{ items, total }, highlighted] = await Promise.all([
    client.fetch(paginatedPosts, queryParams, { next: { tags: ['blog'] } }),
    client.fetch(highlightedPosts, {}, { next: { tags: ['blog'] } })
  ]);

  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={items} total={total} pageSize={pageSize} highlightedPosts={highlighted} />;
}
