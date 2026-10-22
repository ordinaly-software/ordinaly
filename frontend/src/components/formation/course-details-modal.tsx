'use client';

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CarouselNavButtons } from "@/components/ui/carousel-nav-buttons";
import { cn } from "@/lib/utils";
import { Calendar, BookOpen, Star } from 'lucide-react';
import { AddToCalendarButtons } from './add-to-calendar-buttons';
import CourseSidebar from './course-sidebar';
import SharePostButtons from '@/components/blog/share-post-buttons';
import CourseFooter from './course-footer';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { openPastCourseWhatsApp } from '@/utils/past-course';
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";
import Image from "next/image";

interface Course {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  bonified_course_link?: string | null;
  youtube_video_url?: string | null;
  image: string;
  price?: number;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  timezone: string;
  weekdays: number[];
  week_of_month?: number | null;
  interval: number;
  exclude_dates: string[];
  max_attendants: number;
  enrolled_count?: number;
  created_at: string;
  updated_at: string;
  duration_hours?: number;
  formatted_schedule?: string;
  schedule_description?: string;
  next_occurrences?: string[];
  weekday_display?: string[];
}

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  isEnrolled: boolean;
  isAuthenticated: boolean;
  onEnroll: () => void;
  onCancel: () => void;
  onAuthRequired: () => void;
  /** Neighbouring courses; leave undefined where there is none (or the list is unknown). */
  onPrevCourse?: () => void;
  onNextCourse?: () => void;
}

