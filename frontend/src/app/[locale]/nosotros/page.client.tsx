"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FaqAccordion, type FaqAccordionItem } from "@/components/ui/faq-accordion";
import { WorkWithUsSection } from "@/components/about/work-with-us";
import { PrinciplesSection } from "@/components/about/principles";
import { AboutHero } from "@/components/about/about-hero";
import { Linkedin } from "lucide-react";

const Footer = dynamic(() => import("@/components/ui/footer"), {
  ssr: false,
  loading: () => (
    <footer className="border-t border-[--color-border-subtle] dark:border-white/10 py-12 px-4 sm:px-6 lg:px-8 bg-ivory-light dark:bg-slate-dark animate-pulse">
      <div className="max-w-7xl mx-auto h-10 bg-oat dark:bg-slate-medium rounded-a-s" />
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

  const faqItems: FaqAccordionItem[] = [
    {
      question: t("about.whatQuestion"),
      answer: t.rich("about.whatAnswer", {
        link: (chunks) => (
          <Link href="/consultora-tecnologica-sevilla" className="font-semibold text-clay underline underline-offset-2 hover:text-clay/80">
            {chunks}
          </Link>
        ),
      }),
    },
    { question: t("about.goalQuestion"), answer: t("about.goalAnswer") },
  ];

  return (
    <div className="bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light min-h-screen mt-[-20px]">
      <AboutHero />

      {/* Team */}
      <section className="bg-ivory-medium dark:bg-slate-dark border-y border-[--color-border-subtle] dark:border-white/10" id="team">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h3 className="font-serif text-3xl font-normal text-slate-dark dark:text-ivory-light mb-10">{t("testimonials.title")}</h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-a-l border border-[--color-border-subtle] dark:border-white/10 bg-ivory-light dark:bg-slate-medium p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-a-m">
                  <Image src={member.src} alt={member.name} fill sizes="160px" className="object-cover" />
                </div>
                <h4 className="mt-5 text-lg font-semibold text-slate-dark dark:text-ivory-light">{member.name}</h4>
                <h2 className="mt-1 text-sm font-medium uppercase tracking-[0.017em] text-clay">{member.role}</h2>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`LinkedIn — ${member.name}`}
                    className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-oat text-slate-medium transition-colors hover:bg-[#0A66C2] hover:text-white dark:bg-slate-dark dark:text-cloud-medium"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PrinciplesSection id="principles" />

      <FaqAccordion titleTag="h3" title={t("faq.title")} items={faqItems} />

      <WorkWithUsSection id="cta" className="mb-16 md:mb-24" />

      <Footer />
    </div>
  );
}
