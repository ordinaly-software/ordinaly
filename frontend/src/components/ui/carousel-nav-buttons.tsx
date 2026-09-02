"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselNavButtonsProps {
  onPrevClick: () => void;
  onNextClick: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  /**
   * Stable key for the once-per-session "next" nudge. Defaults to a React
   * useId (stable for this carousel's position across reloads in the tab).
   */
  nudgeId?: string;
  className?: string;
}

const NUDGE_PREFIX = "ordinaly:carousel-nudge:";

// High-contrast pill: dark on the light UI, inverted in dark mode, clay on hover.
// Reads clearly against the oat cards it overlaps (the old oat-on-oat buttons
// disappeared into them).
const BUTTON_BASE =
  "pointer-events-auto inline-flex items-center justify-center rounded-full " +
  "bg-slate-dark text-ivory-light ring-1 ring-black/10 " +
  "shadow-[0_10px_28px_-8px_rgba(20,20,19,0.55)] " +
  "transition-[transform,background-color,color,width,padding] duration-300 ease-out " +
  "hover:bg-clay hover:text-ivory-light hover:scale-105 active:scale-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
  "dark:bg-ivory-light dark:text-slate-dark dark:ring-white/15 dark:hover:bg-clay dark:hover:text-ivory-light " +
  "disabled:opacity-0 disabled:pointer-events-none";

export function CarouselNavButtons({
  onPrevClick,
  onNextClick,
  prevDisabled = false,
  nextDisabled = false,
  prevLabel = "Previous",
  nextLabel = "Next",
  nudgeId,
  className,
}: CarouselNavButtonsProps) {
  const autoId = useId();
  const storageKey = NUDGE_PREFIX + (nudgeId ?? autoId);
  const [nudge, setNudge] = useState(false);

  const dismissNudge = useCallback(() => {
    setNudge(false);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* storage unavailable — nothing to persist */
    }
  }, [storageKey]);

  // Show the "next" label once per carousel per tab session, until the user
  // interacts or a short timeout elapses.
  useEffect(() => {
    if (nextDisabled) return;
    let alreadySeen = true;
    try {
      alreadySeen = sessionStorage.getItem(storageKey) === "1";
    } catch {
      alreadySeen = true;
    }
    if (alreadySeen) return;
    setNudge(true);
    const timer = window.setTimeout(dismissNudge, 6000);
    return () => window.clearTimeout(timer);
  }, [storageKey, nextDisabled, dismissNudge]);

  const handlePrev = () => {
    if (nudge) dismissNudge();
    onPrevClick();
  };
  const handleNext = () => {
    if (nudge) dismissNudge();
    onNextClick();
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-2 sm:px-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={prevDisabled}
        aria-label={prevLabel}
        className={cn(BUTTON_BASE, "h-12 w-12 sm:h-14 sm:w-14")}
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.75} />
      </button>

      <button
        type="button"
        onClick={handleNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
        className={cn(
          BUTTON_BASE,
          "h-12 sm:h-14 gap-1.5 overflow-hidden",
          nudge ? "w-auto pl-5 pr-4 animate-carousel-hint" : "w-12 sm:w-14",
        )}
      >
        {nudge && (
          <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide">
            {nextLabel}
          </span>
        )}
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" strokeWidth={2.75} />
      </button>
    </div>
  );
}
