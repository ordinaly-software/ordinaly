import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from './types';
import { BlogPost } from './types';
import { urlFor } from '@/lib/image';
export interface BlogCardProps {
  post: BlogPost;
  onCategoryClick?: (cat: string) => void;
}

export interface BlogCardProps {
  post: BlogPost;
  onCategoryClick?: (cat: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onCategoryClick }) => {
  const categories = Array.isArray(post.categories) ? post.categories : [];

  return (
    <div
      className="
        group relative overflow-hidden
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-2xl
        transition-all duration-300
        w-full max-w-4xl mx-auto
        flex flex-col md:flex-row
        hover:border-[#22A60D]
        hover:shadow-2xl hover:shadow-[#22A60D]/10
        hover:-translate-y-2
      "
    >
      {/* Image */}
      <div
        className="
          relative w-full h-48
          md:h-auto md:w-56 md:flex-shrink-0
          bg-gray-100 dark:bg-gray-900
          md:rounded-l-2xl overflow-hidden
        "
      >
        {post.ogImage?.asset && (
          <Image
            src={urlFor(post.ogImage.asset).url()}
            alt={post.ogImage?.alt || post.title}
            fill
            className="object-cover md:group-hover:scale-110 transition-transform duration-500"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {/* Categories */}
        <div className="mb-2 flex flex-wrap gap-1.5 md:gap-2">
          {categories.map((cat: Category) =>
            cat?.slug ? (
              onCategoryClick ? (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onCategoryClick(cat.slug || cat.title)}
                  className="
                    px-2 py-0.5
                    md:px-3 md:py-1
                    rounded-full
                    bg-[#22C55E]/10 text-[#22C55E]
                    text-xs md:text-sm
                    font-medium
                    hover:bg-[#22C55E]/20 transition
                  "
                >
                  {cat.title}
                </button>
              ) : (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="
                    px-2 py-0.5
                    md:px-3 md:py-1
                    rounded-full
                    bg-[#22C55E]/10 text-[#22C55E]
                    text-xs md:text-sm
                    font-medium
                    hover:bg-[#22C55E]/20 transition
                  "
                >
                  {cat.title}
                </Link>
              )
            ) : null
          )}
        </div>

        {/* Title */}
        <h2
          className="
            font-bold text-gray-900 dark:text-white
            text-lg md:text-2xl
            leading-snug
            mb-1
            md:group-hover:text-[#22A60D]
            transition-colors
            line-clamp-2
          "
        >
          <Link href={`/blog/${post.slug}`}>
            {post.seoTitle || post.title}
          </Link>
        </h2>

        {/* Date */}
        {post.publishedAt && (
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}

        {/* Description – desktop only */}
        {(post.seoDescription || post.excerpt) && (
          <p className="hidden md:block text-gray-600 dark:text-gray-400 text-base opacity-80 mt-2">
            {post.seoDescription || post.excerpt}
          </p>
        )}
      </div>
    </div>
  );
};
