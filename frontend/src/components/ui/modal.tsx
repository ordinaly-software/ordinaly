"use client";

import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  showHeader?: boolean;
  /** Pinned below the scrolling content (actions that must stay reachable). Wrap in ModalFooter for the standard bar. */
  footer?: ReactNode;
  /** Rendered above the backdrop, outside the panel (e.g. prev/next controls). */
  outside?: ReactNode;
  /** Remount the scrolling content (and so reset its scroll) when this changes. */
  contentKey?: string | number;
  /** id of the element naming the dialog, when there is no built-in header. */
  labelledBy?: string;
}

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-slate-dark sm:px-8">
    {children}
  </div>
);

// (decelerationRate / (1 - decelerationRate)) / 1000 for rate 0.998, applied to px/s
const SHEET_PROJECTION = 0.499;

const subscribeNoop = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

/**
 * Shared dialog: a bottom sheet on phones (grabber, drag to dismiss) and a centered
 * card from md up. Enters and leaves along the same edge.
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  title,
  showHeader = false,
  footer,
  outside,
  contentKey,
  labelledBy,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  useDialogFocus(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isClient) return null;

  const hiddenState = reduceMotion ? { opacity: 0 } : isMobile ? { y: "100%" } : { opacity: 0, y: 16 };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const height = dialogRef.current?.offsetHeight ?? 0;
    // Project where the flick would come to rest, then dismiss if that lands past 40% of the sheet.
    const projectedY = info.offset.y + info.velocity.y * SHEET_PROJECTION;
    if (projectedY > height * 0.4) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-lg"
            onClick={onClose}
            tabIndex={-1}
            aria-label="Cerrar"
          />

          {outside && (
            // Leaves along the same path as the panel
            <motion.div
              initial={hiddenState}
              animate={{ opacity: 1, y: 0 }}
              exit={hiddenState}
              transition={reduceMotion ? { duration: 0.15 } : { type: "spring", duration: 0.4, bounce: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {outside}
            </motion.div>
          )}

          {/* Modal content */}
          <motion.div
            ref={dialogRef}
            initial={hiddenState}
            animate={{ opacity: 1, y: 0 }}
            exit={hiddenState}
            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", duration: 0.4, bounce: 0 }}
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
            className={cn(
              "relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl",
              "bg-white shadow-2xl dark:bg-slate-dark dark:border dark:border-white/10",
              "md:max-h-[90dvh] md:rounded-3xl",
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={showHeader ? "modal-title" : labelledBy}
            tabIndex={-1}
          >
            {/* Grabber: the only drag-to-dismiss zone, so the content below scrolls untouched */}
            <div
              className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center md:hidden"
              onPointerDown={(event) => dragControls.start(event)}
              aria-hidden="true"
            >
              <span className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/30" />
            </div>

            {showHeader ? (
              <div className="flex shrink-0 items-start gap-3 border-b border-gray-200 px-5 pb-4 pt-1 dark:border-white/10 sm:px-8 md:pt-5">
                <h2
                  id="modal-title"
                  className="flex-1 pr-2 text-xl font-semibold leading-snug tracking-tight text-gray-900 dark:text-white"
                >
                  {title || "Modal"}
                </h2>
                <ModalCloseButton
                  onClick={onClose}
                  variant="default"
                  size="sm"
                  className="shrink-0"
                  aria-label="Cerrar"
                />
              </div>
            ) : (
              <ModalCloseButton
                onClick={onClose}
                variant="overlay"
                size="sm"
                className="absolute right-3 top-3 z-20"
                aria-label="Cerrar"
              />
            )}

            <div key={contentKey} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className={showHeader ? "px-5 py-5 sm:px-8 sm:py-6" : "p-0"}>{children}</div>
            </div>

            {footer}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
