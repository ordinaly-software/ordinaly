"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaqAccordion, type FaqAccordionItem } from "@/components/ui/faq-accordion";
import { WorkWithUsSection } from "@/components/ui/work-with-us";
import { Timeline } from "@/components/about/timeline";
import { AboutHero } from "@/components/about/about-hero";
import { Linkedin } from "lucide-react";

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
    "2": "/static/about/story_02.webp",
    "3": "/static/about/story_03.webp",
    "4": "/static/about/story_04.webp",
  } as const;

  const timelineData = (["1", "2", "3", "4"] as const).map((key) => {
    return {
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
    };
  });

  const faqItems: FaqAccordionItem[] = [
    { question: t("about.whatQuestion"), answer: t("about.whatAnswer") },
    { question: t("about.goalQuestion"), answer: t("about.goalAnswer") },
  ];

  return (
    <div className="bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light min-h-screen mt-[-20px]">
      <AboutHero />

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
          title={t("story.title")}
          titleClassName="text-3xl md:text-5xl font-bold text-clay dark:text-clay"
          className="bg-transparent dark:bg-transparent"
        />
      </section>

      <FaqAccordion titleTag="h3" title={t("faq.title")} items={faqItems} />

      <WorkWithUsSection id="cta" className="mb-16 md:mb-24" />

      <Footer />
    </div>
  );
}
