import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { highlightedNewsPosts, paginatedNewsPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasParams = !!resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;

  const base = createPageMetadata({
      locale,
      path: "/news",
      title: isEs ? "Noticias de automatización e IA" : "Automation & AI news",
      description: isEs
        ? "Actualidad y novedades sobre automatización, IA y productividad para empresas."
        : "Updates and news about automation, AI, and productivity for companies.",
      image: "/static/backgrounds/blog_background.png",
    });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export const revalidate = 300;

export default async function NewsIndex() {
  const pageSize = 12;
  const params = {
    offset: 0,
    end: pageSize,
    q: "",
    tag: null,
    cat: null,
  } as unknown as QueryParams;

  const [{ items, total }, highlighted] = await Promise.all([
    client.fetch(paginatedNewsPosts, params, { next: { tags: ["news"] } }),
    client.fetch(highlightedNewsPosts, {}, { next: { tags: ["news"] } }),
  ]);

  const { default: BlogClient } = await import("@/components/blog/blog-client");
  return (
    <BlogClient
      posts={items}
      total={total}
      pageSize={pageSize}
      highlightedPosts={highlighted}
      basePath="/news"
      translationsNamespace="news"
    />
  );
}
