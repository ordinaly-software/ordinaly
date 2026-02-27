"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading = false }: DeleteAccountModalProps) => {
  const t = useTranslations("profile");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="p-6">
        {/* Warning icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          {t("deleteAccount.confirmTitle")}
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
          {t("deleteAccount.confirmMessage")}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {t("deleteAccount.cancelButton")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Eliminando..." : t("deleteAccount.confirmButton")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
