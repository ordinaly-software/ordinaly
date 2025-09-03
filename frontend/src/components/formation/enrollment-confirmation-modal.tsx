

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Euro, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import CheckoutButton from "./checkout-button";
import { useTheme } from "@/contexts/theme-context";


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

interface EnrollmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
  onEnroll?: () => void; // Optional, for custom post-enroll logic
}

const EnrollmentConfirmationModal: React.FC<EnrollmentConfirmationModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
  onEnroll,
}) => {
  const t = useTranslations("formation");
  const { isDark } = useTheme();
  const [enrolled, setEnrolled] = React.useState(false);

  // Reset enrolled state when modal opens/closes or course changes
  React.useEffect(() => {
    setEnrolled(false);
  }, [isOpen, selectedCourse]);

  const handleEnrollSuccess = () => {
    setEnrolled(true);
    setTimeout(() => {
      if (onEnroll) onEnroll();
      onClose();
    }, 1200); // Show success for a moment before closing
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      className="w-[min(100vw-1rem,28rem)] mx-2 sm:mx-4 p-0 rounded-2xl overflow-hidden"
    >
      {selectedCourse && (
        <div
          className={`overflow-hidden grid grid-rows-[auto,1fr,auto] max-h-[clamp(560px,90svh,820px)] ${isDark ? 'bg-[#12121A]' : 'bg-white'}`}
        >
          {/* HEADER */}
          <div className={`flex items-start justify-between px-4 pt-4 pb-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <h2 className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold leading-tight flex-1 mr-2`}
                style={{ fontSize: 'clamp(1rem, 3.8vw, 1.35rem)' }}>
              {selectedCourse ? `${t("enrollment.confirm")} - ${selectedCourse.title}` : t("enrollment.confirm")}
            </h2>
          </div>

          {/* SCROLL AREA */}
          <div className={`min-h-0 overflow-y-auto px-3 sm:px-4 py-4`}>
            <div className="text-center">
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2 font-semibold`}
                 style={{ fontSize: 'clamp(.95rem, 3.6vw, 1.125rem)' }}>
                {enrolled ? t("enrollment.successMessage") : t("enrollment.confirmMessage")}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t("enrollment.paymentNote")}</p>
            </div>

            <div className={`mt-4 ${isDark ? 'bg-gray-50/5 ring-1 ring-white/10' : 'bg-gray-50 ring-1 ring-gray-200'} rounded-xl p-4 space-y-3`}>
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>
                {t("enrollment.courseDetails")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium">{t("date")}:</span>
                    <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(selectedCourse.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium">{t("location")}:</span>
                    <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedCourse.location ?? t("locationSoon")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Euro className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium">{t("price")}:</span>
                    <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedCourse.price ? `€${selectedCourse.price}` : t("free")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-[#22A60D]" />
                    <span className="font-medium">{t("maxAttendants")}:</span>
                    <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedCourse.max_attendants}</span>
                  </div>
                </div>
              </div>

              {selectedCourse.description && (
                <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedCourse.subtitle}</p>
                </div>
              )}
            </div>
          </div>

          <div
            className={`px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] ${isDark ? 'bg-[#12121A] border-white/10' : 'bg-white border-gray-200'} border-t flex flex-col sm:flex-row gap-3 justify-end shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.03)]`}
          >
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto px-6 h-10">
              {t("enrollment.cancel")}
            </Button>
            {selectedCourse && (
              <CheckoutButton
                courseId={selectedCourse.id}
                label={enrolled ? t("enrollment.enrolled") : t("enrollment.confirmEnroll")}
                className="w-full sm:w-auto bg-[#22A60D] hover:bg-[#1C8C0B] text-white px-6 h-10 flex items-center gap-2 rounded-2xl"
                onSuccess={handleEnrollSuccess}
                disabled={enrolled}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EnrollmentConfirmationModal;
