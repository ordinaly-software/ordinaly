import React from "react";
import { Modal } from "@/components/ui/modal";
import { UserX } from "lucide-react";

interface CourseCancelEnrollmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  t?: (key: string) => string;
}

const CourseCancelEnrollmentSuccessModal: React.FC<CourseCancelEnrollmentSuccessModalProps> = ({
  isOpen,
  onClose,
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
        <UserX className="w-16 h-16 text-green mb-4" />
        <h2 className="text-2xl font-bold text-center mb-2">
          {t ? t("cancellation.title") : "Enrollment Cancelled"}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
          {t ? t("cancellation.message") : "Your enrollment has been cancelled successfully."}
        </p>
        <button
          className="bg-[#0d6e0c] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0A4D08] transition"
          onClick={onClose}
        >
          {t ? t("enrollmentSuccess.close") : "Close"}
        </button>
      </div>
    </Modal>
  );
};

export default CourseCancelEnrollmentSuccessModal;
