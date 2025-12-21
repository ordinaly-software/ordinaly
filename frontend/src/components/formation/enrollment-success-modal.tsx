import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.push("/profile?tab=courses")}
            className="bg-[#1F8A0D] hover:bg-[#166307] text-white dark:bg-[#7CFC00] dark:hover:bg-[#6BFF52] dark:text-[#0B1B17] w-full sm:w-auto"
          >
            {t ? t("enrollmentSuccess.viewMyCourses") : "View my courses"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t ? t("enrollmentSuccess.close") : "Close"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseEnrollmentSuccessModal;
