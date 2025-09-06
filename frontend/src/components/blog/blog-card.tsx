import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/image';
export interface BlogCardProps {
  post: any;
  onCategoryClick?: (cat: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onCategoryClick }) => {
  // Support multiple categories
  const categories = Array.isArray(post.categories) ? post.categories : [];
  return (
    <div className="group relative flex flex-row items-stretch overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#22A60D] hover:shadow-2xl hover:shadow-[#22A60D]/10 transform hover:-translate-y-2 transition-all duration-500 w-full max-w-4xl mx-auto rounded-2xl">
      {/* Image on the left, smaller */}
      <div className="flex-shrink-0 flex items-center justify-center w-40 h-40 md:w-56 md:h-56 bg-gray-100 dark:bg-gray-900 rounded-l-2xl overflow-hidden">
        {(post.ogImage || post.mainImage || post.coverImage) ? (
          <Image
            src={urlFor(post.ogImage || post.mainImage || post.coverImage).width(224).height(224).url()}
            alt={post.ogImage?.alt || post.mainImage?.alt || post.coverImage?.alt || post.title}
            width={224}
            height={224}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            priority
          />
        ) : null}
      </div>
      {/* Card content on the right */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        {/* Publication date */}
        {post.publishedAt && (
          <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        )}
        {/* Category pill section */}
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((cat: any) => (
            cat?.slug ? (
              onCategoryClick ? (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onCategoryClick(cat.title)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/20 transition w-fit"
                >
                  {cat.ogImage && (
                    <Image
                      src={urlFor(cat.ogImage).width(24).height(24).url()}
                      alt={cat.title}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  {cat.title}
                </button>
              ) : (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/20 transition w-fit"
                >
                  {cat.ogImage && (
                    <Image
                      src={urlFor(cat.ogImage).width(24).height(24).url()}
                      alt={cat.title}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  {cat.title}
                </Link>
              )
            ) : null
          ))}
        </div>
        {/* SEO Title */}
        <h2 className="font-bold text-gray-900 dark:text-white mb-2 text-2xl group-hover:text-[#22A60D] transition-colors duration-300">
          <Link href={`/blog/${post.slug}`}>{post.seoTitle || post.title}</Link>
        </h2>
        {/* SEO Description */}
        {(post.seoDescription || post.excerpt) && (
          <p className="text-gray-600 dark:text-gray-400 text-base opacity-80 mb-2">
            {post.seoDescription || post.excerpt}
          </p>
        )}
      </div>
    </div>
  );
};
