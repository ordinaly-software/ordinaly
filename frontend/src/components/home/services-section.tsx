"use client";

import type { ReactNode, RefObject } from "react";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

interface ServicesIntroProps extends HeroProps {
  servicesContent: ReactNode;
  sectionRef?: RefObject<HTMLElement | null>;
}

const serviceBenefits = [
  {
    titleKey: "services.extra.0.title",
    defaultTitle: "Implementación Rápida",
    descriptionKey: "services.extra.0.description",
    defaultDescription: "Primeros resultados visibles en 2-4 semanas. Trabajamos por fases para valor inmediato.",
    iconBg: "from-green-400 to-green-600",
    iconPath: "M5 13l4 4L19 7",
  },
  {
    titleKey: "services.extra.1.title",
    defaultTitle: "100% Personalizable",
    descriptionKey: "services.extra.1.description",
    defaultDescription: "No usamos plantillas genéricas. Cada solución se diseña específicamente para tu negocio.",
    iconBg: "from-blue-400 to-blue-600",
    iconPath:
      "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    titleKey: "services.extra.2.title",
    defaultTitle: "Soporte Continuo",
    descriptionKey: "services.extra.2.description",
    defaultDescription: "Equipo técnico en Sevilla disponible. Actualizaciones y mejoras incluidas en el servicio.",
    iconBg: "from-purple-400 to-purple-600",
    iconPath:
      "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

export function ServicesSection({ t, servicesContent, sectionRef }: ServicesIntroProps) {
  return (
    <section id="services" ref={sectionRef} className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#1F8A0D] dark:text-[#3FBD6F]">
            {t("services.title")}
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto mb-2">
            {t("services.subtitle")}
          </p>
        </div>
        {servicesContent}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {serviceBenefits.map((benefit, index) => (
            <div
              key={benefit.titleKey}
              className="scroll-animate fade-in-up text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${benefit.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t(benefit.titleKey)}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{t(benefit.descriptionKey)}</p>
            </div>
          ))}
          <br></br>
        </div>
      </div>
    </section>
  );
}
