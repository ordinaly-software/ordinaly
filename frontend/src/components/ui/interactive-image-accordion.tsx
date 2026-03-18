"use client";

import React, { useState } from "react";
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

// ─── Legacy export (used by existing pages) ──────────────────────────────────

const _legacyItems: AccordionImageItem[] = [
  {
    id: 1,
    label: "Voice Assistant",
    imageUrl:
      "https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 2,
    label: "AI Image Generation",
    imageUrl:
      "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    label: "AI Chatbot + Local RAG",
    imageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 4,
    label: "AI Agent",
    imageUrl:
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2090&auto=format&fit=crop",
  },
  {
    id: 5,
    label: "Visual Understanding",
    imageUrl:
      "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop",
  },
];

export function LandingAccordionItem() {
  return (
    <div className="bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-dark)] font-sans">
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)] leading-tight tracking-tighter">
              Accelerate Gen-AI Tasks on Any Device
            </h1>
            <p className="mt-6 text-lg text-[var(--swatch--slate-light)] dark:text-[var(--swatch--cloud-medium)] max-w-xl mx-auto md:mx-0">
              Build high-performance AI apps on-device without the hassle of
              model compression or edge deployment.
            </p>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-block bg-[var(--swatch--slate-dark)] dark:bg-[var(--swatch--ivory-light)] text-[var(--swatch--ivory-light)] dark:text-[var(--swatch--slate-dark)] font-semibold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="overflow-x-auto p-1">
              <ImageAccordion items={_legacyItems} initialActiveIndex={4} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
