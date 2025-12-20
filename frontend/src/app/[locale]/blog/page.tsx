import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { paginatedPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/blog",
    title: isEs ? "Blog de automatización e IA | Ordinaly" : "Automation & AI blog | Ordinaly",
    description: isEs
      ? "Noticias, guías y casos de éxito sobre automatización, IA y productividad para empresas."
      : "News, guides, and success stories on automation, AI, and productivity for companies.",
    image: "/static/backgrounds/blog_background.webp",
  });
}

export const revalidate = 300;
export const dynamic = 'force-static';

export default async function BlogIndex() {
  const pageSize = 6;
  const params = {
    offset: 0,
    end: pageSize,
    q: "",
    tag: null,
    cat: null,
  } as unknown as QueryParams;

  const { items, total } = await client.fetch(
    paginatedPosts,
    params,
    { next: { tags: ['blog'] } }
  );
  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={items} total={total} pageSize={pageSize} />;
}
