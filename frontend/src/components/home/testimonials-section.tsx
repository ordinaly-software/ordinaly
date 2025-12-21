"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

const MAX_TESTIMONIALS = 5;
const avatarGradients = [
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-cyan-600",
  "from-lime-400 to-emerald-500",
];

const localTestimonials = [
  {
    initials: "AG",
    nameKey: "testimonials.items.0.name",
    roleKey: "testimonials.items.0.role",
    quoteKey: "testimonials.items.0.quote",
    color: "from-green-400 to-green-600",
  },
  {
    initials: "JM",
    nameKey: "testimonials.items.1.name",
    roleKey: "testimonials.items.1.role",
    quoteKey: "testimonials.items.1.quote",
    color: "from-blue-400 to-blue-600",
  },
  {
    initials: "LR",
    nameKey: "testimonials.items.2.name",
    roleKey: "testimonials.items.2.role",
    quoteKey: "testimonials.items.2.quote",
    color: "from-purple-400 to-purple-600",
  },
];

type GoogleReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  profile_photo_url?: string;
  relative_time_description?: string;
  time?: number;
};

type GoogleReviewsPayload = {
  rating: number | null;
  userRatingsTotal: number | null;
  reviews: GoogleReview[];
  googleMapsUrl?: string;
  writeReviewUrl?: string;
};

type TestimonialCard = {
  name: string;
  meta?: string;
  quote?: string;
  rating: number;
  profilePhotoUrl?: string;
  initials?: string;
  color?: string;
};

const clampStars = (rating: number) => Math.max(0, Math.min(5, Math.round(rating)));

