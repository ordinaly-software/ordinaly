"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SimpleAccordion } from "@/components/ui/simple-accordion";
import { WorkWithUsSection } from "@/components/ui/work-with-us";
import { Timeline } from "@/components/about/timeline";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import { Rocket, ArrowRight, Linkedin } from "lucide-react";

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
  const locale = useLocale();
  void locale;

  const team = [
    {
      name: t("testimonials.1.name"),
      role: t("testimonials.1.role"),
      src: "/static/team/antonio_hd.webp",
      linkedin: "https://www.linkedin.com/in/antoniommff/",
    },
    {
      name: t("testimonials.2.name"),
      role: t("testimonials.2.role"),
      src: "/static/team/guillermo_hd.webp",
      linkedin: "https://www.linkedin.com/in/guillermomontero/",
    },
    {
      name: t("testimonials.3.name"),
      role: t("testimonials.3.role"),
      src: "/static/team/emilio_hd.webp",
      linkedin: "https://www.linkedin.com/in/emiliocidperez/",
    },
  ];

  const timelineMedia = {
    "1": "/static/about/story_01.webp",
    "2": "/static/about/story_03.webp",
    "3": "/logo.webp",
    "4": "/static/about/story_2026.webp",
  } as const;

  const timelineData = (["1", "2", "3", "4"] as const).map((key) => {
    const isLogo = key === "3";
    return {
      title: t(`story.timeline.${key}.title`),
      media: (
        <Image
          src={timelineMedia[key]}
          alt={t(`story.timeline.${key}.title`)}
          fill
          sizes="(min-width: 1024px) 224px, 100vw"
          className={isLogo ? "object-contain p-6" : "object-cover"}
          priority={key === "1"}
        />
      ),
      content: <p>{t(`story.timeline.${key}.body`)}</p>,
    };
  });

  // "Automatizamos con un propósito" -> bold/accent the trailing phrase in place.
  const heroTitle = t("hero.title");
  const heroTitleAccent = t("hero.titleAccent");
  const heroTitleLead = heroTitleAccent && heroTitle.endsWith(heroTitleAccent)
    ? heroTitle.slice(0, heroTitle.length - heroTitleAccent.length)
    : heroTitle;

  const qaItems = [
    { question: t("about.whatQuestion"), answer: t("about.whatAnswer") },
    { question: t("about.goalQuestion"), answer: t("about.goalAnswer") },
  ];

  return (
    <div className="bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light min-h-screen mt-[-20px]">
      {/* Hero */}
      <section className="relative border-b border-[--color-border-subtle] dark:border-[--color-border-strong]">
        <div className="relative u-container pb-14 pt-10 md:pb-20 md:pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,200px)] lg:items-center">
            {/* Left: team photo */}
            <div className="hidden lg:flex flex-col items-center gap-4">
              <DraggableCardContainer className="flex items-center justify-center [perspective:1200px]">
                <DraggableCardBody className="min-h-0 w-52 h-64 rounded-[1.5rem] bg-white p-3 shadow-xl dark:bg-neutral-900">
                  <div className="relative h-full w-full overflow-hidden rounded-[1.1rem]">
                    <Image
                      src="/static/about/story_03.webp"
                      alt={t("testimonials.title")}
                      fill
                      sizes="208px"
                      draggable={false}
                      className="pointer-events-none object-cover"
                    />
                  </div>
                </DraggableCardBody>
              </DraggableCardContainer>
              <Button asChild variant="outline" size="sm" className="dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                <a href="#team">{t("hero.ctaPrimary")}</a>
              </Button>
            </div>

            {/* Center: headline card */}
            <div className="rounded-[2rem] bg-white/82 p-7 text-center shadow-[0_24px_80px_-42px_rgba(20,20,19,0.32)] backdrop-blur-xl dark:bg-[rgba(10,16,26,0.78)] md:p-8">
              <div className="space-y-5">
                <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl text-slate-dark dark:text-ivory-light">
                  {heroTitleLead}
                  <span className="font-extrabold text-clay">{heroTitleAccent}</span>
                </h1>
                <p className="mx-auto max-w-xl text-xl leading-relaxed text-slate-medium dark:text-[#DFDDD3]">
                  {t("hero.subtitle")}
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1 lg:hidden">
                  <Button asChild variant="accent" className="shadow-lg shadow-clay/20">
                    <a href="#team">
                      <Rocket className="h-4 w-4 mr-2" />
                      {t("hero.ctaPrimary")}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <a href="#cta">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {t("hero.ctaSecondary")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: office photo */}
            <div className="hidden lg:flex flex-col items-center gap-4">
              <DraggableCardContainer className="flex items-center justify-center [perspective:1200px]">
                <DraggableCardBody className="min-h-0 w-52 h-64 rounded-[1.5rem] bg-white p-3 shadow-xl dark:bg-neutral-900">
                  <div className="relative h-full w-full overflow-hidden rounded-[1.1rem]">
                    <Image
                      src="/static/contact/office_02.webp"
                      alt=""
                      fill
                      sizes="208px"
                      draggable={false}
                      className="pointer-events-none object-cover"
                    />
                  </div>
                </DraggableCardBody>
              </DraggableCardContainer>
              <Button asChild variant="accent" size="sm" className="shadow-lg shadow-clay/20">
                <a href="#cta">{t("hero.ctaSecondary")}</a>
              </Button>
            </div>
          </div>

          {/* What is Ordinaly / what do we want to achieve */}
          <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-[--color-border-subtle] bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(10,16,26,0.78)] md:p-8">
            <SimpleAccordion items={qaItems} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800" id="team">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h3 className="text-3xl text-gray-900 dark:text-gray-300 font-bold mb-10">{t("testimonials.title")}</h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-[1.75rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-[1.25rem]">
                  <Image src={member.src} alt={member.name} fill sizes="160px" className="object-cover" />
                </div>
                <h4 className="mt-5 text-lg font-bold text-black dark:text-white">{member.name}</h4>
                <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide text-clay">{member.role}</h2>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`LinkedIn — ${member.name}`}
                    className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#0A66C2] hover:text-white dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Timeline
          data={timelineData}
          title={t("story.eyebrow")}
          titleClassName="text-3xl md:text-5xl font-bold text-clay dark:text-clay"
          description={t("story.lead")}
          className="bg-transparent dark:bg-transparent"
        />
      </section>

      <WorkWithUsSection id="cta" />

      <Footer />
    </div>
  );
}
