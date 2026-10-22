"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} showHeader className="max-w-md">
      <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-300">
        {t("message")}
      </p>

      <div className="flex justify-end gap-3">
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
    </Modal>
  );
};

export default LogoutModal;
