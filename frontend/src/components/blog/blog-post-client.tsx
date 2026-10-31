"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { useTranslations } from 'next-intl';
import { PortableText } from '@portabletext/react';
import { createPortableTextComponents, dimensionsFromRef } from './portable-text-components';
import { urlFor } from '@/lib/image';
import type { BlogPost } from './types';
import { filterVisibleCategories } from "./category-utils";
import SharePostButtons from './share-post-buttons';
import ReadingProgress from './reading-progress';
import TableOfContents, { type TocItem } from './table-of-contents';
import { BlogCard, CategoryChipList } from './blog-card';
import { PostByline } from './post-meta';
import type { PortableTextBlock } from '@portabletext/types';
import dynamic from "next/dynamic";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";

const ContactForm = dynamic(() => import("@/components/ui/contact-form.client"), {
  loading: () => null,
  ssr: false,
});
const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  ssr: false,
  loading: () => null,
});

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

// Symmetric side rails keep the text column centred; the centre column takes all the remaining width.
const railGrid = 'xl:grid xl:grid-cols-[10rem_minmax(0,1fr)_10rem] xl:gap-10 2xl:grid-cols-[12rem_minmax(0,1fr)_12rem] 2xl:gap-16';

export default function BlogPostClient({ post, related = [] }: { post: BlogPost; related?: BlogPost[] }) {
  const t = useTranslations('blog');
  if (!post) return null;
  const p = post;
  const isNews = p.postType === 'news';
  const listingPath = isNews ? '/news' : '/blog';
  const visibleCategories = filterVisibleCategories(Array.isArray(p.categories) ? p.categories : []);
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
  const summary = p.seoDescription || p.excerpt || '';
  const cover = p.mainImage?.asset ? p.mainImage : undefined;
  // Keep the image's own proportions (infographics lose their titles when cropped), within sane bounds.
  const coverDims = dimensionsFromRef((cover?.asset as { _ref?: string } | undefined)?._ref);
  const coverRatio = Math.min(2.4, Math.max(1, coverDims.width / coverDims.height));
  const shareProps = { title: p.title, excerpt: summary, slug: p.slug };

  return (
    <div className="min-h-screen bg-ivory-light dark:bg-[var(--swatch--slate-dark)] text-gray-800 dark:text-white transition-colors duration-300">
      <ReadingProgress targetId="post-article" />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 md:pt-12 xl:max-w-[88rem] xl:px-14 2xl:max-w-[96rem] 2xl:px-16">
        <div className={railGrid}>
        <div className="xl:col-start-2">
        <Link
          href={listingPath}
          className="inline-flex items-center gap-2 rounded-full py-1 pr-3 text-sm font-medium text-clay transition-colors hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {isNews ? t('backToNews') : t('backToBlog')}
        </Link>

        <header className="mt-6">
          <CategoryChipList categories={visibleCategories} />
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-slate-dark dark:text-ivory-light md:text-6xl">
            {p.title}
          </h1>
          {summary && (
            <p className="mt-5 text-xl leading-relaxed text-slate-light dark:text-cloud-medium">{summary}</p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-ivory-dark py-4 dark:border-white/10">
            <PostByline post={p} />
            {p.slug && (
              <div className="xl:hidden">
                <SharePostButtons {...shareProps} showLabel={false} />
              </div>
            )}
          </div>
        </header>
        </div>
        </div>

        {cover && (
          <figure className="mx-auto mt-10" style={{ maxWidth: `min(52rem, ${Math.round(55 * coverRatio)}vh)` }}>
            <Image
              src={urlFor(cover).width(1600).url()}
              alt={cover.alt || p.title}
              width={1600}
              height={Math.round(1600 / coverRatio)}
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              style={{ aspectRatio: coverRatio }}
              className="w-full rounded-3xl object-cover shadow-lg ring-1 ring-black/5"
            />
            {(cover.caption || cover.attribution) && (
              <figcaption className="mt-3 text-center text-sm leading-snug tracking-[0.005em] text-slate-light dark:text-cloud-medium">
                {cover.caption}
                {cover.caption && cover.attribution ? ' · ' : null}
                {cover.attribution && <span className="opacity-75">{cover.attribution}</span>}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14 xl:grid-cols-[10rem_minmax(0,1fr)_10rem] xl:gap-10 2xl:grid-cols-[12rem_minmax(0,1fr)_12rem] 2xl:gap-16">
          <aside className="hidden xl:order-first xl:block">
            {p.slug && (
              <div className="sticky top-28 flex flex-col items-end gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{t('shareLabel')}</span>
                <SharePostButtons {...shareProps} showLabel={false} />
              </div>
            )}
          </aside>
          <aside className="order-first lg:order-last">
            <div className="lg:sticky lg:top-28">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
          <article id="post-article" className="prose max-w-none min-w-0">
            <PortableText value={p.body} components={portableTextComponents} />
          </article>
        </div>

        <div className={`mt-12 ${railGrid}`}>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-ivory-dark pt-6 dark:border-white/10 sm:flex-row xl:col-start-2">
            <span className="text-base font-semibold text-slate-medium dark:text-cloud-light">{t('shareLabel')}</span>
            {p.slug && <SharePostButtons {...shareProps} showLabel={false} />}
          </div>
        </div>
      </main>

      {related.length > 0 && (
        <section className="bg-white/60 px-4 py-14 dark:bg-white/[0.03] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-xl font-semibold tracking-[-0.02em] text-slate-dark dark:text-ivory-light md:text-2xl">
              {t('related.title')}
            </h2>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                // Two columns below lg would leave an orphan third card, so only show it from lg up.
                <li key={item.slug} className="[&:nth-child(n+3)]:hidden lg:[&:nth-child(n+3)]:block">
                  <BlogCard post={item} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-clay/20 dark:border-clay/15 bg-white/80 dark:bg-gray-800/90 p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-clay dark:text-clay">
            {t("relatedServices", { default: "Servicios relacionados" })}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li><Link href="/" className="text-clay hover:text-flame hover:underline transition-colors">Consultora software especializada en automatización empresarial con Inteligencia Artificial</Link></li>
            <li><Link href="/automatizaciones-personalizadas-empresas-n8n" className="text-clay hover:text-flame hover:underline transition-colors">Automatizaciones personalizadas con n8n</Link></li>
            <li><Link href="/automatizacion-facturas" className="text-clay hover:text-flame hover:underline transition-colors">Automatización de facturas</Link></li>
            <li><Link href="/implantacion-odoo" className="text-clay hover:text-flame hover:underline transition-colors">Implantación de Odoo</Link></li>
          </ul>
        </div>
      </div>

      <ReCaptchaWrapper badgeContainerId="recaptcha-badge-blog-contact">
        <ContactForm recaptchaAction="blog_contact_form" recaptchaBadgeId="recaptcha-badge-blog-contact" />
      </ReCaptchaWrapper>

      <WhatsAppBubble />
      <Footer />
      <BackToTopButton />
    </div>
  );
}
