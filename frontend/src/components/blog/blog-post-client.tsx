"use client";

import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { useTranslations } from 'next-intl';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from './portable-text-components';
import { urlFor } from '@/lib/image';
import Banner from '@/components/ui/banner';
import type { BlogPost, MediaItem, Category } from './types';

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const t = useTranslations('blog');
  if (!post) return null;
  const p = post;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    datePublished: p.publishedAt || p._createdAt,
    dateModified: p.updatedAt || p._updatedAt,
    author: { '@type': 'Person', name: p.author?.name },
    image: p.coverImage && p.coverImage.asset ? [urlFor(p.coverImage.asset).width(1200).height(630).url()] : undefined,
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${p.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <Banner
        title={p.title}
        subtitle={p.seoDescription || p.excerpt || ''}
        backgroundImage={p.mainImage && p.mainImage.asset ? urlFor(p.mainImage.asset).width(1600).height(900).url() : undefined}
      />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Link href="/blog" className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 hover:underline mb-6">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          {t("backToBlog")}
        </Link>
        {/* Publication date */}
        {p.publishedAt && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        )}
        {/* Main cover image (already shown in banner, so skip here) */}
        {p.media && Array.isArray(p.media) && p.media.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {p.media.map((m: MediaItem, idx: number) => (
              <div key={idx} className="rounded-lg overflow-hidden">
                {m.type === 'image' && m.asset && (
                  <Image
                    src={urlFor(m.asset).width(800).height(600).url()}
                    alt={m.alt || 'Blog media'}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                )}
                {m.type === 'video' && m.url && (
                  <video controls className="w-full h-auto">
                    <source src={m.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ))}
          </div>
        )}
        <article className="prose max-w-none mt-6">
          <PortableText value={p.body} components={portableTextComponents} />
        </article>
      </main>
      {/* Categories at the bottom */}
      {Array.isArray(p.categories) && p.categories.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-10">
          <div className="mt-8 mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">{t("postCategories")}:</div>
          <div className="flex flex-wrap gap-2">
            {p.categories.map((cat: Category) => (
              cat?.slug ? (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.title}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/20 transition w-fit"
                >
                  {cat.title}
                </Link>
              ) : null
            ))}
          </div>
        </div>
      )}
      <Footer />
      <BackToTopButton />
    </div>
  );
}
