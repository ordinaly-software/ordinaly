

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Euro, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import CheckoutButton from "./checkout-button";
import CourseEnrollmentSuccessModal from "@/components/formation/enrollment-success-modal";
import { useTheme } from "@/contexts/theme-context";
import Alert from "@/components/ui/alert";


interface Course {
  id: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  bonified_course_link?: string | null;
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
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<"bonification" | "checkout">("bonification");
  const hasBonificationLink = !!selectedCourse?.bonified_course_link?.trim();
  const [alert, setAlert] = React.useState<{ type: "success" | "error" | "info" | "warning"; message: string } | null>(null);

  // Reset enrolled state when modal opens/closes or course changes
  React.useEffect(() => {
    setEnrolled(false);
    setCurrentStep(hasBonificationLink ? "bonification" : "checkout");
    setAlert(null);
  }, [isOpen, selectedCourse, hasBonificationLink]);

  const handleEnrollSuccess = () => {
    setEnrolled(true);
    // If course is free, show the success modal
    if (selectedCourse && (!selectedCourse.price || selectedCourse.price === 0)) {
      setShowSuccessModal(true);
    } else {
      // For paid courses, let Stripe redirect handle the modal
      setTimeout(() => {
        if (onEnroll) onEnroll();
        onClose();
      }, 1200);
    }
  };

  const bonificationText = t("enrollment.bonificationInfo");
  const bonificationParagraphs = bonificationText.split("\n\n").filter(Boolean);

  const handleBonificationDecision = (hasCredits: boolean) => {
    if (!selectedCourse) return;
    if (!hasCredits) {
      setCurrentStep("checkout");
      return;
    }
    const link = selectedCourse.bonified_course_link?.trim();
    if (!link) {
      setAlert({ type: "error", message: t("enrollment.bonificationMissingLink") });
      return;
    }
    window.location.href = link;
  };

  return (
    <>
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
            <h2
              className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold leading-snug flex-1 min-w-0 break-words`}
              style={{ fontSize: 'clamp(1rem, 3.8vw, 1.35rem)' }}
            >
              {selectedCourse ? `${t("enrollment.confirm")} - ${selectedCourse.title}` : t("enrollment.confirm")}
            </h2>
          </div>

          {/* SCROLL AREA */}
          <div className={`min-h-0 overflow-y-auto px-3 sm:px-4 py-4`}>
            {alert && (
              <div className="mb-4">
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                  duration={5000}
                />
              </div>
            )}
            {hasBonificationLink && (
              <div className="flex items-center justify-center mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-green-100 text-green-800'}`}>
                  {currentStep === "bonification" ? t("enrollment.stepBonification") : t("enrollment.stepCheckout")}
                </span>
              </div>
            )}
            {currentStep === "bonification" ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2 font-bold text-xl`}
                     style={{ fontSize: 'clamp(.95rem, 3.6vw, 1.125rem)' }}>
                    {t("enrollment.bonificationQuestion")}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("enrollment.bonificationHint")}
                  </p>
                </div>
                <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-gray-50/5 ring-1 ring-white/10' : 'bg-gray-50 ring-1 ring-gray-200'}`}>
                  {bonificationParagraphs.map((paragraph, idx) => (
                    <p key={idx} className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <>
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
                      <CalendarDays className="w-4 h-4 mr-2 text-[#1F8A0D] dark:text-[#7CFC00]" />
                      <span className="font-medium">{t("date")}:</span>
                      <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(selectedCourse.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-[#1F8A0D] dark:text-[#7CFC00]" />
                      <span className="font-medium">{t("location")}:</span>
                      <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedCourse.location ?? t("locationSoon")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Euro className="w-4 h-4 mr-2 text-[#1F8A0D] dark:text-[#7CFC00]" />
                      <span className="font-medium">{t("price")}:</span>
                      <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedCourse.price ? `€${selectedCourse.price}` : t("free")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-[#1F8A0D] dark:text-[#7CFC00]" />
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
              </>
            )}
          </div>

            <div
              className={`px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] ${isDark ? 'bg-[#12121A] border-white/10' : 'bg-white border-gray-200'} border-t flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.03)]`}
            >
              <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto sm:min-w-[140px] px-6 h-11 whitespace-normal">
                {t("enrollment.cancel")}
              </Button>
              {currentStep === "bonification" ? (
                <>
                  <Button
                    type="button"
                    onClick={() => handleBonificationDecision(false)}
                    className="w-full sm:w-auto sm:min-w-[180px] bg-[#1F8A0D] dark:bg-[#7CFC00] hover:bg-[#1A740B] text-white dark:text-black px-6 h-11 whitespace-normal"
                  >
                    {t("enrollment.bonificationNo")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleBonificationDecision(true)}
                    className="w-full sm:w-auto sm:min-w-[180px] px-6 h-11 whitespace-normal"
                  >
                    {t("enrollment.bonificationYes")}
                  </Button>
                </>
              ) : (
                <CheckoutButton
                  courseId={selectedCourse.id}
                  label={t("enrollment.confirmEnroll")}
                  className="w-full sm:w-auto sm:min-w-[220px] bg-[#1F8A0D] dark:bg-[#7CFC00] hover:bg-[#1A740B] text-white dark:text-black px-6 h-11 flex items-center justify-center rounded-2xl whitespace-normal"
                  onSuccess={handleEnrollSuccess}
                  disabled={enrolled}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
      {/* Success Modal for free courses */}
      {selectedCourse && showSuccessModal && (
        <CourseEnrollmentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            if (onEnroll) onEnroll();
            onClose();
          }}
          courseTitle={selectedCourse.title}
          t={t}
        />
      )}
    </>
  );
};

export default EnrollmentConfirmationModal;
