import type { Metadata } from "next";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity";
import { postBySlug } from "@/lib/queries";
import { urlFor } from "@/lib/image";

type Service = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string | null;
};

const FALLBACK_API_BASE_URL = "https://api.ordinaly.ai";
const FALLBACK_OG_IMAGE = "/og-image.png";

const resolveServiceOgImage = (rawImage?: string | null) => {
  if (!rawImage) return FALLBACK_OG_IMAGE;
  const trimmed = rawImage.trim();
  if (!trimmed) return FALLBACK_OG_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\/api\.ordinaly\.ai/i, "https://api.ordinaly.ai");
  }
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/static/")) return trimmed;
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL).replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

async function fetchService(slug: string): Promise<Service | null> {
  try {
    const res = await fetch(getApiEndpoint(`/api/services/${slug}/`), {
      next: { revalidate: 300 },
    });
    if (res.ok) return res.json();
  } catch {
    // ignore
  }
  return null;
}

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

  // Check if it's a service slug
  const service = await fetchService(slug);
  if (service) {
    const fallbackTitle = isEs
      ? "Servicios y productos de automatización con IA"
      : "AI automation services and products";
    const fallbackDescription = isEs
      ? defaultDescription
      : "AI automation services and products for companies looking to scale with intelligent workflows.";
    const title = service.title || fallbackTitle;
    const description = service.subtitle || service.description || fallbackDescription;
    const image = resolveServiceOgImage(service.image);

    return createPageMetadata({ locale, path: `/${slug}`, title, description, image });
  }

  // Unknown slug — return non-indexable fallback
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs ? "Servicios de automatización" : "Automation services",
    description: defaultDescription,
    image: "/static/backgrounds/services_background.webp",
    index: false,
  });
}

const getServicesPage = () =>
  import("../servicios/page.client").then((m) => m.default);

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

  // Service (check API)
  const service = await fetchService(slug);
  if (service) {
    const ServicesPage = await getServicesPage();
    return <ServicesPage initialServiceSlug={slug} />;
  }

  // Nothing found
  notFound();
}
