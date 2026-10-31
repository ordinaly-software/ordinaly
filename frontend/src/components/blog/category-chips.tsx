"use client";

import { cn } from "@/lib/utils";

export type CategoryChip = { value: string; label: string };

/**
 * Horizontal category filter. Pills respond on press (not release) and the row
 * scrolls under a soft edge fade instead of wrapping into several lines.
 */
export function CategoryChips({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: CategoryChip[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  if (options.length <= 1) return null;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)] sm:[mask-image:none]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium tracking-[0.005em]",
              "transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-95",
              "motion-reduce:transition-colors motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-light dark:focus-visible:ring-offset-slate-dark",
              active
                ? "border-clay-fill bg-clay-fill text-white"
                : "border-ivory-dark bg-white/70 text-slate-medium hover:border-clay hover:text-clay dark:border-white/15 dark:bg-white/5 dark:text-cloud-light dark:hover:border-clay dark:hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
