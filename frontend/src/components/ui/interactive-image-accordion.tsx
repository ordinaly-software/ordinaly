"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface AccordionImageItem {
  id: number | string;
  label: string;
  sublabel?: string;
  imageUrl: string;
}

interface ImageAccordionProps {
  items: AccordionImageItem[];
  initialActiveIndex?: number;
  className?: string;
  itemHeight?: string;
}

export function ImageAccordion({
  items,
  initialActiveIndex = 0,
  className,
  itemHeight = "h-[460px]",
}: ImageAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  return (
    <div className={cn("flex flex-row items-stretch gap-2.5", className)}>
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={item.id}
            className={cn(
              "relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0",
              "transition-all duration-700 ease-in-out",
              itemHeight,
              isActive ? "flex-grow basis-[360px]" : "basis-[58px]",
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
          >
            {/* Background image */}
            <img
              src={item.imageUrl}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out"
              style={{ transform: isActive ? "scale(1.04)" : "scale(1)" }}
              onError={(e) => {
                const t = e.currentTarget;
                t.onerror = null;
                t.src = "/static/home/main_home_ilustration_1.webp";
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20 transition-opacity duration-500" />

            {/* Collapsed label — vertical */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/90 font-semibold text-sm whitespace-nowrap -rotate-90 tracking-wide">
                  {item.label}
                </span>
              </div>
            )}

            {/* Expanded content — bottom */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-bold text-lg leading-snug">
                  {item.label}
                </p>
                {item.sublabel && (
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed line-clamp-2">
                    {item.sublabel}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
