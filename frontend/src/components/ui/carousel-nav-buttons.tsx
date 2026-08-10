"use client";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface CarouselNavButtonsProps {
  onPrevClick: () => void;
  onNextClick: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function CarouselNavButtons({
  onPrevClick,
  onNextClick,
  prevDisabled = false,
  nextDisabled = false,
  prevLabel = "Previous",
  nextLabel = "Next",
  className,
}: CarouselNavButtonsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-2 sm:px-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={onPrevClick}
        disabled={prevDisabled}
        aria-label={prevLabel}
        className="pointer-events-auto flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-oat shadow-lg transition-opacity duration-200 dark:bg-[--swatch--slate-medium] disabled:opacity-0 disabled:pointer-events-none"
      >
        <IconArrowNarrowLeft className="h-6 w-6 sm:h-7 sm:w-7 text-clay dark:text-clay" />
      </button>
      <button
        type="button"
        onClick={onNextClick}
        disabled={nextDisabled}
        aria-label={nextLabel}
        className="pointer-events-auto flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-oat shadow-lg transition-opacity duration-200 dark:bg-[--swatch--slate-medium] disabled:opacity-0 disabled:pointer-events-none"
      >
        <IconArrowNarrowRight className="h-6 w-6 sm:h-7 sm:w-7 text-clay dark:text-clay" />
      </button>
    </div>
  );
}
