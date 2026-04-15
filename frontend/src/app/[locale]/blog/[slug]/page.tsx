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
  const { slug } = await params;
  const p = await client.fetch(postBySlug, { slug });
  if (!p) return {};
  const title = p?.seoTitle ?? p.title;
  const desc = p?.seoDescription ?? p.excerpt ?? defaultDescription;
  const og = p.ogImage ?? p.mainImage ?? p.coverImage;
  const ogUrl = og ? urlFor(og).width(1200).height(630).fit("crop").format("jpg").url() : "";
  const imageUrl = ogUrl || "/og-image.png";

  return createPageMetadata({
    locale: "es",
    path: `/blog/${p.slug}`,
    title,
    description: desc,
    image: imageUrl,
    type: "article",
    alternateLocales: ["es"],
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

  const coverImageAsset = p.coverImage?.asset ?? p.mainImage?.asset;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    datePublished: p.publishedAt || p._createdAt,
    dateModified: p.updatedAt || p._updatedAt,
    author: { '@type': 'Person', name: p.author?.name },
    image: coverImageAsset
      ? [urlFor(coverImageAsset).width(1200).height(630).format("png").url()]
      : undefined,
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${p.slug}`,
  };

  const { default: BlogPostClient } = await import('@/components/blog/blog-post-client');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={p} />
    </>
  );
}
