"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  username: string;
}

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading = false, username }: DeleteAccountModalProps) => {
  const t = useTranslations("profile");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText === username) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const isConfirmValid = confirmText === username;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
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

        {/* Confirmation input */}
        <div className="mb-6">
          <Input
            type="text"
            value={confirmText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
            placeholder={t("deleteAccount.confirmPlaceholder")}
            className="w-full text-center font-mono"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            {t("deleteAccount.cancelButton")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : t("deleteAccount.confirmButton")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