// Helper to robustly map backend schedule string to translation key and variables
function renderFullScheduleText(course: Course, t: ReturnType<typeof useTranslations>) {
  // Try to parse the formatted_schedule and map to a translation key
  // Example: "Every 4 weeks on Thursday from September 01, 2025 to September 30, 2025, 11:00 - 13:00"
  const fs = course.formatted_schedule;
  if (!fs) return '';

  // English to localized weekday and month mapping
  const weekdayMap: Record<string, string> = {
    'Monday': t('weekdays.monday.full'),
    'Tuesday': t('weekdays.tuesday.full'),
    'Wednesday': t('weekdays.wednesday.full'),
    'Thursday': t('weekdays.thursday.full'),
    'Friday': t('weekdays.friday.full'),
    'Saturday': t('weekdays.saturday.full'),
    'Sunday': t('weekdays.sunday.full'),
  };
  const monthMap: Record<string, string> = {
    'January': t('months.january', { default: 'enero' }),
    'February': t('months.february', { default: 'febrero' }),
    'March': t('months.march', { default: 'marzo' }),
    'April': t('months.april', { default: 'abril' }),
    'May': t('months.may', { default: 'mayo' }),
    'June': t('months.june', { default: 'junio' }),
    'July': t('months.july', { default: 'julio' }),
    'August': t('months.august', { default: 'agosto' }),
    'September': t('months.september', { default: 'septiembre' }),
    'October': t('months.october', { default: 'octubre' }),
    'November': t('months.november', { default: 'noviembre' }),
    'December': t('months.december', { default: 'diciembre' }),
  };

  // Helper to localize weekday(s) and month in a string
  function localizeWeekdays(weekdays: string) {
    return weekdays.split(',').map(w => {
      const trimmed = w.trim();
      return weekdayMap[trimmed] || trimmed;
    }).join(', ');
  }

  function localizeMonthDate(date: string) {
    // e.g. "September 01, 2025" => "1 de septiembre de 2025" for es
    const parts = date.split(' ');
    if (parts.length === 3 && monthMap[parts[0]]) {
      // Detect locale (from t or window.navigator)
      const locale = (typeof window !== 'undefined' && window.navigator.language) || 'en';
  // Use browser locale only
      // For Spanish, use day de month de year
      if (/^es/.test(locale)) {
        // parts[0]=Month, parts[1]=day,, parts[2]=year
        const day = parts[1].replace(',', '');
        const month = monthMap[parts[0]];
        const year = parts[2];
        return `${day} de ${month} de ${year}`;
      } else {
        // Default: just localize month name
        return date.replace(parts[0], monthMap[parts[0]]);
      }
    }
    return date;
  }

  // Patterns for dynamic keys
  const patterns = [
    {
      // Once: "July 08, 2025 from 09:30 to 11:30"
      regex: /^([A-Za-z]+ \d{2}, \d{4}) from (\d{2}:\d{2}) to (\d{2}:\d{2})$/,
      key: 'fullScheduleText.once',
      getVars: (m: RegExpMatchArray) => ({
        date: localizeMonthDate(m[1]),
        startTime: m[2],
        endTime: m[3],
      })
    },
    {
      // Every Thursday from September 01, 2025 to September 30, 2025, 11:00 - 13:00
      regex: /^Every ([A-Za-z]+) from ([A-Za-z]+ \d{2}, \d{4}) to ([A-Za-z]+ \d{2}, \d{4}), (\d{2}:\d{2}) - (\d{2}:\d{2})$/,
      key: 'fullScheduleText.everyWeekdays',
      getVars: (m: RegExpMatchArray) => ({
        weekdays: localizeWeekdays(m[1]),
        startDate: localizeMonthDate(m[2]),
        endDate: localizeMonthDate(m[3]),
        startTime: m[4],
        endTime: m[5],
      })
    },
    {
      regex: /^Every (\d+) weeks on ([A-Za-z, ]+) from ([A-Za-z]+ \d{2}, \d{4}) to ([A-Za-z]+ \d{2}, \d{4}), (\d{2}:\d{2}) - (\d{2}:\d{2})$/,
      key: 'fullScheduleText.everyXWeeksOnWeekdays',
      getVars: (m: RegExpMatchArray) => ({
        interval: m[1],
        weekdays: localizeWeekdays(m[2]),
        startDate: localizeMonthDate(m[3]),
        endDate: localizeMonthDate(m[4]),
        startTime: m[5],
        endTime: m[6],
      })
    },
    {
      regex: /^Every (\d+) weeks on ([A-Za-z]+) from ([A-Za-z]+ \d{2}, \d{4}) to ([A-Za-z]+ \d{2}, \d{4}), (\d{2}:\d{2}) - (\d{2}:\d{2})$/,
      key: 'fullScheduleText.everyXWeeksOnWeekday',
      getVars: (m: RegExpMatchArray) => ({
        interval: m[1],
        weekday: localizeWeekdays(m[2]),
        startDate: localizeMonthDate(m[3]),
        endDate: localizeMonthDate(m[4]),
        startTime: m[5],
        endTime: m[6],
      })
    },
  ];

  for (const { regex, key, getVars } of patterns) {
    const match = fs.match(regex);
    if (match) {
      return t(key, getVars(match));
    }
  }

  // Fallback: show raw string (never use literal as translation key)
  return fs;
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const CourseDetailsModal = ({
  isOpen,
  onClose,
  course,
  isEnrolled,
  isAuthenticated,
  onEnroll,
  onCancel,
  onAuthRequired,
  onPrevCourse,
  onNextCourse
}: CourseDetailsModalProps) => {
  const t = useTranslations('formation.courseDetails');
  const formationT = useTranslations('formation');
  // ...existing code...

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") {
      return t('noSpecificDate'); // Use a translation key for flexibility
    }
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) {
      return ''; // Return empty string for null/undefined time
    }
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  const getWeekdayNames = (weekdays: number[]) => {
    const names = [
      t('weekdays.monday.full'),
      t('weekdays.tuesday.full'),
      t('weekdays.wednesday.full'),
      t('weekdays.thursday.full'),
      t('weekdays.friday.full'),
      t('weekdays.saturday.full'),
      t('weekdays.sunday.full')
    ];
    return weekdays.map(day => names[day]).join(', ');
  };

  const handleRequestEdition = () => {
    openPastCourseWhatsApp(course, formationT);
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      onAuthRequired();
    } else {
      onEnroll();
    }
  };

  // Handle null/empty dates and use time for accuracy
  const getDateTime = (dateStr: string, timeStr: string): Date | null => {
    if (!dateStr || dateStr === "0000-00-00" || !timeStr) return null;
    return new Date(`${dateStr}T${timeStr}`);
  };
  const hasNoDates = !course.start_date || !course.end_date || !course.start_time || !course.end_time;
  const now = new Date();
  const startDateTime = getDateTime(course.start_date, course.start_time);
  const endDateTime = getDateTime(course.end_date, course.end_time);
  const hasStarted = !hasNoDates && !!(startDateTime && startDateTime <= now);
  const hasEnded = !hasNoDates && !!(endDateTime && endDateTime <= now);
  const isFull = course.max_attendants > 0 && (course.enrolled_count ?? 0) >= course.max_attendants;
  const showFull = isFull && !isEnrolled && !hasStarted && !hasNoDates;
  const canEnroll = isAuthenticated && !isEnrolled && !hasStarted && !hasNoDates && !isFull;
  const shouldShowAuth = !isAuthenticated && !hasStarted && !hasNoDates && !isFull;

  const hasImage = !!course.image && course.image !== "undefined" && course.image !== "null";

  const [portraitCourseId, setPortraitCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onPrevCourse?.();
      if (event.key === "ArrowRight") onNextCourse?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onPrevCourse, onNextCourse]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="md:max-w-5xl lg:max-w-6xl"
      contentKey={course.id}
      labelledBy="course-modal-title"
      outside={
        (onPrevCourse || onNextCourse) && (
          <div className="hidden xl:contents">
            <CarouselNavButtons
              onPrevClick={() => onPrevCourse?.()}
              onNextClick={() => onNextCourse?.()}
              prevDisabled={!onPrevCourse}
              nextDisabled={!onNextCourse}
              prevLabel={t('previousCourse')}
              nextLabel={t('nextCourse')}
              nudgeId="course-details-modal"
              className="left-1/2 right-auto z-[70] w-[min(100%,80.5rem)] -translate-x-1/2 px-0 sm:px-0"
            />
          </div>
        )
      }
      footer={
        <CourseFooter
          shouldShowAuth={shouldShowAuth}
          canEnroll={canEnroll}
          showFull={showFull}
          fullLabel={formationT('full')}
          handleEnrollClick={handleEnrollClick}
          onEnroll={onEnroll}
          showRequestEdition={hasEnded}
          hasEnded={hasEnded}
          onRequestEdition={handleRequestEdition}
          requestEditionLabel={formationT('wantNewEdition')}
          t={t}
        />
      }
    >
      {/* Cover: shown whole at its natural proportions, never cropped */}
      {hasImage && (
        <div className="bg-slate-100 [container-type:inline-size] dark:bg-black/30">
          <Image
            loader={imageLoader}
            src={course.image}
            alt={course.title}
            width={1600}
            height={900}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              setPortraitCourseId(naturalHeight > naturalWidth ? course.id : null);
            }}
            // Landscape: shown whole. Portrait: cropped to a square so it never towers over the text.
            className={cn(
              "mx-auto",
              portraitCourseId === course.id
                ? "h-[min(50dvh,100cqw)] w-[min(50dvh,100cqw)] object-cover"
                : "h-auto max-h-[50dvh] w-full object-contain"
            )}
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </div>
      )}

      <div className="px-5 pb-8 pt-5 sm:px-8 md:pt-6">
        <header className={cn("mb-6", !hasImage && "pr-10")}>
          <div className="mb-3 flex flex-wrap gap-2">
            {course.price !== null && course.price !== undefined && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-clay-fill dark:bg-clay-fill text-white dark:text-white">€{course.price}</span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cobalt text-white">
              {t(`periodicity.${course.periodicity}`)}
            </span>
            {isEnrolled && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-clay-fill dark:bg-clay-fill text-white dark:text-white">✓ {t('enrolled')}</span>
            )}
          </div>
          <h2 id="course-modal-title" className="text-2xl font-semibold leading-tight tracking-tight text-slate-dark dark:text-ivory-light md:text-3xl">{course.title}</h2>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Calendar Buttons (Mobile Only) */}
            <div className="block md:hidden">
              {isEnrolled && !hasEnded && (
                <AddToCalendarButtons
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  isEnrolled={isEnrolled}
                />
              )}
            </div>

            {/* Share buttons for mobile */}
            <div className="lg:hidden">
              <SharePostButtons title={course.title} excerpt={course.subtitle} slug={course.slug} />
            </div>

            {/* Next Occurrences */}
            {course.next_occurrences && course.next_occurrences.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-cobalt dark:text-cobalt-light" />
                  {t('upcomingSessions')}
                </h2>
                <div className="bg-cobalt/10 dark:bg-cobalt/20 rounded-xl p-4">
                  <div className="space-y-2">
                    {course.next_occurrences.slice(0, 5).map((occurrence, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 shrink-0 text-cobalt dark:text-cobalt-light" />
                        <span className="text-gray-700 dark:text-gray-300">{formatDate(occurrence)}</span>
                      </div>
                    ))}
                    {course.next_occurrences.length > 5 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {t('moreSessions', { count: course.next_occurrences.length - 5 })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {course.youtube_video_url && (
              <HeroVideoDialog
                videoUrl={course.youtube_video_url}
                thumbnailAlt={course.title}
                title={course.title}
                playLabel={t('playVideo')}
              />
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cobalt dark:text-cobalt-light" />
                {t('courseDescription')}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 break-words prose-a:break-all">
                {course.subtitle && (
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {course.subtitle}
                  </p>
                )}
                <br />
                <MarkdownRenderer>{course.description}</MarkdownRenderer>
              </div>
            </div>

            {/* Schedule Details */}
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cobalt dark:text-cobalt-light" />
                {t('scheduleInformation')}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('startDate')}</p>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(course.start_date)}</p>
                  </div>
                  {course.periodicity !== 'once' && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('endDate')}</p>
                      <p className="text-gray-900 dark:text-gray-100">{formatDate(course.end_date)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('time')}</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatTime(course.start_time)} - {formatTime(course.end_time)}
                    </p>
                  </div>
                  {course.duration_hours && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('duration')}</p>
                      <p className="text-gray-900 dark:text-gray-100">{course.duration_hours} {t('hours')}</p>
                    </div>
                  )}
                </div>

                {course.weekdays && course.weekdays.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('daysOfWeek')}</p>
                    <p className="text-gray-900 dark:text-gray-100">{getWeekdayNames(course.weekdays)}</p>
                  </div>
                )}

                {course.formatted_schedule && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('fullSchedule')}</p>
                    <p className="text-gray-900 dark:text-gray-100 text-sm">
                      {renderFullScheduleText(course, t)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <CourseSidebar
              course={course}
              isEnrolled={isEnrolled}
              hasStarted={hasStarted}
              hasEnded={hasEnded}
              canEnroll={canEnroll}
              shouldShowAuth={shouldShowAuth}
              showFull={showFull}
              fullLabel={formationT('full')}
              onEnroll={onEnroll}
              onCancel={onCancel}
              onAuthRequired={onAuthRequired}
              onRequestEdition={handleRequestEdition}
              requestEditionLabel={formationT('wantNewEdition')}
              showRequestEdition={hasEnded}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CourseDetailsModal;
