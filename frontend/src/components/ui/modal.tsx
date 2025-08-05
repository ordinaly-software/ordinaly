"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  showHeader?: boolean;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  title,
  showHeader = false
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

return createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    />

    {/* Wrapper para centrar verticalmente con margen si hay scroll */}
    <div className="relative z-10 mx-auto my-16 w-full max-w-2xl px-4">
      <div 
        className={`relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1924] shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Default close button for all modals */}
        <ModalCloseButton
          onClick={onClose}
          variant="default"
          size="md"
          className="absolute top-4 right-4 z-10"
        />

        {showHeader && (
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title || "Modal"}
            </h2>
          </div>
        )}

        <div className={`${showHeader ? 'p-6' : 'p-0'}`}>
          {children}
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};