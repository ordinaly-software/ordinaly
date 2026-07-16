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
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={onPrevClick}
        disabled={prevDisabled}
        aria-label={prevLabel}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
      >
        <IconArrowNarrowLeft className="h-6 w-6 text-clay dark:text-clay" />
      </button>
      <button
        type="button"
        onClick={onNextClick}
        disabled={nextDisabled}
        aria-label={nextLabel}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
      >
        <IconArrowNarrowRight className="h-6 w-6 text-clay dark:text-clay" />
      </button>
    </div>
  );
}
