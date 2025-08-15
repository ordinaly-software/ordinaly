"use client";

import { ReactNode, useEffect } from "react";
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

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      />

      {/* Modal content */}
      <div
        className={[
          "relative z-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800",
          "bg-white dark:bg-[#1A1924] shadow-2xl",
          // Make the modal respect small mobile viewports
          "max-h-[calc(100svh-2rem)] sm:max-h-[calc(100vh-4rem)] w-full",
          className,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showHeader ? "modal-title" : undefined}
      >
        {showHeader ? (
          // Header with inline close button – prevents overlap
          <div className="px-6 py-4 flex items-start gap-3 border-b border-gray-200 dark:border-gray-800">
            <h2
              id="modal-title"
              className="text-xl font-bold leading-snug text-gray-900 dark:text-white pr-2 flex-1"
            >
              {title || "Modal"}
            </h2>
            <ModalCloseButton
              onClick={onClose}
              variant="default"
              size="md"
              className="-mt-1 shrink-0"
              aria-label="Cerrar"
            />
          </div>
        ) : (
          // Fallback close button when there's no header
          <ModalCloseButton
            onClick={onClose}
            variant="default"
            size="md"
            className="absolute top-3 right-3 z-10"
            aria-label="Cerrar"
          />
        )}

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 0.5rem)' }}>
            <div className={showHeader ? "p-6" : "p-0"}>
              {children}
            </div>
          </div>
      </div>
    </div>,
    document.body
  );
};