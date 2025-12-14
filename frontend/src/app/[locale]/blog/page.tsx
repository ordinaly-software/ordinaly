import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { paginatedPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/blog",
    title: "Blog de Noticias de Ordinaly",
    description: "Noticias, guías y casos de éxito sobre automatización, IA y productividad.",
    image: "/static/backgrounds/blog_background.webp",
  });
}

export const revalidate = 300;
export const dynamic = 'force-static';

export default async function BlogIndex() {
  const pageSize = 6;
  const { items, total } = await client.fetch(
    paginatedPosts,
    { offset: 0, end: pageSize, q: '', tag: '', cat: '' },
    { next: { tags: ['blog'] } }
  );
  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={items} total={total} pageSize={pageSize} />;
}
