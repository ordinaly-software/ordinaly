'use client';

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Euro, Info, BookOpen, Star, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Course {
  id: number;
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

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return `/api/placeholder/600/400`;
  }
  
  if (src.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
    return `${baseUrl}${src}?w=${width}&q=${quality || 75}`;
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
  onAuthRequired
}: CourseDetailsModalProps) => {
  const t = useTranslations('formation.courseDetails');

  const formatDate = (dateString: string) => {
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

  const getPeriodicityDisplay = (periodicity: string) => {
    try {
      return t(`periodicity.${periodicity}` as 'periodicity.once' | 'periodicity.daily' | 'periodicity.weekly' | 'periodicity.biweekly' | 'periodicity.monthly' | 'periodicity.custom');
    } catch {
      return periodicity;
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

  const hasStarted = new Date(course.start_date) <= new Date();
  const canEnroll = isAuthenticated && !isEnrolled && !hasStarted;
  const shouldShowAuth = !isAuthenticated && !hasStarted;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <Image
            loader={imageLoader}
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {course.price !== null && course.price !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                  <Euro className="w-3 h-3 mr-1" />
                  €{course.price}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue text-white">
                {getPeriodicityDisplay(course.periodicity)}
              </span>
              {isEnrolled && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('enrolled')}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{course.title}</h1>
            {course.subtitle && (
              <p className="text-gray-200 text-sm">{course.subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue" />
                  {t('courseDescription')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{course.description}</p>
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
                      <p className="text-gray-900 dark:text-gray-100 text-sm">{course.formatted_schedule}</p>
                    </div>
                  )}
                </div>
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
                      {course.next_occurrences.slice(0, 5).map((occurrence, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {t('courseInformation')}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('location')}</p>
                      <p className="text-gray-900 dark:text-gray-100 text-sm">{course.location}</p>
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
                      <p className="text-gray-900 dark:text-gray-100 text-sm">{getPeriodicityDisplay(course.periodicity)}</p>
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

              {/* Action Buttons */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {t('cancelEnrollment')}
                  </Button>
                ) : hasStarted ? (
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-2">
                      {t('courseHasStarted')}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('courseStartedMessage')}
                    </p>
                  </div>
                ) : (
                  <>
                    {shouldShowAuth ? (
                        <Button
                        onClick={handleEnrollClick}
                        className="w-full"
                        style={{ backgroundColor: '#46B1C9', color: '#fff' }}
                        >
                        {t('signInToEnroll')}
                        </Button>
                    ) : canEnroll ? (
                      <Button
                        onClick={onEnroll}
                        className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      >
                        {t('enrollNow')}
                      </Button>
                    ) : null}
                  </>
                )}
              </div>

              {/* Additional Info */}
              {course.exclude_dates && course.exclude_dates.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">{t('importantDates')}</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('excludedDatesMessage', { count: course.exclude_dates.length })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CourseDetailsModal;
