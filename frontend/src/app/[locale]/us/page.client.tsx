"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { WorkWithUsSection } from "@/components/ui/work-with-us";
import { Timeline } from "@/components/ui/timeline";
import { Rocket, ArrowRight, Users, Sparkle } from "lucide-react";

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

  const testimonials = [
    {
      quote: t("testimonials.1.quote"),
      name: t("testimonials.1.name"),
      designation: t("testimonials.1.role"),
      src: "/static/team/antonio.webp",
    },
    {
      quote: t("testimonials.2.quote"),
      name: t("testimonials.2.name"),
      designation: t("testimonials.2.role"),
      src: "/static/team/guillermo.webp",
    },
    {
      quote: t("testimonials.3.quote"),
      name: t("testimonials.3.name"),
      designation: t("testimonials.3.role"),
      src: "/static/team/emilio.webp",
    },
  ];

  const timelineMedia = {
    "1": "/static/us/story_01.webp",
    "2": "/static/us/story_02.webp",
    "3": "/static/us/story_03.webp",
    "4": "/static/us/story_04.webp",
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
    <div className="bg-[#F9FAFB] dark:bg-[#0b1220] text-gray-900 dark:text-white min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#22A60D]/10 via-[#3FB89D]/10 to-[#623CEA]/15 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#22A60D] font-semibold">
                <Sparkle className="h-4 w-4" />
                {t("hero.tagline")}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {t("hero.title")}
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-[#22A60D] hover:bg-[#1c8d0c] text-white gap-2" asChild>
                  <a href="#testimonials">
                  <Rocket className="h-4 w-4" />
                  {t("hero.ctaPrimary")}
                  </a>
                </Button>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700 gap-2" asChild>
                  <a href="#cta">
                  <ArrowRight className="h-4 w-4" />
                  {t("hero.ctaSecondary")}
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-white/40 dark:bg-white/5 blur-3xl rounded-full" />
              <div className="relative rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 shadow-2xl bg-gradient-to-br from-white/70 to-white/40 dark:from-white/5 dark:to-white/0 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/90 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 p-4 space-y-2 shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("hero.missionLabel")}</p>
                    <p className="text-lg font-semibold">{t("mission.title")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("mission.body")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/90 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 p-4 space-y-2 shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("hero.visionLabel")}</p>
                    <p className="text-lg font-semibold">{t("vision.title")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("vision.body")}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-[#22A60D] text-white p-4 flex items-center gap-3 shadow-lg">
                    <Users className="h-8 w-8" />
                    <div>
                      <p className="text-sm opacity-90">{t("stats.teamLabel")}</p>
                      <p className="text-2xl font-bold">{t("stats.teamValue")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
          <h3 className="text-3xl font-bold mb-6">{t("testimonials.title")}</h3>
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </section>

      <WorkWithUsSection id="cta" />
      <Footer />
    </div>
  );
}
