import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from './types';
import { BlogPost } from './types';
import { urlFor } from '@/lib/image';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { filterVisibleCategories } from "./category-utils";
import { PostByline } from './post-meta';

export const categoryChipClass = cn(
  badgeVariants({ variant: 'secondary' }),
  'relative z-10 bg-clay/10 px-3 py-1 text-xs font-medium text-clay transition-[background-color,transform] duration-150 hover:bg-clay/20 active:scale-95 dark:text-clay motion-reduce:active:scale-100',
);

export const postCoverSource = (post: BlogPost) => {
  const image = post.ogImage?.asset ? post.ogImage : post.mainImage;
  return image?.asset ? image : undefined;
};

export function CategoryChipList({
  categories,
  onCategoryClick,
}: {
  categories: Category[];
  onCategoryClick?: (cat: string) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {categories.map((cat) =>
        cat?.slug ? (
          onCategoryClick ? (
            <button key={cat.slug} type="button" onClick={() => onCategoryClick(cat.slug)} className={categoryChipClass}>
              {cat.title}
            </button>
          ) : (
            <Link key={cat.slug} href={`/blog?category=${cat.slug}`} className={categoryChipClass}>
              {cat.title}
            </Link>
          )
        ) : null,
      )}
    </div>
  );
}

export interface BlogCardProps {
  post: BlogPost;
  onCategoryClick?: (cat: string) => void;
  compact?: boolean;
  /** `sm` is a denser card for secondary lists such as related posts. */
  size?: 'default' | 'sm';
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onCategoryClick, compact = false, size = 'default' }) => {
  const categories = filterVisibleCategories(Array.isArray(post.categories) ? post.categories : []);
  const cover = postCoverSource(post);
  const small = size === 'sm';

  return (
    <article
      className="group relative flex h-full flex-col transition-transform duration-150 ease-out active:scale-[0.99] motion-reduce:active:scale-100"
    >
      <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ivory-medium ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10', small ? 'aspect-[16/10]' : 'aspect-[3/2]')}>
        {cover && (
          <Image
            src={urlFor(cover).width(800).height(534).url()}
            alt={cover.alt || ''}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {!compact && <CategoryChipList categories={categories} onCategoryClick={onCategoryClick} />}

        <h2
          className={cn(
            'font-semibold text-balance text-slate-dark dark:text-ivory-light',
            compact ? 'text-base leading-snug' : small ? 'text-base leading-snug tracking-[-0.01em] line-clamp-3' : 'text-xl leading-tight tracking-[-0.015em] line-clamp-3',
          )}
        >
          {/* Stretched link: the whole card is the click target, chips stay above it. */}
          <Link
            href={`/${post.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-clay focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-clay"
          >
            {post.seoTitle || post.title}
          </Link>
        </h2>

        {!compact && (post.seoDescription || post.excerpt) && (
          <p className={cn('mt-2 line-clamp-2 leading-relaxed text-slate-light dark:text-cloud-medium', small ? 'text-sm' : 'text-base')}>
            {post.seoDescription || post.excerpt}
          </p>
        )}

        {!compact && <PostByline post={post} className="mt-auto pt-5" />}
      </div>
    </article>
  );
};
