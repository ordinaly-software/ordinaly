"use client";

import React from 'react';
import { BlogPost } from './types';
import { BlogCard } from './blog-card';
import { useTranslations } from 'next-intl';
import { CarouselNavButtons } from '@/components/ui/carousel-nav-buttons';

interface HighlightedCarouselProps {
  posts: BlogPost[];
  onCategoryClick?: (cat: string) => void;
  translationsNamespace?: "blog" | "news";
}

export const HighlightedCarousel: React.FC<HighlightedCarouselProps> = ({
  posts,
  onCategoryClick,
  translationsNamespace = "blog",
}) => {
  const t = useTranslations(translationsNamespace);
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
        <h2 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t('highlighted.title', { default: 'Destacados' })}
        </h2>

        <div className="relative">
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
              <div key={post.slug} className="flex-shrink-0 w-[85%] sm:w-[60%] md:w-[40%] max-w-sm pt-2">
                <BlogCard post={post} onCategoryClick={onCategoryClick} compact />
              </div>
            ))}
          </div>

          {posts.length > 1 && (
            <CarouselNavButtons
              onPrevClick={scrollLeft}
              onNextClick={scrollRight}
              prevDisabled={!canScrollLeft}
              nextDisabled={!canScrollRight}
              prevLabel={t('highlighted.previous', { default: 'Previous' })}
              nextLabel={t('highlighted.next', { default: 'Next' })}
            />
          )}
        </div>
      </div>
    </section>
  );
};
