import type { Metadata } from "next";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity";
import { postBySlug } from "@/lib/queries";
import { urlFor } from "@/lib/image";

async function fetchBlogPost(slug: string) {
  try {
    const p = await client.fetch(postBySlug, { slug }, { next: { tags: ['blog', `post:${slug}`] } });
    return p && !p.isPrivate ? p : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

  // Check blog post first
  const post = await fetchBlogPost(slug);
  if (post) {
    if (locale === "en") notFound();
    const title = post?.seoTitle ?? post.title;
    const desc = post?.seoDescription ?? post.excerpt ?? defaultDescription;
    const og = post.ogImage ?? post.mainImage ?? post.coverImage;
    const ogUrl = og ? urlFor(og).width(1200).height(630).fit("crop").format("jpg").url() : "";
    return createPageMetadata({
      locale: "es",
      path: `/${post.slug}`,
      title,
      description: desc,
      image: ogUrl || "/og-image.png",
      type: "article",
      alternateLocales: ["es"],
    });
  }

  // Unknown slug — return non-indexable fallback
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs ? "Página no encontrada" : "Page not found",
    description: defaultDescription,
    image: "/og-image.png",
    index: false,
  });
}

const getBlogPostClient = () =>
  import("@/components/blog/blog-post-client").then((m) => m.default);

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;

  // Blog post check first (Sanity)
  const post = await fetchBlogPost(slug);
  if (post) {
    if (locale === "en") notFound();
    const BlogPostClient = await getBlogPostClient();
    const { urlFor: urlForImg } = await import("@/lib/image");
    const coverImageAsset = post.coverImage?.asset ?? post.mainImage?.asset;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      datePublished: post.publishedAt || post._createdAt,
      dateModified: post.updatedAt || post._updatedAt,
      author: { '@type': 'Person', name: post.author?.name },
      image: coverImageAsset
        ? [urlForImg(coverImageAsset).width(1200).height(630).format("png").url()]
        : undefined,
      mainEntityOfPage: `${process.env.NEXT_PUBLIC_BASE_URL}/${post.slug}`,
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogPostClient post={post} />
      </>
    );
  }

  // Nothing found
  notFound();
}
