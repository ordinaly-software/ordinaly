import { client } from '@/lib/sanity';
import { postBySlug } from '@/lib/queries';
import { Metadata } from 'next';
import BlogPostClient from '@/components/blog/blog-post-client';

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(
    '*[_type=="post" && (!defined(isPrivate) || isPrivate==false)].slug.current'
  );
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await client.fetch(postBySlug, { slug });
  if (!p) return {};
  const title = p?.seoTitle ?? p.title;
  const desc = p?.seoDescription ?? p.excerpt ?? '';
  const og = p?.ogImage ?? p?.mainImage ?? p?.coverImage;
  const images = og ? [{ url: og.asset ? og.asset.url : '' }] : [];
  const canonical = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${p.slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, images, type: 'article', url: canonical },
    twitter: { card: 'summary_large_image', title, description: desc, images: images.map(i => i.url) },
  };
}

export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await client.fetch(postBySlug, { slug }, { next: { tags: ['blog', `post:${slug}`] } });
  if (!p || p.isPrivate) return null;
  return <BlogPostClient post={p} />;
}
