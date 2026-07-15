"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorCard from "@/components/ui/error-card";
import { ArrowRight, Calendar } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import CourseCard from "@/components/formation/course-card";
import { useCourses, type Course } from "@/hooks/useCourses";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
const AuthModal = dynamic(() => import("@/components/auth/auth-modal"), { ssr: false });

interface CoursesShowcaseProps {
  limit?: number;
  showUpcomingOnly?: boolean;
  initialCourses?: Course[];
  onCourseClick?: (course: Course) => void;
  onViewAllClick?: () => void;
  referenceNow?: number;
  cardTitleTag?: "h3" | "h4";
}

export default function CoursesShowcase(props: CoursesShowcaseProps & { titleTag?: "h2" | "h3" }) {
  const { limit = 3, showUpcomingOnly = true, onCourseClick, initialCourses, referenceNow, titleTag = "h2", cardTitleTag = "h3" } = props;
  const t = useTranslations("home.courses");
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const shouldLazyLoad = showUpcomingOnly || !initialCourses || initialCourses.length < limit;
  const [hasBeenVisible, setHasBeenVisible] = useState(!shouldLazyLoad);
  const sectionRef = useRef<HTMLElement | null>(null);
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

  const handleCourseClick = useCallback((course: Course) => {
    if (onCourseClick) {
      onCourseClick(course);
      return;
    }
    // Navigate to formation page with course highlighted/modal opened
    router.push(`/formacion/${course.slug ?? course.id}`);
  }, [onCourseClick, router]);

  const handleSignUpClick = useCallback((course: Course) => {
    if (isAuthenticated) {
      router.push(`/formacion/${course.slug ?? course.id}`);
    } else {
      setSelectedCourse(course);
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, router]);

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
                  onClick={() => router.push('/formacion')}
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
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-10 md:mb-12">
          {titleTag === "h3" ? (
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
              {t('showcaseTitle')}
            </h3>
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
              {t('showcaseTitle')}
            </h2>
          )}
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
          <Carousel
            items={displayCourses}
            getKey={(course) => course.id}
            autoplay={displayCourses.length > 1}
            prevLabel={t('previous')}
            nextLabel={t('next')}
            renderItem={(course) => {
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

              return (
                <CourseCard
                  course={course}
                  variant={isPastCourse ? "past" : "upcoming"}
                  onEnroll={() => handleSignUpClick(course)}
                  onViewDetails={() => handleCourseClick(course)}
                  highlightUpcoming={highlightUpcoming}
                  cardTitleTag={cardTitleTag}
                />
              );
            }}
          />
        )}

        {/* View All Courses Button */}
        {displayCourses.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/formacion')}
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
