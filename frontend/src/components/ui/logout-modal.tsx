"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-[90%]">
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
    </Modal>
  );
};

export default LogoutModal;
