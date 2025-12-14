"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Rocket, Heart, Target, ArrowRight, Users, Sparkle } from "lucide-react";

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

  const milestones = [
    { year: "2021", title: t("story.2021.title"), body: t("story.2021.body") },
    { year: "2022", title: t("story.2022.title"), body: t("story.2022.body") },
    { year: "2023", title: t("story.2023.title"), body: t("story.2023.body") },
    { year: "2024", title: t("story.2024.title"), body: t("story.2024.body") },
  ];

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
                <Button className="bg-[#22A60D] hover:bg-[#1c8d0c] text-white gap-2">
                  <Rocket className="h-4 w-4" />
                  {t("hero.ctaPrimary")}
                </Button>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700 gap-2">
                  <ArrowRight className="h-4 w-4" />
                  {t("hero.ctaSecondary")}
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-[#22A60D]" />
          <p className="text-sm uppercase tracking-[0.18em] text-[#22A60D] font-semibold">
            {t("values.eyebrow")}
          </p>
        </div>
        <h2 className="text-3xl font-bold">{t("values.title")}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {["1", "2", "3"].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-5 shadow-sm"
            >
              <p className="text-lg font-semibold mb-2">{t(`values.items.${key}.title`)}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t(`values.items.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-[#22A60D] font-semibold">
              {t("story.eyebrow")}
            </p>
            <h3 className="text-3xl font-bold">{t("story.title")}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t("story.lead")}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {milestones.map((item) => (
              <div
                key={item.year}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4 shadow-sm"
              >
                <p className="text-sm text-[#22A60D] font-semibold">{item.year}</p>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h3 className="text-3xl font-bold mb-6">{t("testimonials.title")}</h3>
          <AnimatedTestimonials testimonials={testimonials} autoplay />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-[#22A60D] font-semibold">
            {t("cta.eyebrow")}
          </p>
          <h3 className="text-3xl font-bold">{t("cta.title")}</h3>
          <p className="text-gray-700 dark:text-gray-300">{t("cta.body")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-[#22A60D] hover:bg-[#1c8d0c] text-white gap-2">
            <Target className="h-4 w-4" />
            {t("cta.primary")}
          </Button>
          <Button variant="outline" className="border-gray-200 dark:border-gray-700">
            {t("cta.secondary")}
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
