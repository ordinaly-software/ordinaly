"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/lib/image';
import { BlogCard, CategoryChipList, postCoverSource } from './blog-card';
import { filterVisibleCategories } from './category-utils';
import { PostByline } from './post-meta';
import type { BlogPost } from './types';

/** Lead story (split hero) plus up to three supporting posts. */
export function FeaturedPosts({
  posts,
  onCategoryClick,
  translationsNamespace = 'blog',
}: {
  posts: BlogPost[];
  onCategoryClick?: (cat: string) => void;
  translationsNamespace?: 'blog' | 'news';
}) {
  const t = useTranslations(translationsNamespace);
  if (!posts || posts.length === 0) return null;

  const [lead, ...rest] = posts;
  const supporting = rest.slice(0, 3);
  const cover = postCoverSource(lead);
  const categories = filterVisibleCategories(Array.isArray(lead.categories) ? lead.categories : []);

  return (
    <section className="bg-white/60 px-4 py-12 dark:bg-white/[0.03] sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-clay">
          {t('featured.label')}
        </p>

        <article className="group relative grid items-center gap-6 transition-transform duration-150 ease-out active:scale-[0.995] motion-reduce:active:scale-100 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-ivory-medium shadow-lg ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
            {cover && (
              <Image
                src={urlFor(cover).width(1200).height(675).url()}
                alt={cover.alt || ''}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            )}
          </div>

          <div>
            <CategoryChipList categories={categories} onCategoryClick={onCategoryClick} />
            <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-slate-dark dark:text-ivory-light md:text-4xl">
              <Link
                href={`/${lead.slug}`}
                className="transition-colors after:absolute after:inset-0 group-hover:text-clay focus-visible:outline-none focus-visible:after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-clay"
              >
                {lead.seoTitle || lead.title}
              </Link>
            </h2>
            {(lead.seoDescription || lead.excerpt) && (
              <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-slate-light dark:text-cloud-medium">
                {lead.seoDescription || lead.excerpt}
              </p>
            )}
            <PostByline post={lead} className="mt-6" />
            <span className="mt-6 inline-flex items-center gap-1.5 font-medium text-clay">
              {t('readArticle')}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </span>
          </div>
        </article>

        {supporting.length > 0 && (
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 border-t border-ivory-dark pt-10 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {supporting.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} onCategoryClick={onCategoryClick} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
