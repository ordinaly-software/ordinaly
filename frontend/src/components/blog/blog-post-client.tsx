"use client";

import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { useTranslations } from 'next-intl';
import { PortableText } from '@portabletext/react';
import { createPortableTextComponents } from './portable-text-components';
import { urlFor } from '@/lib/image';
import Banner from '@/components/ui/banner';
import type { BlogPost, MediaItem, Category } from './types';
import SharePostButtons from './share-post-buttons';
import type { PortableTextBlock } from '@portabletext/types';
import dynamic from "next/dynamic";

const ContactForm = dynamic(() => import("@/components/ui/contact-form.client"), {
  loading: () => null,
  ssr: false,
});

type TocItem = {
  id: string;
  text: string;
  level: number;
};

const headingLevels: Record<string, number> = {
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
};

const getHeadingText = (block: PortableTextBlock) => {
  const children = Array.isArray(block.children) ? block.children : [];
  return children
    .map((child) => (typeof child.text === 'string' ? child.text : ''))
    .join('')
    .trim();
};

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const t = useTranslations('blog');
  if (!post) return null;
  const p = post;
  const headingIdByKey: Record<string, string> = {};
  const tocItems: TocItem[] = [];
  const headingCounts: Record<string, number> = {};

  if (Array.isArray(p.body)) {
    p.body.forEach((block, index) => {
      if (block?._type !== 'block') return;
      const style = block.style || '';
      const level = headingLevels[style];
      if (!level) return;
      const text = getHeadingText(block);
      if (!text) return;
      const baseId = slugifyHeading(text) || `section-${index + 1}`;
      const nextCount = (headingCounts[baseId] || 0) + 1;
      headingCounts[baseId] = nextCount;
      const id = nextCount > 1 ? `${baseId}-${nextCount}` : baseId;
      if (block._key) {
        headingIdByKey[block._key] = id;
      }
      tocItems.push({ id, text, level });
    });
  }
  const portableTextComponents = createPortableTextComponents(headingIdByKey);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    datePublished: p.publishedAt || p._createdAt,
    dateModified: p.updatedAt || p._updatedAt,
    author: { '@type': 'Person', name: p.author?.name },
    image:
      p.coverImage && p.coverImage.asset
        ? [urlFor(p.coverImage.asset).width(1200).height(630).format("png").url()]
        : undefined,
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
        {/* Header row: back link | share buttons | date (responsive) */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          <div className="flex md:justify-start justify-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[#1F8A0D] dark:text-[#3FBD6F] hover:text-[#2EA55E] dark:hover:text-[#2EA55E] hover:underline">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              {t("backToBlog")}
            </Link>
          </div>

          <div className="flex md:justify-center justify-center">
            {/* Share buttons for this post */}
            {p.slug && (
              <div className="px-2">
                <SharePostButtons title={p.title} excerpt={p.seoDescription || p.excerpt || ''} slug={p.slug} />
              </div>
            )}
          </div>

          <div className="flex md:justify-end justify-center">
            {/* Publication date */}
            {p.publishedAt && (
              <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
                {new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>
        {tocItems.length > 0 && (
          <nav aria-label={t('toc.label', { default: 'Table of contents' })} className="mb-8 rounded-2xl border border-[#1F8A0D]/30 dark:border-[#3FBD6F]/40 bg-white/80 dark:bg-[#15151D]/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#3FBD6F]">
              {t('toc.title', { default: 'Table of contents' })}
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              {tocItems.map((item) => (
                <li key={item.id} className={item.level >= 4 ? 'ml-6' : item.level === 3 ? 'ml-4' : 'ml-0'}>
                  <a href={`#${item.id}`} className="hover:text-[#2EA55E] dark:hover:text-[#2EA55E] transition-colors text-[#1F8A0D] dark:text-[#3FBD6F]">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
      {/* Categories and share row - centered and evenly spaced */}
      <div className="border-t border-gray-300 dark:border-gray-700 pt-6 pb-2">
        {Array.isArray(p.categories) && p.categories.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-10">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-evenly gap-8 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">{t("postCategories")}:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {p.categories.map((cat: Category) => (
                    cat?.slug ? (
                      <Link
                        key={cat.slug}
                        href={`/blog?category=${cat.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1F8A0D]/10 text-[#1F8A0D] dark:bg-[#3FBD6F]/20 dark:text-[#3FBD6F] text-sm font-medium hover:bg-[#1F8A0D]/20 dark:hover:bg-[#3FBD6F]/30 transition w-fit"
                      >
                        {cat.title}
                      </Link>
                    ) : null
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">{t('shareLabel')}</div>
                {p.slug && (
                    <SharePostButtons showLabel={false} title={p.title} excerpt={p.seoDescription || p.excerpt || ''} slug={p.slug} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ContactForm />

      <Footer />
      <BackToTopButton />
    </div>
  );
}
