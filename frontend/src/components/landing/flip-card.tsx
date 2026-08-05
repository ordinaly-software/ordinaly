"use client";

import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
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
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={ariaLabel}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={cn("relative h-96 w-full cursor-pointer [perspective:1500px]", className)}
    >
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
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
