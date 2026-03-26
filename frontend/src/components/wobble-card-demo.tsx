"use client";

import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";

export function BenefitsGrid({ benefits }: { benefits: string[] }) {
  return (
    <section className="py-24 bg-white dark:bg-neutral-900 transition-colors">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
        Beneficios de la Automatización Inteligente
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        {benefits.map((benefit, i) => (
          <WobbleCard
            key={i}
            containerClassName="
              relative overflow-hidden
              bg-neutral-900 dark:bg-neutral-800
              border border-neutral-700
              rounded-2xl
              p-6
              min-h-[220px]
              group
            "
            className="text-white"
          >
            <div
              className="
                w-3 h-3 rounded-full 
                bg-neutral-600 
                group-hover:bg-[#d97706] 
                transition-all duration-300
                mb-4
              "
            />
            <p className="text-neutral-300 text-base leading-relaxed relative z-10">
              {benefit}
            </p>
            <div
              className="
                absolute inset-0 
                opacity-0 group-hover:opacity-20 
                transition-opacity duration-300 
                bg-[#d97706]
              "
            />
            <div
              className="
                pointer-events-none absolute inset-0 rounded-2xl
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
              "
              style={{
                background:
                  "linear-gradient(120deg, transparent 0%, #d97706 50%, transparent 100%)",
                mask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "2px",
                animation: "electricFlow 2s linear infinite",
              }}
            />
          </WobbleCard>
        ))}
      </div>
      <style jsx>{`
        @keyframes electricFlow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
