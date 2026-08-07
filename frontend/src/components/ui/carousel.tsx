"use client";

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import type { EmblaOptionsType } from "embla-carousel";
import { useCarouselButtons } from "./carousel-buttons";
import { CarouselNavButtons } from "./carousel-nav-buttons";
import { cn } from "@/lib/utils";

export interface CarouselProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  /** Extra slide appended after the items, e.g. a "view all" card. */
  trailingSlide?: ReactNode;
  /** Tailwind classes controlling how many slides fit per breakpoint. */
  slideClassName?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
  options?: EmblaOptionsType;
  /**
   * Set when slides have their own fixed pixel width (e.g. `w-[380px]` on
   * the rendered item) instead of a percentage `basis-*` in `slideClassName`.
   * Fixed-width slides need the scroll container sized to their combined
   * width so Embla can measure how far it can actually scroll — percentage
   * slides need the opposite (container = 100% of the viewport), so this
   * only changes behavior when explicitly opted into.
   */
  fixedWidthSlides?: boolean;
}

const DEFAULT_SLIDE_CLASS =
  "shrink-0 grow-0 basis-[85%] sm:basis-[46%] lg:basis-[31%] pl-4";

export function Carousel<T>({
  items,
  getKey,
  renderItem,
  trailingSlide,
  slideClassName = DEFAULT_SLIDE_CLASS,
  autoplay = false,
  autoplayDelay = 4500,
  prevLabel = "Previous",
  nextLabel = "Next",
  className,
  options,
  fixedWidthSlides = false,
}: CarouselProps<T>) {
  const plugins = useMemo(
    () => [
      WheelGesturesPlugin(),
      ...(autoplay
        ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
        : []),
    ],
    [autoplay, autoplayDelay],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", containScroll: fixedWidthSlides ? false : "keepSnaps", dragFree: true, ...options },
    plugins,
  );

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    useCarouselButtons(emblaApi);

  // Slide count/content can change after the initial measurement (e.g. data
  // arriving after mount, images loading, fonts swapping in); without this,
  // embla can keep stale scroll-snap bounds and leave the next button
  // incorrectly disabled even though there's more content to scroll to.
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, items.length, trailingSlide]);

  const [partialSlides, setPartialSlides] = useState<ReadonlySet<number>>(new Set());

  // Slides only partially inside the viewport (peeking at the edges) get blurred.
  useEffect(() => {
    const viewport = emblaApi?.rootNode();
    if (!viewport) return;
    const slideEls = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-carousel-slide]"),
    );
    if (slideEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setPartialSlides((prev) => {
          const next = new Set(prev);
          let changed = false;
          entries.forEach((entry) => {
            const idx = Number((entry.target as HTMLElement).dataset.carouselSlide);
            const isPartial = entry.intersectionRatio < 0.9;
            if (isPartial && !next.has(idx)) {
              next.add(idx);
              changed = true;
            } else if (!isPartial && next.has(idx)) {
              next.delete(idx);
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      },
      { root: viewport, threshold: [0, 0.9, 1] },
    );

    slideEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [emblaApi, items.length, trailingSlide]);

  // Pause autoplay while the carousel is scrolled out of view.
  useEffect(() => {
    if (!autoplay || !emblaApi) return;
    const autoplayPlugin = emblaApi.plugins().autoplay;
    if (!autoplayPlugin) return;
    const root = emblaApi.rootNode();

    // The plugin skips its own setup when everything fits in one snap
    // (scrollSnapList().length <= 1); calling play()/stop() on it then throws.
    const canAutoplay = () => emblaApi.scrollSnapList().length > 1;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!canAutoplay()) return;
        if (entry.isIntersecting) autoplayPlugin.play();
        else autoplayPlugin.stop();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [autoplay, emblaApi]);

  if (items.length === 0 && !trailingSlide) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={cn("flex -ml-4", fixedWidthSlides && "w-max shrink-0")}>
          {items.map((item, index) => (
            <div
              key={getKey(item, index)}
              data-carousel-slide={index}
              className={cn(
                slideClassName,
                "transition-[filter,opacity,transform] duration-300 ease-out",
                partialSlides.has(index)
                  ? "blur-[1.5px] opacity-70 scale-[0.98]"
                  : "blur-0 opacity-100 scale-100",
              )}
            >
              {renderItem(item, index)}
            </div>
          ))}
          {trailingSlide && (
            <div
              data-carousel-slide={items.length}
              className={cn(
                slideClassName,
                "transition-[filter,opacity,transform] duration-300 ease-out",
                partialSlides.has(items.length)
                  ? "blur-[1.5px] opacity-70 scale-[0.98]"
                  : "blur-0 opacity-100 scale-100",
              )}
            >
              {trailingSlide}
            </div>
          )}
        </div>
      </div>

      {items.length + (trailingSlide ? 1 : 0) > 1 && (
        <CarouselNavButtons
          onPrevClick={onPrevButtonClick}
          onNextClick={onNextButtonClick}
          prevDisabled={prevBtnDisabled}
          nextDisabled={nextBtnDisabled}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
        />
      )}
    </div>
  );
}
