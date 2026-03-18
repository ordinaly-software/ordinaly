"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedTestimonials } from "@/components/about/animated-testimonials";
import { WorkWithUsSection } from "@/components/ui/work-with-us";
import { Timeline } from "@/components/about/timeline";
import { Rocket, ArrowRight } from "lucide-react";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { TestimonialsSection } from "@/components/home/testimonials-section";

// Partner logo image components for LogoCarousel
const partnerLogos: { name: string; id: number; img: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  "/static/logos/logo_aviva_publicidad_small.webp",
  "/static/logos/logo_grupo_addu_small.webp",
  "/static/logos/logo_proinca_consultores_small.webp",
  "/static/logos/logo_guadalquivir_fincas_small.webp",
  "/static/logos/logo_esau.webp",
  "/static/logos/logo_geesol.webp",
].map((src, i) => ({
  name: src,
  id: i + 1,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  img: ({ className }: React.SVGProps<SVGSVGElement>) => <img src={src} alt="" className={`object-contain invert brightness-0 contrast-100 ${className ?? ""}`} />,
}));

const Footer = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924] animate-pulse">
      <div className="max-w-7xl mx-auto h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </footer>
  ),
});

export default function UsPage() {
  const t = useTranslations("usPage");
  const t_home = useTranslations("home");
  const locale = useLocale();
  const isEs = locale.startsWith("es");

  const factSheet = [
    { label: isEs ? "Nombre legal" : "Legal name", value: "Ordinaly Software S.L." },
    { label: isEs ? "Sede" : "Office", value: "Plaza del Duque de la Victoria 1, 3º 9, Sevilla" },
    { label: "Email", value: "info@ordinaly.ai" },
    { label: isEs ? "Teléfono" : "Phone", value: "+34 626 270 806" },
  ];

  const testimonials = [
    {
      quote: t("testimonials.1.quote"),
      name: t("testimonials.1.name"),
      designation: t("testimonials.1.role"),
      src: "/static/team/antonio_hd.webp",
      linkedin: "https://www.linkedin.com/in/antoniommff/",
    },
    {
      quote: t("testimonials.2.quote"),
      name: t("testimonials.2.name"),
      designation: t("testimonials.2.role"),
      src: "/static/team/guillermo_hd.webp",
      linkedin: "https://www.linkedin.com/in/guillermomontero/",
    },
    {
      quote: t("testimonials.3.quote"),
      name: t("testimonials.3.name"),
      designation: t("testimonials.3.role"),
      src: "/static/team/emilio_hd.webp",
      linkedin: "https://www.linkedin.com/in/emiliocidperez/",
    },
  ];

  const timelineMedia = {
    "1": "/static/about/story_01.webp",
    "2": "/static/about/story_02.webp",
    "3": "/static/about/story_03.webp",
    "4": "/static/about/story_04.webp",
  } as const;

  const timelineData = (["1", "2", "3", "4"] as const).map((key) => ({
    title: t(`story.timeline.${key}.title`),
    media: (
      <Image
        src={timelineMedia[key]}
        alt={t(`story.timeline.${key}.title`)}
        fill
        sizes="(min-width: 1024px) 224px, 100vw"
        className="object-cover"
        priority={key === "1"}
      />
    ),
    content: <p>{t(`story.timeline.${key}.body`)}</p>,
  }));

  return (
    <div className="bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light min-h-screen mt-[-20px]">
      {/* Hero */}
      <section className="relative border-b border-[--color-border-subtle] dark:border-[--color-border-strong] overflow-hidden">
        <Image
          src="/static/about/story_01.webp"
          alt=""
          fill
          className="object-cover blur-sm scale-105 opacity-60 dark:opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-[--color-bg-primary]/70 dark:bg-[--color-bg-inverted]/80" />
        <div className="relative u-container pb-14 pt-10 md:pb-20 md:pt-12">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl text-slate-dark dark:text-ivory-light">
                {t("hero.title")}
              </h1>
              <p className="text-xl leading-relaxed text-slate-medium dark:text-cloud-medium max-w-xl">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild>
                  <a href="#testimonials">
                    <Rocket className="h-4 w-4 mr-2" />
                    {t("hero.ctaPrimary")}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#cta">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t("hero.ctaSecondary")}
                  </a>
                </Button>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.04] space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">{t("hero.missionLabel")}</p>
                <p className="text-base font-semibold text-slate-dark dark:text-ivory-light">{t("mission.title")}</p>
                <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed">{t("mission.body")}</p>
              </div>
              <div className="rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.04] space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">{t("hero.visionLabel")}</p>
                <p className="text-base font-semibold text-slate-dark dark:text-ivory-light">{t("vision.title")}</p>
                <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed">{t("vision.body")}</p>
              </div>
              <div className="col-span-2 rounded-[1.75rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-5 text-white dark:border-white/10 flex items-center gap-4">
                <div>
                  <p className="text-sm text-white/60">{t("hero.definition")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fact sheet */}
      <section className="u-container py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {factSheet.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-5 transition hover:-translate-y-1 hover:border-clay/35 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-dark dark:text-ivory-light leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="u-container pb-12">
        <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-shrink-0 lg:max-w-xs text-white space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">{t_home("partners.title")}</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                {isEs ? "Empresas que confían en nosotros" : "Companies that trust us"}
              </h2>
            </div>
            <div className="flex-1 flex justify-center overflow-hidden">
              <LogoCarousel logos={partnerLogos} columnCount={3} mobileColumnCount={2} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Timeline
          data={timelineData}
          eyebrow={t("story.eyebrow")}
          title={t("story.title")}
          description={t("story.lead")}
          className="bg-transparent dark:bg-transparent"
        />
      </section>

      <section className="bg-white dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800" id="testimonials">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h3 className="text-3xl text-gray-900 dark:text-gray-300 font-bold mb-6">{t("testimonials.title")}</h3>
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </section>

      <WorkWithUsSection id="cta" />

      <TestimonialsSection t={t_home} />
      
      <Footer />
    </div>
  );
}
