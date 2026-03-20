"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Microscope,
  ShieldCheck,
  Sparkles,
  SquareStack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import { HubIllustration } from "@/components/ui/hub-illustration";
import { HUB_FIGURES } from "@/components/ui/hub-figures";
import dynamic from "next/dynamic";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { useLocale, useTranslations } from "next-intl";
import Footer from "@/components/ui/footer";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  ssr: false,
  loading: () => <WhatsAppBubbleSkeleton />,
});

const cardClass =
  "rounded-[2rem] border border-[--color-border-subtle] bg-white/82 shadow-[0_24px_90px_-60px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]";
const softCardClass =
  "rounded-[1.5rem] border border-[--color-border-subtle] bg-[--swatch--ivory-light]/85 dark:border-white/10 dark:bg-white/[0.04]";
const darkCardClass =
  "rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] text-white shadow-[0_24px_90px_-58px_rgba(0,0,0,0.56)] dark:border-white/10";

type LandingMetric = {
  label: string;
  value: string;
  detail: string;
};

type LandingUseCase = {
  tag: string;
  title: string;
  description: string;
  bullets: string[];
};

type LandingFaq = {
  tag?: string;
  question: string;
  answer: string;
};

type LandingHubPlatform = {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  figureKey: keyof typeof HUB_FIGURES;
  colorScheme: "indigo" | "cyan";
  label: string;
  sublabel: string;
};

type LandingHub = {
  title: string;
  subtitle?: string;
  bgTheme?: "indigo" | "cyan" | "green" | "purple";
  platforms: LandingHubPlatform[];
};

type LandingCta = {
  label: string;
  href: string;
  bgColor: string;
};

export type LandingPageContent = {
  slug: string;
  heroImage?: string;
  heroImagePosition?: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  heroBadge: string;
  heroCtaLabel: string;
  secondaryCtaLabel: string;
  serviceType: string;
  areaServed: string;
  valueProps: string[];
  metrics: LandingMetric[];
  outcomes: string[];
  steps: string[];
  useCases: LandingUseCase[];
  technologyFaqs: LandingFaq[];
  keywords: string[];
  hub?: LandingHub;
  cta?: LandingCta;
};

