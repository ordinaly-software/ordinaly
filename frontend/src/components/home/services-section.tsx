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

function LensServiceCard({ service }: { service: Service }) {
  const hasImage = !!service.image;

  return (
    <div className="flex flex-col overflow-hidden rounded-a-l bg-[var(--swatch--slate-dark)] dark:bg-[var(--swatch--slate-medium)] border border-[var(--swatch--slate-medium)] dark:border-[var(--color-border-strong)]">
      {/* Image with lens — zoom only applies here */}
      <Lens zoomFactor={1.4} lensSize={175}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--swatch--slate-medium)]">
          {hasImage ? (
            <Image
              src={service.image!}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, var(--swatch--clay), transparent 55%), radial-gradient(circle at 75% 70%, var(--swatch--kraft), transparent 50%)`,
              }}
            />
          )}
        </div>
      </Lens>

      {/* Text — outside the Lens, always fully readable */}
      <div className="flex flex-col gap-1.5 p-5">
        <p className="label-meta text-[var(--swatch--cloud-medium)]">
          {service.type === "PRODUCT" ? "Producto" : "Servicio"}
        </p>
        <h3 className="text-base font-semibold text-[var(--swatch--ivory-light)] leading-snug">
          {service.title}
        </h3>
        {service.subtitle && (
          <p className="text-sm text-[var(--swatch--cloud-medium)] line-clamp-2 leading-relaxed">
            {service.subtitle}
          </p>
        )}
      </div>
    </div>
  );
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
