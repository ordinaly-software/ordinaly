import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Euro, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useCourseRefund } from "@/hooks/useCourseRefund";

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

interface EnrollmentCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToCancel: Course | null;
  onConfirm: () => void;
}

const EnrollmentCancellationModal: React.FC<EnrollmentCancellationModalProps> = ({
  isOpen,
  onClose,
  courseToCancel,
  onConfirm,
}) => {
  const t = useTranslations("formation");
  const { requestRefund, loading } = useCourseRefund();

  // Unenroll restriction logic (same as in CourseCard)
  let disableUnenroll = false;
  let unenrollRestrictionReason: string | null = null;
  if (courseToCancel) {
    const now = new Date();
    const startDateTime = courseToCancel.start_date && courseToCancel.start_time
      ? new Date(`${courseToCancel.start_date}T${courseToCancel.start_time}`)
      : null;
    const endDateTime = courseToCancel.end_date && courseToCancel.end_time
      ? new Date(`${courseToCancel.end_date}T${courseToCancel.end_time}`)
      : null;
    if (startDateTime) {
      const diffMs = startDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && diffHours > 0) {
        disableUnenroll = true;
        unenrollRestrictionReason = t('alerts.unenroll24hRestriction');
      } else if (diffHours <= 0) {
        disableUnenroll = true;
        unenrollRestrictionReason = t('alerts.unenrollStartedRestriction');
      }
    }
    if (endDateTime && endDateTime < now) {
      disableUnenroll = true;
      unenrollRestrictionReason = t('alerts.unenrollEndedRestriction');
    }
  }

  const handleRefund = () => {
    if (courseToCancel && !disableUnenroll) {
      requestRefund(courseToCancel.slug ?? courseToCancel.id);
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      className="w-[min(100vw-1rem,28rem)] mx-2 sm:mx-4 p-0 rounded-2xl overflow-hidden"
    >
      {courseToCancel && (
        <div className="grid grid-rows-[auto,1fr,auto] bg-white dark:bg-[#12121A] max-h-[clamp(560px,90svh,820px)]">
          {/* HEADER (title + close, no overlap) */}
          <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-gray-900 dark:text-white font-bold leading-tight flex-1 mr-2"
                style={{ fontSize: 'clamp(1rem, 3.8vw, 1.35rem)' }}>
              {t("cancellation.title")}
            </h2>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="min-h-0 overflow-y-auto px-3 sm:px-4 py-4">
            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <UserX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    {t("cancellation.warning")}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t("cancellation.warningMessage", { courseTitle: courseToCancel.title })}
                  </p>
                  {disableUnenroll && unenrollRestrictionReason && (
                    <div className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">
                      {unenrollRestrictionReason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {courseToCancel.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("date")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {new Date(courseToCancel.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("location")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {courseToCancel.location}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Euro className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("price")}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {courseToCancel.price ? `€${courseToCancel.price}` : t("free")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-center py-3">
              <p className="text-gray-700 dark:text-gray-200">
                {t("cancellation.confirmMessage")}
              </p>
            </div>
          </div>

          {/* FIXED FOOTER (same spacing & safe-area as confirmation modal) */}
          <div
            className="px-4 pt-3
                       pb-[calc(env(safe-area-inset-bottom)+16px)]
                       bg-white dark:bg-[#12121A] border-t border-gray-200 dark:border-white/10
                       flex flex-col sm:flex-row gap-3 justify-end
                       shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.3)]"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto px-6 h-10"
            >
              {t("cancellation.keepEnrollment")}
            </Button>
            <Button
              onClick={handleRefund}
              variant="destructive"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 h-10 flex items-center gap-2"
              style={{ borderRadius: '1rem' }}
              disabled={loading || disableUnenroll}
              title={disableUnenroll && unenrollRestrictionReason ? unenrollRestrictionReason : undefined}
            >
              <UserX className="w-4 h-4" />
              {disableUnenroll && unenrollRestrictionReason
                ? unenrollRestrictionReason
                : (loading ? t("cancellation.processing") : t("cancellation.confirmCancel"))}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EnrollmentCancellationModal;
