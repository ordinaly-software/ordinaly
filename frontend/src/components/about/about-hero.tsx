"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export function AboutHero() {
  const t = useTranslations("usPage");

  const heroTitle = t("hero.title");
  const heroTitleAccent = t("hero.titleAccent");
  const heroTitleLead = heroTitleAccent && heroTitle.endsWith(heroTitleAccent)
    ? heroTitle.slice(0, heroTitle.length - heroTitleAccent.length)
    : heroTitle;

  return (
    <section className="relative overflow-hidden border-b border-[--color-border-subtle] dark:border-white/10 bg-ivory-light dark:bg-slate-dark">
      <div className="absolute -z-10 -top-24 -left-24 size-[420px] rounded-full bg-clay/20 blur-3xl" aria-hidden />
      <div className="absolute -z-10 -bottom-32 -right-16 size-[360px] rounded-full bg-oat/60 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-slate-dark dark:text-ivory-light sm:text-5xl md:text-6xl">
          {heroTitleLead}
          <span className="text-clay">{heroTitleAccent}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-medium dark:text-cloud-medium sm:text-xl">
          {t("hero.subtitle")}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="relative h-72 overflow-hidden rounded-a-l ring-1 ring-slate-dark/10 dark:ring-white/10 md:col-span-2 md:h-96">
            <Image
              src="/static/nosotros/story_01.webp"
              alt={t("hero.title")}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="relative h-48 overflow-hidden rounded-a-l ring-1 ring-slate-dark/10 dark:ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-md md:h-56">
              <Image
                src="/static/contacto/office_03.webp"
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="#team"
                className="group inline-flex items-center gap-2 font-semibold text-clay transition hover:text-clay/80"
              >
                {t("hero.ctaPrimary")}
                <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#cta"
                className="group inline-flex items-center gap-2 font-semibold text-slate-dark transition hover:text-clay dark:text-ivory-light"
              >
                {t("hero.ctaSecondary")}
                <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
