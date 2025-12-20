"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

export function TestimonialsSection({ t }: SectionProps) {
  const [googleData, setGoogleData] = useState<GoogleReviewsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackCards = useMemo<TestimonialCard[]>(
    () =>
      localTestimonials.map((item) => ({
        name: t(item.nameKey),
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
      name: review.author_name ?? t("testimonials.googleSource"),
      meta: review.relative_time_description || t("testimonials.googleSource"),
      quote: review.text?.trim(),
      rating: review.rating ?? 0,
      profilePhotoUrl: review.profile_photo_url,
      initials: review.author_name ? getInitials(review.author_name) : "G",
      color: avatarGradients[index % avatarGradients.length],
    }));
  }, [googleData, t]);

  const visibleTestimonials = useMemo(
    () =>
      sortTestimonials(googleCards.length ? googleCards : fallbackCards).slice(
        0,
        MAX_TESTIMONIALS,
      ),
    [fallbackCards, googleCards],
  );

  const aggregateRating = googleData?.rating ?? null;
  const aggregateCount = googleData?.userRatingsTotal ?? null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("testimonials.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {aggregateRating !== null && aggregateCount !== null && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
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
            <div className="flex flex-wrap items-center justify-center gap-4">
              {googleData?.googleMapsUrl && (
                <a
                  href={googleData.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gray-900 dark:text-white hover:text-green-600 transition-colors"
                >
                  {t("testimonials.googleLink")}
                </a>
              )}
              {googleData?.writeReviewUrl && (
                <a
                  href={googleData.writeReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-gray-900 dark:text-white hover:text-green-600 transition-colors"
                >
                  {t("testimonials.googleWrite")}
                </a>
              )}
            </div>
            {isLoading && <span>{t("testimonials.googleLoading")}</span>}
            {hasError && !isLoading && <span>{t("testimonials.googleUnavailable")}</span>}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {visibleTestimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="scroll-animate fade-in-up bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                {item.profilePhotoUrl ? (
                  <div className="w-16 h-16 relative mr-4">
                    <Image
                      src={item.profilePhotoUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${
                      item.color ?? avatarGradients[index % avatarGradients.length]
                    } rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4`}
                  >
                    {item.initials ?? getInitials(item.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                  {item.meta && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.meta}</p>
                  )}
                </div>
              </div>
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
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
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  “{item.quote}”
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
