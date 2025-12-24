"use client";

import React from 'react';
import { BlogPost } from './types';
import { BlogCard } from './blog-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HighlightedCarouselProps {
  posts: BlogPost[];
  onCategoryClick?: (cat: string) => void;
}

export const HighlightedCarousel: React.FC<HighlightedCarouselProps> = ({ posts, onCategoryClick }) => {
  const t = useTranslations('blog');
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    checkScrollability();
  }, [posts]);

  // Don't render if no highlighted posts
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('highlighted.title', { default: 'Destacados' })}
          </h2>
          
          {/* Navigation Buttons */}
          {posts.length > 1 && (
            <div className="flex gap-1">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#7CFC00] hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] transition"
                aria-label={t('highlighted.previous', { default: 'Previous' })}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#7CFC00] hover:text-[#1F8A0D] dark:hover:text-[#7CFC00] transition"
                aria-label={t('highlighted.next', { default: 'Next' })}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              scrollLeft();
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              scrollRight();
            }
          }}
          tabIndex={0}
          className="flex overflow-x-auto gap-6 pt-6 pb-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <div key={post.slug} className="flex-shrink-0 w-[80%] md:w-full max-w-4xl pt-2">
              <BlogCard post={post} onCategoryClick={onCategoryClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
