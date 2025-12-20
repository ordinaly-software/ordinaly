import { Metadata } from "next";
import { client } from "@/lib/sanity";
import { postBySlug } from "@/lib/queries";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { urlFor } from "@/lib/image";
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(
    '*[_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())].slug.current'
  );
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const p = await client.fetch(postBySlug, { slug });
  if (!p) return {};
  const title = p?.seoTitle ?? p.title;
  const desc = p?.seoDescription ?? p.excerpt ?? defaultDescription;
  const og = p?.ogImage ?? p?.mainImage ?? p?.coverImage;
  const imageBuilder = og ? urlFor(og) : null;
  const image = imageBuilder ? imageBuilder.width(1200).height(630).fit("crop").url() : "/og-image.png";

  return createPageMetadata({
    locale,
    path: `/blog/${p.slug}`,
    title,
    description: desc,
    image,
    type: "article",
  });
}

export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const p = await client.fetch(postBySlug, { slug }, { next: { tags: ['blog', `post:${slug}`] } });
  if (!p || p.isPrivate) return null;

  const { default: BlogPostClient } = await import('@/components/blog/blog-post-client');

  return <BlogPostClient post={p} />;
}
