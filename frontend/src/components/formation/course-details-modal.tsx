'use client';

import { Modal } from "@/components/ui/modal";
import { Calendar, BookOpen, Star } from 'lucide-react';
import { AddToCalendarButtons } from './add-to-calendar-buttons';
import CourseHeader from './course-header';
import CourseSidebar from './course-sidebar';
import ShareCourseButtons from './share-course-buttons';
import CourseFooter from './course-footer';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface Course {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
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

const CourseDetailsModal = ({
  isOpen,
  onClose,
  course,
  isEnrolled,
  isAuthenticated,
  onEnroll,
  onCancel,
  onAuthRequired
}: CourseDetailsModalProps) => {
  const t = useTranslations('formation.courseDetails');
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
  const canEnroll = isAuthenticated && !isEnrolled && !hasStarted && !hasNoDates;
  const shouldShowAuth = !isAuthenticated && !hasStarted && !hasNoDates;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1200px]" showHeader={false}>
      <div className="max-h-[85vh] lg:max-h-[92vh] xl:max-h-[95vh] flex flex-col">
        <CourseHeader course={course} isEnrolled={isEnrolled} onClose={onClose} />

        {/* Scrollable content area */}
        <div className="p-6 overflow-y-auto flex-1 pb-28 lg:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
            
              {/* Share buttons for mobile footer */}
              <div className="mt-3 lg:hidden">
                <ShareCourseButtons title={course.title} subtitle={course.subtitle} slug={course.slug} />
              </div>

              {/* Next Occurrences */}
              {course.next_occurrences && course.next_occurrences.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue" />
                    {t('upcomingSessions')}
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="space-y-2">
                      {course.next_occurrences.slice(0, 5).map((occurrence, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue" />
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

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue" />
                  {t('courseDescription')}
                </h2>
                {/* share buttons intentionally shown in sidebar (desktop) and footer (mobile) */}
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer>{course.description}</MarkdownRenderer>
                </div>
              </div>

              {/* Schedule Details */}
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue" />
                  {t('scheduleInformation')}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <br />
            </div>

            <CourseSidebar
              course={course}
              isEnrolled={isEnrolled}
              hasStarted={hasStarted}
              hasEnded={hasEnded}
              canEnroll={canEnroll}
              shouldShowAuth={shouldShowAuth}
              onEnroll={onEnroll}
              onCancel={onCancel}
              onAuthRequired={onAuthRequired}
            />
          </div>
        </div>

    <CourseFooter shouldShowAuth={shouldShowAuth} canEnroll={canEnroll} handleEnrollClick={handleEnrollClick} onEnroll={onEnroll} t={t} />
      </div>
    </Modal>
  );
};

export default CourseDetailsModal;
