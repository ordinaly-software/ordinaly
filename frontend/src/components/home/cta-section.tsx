"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

const ctaBenefits = [
  {
    titleKey: "cta.items.0.title",
    defaultTitle: "Análisis Personalizado",
    descriptionKey: "cta.items.0.description",
    defaultDescription: "Estudiamos tu negocio y te mostramos oportunidades de automatización concretas",
    icon: "🎯",
  },
  {
    titleKey: "cta.items.1.title",
    defaultTitle: "Presupuesto Transparente",
    descriptionKey: "cta.items.1.description",
    defaultDescription: "Sin costes ocultos. Sabrás exactamente qué vas a recibir y cuánto costará",
    icon: "💰",
  },
  {
    titleKey: "cta.items.2.title",
    defaultTitle: "Resultados Rápidos",
    descriptionKey: "cta.items.2.description",
    defaultDescription: "Primeras automatizaciones funcionando en 2-4 semanas. Valor desde el día 1",
    icon: "⚡",
  },
];

export function CtaSection({ t, onWhatsApp }: HeroProps) {
  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1F8A0D] via-[#46B1C9] to-[#623CEA] dark:from-[#0E2417] dark:via-[#0F3A2E] dark:to-[#0B2A3A] text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <div className="max-w-4xl mx-auto text-center scroll-animate fade-in-up relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          {t("cta.title")}
        </h2>
        <p className="text-xl md:text-xl mb-4 max-w-2xl mx-auto font-semibold">
          {t("cta.subtitle")}
        </p>
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-12 text-left">
          {ctaBenefits.map((benefit, index) => (
            <div
              key={benefit.titleKey}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="font-bold text-lg mb-2">
                {t(benefit.titleKey)}
              </h3>
              <p className="text-sm opacity-90">
                {t(benefit.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 px-4 md:px-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <Button
            size="lg"
            className="w-full bg-white text-[#1F8A0D] hover:bg-gray-100 dark:bg-[#3FBD6F] dark:text-[#0B1B17] dark:hover:bg-[#2EA55E] px-6 py-4 md:px-10 md:py-6 text-base md:text-lg font-bold shadow-lg hover:shadow-lg transform hover:scale-105 transition-all"
            onClick={onWhatsApp}
          >
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t("cta.buttons.whatsapp")}</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1F8A0D] dark:border-white/40 dark:text-white dark:hover:bg-white/10 dark:hover:text-white px-6 py-4 md:px-10 md:py-6 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            asChild
          >
            <Link href="/services">
              {t("cta.buttons.services")}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>
        </div>
        <p className="text-sm mt-8 opacity-80">
          <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {t("cta.meta")}
        </p>
      </div>
    </section>
  );
}
