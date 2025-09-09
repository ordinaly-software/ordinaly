import React from "react";
import { Modal } from "@/components/ui/modal";
import { CheckCircle } from "lucide-react";

interface CourseEnrollmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  t?: (key: string) => string;
}

const CourseEnrollmentSuccessModal: React.FC<CourseEnrollmentSuccessModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  t,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      className="max-w-md"
    >
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <CheckCircle className="w-16 h-16 text-green mb-4" />
        <h2 className="text-2xl font-bold text-center mb-2">
          {t ? t("enrollmentSuccess.title") : "Enrollment Confirmed!"}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
          {t
            ? courseTitle
              ? t("enrollmentSuccess.message") + ` ${courseTitle}`
              : t("enrollmentSuccess.message")
            : `You have been successfully enrolled${courseTitle ? ` in ${courseTitle}` : ""}.`}
        </p>
        <button
          className="bg-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          onClick={onClose}
        >
          {t ? t("enrollmentSuccess.close") : "Close"}
        </button>
      </div>
    </Modal>
  );
};

export default CourseEnrollmentSuccessModal;
