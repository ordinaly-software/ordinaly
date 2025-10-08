import React from 'react';
import { AddToCalendarButtons } from './add-to-calendar-buttons';
import ShareCourseButtons from './share-course-buttons';
import { Button } from '@/components/ui/button';
import { Info, MapPin, Users, Clock, Euro, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CourseBrief {
  id?: number | string;
  slug?: string;
  title: string;
  subtitle?: string;
  location?: string;
  max_attendants?: number;
  price?: number | null;
  periodicity?: string;
  exclude_dates?: unknown[];
  start_date?: string | null;
  end_date?: string | null;
}

interface Props {
  course: CourseBrief;
  isEnrolled: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  canEnroll: boolean;
  shouldShowAuth: boolean;
  onEnroll: () => void;
  onCancel: () => void;
  onAuthRequired: () => void;
}

const CourseSidebar: React.FC<Props> = ({ course, isEnrolled, hasStarted, hasEnded, canEnroll, shouldShowAuth, onEnroll, onCancel, onAuthRequired }) => {
  const t = useTranslations('formation.courseDetails');

  const getPeriodicityDisplay = (periodicity: string) => {
    try {
      return t(`periodicity.${periodicity}`);
    } catch {
      return periodicity;
    }
  };

  return (
    <div className="space-y-6">

      <div className="pt-4">
        <ShareCourseButtons title={course.title} subtitle={course.subtitle} slug={course.slug} />
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Info className="w-4 h-4" />
          {t('courseInformation')}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('location')}</p>
              {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? (
                /online|virtual/i.test(course.location)
                  ? <span className="underline cursor-default text-[#22A60D] text-sm">{course.location}</span>
                  : <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-gray-100 text-sm underline hover:text-[#22A60D]"
                      title={course.location}
                    >
                      {course.location}
                    </a>
              ) : (
                <p className="text-gray-900 dark:text-gray-100 text-sm">{t('locationSoon')}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('maxAttendants')}</p>
              <p className="text-gray-900 dark:text-gray-100 text-sm">{course.max_attendants} {t('people')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('scheduleType')}</p>
              <p className="text-gray-900 dark:text-gray-100 text-sm">{getPeriodicityDisplay(course.periodicity || '')}</p>
            </div>
          </div>

          {course.price !== null && course.price !== undefined && (
            <div className="flex items-center gap-3">
              <Euro className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('price')}</p>
                <p className="text-gray-900 dark:text-gray-100 text-sm font-semibold">€{course.price}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="hidden md:block">
          {isEnrolled && !hasEnded && (
            <AddToCalendarButtons
              courseId={Number(course.id || 0)}
              courseSlug={course.slug || ''}
              courseTitle={course.title}
              isEnrolled={isEnrolled}
            />
          )}
        </div>

        {hasNoDatesPlaceholder(course) ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200 mb-2">
              {t('noSpecificDate')}
            </span>
          </div>
        ) : hasEnded ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-2">
              {t('courseHasFinished')}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('courseFinishedMessage')}</p>
          </div>
        ) : hasStarted ? (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-2">
              {t('courseHasStarted')}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('courseStartedMessage')}</p>
          </div>
        ) : (
          <div className="hidden lg:block">
            {shouldShowAuth ? (
              <Button onClick={onAuthRequired} className="w-full" style={{ backgroundColor: '#217093', color: '#fff' }}>{t('signInToEnroll')}</Button>
            ) : canEnroll ? (
              <Button onClick={onEnroll} className="w-full bg-gradient-to-r from-[#22A60D] to-[#22A010] hover:from-[#22A010] hover:to-[#1E8B0C] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-14 text-lg"><GraduationCap className="w-5 h-5 mr-2" />{t('enrollNow')}</Button>
            ) : null}
          </div>
        )}

        {isEnrolled && !hasStarted && (
          <Button onClick={onCancel} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 mb-2">{t('cancelEnrollment')}</Button>
        )}
      </div>

      {course.exclude_dates && course.exclude_dates.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">{t('importantDates')}</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{t('excludedDatesMessage', { count: course.exclude_dates.length })}</p>
        </div>
      )}
    </div>
  );
};

function hasNoDatesPlaceholder(course: CourseBrief) {
  return !course.start_date || !course.end_date;
}

export default CourseSidebar;
