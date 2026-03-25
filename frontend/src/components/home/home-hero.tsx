"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Bot, Building2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageAccordion, type AccordionImageItem } from "@/components/ui/interactive-image-accordion";
import { useTheme } from "@/contexts/theme-context";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HeroProps {
  t: TranslateFn;
  onWhatsApp: () => void;
}

const clientLogos = [
  { src: "/static/logos/logo_grupo_addu_small.webp", alt: "Grupo Addu", width: 130, height: 42 },
  { src: "/static/logos/logo_aviva_publicidad_small.webp", alt: "Aviva Publicidad", width: 140, height: 42 },
  { src: "/static/logos/logo_proinca_consultores_small.webp", alt: "Proinca Consultores", width: 120, height: 42 },
  { src: "/static/logos/logo_guadalquivir_fincas_small.webp", alt: "Guadalquivir Fincas", width: 150, height: 42 },
];

const bulletPoints = [
  { icon: Building2, key: "hero.trust1", href: "#use-cases" },
  { icon: Bot, key: "hero.trust2", href: "#services" },
  { icon: Book, key: "hero.trust3", href: "#courses" },
  { icon: ArrowRight, key: "hero.trust4", href: "/services" },
];

const accordionImages: Omit<AccordionImageItem, "label" | "sublabel">[] = [
  {
    id: 1,
    imageUrl: "/static/home/main_home_ilustration_1.webp",
  },
  {
    id: 2,
    imageUrl: "/static/home/main_home_ilustration_2.webp",
  },
  {
    id: 3,
    imageUrl: "/static/home/main_home_ilustration_3.webp",
  },
  {
    id: 4,
    imageUrl: "/static/home/main_home_ilustration_4.webp",
  },
];

export function HomeHero({ t, onWhatsApp }: HeroProps) {
  const { isDark } = useTheme();

  const accordionItems: AccordionImageItem[] = [
    { ...accordionImages[0], label: t("hero.card1Label"), sublabel: t("hero.card1Value") },
    { ...accordionImages[1], label: t("hero.card2Label"), sublabel: t("hero.card2Value") },
    { ...accordionImages[2], label: t("hero.card3Label"), sublabel: t("hero.card3Value") },
    { ...accordionImages[3], label: t("hero.card4Label"), sublabel: t("hero.card4Value") },
  ];

  return (
    <section className="relative overflow-x-clip bg-[--color-bg-primary] dark:bg-[--color-bg-inverted]">

      <div className="relative w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pb-16 pt-6 lg:pb-20 lg:pt-8">

        {/* ─── Main split grid ──────────────────────────────────────────────── */}
        <div className="grid items-center gap-10 lg:grid-cols-[3fr_2fr] xl:grid-cols-2 xl:gap-14">

          {/* LEFT: copy + CTAs */}
          <div className="scroll-animate fade-in-up">

            {/* Title */}
            <div className="mt-6 space-y-4">
              <h1 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-slate-dark dark:text-ivory-light sm:text-6xl lg:text-[3rem] xl:text-[4.5rem]">
                <span className="block text-clay">
                  {t("hero.titleLine1")}
                </span>
                <span className="block text-black dark:text-white">
                  {t("hero.titleLine2")}
                </span>
              </h1>
              <p className="text-xl font-semibold text-slate-medium dark:text-cloud-medium lg:text-2xl">
                {t("hero.subtitle")}
              </p>
              <p className="max-w-lg text-base leading-relaxed text-slate-medium dark:text-cloud-medium lg:text-lg">
                {t("hero.description1")}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="default" onClick={onWhatsApp}>
                {t("hero.ctaDemo")}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services" className="flex items-center gap-2">
                  {t("hero.ctaServices")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: image accordion */}
          <div className="hidden lg:block scroll-animate fade-in-up">
            <div className="overflow-x-auto lg:overflow-visible">
              <ImageAccordion
                items={accordionItems}
                initialActiveIndex={0}
                itemHeight="h-[480px] xl:h-[540px]"
                className="min-w-[360px] lg:min-w-0"
              />
            </div>
          </div>
        </div>

        {/* ─── Bottom: trust bullets ────────────────────────────────────────── */}
        <div className="scroll-animate fade-in-up mt-10">
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {bulletPoints.map(({ icon: Icon, key, href }) => (
              <Link
                key={key}
                href={href}
                scroll
                className="block rounded-a-m focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
              >
                <div
                  className={`group flex h-full items-center gap-3 rounded-a-m border border-[--color-border-subtle] px-4 py-3 transition-colors duration-300 cursor-pointer hover:bg-clay hover:border- dark:border-white/10
                    ${isDark
                      ? "bg-[rgba(250,249,245,0.05)]"
                      : "bg-[rgba(255,255,255,0.55)]"
                    }
                  `}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center 
                                    rounded-a-s bg-clay/10 text-clay 
                                      transition-colors duration-300
                                        group-hover:bg-white/20 group-hover:text-white">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </span>
                  <p className="text-sm md:text-base text-slate-dark dark:text-ivory-light
                                transition-colors duration-300
                                group-hover:text-white">{t(key)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
