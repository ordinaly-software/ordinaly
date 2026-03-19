"use client";

import type { ReactNode, RefObject } from "react";
import Image from "next/image";
import { Lens } from "@/components/ui/lens";
import type { Service } from "@/hooks/useServices";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface ServicesIntroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
  servicesContent: ReactNode;
  sectionRef?: RefObject<HTMLElement | null>;
  featuredServices?: Service[];
}

export function ServicesSection({ t, servicesContent, sectionRef, featuredServices }: ServicesIntroProps) {
  return (
    <section id="services" ref={sectionRef} className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Section header */}
        <div className="text-center scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-dark dark:text-ivory-light">
            {t("services.title")}
          </h2>
          <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Full service carousel */}
        {servicesContent}

      </div>
    </section>
  );
}
