import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { listPosts } from "@/lib/queries";
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
  const posts = await client.fetch(listPosts, {}, { next: { tags: ['blog'] } });
  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={posts} />;
}
