"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { MouseEvent } from 'react';
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorCard from "@/components/ui/error-card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, Euro, ArrowRight, BookOpen } from "lucide-react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useCourses, type Course } from "@/hooks/useCourses";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { openPastCourseWhatsApp, cleanCourseTitle } from "@/utils/past-course";
const AuthModal = dynamic(() => import("@/components/auth/auth-modal"), { ssr: false });

interface CoursesShowcaseProps {
  limit?: number;
  showUpcomingOnly?: boolean;
  initialCourses?: Course[];
  onCourseClick?: (course: Course) => void;
  onViewAllClick?: () => void;
  referenceNow?: number;
}

export default function CoursesShowcase(props: CoursesShowcaseProps) {
  const { limit = 3, showUpcomingOnly = true, onCourseClick, initialCourses, referenceNow } = props;
  const t = useTranslations("home.courses");
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const shouldLazyLoad = showUpcomingOnly || !initialCourses || initialCourses.length < limit;
  const [hasBeenVisible, setHasBeenVisible] = useState(!shouldLazyLoad);
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hydratedNowMs, setHydratedNowMs] = useState<number | null>(null);

  useEffect(() => {
    setHydratedNowMs(Date.now());
  }, []);

  const nowMs = hydratedNowMs ?? referenceNow ?? 0;
  const nowDate = useMemo(() => new Date(nowMs), [nowMs]);

  useEffect(() => {
    // Check authentication status on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    setIsAuthenticated(!!token);
  }, []);
  
  useEffect(() => {
    if (!shouldLazyLoad || hasBeenVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasBeenVisible(true);
          }
        });
      },
      { threshold: 0.15, rootMargin: '200px' }
    );

    const target = sectionRef.current;
    if (target) observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasBeenVisible, shouldLazyLoad]);
  // Removed enrollments and authentication state for homepage

  const { courses, isLoading, error, refetch } = useCourses({
    enabled: shouldLazyLoad ? hasBeenVisible : false,
    initialData: initialCourses,
  });
  const orderedCourses = useMemo(() => {
    const items = [...courses];
    const getSortTime = (course: Course) => {
      const createdAt = Date.parse(course.created_at);
      if (!Number.isNaN(createdAt)) return createdAt;
      const startAt = Date.parse(course.start_date);
      if (!Number.isNaN(startAt)) return startAt;
      return 0;
    };
    items.sort((a, b) => getSortTime(b) - getSortTime(a));
    return items;
  }, [courses]);
  const displayCourses = useMemo(() => {
    const coursesWithUpcoming = orderedCourses.map((course) => {
      const startAt = Date.parse(course.start_date);
      const upcoming = !Number.isNaN(startAt) && startAt >= nowMs;
      return { course, upcoming };
    });

    let combined: Course[] = orderedCourses;

    if (showUpcomingOnly) {
      const upcoming = coursesWithUpcoming
        .filter((item) => item.upcoming)
        .map((item) => item.course);
      const past = coursesWithUpcoming
        .filter((item) => !item.upcoming)
        .map((item) => item.course);
      combined = [...upcoming, ...past];
    }
    if (!limit || limit <= 0) return combined;
    return combined.slice(0, limit);
  }, [limit, orderedCourses, showUpcomingOnly, nowMs]);

  // Removed enrollments fetching effect for homepage

  const handleImageError = useCallback((courseId: number) => {
    setImageErrors(prev => new Set(prev).add(courseId));
  }, []);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const handleScrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(el.scrollLeft - 340, 0), behavior: 'smooth' });
  }, []);

  const handleScrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.min(el.scrollLeft + 340, el.scrollWidth - el.clientWidth), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Use ResizeObserver so we check after the browser has computed layout
    const observer = new ResizeObserver(() => {
      checkScrollability();
    });
    observer.observe(el);
    // Also observe the inner flex container so card width changes are caught
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    // Initial check after a frame to ensure layout is done
    const raf = requestAnimationFrame(checkScrollability);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [displayCourses.length, checkScrollability]);

  const handleCourseClick = useCallback((course: Course) => {
    if (onCourseClick) {
      onCourseClick(course);
      return;
    }
    // Navigate to formation page with course highlighted/modal opened
    router.push(`/formation/${course.slug ?? course.id}`);
  }, [onCourseClick, router]);

  const handleSignUpClick = useCallback((e: MouseEvent<HTMLButtonElement>, course: Course) => {
    e.stopPropagation();
    if (isAuthenticated) {
      router.push(`/formation/${course.slug ?? course.id}`);
    } else {
      setSelectedCourse(course);
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, router]);

  const handlePastCourseInquiry = useCallback((course: Course) => {
    openPastCourseWhatsApp(course, t);
  }, [t]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") {
      return t('noSpecificDate');
    }
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      if (!year || !month || !day) return t('noSpecificDate');
      const date = new Date(Date.UTC(year, month - 1, day));
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
    } catch {
      return t('noSpecificDate');
    }
  };


  const getAvailabilityBadge = (course: Course) => {
    const hasValidStartDate = Boolean(course.start_date && course.start_date !== "0000-00-00");
    const hasValidEndDate = Boolean(course.end_date && course.end_date !== "0000-00-00");
    if (!hasValidStartDate || !hasValidEndDate) {
      return null;
    }

    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    if (startDate && endDate && startDate <= nowDate && endDate > nowDate) {
      return { text: t('inProgress'), variant: 'default' as const };
    }
    if (endDate && endDate < nowDate) {
      return { text: t('finished'), variant: 'finished' as const };
    }
    const percentage = (course.enrolled_count / course.max_attendants) * 100;
    if (percentage >= 90) return { text: t('almostFull'), variant: 'destructive' as const };
    if (percentage >= 70) return { text: t('fillingFast'), variant: 'default' as const };
    return { text: t('available'), variant: 'secondary' as const };
  };

  if (error) {
    return (
      <ErrorCard
        title={t('errorTitle')}
        message={t('errorMessage')}
        buttonText={t('retryButton')}
        onRetry={refetch}
      />
    );
  }

  if (displayCourses.length === 0 && !isLoading) {
    return (
      <section id="courses" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
              {t('upcomingTitle')}
            </h2>
            <p className="text-xl text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
              {t('upcomingDescription')}
            </p>
          </div>
          <div className="text-center">
            <div className="max-w-md mx-auto bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-oat dark:bg-[--swatch--slate-medium] rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-cobalt dark:text-[var(--swatch--cobalt)]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-dark dark:text-ivory-light mb-3">
                {t('noCoursesTitle')}
              </h3>
              <p className="text-slate-medium dark:text-cloud-medium mb-6">
                {t('noCoursesMessage')}
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/formation')}
                  className="flex items-center gap-2"
                >
                  {t('notifyButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="courses"
      ref={sectionRef}
      className="py-12 px-4 sm:px-6 lg:px-8 bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-dark]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
            {t('showcaseTitle')}
          </h2>
          <p className="text-xl text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
            {t('showcaseDescription')}
          </p>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
            <div className="flex gap-6">
              {Array.from({ length: Math.min(limit, 3) }).map((_, index) => (
                <div key={index} className="flex-shrink-0 flex" style={{ width: 'max(280px, calc((100% - 48px) / 3))' }}>
                  <Card className="w-full flex flex-col bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] border-[--color-border-subtle] dark:border-[--color-border-strong]">
                    <CardHeader>
                      <div className="w-full h-36 bg-oat dark:bg-[--swatch--slate-medium] rounded-lg animate-pulse mb-4"></div>
                      <div className="h-6 bg-oat dark:bg-[--swatch--slate-medium] rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-oat dark:bg-[--swatch--slate-medium] rounded w-3/4 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="h-4 bg-oat dark:bg-[--swatch--slate-medium] rounded animate-pulse"></div>
                        <div className="h-4 bg-oat dark:bg-[--swatch--slate-medium] rounded animate-pulse"></div>
                        <div className="h-10 bg-oat dark:bg-[--swatch--slate-medium] rounded animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScrollability}
            className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
          >
            <div className="flex gap-6">
            {displayCourses.map((course) => {
              const availabilityBadge = getAvailabilityBadge(course);
              const startDate = course.start_date && course.start_date !== "0000-00-00" ? new Date(course.start_date) : null;
              const endDate = course.end_date && course.end_date !== "0000-00-00" ? new Date(course.end_date) : null;
              const highlightUpcoming = Boolean(startDate && startDate > nowDate);
              const isPastCourse = Boolean(
                endDate
                  ? endDate < nowDate
                  : startDate
                    ? startDate < nowDate
                    : false
              );
              const cleanTitle = cleanCourseTitle(course.title);
              const fallbackTitle = cleanTitle.split(' ').slice(0, 3).join(' ');
              const handleAction = (event: React.MouseEvent<HTMLButtonElement>) => {
                if (isPastCourse) {
                  event.stopPropagation();
                  handlePastCourseInquiry(course);
                  return;
                }
                handleSignUpClick(event, course);
              };
              const buttonLabel = highlightUpcoming
                ? t('enrollCta')
                : t('moreInfo');

              return (
                <div
                  key={course.id}
                  className="flex-shrink-0 flex snap-start"
                  style={{ width: 'max(280px, calc((100% - 48px) / 3))' }}
                >
                      <Card
                        className={
                          `w-full flex flex-col bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] border-[--color-border-subtle] dark:border-[--color-border-strong] transition-all duration-300 hover:shadow-xl hover:border-clay/30 dark:hover:border-clay/30 hover:-translate-y-1 cursor-pointer group rounded-3xl ` +
                          (highlightUpcoming ? 'ring-2 ring-clay shadow-2xl z-10' : '') +
                          (isPastCourse ? ' opacity-70' : '')
                        }
                        style={highlightUpcoming ? { boxShadow: '0 0 0 3px var(--swatch--clay), 0 8px 15px 0 var(--swatch--clay)44' } : {}}
                        onClick={() => handleCourseClick(course)}
                      >
                        <CardHeader className="pb-2">
                          <div className="relative w-full h-36 rounded-lg overflow-hidden mb-4 bg-oat/40 dark:bg-[--swatch--slate-medium]/40">
                            {!imageErrors.has(course.id) ? (
                              <Image
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                                quality={60}
                                onError={() => handleImageError(course.id)}
                              />
                            ) : (
                              // Fallback content when image fails
                              <div className="absolute inset-0 flex items-center justify-center text-[var(--swatch--cloud-medium)] dark:text-[var(--swatch--cloud-medium)]">
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-2 bg-clay/20 rounded-full flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-clay" />
                                  </div>
                                  <p className="text-sm font-medium px-4">
                                    {fallbackTitle || course.title}
                                  </p>
                                </div>
                              </div>
                        )}
                            {availabilityBadge && (
                              <div className="absolute top-3 left-3">
                                <Badge variant={availabilityBadge.variant}>
                                  {availabilityBadge.text}
                                </Badge>
                              </div>
                            )}

                            {course.price && (
                              <div className="absolute top-3 right-3 bg-white/90 dark:bg-[--swatch--slate-medium]/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                <div className="flex items-center gap-1 text-sm font-semibold text-slate-dark dark:text-ivory-light">
                                  <Euro className="w-4 h-4" />
                                  {/* {Math.round(Number(course.price))} */}
                                  {course.price}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <CardTitle className="text-xl text-slate-dark dark:text-ivory-light group-hover:text-clay dark:group-hover:text-clay transition-colors line-clamp-2">
                              {cleanTitle}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 flex flex-col">
                          <div className="space-y-4 flex-1 flex flex-col">
                            {/* Course Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {course.start_date ? formatDate(course.start_date) : t('datesSoon')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {course.duration_hours ? `${course.duration_hours}h` : t('durationSoon')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-medium dark:text-cloud-medium col-span-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? (
                                  (/online|virtual/i.test(course.location)
                                    ? <span className="truncate underline" title={course.location}>{course.location}</span>
                                    : <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate underline hover:text-clay dark:hover:text-clay dark:text-clay"
                                        title={course.location}
                                      >
                                        {course.location}
                                      </a>
                                  )
                                ) : (
                                  <span className="truncate">
                                    {t('locationSoon')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Weekdays */}
                            {course.weekday_display.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {course.weekday_display.map((day) => (
                                  <Badge key={day} variant="outline" className="text-xs">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Progress Bar */}
                            {startDate && endDate && startDate > nowDate && endDate > nowDate && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm text-slate-medium dark:text-cloud-medium">
                                  <span>{course.max_attendants} {t('max')}</span>
                                </div>
                                <div className="w-full bg-oat dark:bg-[--swatch--slate-medium] rounded-full h-2">
                                  <div
                                    className="bg-clay h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((course.enrolled_count / course.max_attendants) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 mt-6">
                            {isPastCourse ? (
                              <>
                                <Button
                                  variant="flame"
                                  className="w-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handlePastCourseInquiry(course);
                                  }}
                                >
                                  <span>{t("wantNewEdition")}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full border-[--color-border-subtle] text-slate-medium dark:border-[--color-border-strong] dark:text-cloud-medium hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-dark]/70"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCourseClick(course);
                                  }}
                                >
                                  {t("viewDetails")}
                                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="flame"
                                className="w-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
                                onClick={handleAction}
                              >
                                <span>{buttonLabel}</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
            })}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 px-1">
            <button
              type="button"
              aria-label={t('previous')}
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
            >
              <IconArrowNarrowLeft className="h-6 w-6 text-clay dark:text-clay" />
            </button>
            <button
              type="button"
              aria-label={t('next')}
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
            >
              <IconArrowNarrowRight className="h-6 w-6 text-clay dark:text-clay" />
            </button>
          </div>
          </div>
        )}

        {/* View All Courses Button */}
        {displayCourses.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/formation')}
              className="bg-transparent border-2 border-clay text-clay hover:bg-clay hover:text-white dark:border-clay dark:text-clay dark:hover:bg-clay dark:hover:text-ivory-light transition-all duration-300 px-6 py-3 text-base font-semibold rounded-full shadow-md hover:shadow-lg hover:shadow-clay/20 group"
            >
              {t('viewAllCourses')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          courseTitle={selectedCourse?.title.replace(/🌐 |🐍 |📊 |📱 |☁️ |🎨 |🤖 |🔒 |🔗 |💻 |📈 |🔧 /g, '')}
        />
      )}
    </section>
  );
}