const sortTestimonials = (items: TestimonialCard[]) =>
  [...items].sort((a, b) => {
    const ratingDiff = b.rating - a.rating;
    if (ratingDiff !== 0) return ratingDiff;
    const aHasText = Boolean(a.quote && a.quote.trim().length > 0);
    const bHasText = Boolean(b.quote && b.quote.trim().length > 0);
    if (aHasText !== bHasText) return aHasText ? -1 : 1;
    return (b.quote?.length ?? 0) - (a.quote?.length ?? 0);
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 48 48"
    className={className}
  >
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.837 32.661 29.345 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.045 6.053 29.272 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.656 16.104 19.001 12 24 12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.045 6.053 29.272 4 24 4 16.319 4 9.656 8.276 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.237 0 9.917-2.006 13.469-5.268l-6.219-5.268C29.205 35.091 26.715 36 24 36c-5.324 0-9.814-3.319-11.281-7.946l-6.529 5.028C9.512 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 01-4.053 5.464h.003l6.219 5.268C36.999 39.187 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

export function TestimonialsSection({ t }: SectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [googleData, setGoogleData] = useState<GoogleReviewsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/google-reviews");
        if (!response.ok) {
          throw new Error("Google reviews request failed");
        }
        const data = (await response.json()) as GoogleReviewsPayload;
        if (isMounted) {
          setGoogleData(data);
          setHasError(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = idleWindow.requestIdleCallback?.(fetchReviews) ?? null;
    const timeoutId = idleId ? null : window.setTimeout(fetchReviews, 800);
    return () => {
      isMounted = false;
      if (idleId !== null) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const fallbackCards = useMemo<TestimonialCard[]>(
    () =>
      localTestimonials.map((item) => ({
        name: t(item.nameKey).split(" ")[0] + "...",
        meta: t(item.roleKey),
        quote: t(item.quoteKey),
        rating: 5,
        initials: item.initials,
        color: item.color,
      })),
    [t],
  );

  const googleCards = useMemo<TestimonialCard[]>(() => {
    if (!googleData?.reviews?.length) return [];
    return googleData.reviews.map((review, index) => ({
      name: (review.author_name?.split(" ")[0] ?? t("testimonials.googleSource")) + "...",
      meta: review.relative_time_description || t("testimonials.googleSource"),
      quote: review.text?.trim(),
      rating: review.rating ?? 0,
      profilePhotoUrl: review.profile_photo_url,
      initials: review.author_name ? getInitials(review.author_name) : "G",
      color: avatarGradients[index % avatarGradients.length],
    }));
  }, [googleData, t]);

  const shouldShowSkeleton = isLoading && !googleData;
  const visibleTestimonials = useMemo(
    () =>
      shouldShowSkeleton
        ? []
        : sortTestimonials(googleCards.length ? googleCards : fallbackCards).slice(
            0,
            MAX_TESTIMONIALS,
          ),
    [fallbackCards, googleCards, shouldShowSkeleton],
  );

  // Ensure newly added testimonial cards become visible by triggering their animation
  useEffect(() => {
    const container = sectionRef.current;
    if (!container) return;
    const items = container.querySelectorAll<HTMLElement>(".scroll-animate");
    items.forEach((el) => el.classList.add("animate-in"));
  }, [visibleTestimonials.length]);

  const aggregateRating = googleData?.rating ?? null;
  const aggregateCount = googleData?.userRatingsTotal ?? null;
  const cardScrollStep = 320;

  const checkScrollability = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const handleScrollLeft = () => {
    const container = scrollRef.current;
    if (!container) return;
    const newScroll = Math.max(container.scrollLeft - cardScrollStep, 0);
    container.scrollTo({ left: newScroll, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    const container = scrollRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const newScroll = Math.min(container.scrollLeft + cardScrollStep, maxScroll);
    container.scrollTo({ left: newScroll, behavior: "smooth" });
  };

  useEffect(() => {
    checkScrollability();
  }, [visibleTestimonials.length]);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("testimonials.title")}
          </h2>
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {shouldShowSkeleton ? (
              <>
                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-60 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                {aggregateRating !== null && aggregateCount !== null && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                        {aggregateRating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className={`w-5 h-5 ${
                              index < clampStars(aggregateRating)
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-700"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span>
                      {t("testimonials.googleSummary", {
                        rating: aggregateRating.toFixed(1),
                        count: aggregateCount,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {googleData?.googleMapsUrl && (
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={googleData.googleMapsUrl} target="_blank" rel="noreferrer">
                        <BadgeCheck className="h-4 w-4" />
                        {t("testimonials.googleLink")}
                      </a>
                    </Button>
                  )}
                  {googleData?.writeReviewUrl && (
                    <Button asChild size="sm" className="gap-2">
                      <a href={googleData.writeReviewUrl} target="_blank" rel="noreferrer">
                        <GoogleIcon className="h-4 w-4" />
                        {t("testimonials.googleWrite")}
                      </a>
                    </Button>
                  )}
                </div>
                {isLoading && <span>{t("testimonials.googleLoading")}</span>}
                {hasError && !isLoading && <span>{t("testimonials.googleUnavailable")}</span>}
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScrollability}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {shouldShowSkeleton
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`testimonial-skeleton-${index}`}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg min-w-[260px] sm:min-w-[300px] md:min-w-[320px] animate-pulse"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="flex mb-3 gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`star-skeleton-${index}-${i}`}
                          className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700"
                        ></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))
              : visibleTestimonials.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg min-w-[260px] sm:min-w-[300px] md:min-w-[320px]"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="flex items-center mb-4">
                      {item.profilePhotoUrl && !failedImages[item.profilePhotoUrl] ? (
                        <div className="w-12 h-12 relative mr-3">
                          <img
                            src={item.profilePhotoUrl}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [item.profilePhotoUrl ?? "unknown"]: true,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${
                            item.color ?? avatarGradients[index % avatarGradients.length]
                          } rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3`}
                        >
                          {item.initials ?? getInitials(item.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        {item.meta && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.meta}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < clampStars(item.rating)
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {item.quote && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        “{item.quote}”
                      </p>
                    )}
                  </div>
                ))}
          </div>
          <div className="mr-2 mt-4 flex justify-end gap-2 px-1">
            <button
              className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              type="button"
              aria-label="Scroll testimonials left"
            >
              <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <button
              className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              type="button"
              aria-label="Scroll testimonials right"
            >
              <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
