"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

export interface AppleModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  layoutId?: string;
  categoryLayoutId?: string;
  titleLayoutId?: string;
  contentClassName?: string;
  containerClassName?: string;
  closeLabel?: string;
}

export function AppleModal({
  isOpen,
  onClose,
  category,
  title,
  children,
  layoutId,
  categoryLayoutId,
  titleLayoutId,
  contentClassName = "py-10",
  containerClassName = "relative z-[60] mx-auto my-10 h-fit w-full max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900",
  closeLabel = "Close",
}: AppleModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef as React.RefObject<HTMLDivElement>, () => onClose());

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 h-screen overflow-auto">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            onClick={onClose}
            aria-label={closeLabel}
          />

          {/* Close button — fixed to viewport, never covers scrolled content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-4 right-4 z-[200]"
          >
            <ModalCloseButton onClick={onClose} variant="default" size="md" className="shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            ref={containerRef}
            layoutId={layoutId}
            className={containerClassName}
          >
            {category != null && (
              <motion.p
                layoutId={categoryLayoutId}
                className="text-base font-medium text-black dark:text-white"
              >
                {category}
              </motion.p>
            )}
            {title != null && (
              <motion.p
                layoutId={titleLayoutId}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {title}
              </motion.p>
            )}

            <div className={contentClassName}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

