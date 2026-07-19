"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageAccordion, type AccordionImageItem } from "@/components/home/interactive-image-accordion";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HeroProps {
  t: TranslateFn;
}

const accordionImages: Omit<AccordionImageItem, "label" | "sublabel">[] = [
  {
    id: 1,
    imageUrl: "/static/contact/office_01.webp",
  },
  {
    id: 2,
    imageUrl: "/static/formacion-ia-sevilla/1-ordinaly.webp",
  },
];

export function HomeHero({ t }: HeroProps) {
  const accordionItems: AccordionImageItem[] = [
    { ...accordionImages[0], label: t("hero.card4Label"), sublabel: t("hero.card4Value") },
    { ...accordionImages[1], label: t("hero.card2Label"), sublabel: t("hero.card2Value") },
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
                <span className="block whitespace-nowrap break-normal hyphens-none text-clay">
                  {t("hero.titleLine1")}
                </span>
                <span className="block text-black dark:text-white">
                  {t("hero.titleLine2")}
                </span>
              </h1>
              <h2 className="text-xl font-semibold text-slate-medium dark:text-cloud-medium lg:text-2xl">
                {t("hero.subtitle")}
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-slate-medium dark:text-cloud-medium lg:text-lg">
                {t("hero.description1")}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="default" asChild>
                <Link href="#contacto">
                  {t("hero.ctaDemo")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/servicios" className="flex items-center gap-2">
                  {t("hero.ctaServices")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT: image accordion */}
          <div className="scroll-animate fade-in-up min-w-0">
            {/* Mobile / tablet: single static image card */}
            <div className="relative lg:hidden rounded-2xl overflow-hidden h-[300px] sm:h-[380px] w-full">
              <Image
                src={accordionItems[0].imageUrl}
                alt={`${t("hero.titleLine1")} ${t("hero.titleLine2")} – ${accordionItems[0].label}`}
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-bold text-lg leading-snug">{accordionItems[0].label}</p>
                {accordionItems[0].sublabel && (
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed line-clamp-2">
                    {accordionItems[0].sublabel}
                  </p>
                )}
              </div>
            </div>
            {/* Desktop: full interactive accordion */}
            <div className="hidden lg:block">
              <ImageAccordion
                items={accordionItems}
                initialActiveIndex={0}
                itemHeight="h-[480px] xl:h-[540px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
