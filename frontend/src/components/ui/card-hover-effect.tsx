"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HoverEffectItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function HoverEffectCards({
  items,
  className,
}: {
  items: HoverEffectItem[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="relative group block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-[#d97706] rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
              />
            )}
          </AnimatePresence>
          <div
            className={cn(
              "relative z-20 h-full rounded-2xl p-6 border transition-colors duration-200",
              hoveredIndex === idx
                ? "border-transparent bg-transparent"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900",
            )}
          >
            {item.icon && (
              <div
                className={cn(
                  "mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200",
                  hoveredIndex === idx ? "bg-white/15 text-white" : "bg-[#d97706]/10 text-[#d97706]",
                )}
              >
                {item.icon}
              </div>
            )}
            <h4
              className={cn(
                "font-bold text-lg mb-2 transition-colors duration-200",
                hoveredIndex === idx ? "text-white" : "text-neutral-900 dark:text-white",
              )}
            >
              {item.title}
            </h4>
            <p
              className={cn(
                "text-sm leading-relaxed transition-colors duration-200",
                hoveredIndex === idx ? "text-white/90" : "text-neutral-600 dark:text-neutral-400",
              )}
            >
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
