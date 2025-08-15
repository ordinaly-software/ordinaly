
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Euro, Users, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

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
  onConfirm: () => void;
}

const EnrollmentConfirmationModal: React.FC<EnrollmentConfirmationModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
  onConfirm,
}) => {
  const t = useTranslations("formation");

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    showHeader={false}
    className="w-[min(100vw-1rem,28rem)] mx-2 sm:mx-4 p-0 rounded-2xl overflow-hidden"
  >

    {selectedCourse && (
      // Use clamp: min 560px, prefer 90svh, max 820px
      <div className="overflow-hidden grid grid-rows-[auto,1fr,auto] bg-[#12121A]
                      max-h-[clamp(560px,90svh,820px)]">
        {/* HEADER */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
          <h2 className="text-white font-bold leading-tight flex-1 mr-2"
              style={{ fontSize: 'clamp(1rem, 3.8vw, 1.35rem)' }}>
            {selectedCourse ? `${t("enrollment.confirm")} - ${selectedCourse.title}` : t("enrollment.confirm")}
          </h2>
        </div>
    
        {/* SCROLL AREA */}
        <div className="min-h-0 overflow-y-auto px-3 sm:px-4 py-4">
          <div className="text-center">
            <p className="text-gray-200 mb-2 font-semibold"
               style={{ fontSize: 'clamp(.95rem, 3.6vw, 1.125rem)' }}>
              {t("enrollment.confirmMessage")}
            </p>
            <p className="text-sm text-gray-400">{t("enrollment.paymentNote")}</p>
          </div>

          <div className="mt-4 bg-gray-50/5 rounded-xl p-4 space-y-3 ring-1 ring-white/10">
            <h3 className="text-white text-lg font-semibold">
              {t("enrollment.courseDetails")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-[#22A60D]" />
                  <span className="font-medium">{t("date")}:</span>
                  <span className="ml-2 text-gray-300">
                    {new Date(selectedCourse.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#22A60D]" />
                  <span className="font-medium">{t("location")}:</span>
                  <span className="ml-2 text-gray-300">
                    {selectedCourse.location ?? t("locationSoon")}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Euro className="w-4 h-4 mr-2 text-[#22A60D]" />
                  <span className="font-medium">{t("price")}:</span>
                  <span className="ml-2 text-gray-300">
                    {selectedCourse.price ? `€${selectedCourse.price}` : t("free")}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#22A60D]" />
                  <span className="font-medium">{t("maxAttendants")}:</span>
                  <span className="ml-2 text-gray-300">{selectedCourse.max_attendants}</span>
                </div>
              </div>
            </div>

            {selectedCourse.description && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-gray-300">{selectedCourse.subtitle}</p>
              </div>
            )}
          </div>
        </div>
    
        <div
          className="px-4 pt-3
                     pb-[calc(env(safe-area-inset-bottom)+16px)]
                     bg-[#12121A] border-t border-white/10
                     flex flex-col sm:flex-row gap-3 justify-end
                     shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.3)]"
        >
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto px-6 h-10">
            {t("enrollment.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#22A60D] hover:bg-[#1C8C0B] text-white px-6 h-10 flex items-center gap-2"
            style={{ borderRadius: '1rem' }}
          >
            <GraduationCap className="w-4 h-4" />
            {t("enrollment.confirmEnroll")}
          </Button>
        </div>
      </div>
    )}
  </Modal>
);

};

export default EnrollmentConfirmationModal;
