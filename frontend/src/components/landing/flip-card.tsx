"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  frontClassName?: string;
  backClassName?: string;
  className?: string;
  ariaLabel?: string;
}

export function FlipCard({ front, back, frontClassName, backClassName, className, ariaLabel }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => setFlipped((current) => !current);

  return (
    // The card surface is mouse/touch only. Keyboard and screen-reader users get a real
    // button (visible on focus), and the face that is turned away is inert so its
    // links can't be tabbed to.
    <div
      role="group"
      aria-label={ariaLabel}
      onClick={toggle}
      className={cn("relative h-96 w-full cursor-pointer [perspective:1500px]", className)}
    >
      <button
        type="button"
        aria-pressed={flipped}
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-3 focus-visible:top-3 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-slate-dark focus-visible:shadow-lg"
      >
        {ariaLabel}
      </button>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" } as CSSProperties}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0.2, 0.2, 1] }}
      >
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl shadow-lg",
            frontClassName,
          )}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          inert={flipped}
        >
          {front}
        </div>
        <div
          className={cn(
            "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900",
            backClassName,
          )}
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          inert={!flipped}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
