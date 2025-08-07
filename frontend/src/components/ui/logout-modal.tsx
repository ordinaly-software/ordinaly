"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({ isOpen, onClose, onConfirm }: LogoutModalProps) => {
  const t = useTranslations("logoutModal");

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0"
        onClick={handleBackdropClick}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden relative z-10">
        {/* Close Button */}
        <ModalCloseButton
          onClick={onClose}
          variant="default"
          size="md"
          className="absolute top-4 right-4 z-10"
        />

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {t("message")}
          </p>

          <div className="flex justify-end space-x-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t("cancelButton")}
            </Button>

            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("confirmButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
