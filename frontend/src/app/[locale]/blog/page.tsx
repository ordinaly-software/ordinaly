import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { paginatedPosts, highlightedPosts } from "@/lib/queries";
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
      path: "/blog",
      title: isEs ? "Blog de automatización e IA" : "Automation & AI blog",
      description: isEs
        ? "Noticias, guías y casos de éxito sobre automatización, IA y productividad para empresas."
        : "News, guides, and success stories on automation, AI, and productivity for companies.",
      image: "/static/backgrounds/blog_background.png",
    });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export const revalidate = 300;

export default async function BlogIndex() {
  const pageSize = 6;
  const params = {
    offset: 0,
    end: pageSize,
    q: "",
    tag: null,
    cat: null,
  } as unknown as QueryParams;

  const [{ items, total }, highlighted] = await Promise.all([
    client.fetch(paginatedPosts, params, { next: { tags: ['blog'] } }),
    client.fetch(highlightedPosts, {}, { next: { tags: ['blog'] } })
  ]);

  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={items} total={total} pageSize={pageSize} highlightedPosts={highlighted} />;
}
