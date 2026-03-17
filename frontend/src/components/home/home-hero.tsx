"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Book, Bot, Building2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { icon: Building2, key: "hero.trust1", href: "#services" },
  { icon: Bot, key: "hero.trust2", href: "#services" },
  { icon: Book, key: "hero.trust3", href: "#courses" },
  { icon: ArrowRight, key: "hero.trust4", href: "#courses" },
];

const heroContextCards = [
  { icon: Building2, labelKey: "hero.localCardLabel", valueKey: "hero.localCardValue" },
  { icon: MapPin, labelKey: "hero.coverageCardLabel", valueKey: "hero.coverageCardValue" },
  { icon: Bot, labelKey: "hero.deliveryCardLabel", valueKey: "hero.deliveryCardValue" },
];

export function HomeHero({ t, onWhatsApp }: HeroProps) {
  const { isDark } = useTheme();

  return (
    <section className="relative overflow-hidden bg-[--color-bg-primary] dark:bg-[--color-bg-inverted]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.12),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.2),transparent_60%)]" />
        <div className="absolute left-1/2 top-[18rem] h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-clay/12 blur-3xl" />
      </div>

      <div className="relative u-container pb-16 pt-14 lg:pb-20 lg:pt-16">
        <div className="scroll-animate fade-in-up mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <div
              className="label-meta inline-flex items-center gap-2 rounded-full border border-[--color-border-subtle] px-4 py-2 backdrop-blur-sm dark:border-white/10"
              style={{ backgroundColor: isDark ? "rgba(250,249,245,0.06)" : "rgba(250,249,245,0.82)" }}
            >
              <MapPin className="h-3.5 w-3.5 text-clay" strokeWidth={1.5} />
              <span>{t("hero.locationBadge")}</span>
            </div>
            <div
              className="label-meta inline-flex items-center gap-2 rounded-full border border-[--color-border-subtle] px-4 py-2 backdrop-blur-sm dark:border-white/10"
              style={{ backgroundColor: isDark ? "rgba(250,249,245,0.06)" : "rgba(250,249,245,0.7)" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-cobalt" strokeWidth={1.5} />
              <span>{t("hero.coverageBadge")}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-slate-dark dark:text-ivory-light sm:text-6xl lg:text-[5.5rem]">
              <span className="block">{t("hero.titleLine1")}</span>
              <span className="block text-clay">{t("hero.titleLine2")}</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl font-semibold text-slate-medium dark:text-cloud-medium lg:mx-0 lg:text-2xl">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium lg:mx-0 lg:text-lg">
              {t("hero.description1")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
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

        <div className="scroll-animate fade-in-up mt-12">
          <div
            className="overflow-hidden rounded-[2rem] border border-[--color-border-subtle] p-4 shadow-[0_30px_120px_-60px_rgba(2,85,213,0.55)] dark:border-[--color-border-strong] sm:p-6 lg:p-8"
            style={{
              background: isDark
                ? "linear-gradient(180deg, rgba(61,61,58,0.92) 0%, rgba(20,20,19,0.96) 100%)"
                : "linear-gradient(180deg, rgba(250,249,245,0.96) 0%, rgba(240,238,230,0.94) 100%)",
            }}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {heroContextCards.map(({ icon: Icon, labelKey, valueKey }) => (
                <div
                  key={labelKey}
                  className="rounded-[1.5rem] border border-[--color-border-subtle] p-5 dark:border-white/10"
                  style={{ backgroundColor: isDark ? "rgba(250,249,245,0.04)" : "rgba(255,255,255,0.55)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-clay/12 text-clay">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <p className="label-meta">{t(labelKey)}</p>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-dark dark:text-ivory-light">
                    {t(valueKey)}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="relative mt-6 overflow-hidden rounded-[2rem] border border-[--color-border-subtle] px-4 pt-6 dark:border-white/10 sm:px-6 lg:px-8 lg:pt-8"
              style={{
                background: isDark
                  ? "radial-gradient(circle at 50% 24%, rgba(2,85,213,0.26), rgba(20,20,19,0.98) 64%)"
                  : "radial-gradient(circle at 50% 24%, rgba(2,85,213,0.16), rgba(250,249,245,0.94) 66%)",
              }}
            >
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute left-1/2 top-14 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full border border-white/10" />
                <div className="absolute left-1/2 top-24 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-white/5" />
                <div className="absolute bottom-10 left-10 h-28 w-28 rounded-full bg-clay/15 blur-3xl" />
                <div className="absolute right-10 top-10 h-28 w-28 rounded-full bg-cobalt/20 blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="mb-4 flex justify-center">
                  <div className="label-meta inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-ivory-light backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5 text-clay" strokeWidth={1.5} />
                    <span>{t("hero.globeCaption")}</span>
                  </div>
                </div>
              </div>

              <div className="absolute left-4 top-4 hidden max-w-[14rem] rounded-[1.25rem] border border-white/15 bg-white/10 p-4 text-left backdrop-blur-xl xl:block">
                <p className="label-meta text-white/65">{t("hero.localCardLabel")}</p>
                <p className="mt-2 text-base font-semibold text-white">{t("hero.globeFloatingTop")}</p>
              </div>

              <div className="absolute bottom-5 right-4 hidden max-w-[18rem] rounded-[1.25rem] border border-white/15 bg-black/30 p-4 text-left backdrop-blur-xl xl:block">
                <p className="label-meta text-white/65">{t("hero.coverageCardLabel")}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{t("hero.globeFloatingBottom")}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {bulletPoints.map(({ icon: Icon, key, href }) => (
                <Link
                  key={key}
                  href={href}
                  scroll
                  className="block rounded-a-m focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                >
                  <div
                    className="flex h-full items-center gap-3 rounded-a-m border border-[--color-border-subtle] px-4 py-3 transition-colors dark:border-white/10"
                    style={{ backgroundColor: isDark ? "rgba(250,249,245,0.05)" : "rgba(255,255,255,0.55)" }}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-a-s bg-clay/10 text-clay">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </span>
                    <p className="text-sm md:text-base text-slate-dark dark:text-ivory-light">{t(key)}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[--color-border-subtle] dark:bg-white/10" />
                <span className="label-meta">{t("hero.clientsTitle")}</span>
                <div className="h-px flex-1 bg-[--color-border-subtle] dark:bg-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {clientLogos.map((logo) => (
                  <div
                    key={logo.alt}
                    className="flex items-center justify-center rounded-a-m border border-[--color-border-subtle] px-3 py-3 dark:border-white/10"
                    style={{ backgroundColor: isDark ? "rgba(250,249,245,0.05)" : "rgba(255,255,255,0.5)" }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="max-h-10 w-auto opacity-90"
                      style={{
                        filter: isDark
                          ? "brightness(1.1) invert(0)"
                          : "invert(1) brightness(0.15) contrast(1.1)",
                      }}
                      loading="lazy"
                      sizes="(max-width: 640px) 80px, 112px"
                      quality={60}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
