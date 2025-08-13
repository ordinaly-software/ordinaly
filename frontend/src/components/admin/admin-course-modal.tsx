import React from "react";
import Image from "next/image";
import { Euro, Users, User, XCircle, Calendar, MapPin, Clock } from "lucide-react";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Modal } from "@/components/ui/modal";

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: string | null;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: string;
  timezone: string;
  weekdays: number[];
  week_of_month?: number | null;
  interval: number;
  exclude_dates: string[];
  max_attendants: number;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
  duration_hours?: number;
  next_occurrences?: string[];
}

interface Enrollment {
  id: number;
  user: number;
  enrolled_at: string;
  user_details?: {
    name?: string;
    surname?: string;
    email?: string;
    company?: string;
  };
}

interface CourseVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  enrollments: Enrollment[];
  isLoadingEnrollments: boolean;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  dateLocale: string;
  formatWeekdays: (weekdays: number[]) => string;
}

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const CourseVisualizationModal: React.FC<CourseVisualizationModalProps> = ({
  isOpen,
  onClose,
  course,
  enrollments,
  isLoadingEnrollments,
  t,
  dateLocale,
  formatWeekdays,
}) => {
  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("details.title")}
      showHeader={true}
      className="max-w-[95vw] xl:max-w-[85vw] 2xl:max-w-[80vw]"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 sm:px-0">
        {/* Course Image at the very top, full width */}
        {course.image && course.image !== "undefined" && course.image !== "null" && (
          <div className="relative w-full h-64 bg-gray-200 overflow-hidden group rounded-xl">
            {/* Blurred background */}
            <Image
              loader={imageLoader}
              src={course.image}
              alt={course.title}
              fill
              className="object-cover scale-110 blur-md opacity-60"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              aria-hidden="true"
              draggable={false}
              priority
            />
            {/* Main image on top */}
            <Image
              loader={imageLoader}
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                  {t(`form.periodicity.${course.periodicity}`)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{course.title}</h1>
              {course.subtitle && (
                <p className="text-gray-200 text-sm">{course.subtitle}</p>
              )}
            </div>
          </div>
        )}
        {/* Course Header and rest of modal content below */}
        <div className="flex flex-col sm:flex-row landscape:flex-col-reverse items-start sm:space-x-6 space-y-4 sm:space-y-0 landscape:space-y-4 landscape:sm:space-x-0">
          {/* Course Info */}
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
              {course.title}
            </h2>
            {course.subtitle && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 break-words">
                {course.subtitle}
              </p>
            )}
            {/* Key Metrics - stack vertically on mobile */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-[#22A60D]/10 rounded-lg p-4 flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <Users className="h-6 w-6 text-[#22A60D] flex-shrink-0" />
                    <p className="text-lg font-bold text-[#22A60D]">
                      {course.enrolled_count || 0}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    {t("details.enrolled")}
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <User className="h-6 w-6 text-blue flex-shrink-0" />
                    <p className="text-lg font-bold text-blue">
                      {course.max_attendants}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    {t("details.capacity")}
                  </p>
                </div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <XCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                    <p className="text-lg font-bold text-orange-600">
                      {course.max_attendants - (course.enrolled_count || 0)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    {t("details.vacant")}
                  </p>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 flex-1 min-w-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <Euro className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    <p className="text-lg font-bold text-purple-600 break-words text-right">
                      {course.price ? `${Math.round(Number(course.price))}` : t("contactForQuote")}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    {t("details.price")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Course Details Grid - stack vertically on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-5 w-5 text-blue" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.schedule")}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.startDate")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.start_date && course.start_date !== "0000-00-00"
                    ? new Date(course.start_date).toLocaleDateString(dateLocale, { year: "numeric", month: "numeric", day: "numeric" })
                    : t("noSpecificDate")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.endDate")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.end_date && course.end_date !== "0000-00-00"
                    ? new Date(course.end_date).toLocaleDateString(dateLocale, { year: "numeric", month: "numeric", day: "numeric" })
                    : t("noSpecificDate")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.time")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.start_time ? course.start_time.substring(0, 5) : "-"} - {course.end_time ? course.end_time.substring(0, 5) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.duration")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.duration_hours?.toFixed(1)} {t("details.hours")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.frequency")}:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {t(`form.periodicity.${course.periodicity}`)}
                </span>
              </div>
              {course.weekdays && course.weekdays.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t("details.weekdays")}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatWeekdays(course.weekdays)}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Location & Logistics */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.locationInfo")}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.location")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {typeof course.location === 'string' && course.location.trim() !== '' && course.location !== 'null' ? course.location : t('locationSoon')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.timezone")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.timezone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.created")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(course.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("details.lastUpdated")}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(course.updated_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Enrollment Progress */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.enrollmentStatus")}</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {((course.enrolled_count || 0) / course.max_attendants * 100).toFixed(1)}% {t("details.fullStatus")}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                (course.enrolled_count || 0) >= course.max_attendants
                  ? 'bg-red-500' 
                  : (course.enrolled_count || 0) / course.max_attendants >= 0.8
                    ? 'bg-orange-500' 
                    : 'bg-[#22A60D]'
              }`}
              style={{ 
                width: `${Math.min(((course.enrolled_count || 0) / course.max_attendants * 100), 100)}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{course.enrolled_count || 0} {t("details.enrolled").toLowerCase()}</span>
            <span>{course.max_attendants - (course.enrolled_count || 0)} {t("details.spotsRemaining")}</span>
          </div>
        </div>
        {/* Enrolled Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{t("details.enrolledMembers")}</span>
            </h3>
            <span className="bg-[#22A60D]/10 text-[#22A60D] px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
              {enrollments.length} {t("details.members")}
            </span>
          </div>
          {isLoadingEnrollments ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#22A60D]"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{t("details.noEnrollments")}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {enrollments.map((enrollment, idx) => {
                const userName = enrollment.user_details?.name?.trim();
                const userSurname = enrollment.user_details?.surname?.trim();
                const userEmail = enrollment.user_details?.email;
                let displayName = '';
                if (userName && userSurname) {
                  displayName = `${userName} ${userSurname}`;
                } else if (userName) {
                  displayName = userName;
                } else if (userSurname) {
                  displayName = userSurname;
                } else if (userEmail) {
                  displayName = userEmail.split('@')[0];
                } else {
                  displayName = `User #${enrollment.user}`;
                }
                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#22A60D]/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-[#22A60D]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {displayName}
                        </p>
                        {enrollment.user_details?.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {enrollment.user_details.email}
                          </p>
                        )}
                        {enrollment.user_details?.company && (
                          <p className="text-xs text-blue">
                            {enrollment.user_details.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("details.enrolledOn")} {new Date(enrollment.enrolled_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {t("details.member")} #{idx + 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Next Occurrences */}
        {course.next_occurrences && course.next_occurrences.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("details.upcomingSessions")}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {course.next_occurrences.slice(0, 6).map((occurrence: string, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(occurrence).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {course.start_time.substring(0, 5)} - {course.end_time.substring(0, 5)}
                  </p>
                </div>
              ))}
            </div>
            {course.next_occurrences.length > 6 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                +{course.next_occurrences.length - 6} {t("details.moreSessions")}
              </p>
            )}
          </div>
        )}
        {/* Course Description at the very end */}
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mt-8 break-words">
          <MarkdownRenderer>
            {course.description}
          </MarkdownRenderer>
        </div>
      </div>
    </Modal>
  );
};

export default CourseVisualizationModal;