export default function LandingPageView({
  content,
  architectureOverride,
}: {
  content: LandingPageContent;
  architectureOverride?: ReactNode;
}) {
  const locale = useLocale();
  const tUi = useTranslations("landingUi");
  const isEn = locale.startsWith("en");

  const heroCtaHref = `/${isEn ? "en" : "es"}/contact`;
  const jumpToFormHref = "#landing-contact";
  const whatsappText = isEn
    ? `I want to scope ${content.serviceType.toLowerCase()} with Ordinaly`
    : `Quiero definir ${content.serviceType.toLowerCase()} con Ordinaly`;
  const secondaryCtaHref = `https://wa.me/34626270806?text=${encodeURIComponent(whatsappText)}`;
  const floatingCtaLabel = content.cta?.label ?? null;
  const floatingCtaHref = content.cta?.href ?? secondaryCtaHref;
  const floatingCtaBg = content.cta?.bgColor ?? "#0255D5";

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.technologyFaqs?.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    [content.technologyFaqs],
  );

  const serviceSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: content.title,
      serviceType: content.serviceType,
      areaServed: content.areaServed,
      provider: {
        "@type": "LocalBusiness",
        name: "Ordinaly Software S.L.",
        url: "https://ordinaly.ai",
        telephone: "+34 626 270 806",
        email: "info@ordinaly.ai",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Plaza del Duque de la Victoria 1, 3º 9",
          addressLocality: "Sevilla",
          addressRegion: "Andalucía",
          addressCountry: "ES",
        },
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        areaServed: content.areaServed,
      },
      keywords: content.keywords,
      hasFAQ: faqSchema,
    }),
    [content.areaServed, content.keywords, content.serviceType, content.title, faqSchema],
  );

  const ui = {
    blueprint: tUi("blueprint"),
    measuredDelivery: tUi("measuredDelivery"),
    service: tUi("service"),
    coverage: tUi("coverage"),
    delivery: tUi("delivery"),
    deliveryText: tUi("deliveryText"),
    metrics: tUi("metrics"),
    metricsText: tUi("metricsText"),
    kpis: tUi("kpis"),
    process: tUi("process"),
    processText: tUi("processText"),
    useCases: tUi("useCases"),
    useCasesText: tUi("useCasesText"),
    faq: tUi("faq"),
    ready: tUi("ready"),
    readyText: tUi("readyText"),
    keywords: tUi("keywords"),
    architecture: tUi("architecture"),
    contactEyebrow: tUi("contactEyebrow"),
    contactTitle: tUi("contactTitle"),
    contactText: tUi("contactText"),
    response: tUi("response"),
    responseText: tUi("responseText"),
    startNow: tUi("startNow"),
  };

  const contactHighlights = [
    { label: ui.service, value: content.serviceType },
    { label: ui.coverage, value: content.areaServed },
    { label: ui.response, value: ui.responseText },
  ];

  return (
    <div className="relative overflow-hidden bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.14),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.22),transparent_60%)]" />
        <div className="absolute left-[8%] top-56 h-44 w-44 rounded-full bg-[#0255D5]/8 blur-3xl dark:bg-[#0255D5]/16" />
        <div className="absolute right-[7%] top-[22rem] h-52 w-52 rounded-full bg-clay/10 blur-3xl" />
      </div>

      <div className="relative u-container pb-24 pt-10 lg:pb-28 lg:pt-12">
        <div className="flex flex-col gap-6 lg:gap-8">
          <section className={`${cardClass} overflow-hidden p-6 md:p-8 lg:p-10`}>
            <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
              <div>
                <div className="flex flex-wrap gap-3">
                  <span className="label-meta inline-flex items-center gap-2 rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-4 py-2 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {content.heroBadge}
                  </span>
                  <span className="label-meta inline-flex items-center gap-2 rounded-full border border-[#0255D5]/15 bg-white/70 px-4 py-2 text-slate-dark dark:border-white/10 dark:bg-white/[0.06] dark:text-ivory-light">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0255D5] dark:text-[#7DB5FF]" />
                    {ui.blueprint}
                  </span>
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-[3.8rem]">
                  {content.title}
                </h1>
                <p className="mt-4 max-w-3xl text-xl font-semibold leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {content.subtitle}
                </p>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {content.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="cobalt">
                    <Link href={heroCtaHref}>{content.heroCtaLabel}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href={jumpToFormHref}>{ui.startNow}</a>
                  </Button>
                  <Button asChild size="lg" variant="whatsapp">
                    <a href={secondaryCtaHref} target="_blank" rel="noopener noreferrer">
                      {content.secondaryCtaLabel}
                    </a>
                  </Button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className={`${softCardClass} p-5`}>
                    <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.service}</p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-dark dark:text-ivory-light">
                      {content.serviceType}
                    </p>
                  </div>
                  <div className={`${softCardClass} p-5`}>
                    <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.coverage}</p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-dark dark:text-ivory-light">
                      {content.areaServed}
                    </p>
                  </div>
                  <div className={`${softCardClass} p-5`}>
                    <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.delivery}</p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-dark dark:text-ivory-light">
                      {ui.deliveryText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="relative min-h-[340px] overflow-hidden rounded-[1.75rem] border border-[--color-border-subtle] bg-[#0f172a] shadow-[0_28px_80px_-50px_rgba(15,23,42,0.5)] dark:border-white/10 lg:min-h-[420px]">
                  <Image
                    src={content.heroImage || "/static/backgrounds/services_background.webp"}
                    alt={content.title}
                    fill
                    priority
                    className="object-cover"
                    style={{ objectPosition: content.heroImagePosition ?? "center" }}
                    sizes="(min-width: 1280px) 520px, (min-width: 768px) 60vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                    {ui.measuredDelivery}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="label-meta text-white/65">{content.areaServed}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{content.serviceType}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {content.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {(content.metrics ?? []).map((metric) => (
                    <div key={metric.label} className={`${softCardClass} p-5`}>
                      <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{metric.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-dark dark:text-ivory-light">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                        {metric.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {content.valueProps.map((item, idx) => (
              <div key={idx} className={`${cardClass} p-5 md:p-6`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#0255D5]/10 text-[#0255D5] dark:bg-[#0255D5]/16 dark:text-[#7DB5FF]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">{item}</p>
              </div>
            ))}
          </section>

          {architectureOverride ? (
            <section className={`${cardClass} overflow-hidden p-0`}>
              {architectureOverride}
            </section>
          ) : content.hub ? (
            <section className={`${cardClass} overflow-hidden p-0`}>
              <div className="border-b border-[--color-border-subtle] px-6 py-4 dark:border-white/10 md:px-8">
                <div className="flex items-center gap-2 text-[#0255D5] dark:text-[#7DB5FF]">
                  <SquareStack className="h-4 w-4" />
                  <span className="label-meta text-inherit">{ui.architecture}</span>
                </div>
              </div>
              <HubIllustration
                title={content.hub.title}
                subtitle={content.hub.subtitle}
                bgTheme={content.hub.bgTheme}
                platforms={content.hub.platforms.map((platform) => ({
                  position: platform.position,
                  label: platform.label,
                  sublabel: platform.sublabel,
                  colorScheme: platform.colorScheme,
                  figure: HUB_FIGURES[platform.figureKey],
                }))}
              />
            </section>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
            <div className={`${cardClass} p-6 md:p-8`}>
              <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.metrics}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{ui.kpis}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                {ui.metricsText}
              </p>
              <ul className="mt-6 space-y-4">
                {content.outcomes.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0255D5]/10 text-[#0255D5] dark:bg-[#0255D5]/16 dark:text-[#7DB5FF]">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${cardClass} p-6 md:p-8`}>
              <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.process}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{ui.process}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                {ui.processText}
              </p>
              <ol className="mt-6 space-y-4">
                {content.steps.map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0255D5]/10 text-sm font-semibold text-[#0255D5] dark:bg-[#0255D5]/16 dark:text-[#7DB5FF]">
                      {idx + 1}
                    </span>
                    <span className="pt-1 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="space-y-6">
            <div className={`${cardClass} p-6 md:p-8`}>
              <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.useCases}</p>
              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <h2 className="text-3xl font-semibold tracking-[-0.03em]">{ui.useCases}</h2>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {ui.useCasesText}
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {content.useCases.map((useCase) => (
                <div key={useCase.title} className={`${cardClass} p-6`}>
                  <span className="label-meta inline-flex rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-3 py-1 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
                    {useCase.tag}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{useCase.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                    {useCase.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {useCase.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm text-slate-medium dark:text-cloud-medium">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0255D5]/10 text-[#0255D5] dark:bg-[#0255D5]/16 dark:text-[#7DB5FF]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr] xl:items-start">
            <div className={`${cardClass} p-6 md:p-8`}>
              <div className="flex items-center gap-2 text-[#0255D5] dark:text-[#7DB5FF]">
                <Microscope className="h-4 w-4" />
                <span className="label-meta text-inherit">{ui.faq}</span>
              </div>
              <div className="mt-5 divide-y divide-[--color-border-subtle] dark:divide-white/10">
                {content.technologyFaqs.map((faq, idx) => (
                  <details key={faq.question} className="group py-4" open={idx === 0}>
                    <summary className="flex cursor-pointer items-start justify-between gap-3 text-base font-medium text-slate-dark dark:text-ivory-light">
                      <div className="space-y-2">
                        {faq.tag ? (
                          <span className="label-meta inline-flex rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-3 py-1 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
                            {faq.tag}
                          </span>
                        ) : null}
                        <span className="block">{faq.question}</span>
                      </div>
                      <span className="text-[#0255D5] transition-transform group-open:rotate-45 dark:text-[#7DB5FF]">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <div className={`${cardClass} bg-[linear-gradient(135deg,rgba(2,85,213,0.08),rgba(214,119,63,0.08),rgba(255,255,255,0.92))] p-6 md:p-8 dark:bg-[linear-gradient(135deg,rgba(2,85,213,0.16),rgba(214,119,63,0.12),rgba(255,255,255,0.04))]`}>
              <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.ready}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{content.heroCtaLabel}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                {ui.readyText}
              </p>

              <div className="mt-6 grid gap-4">
                <div className={`${softCardClass} p-5`}>
                  <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.keywords}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {content.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-[#0255D5]/15 bg-white/70 px-3 py-1 text-xs font-medium text-slate-dark dark:border-white/10 dark:bg-white/[0.06] dark:text-ivory-light"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`${softCardClass} p-5`}>
                  <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.coverage}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                    {content.areaServed}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button asChild size="lg" variant="cobalt">
                  <Link href={heroCtaHref}>{content.heroCtaLabel}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="justify-between border-[#0255D5]/20 text-[#0255D5] hover:bg-[#0255D5]/5 dark:border-[#7DB5FF]/20 dark:text-[#7DB5FF] dark:hover:bg-white/5"
                >
                  <a href={secondaryCtaHref} target="_blank" rel="noopener noreferrer">
                    {content.secondaryCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </section>

          <section id="landing-contact" className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
            <div className={`${darkCardClass} p-6 md:p-8`}>
              <p className="label-meta text-white/60">{ui.contactEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{ui.contactTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{ui.contactText}</p>
              <div className="mt-8 space-y-4">
                {contactHighlights.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/85">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardClass} overflow-hidden`}>
              <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
            </div>
          </section>
        </div>
      </div>

      <Footer />

      <WhatsAppBubble />

      {floatingCtaLabel ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Button
            asChild
            size="lg"
            className="whitespace-nowrap rounded-full px-8 py-4 text-base font-bold shadow-2xl transition-transform hover:scale-105"
            style={{ backgroundColor: floatingCtaBg }}
          >
            <a href={floatingCtaHref} target="_blank" rel="noopener noreferrer">
              <Sparkles className="mr-2 h-5 w-5" />
              {floatingCtaLabel}
            </a>
          </Button>
        </div>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
