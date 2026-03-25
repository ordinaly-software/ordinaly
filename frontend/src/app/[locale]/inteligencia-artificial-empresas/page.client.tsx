"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "next-intl";
import dynamic from "next/dynamic";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  ssr: false,
  loading: () => <WhatsAppBubbleSkeleton />,
});

// Static images for the 3 feature cards (matched by index to es/en content order)
const CARD_IMAGES = [
  "/static/inteligencia_artificial_empresas/Copiloto_Interno.webp",
  "/static/inteligencia_artificial_empresas/AutomatizacionProcesos.webp",
  "/static/inteligencia_artificial_empresas/ModelosPrivados_Seguros.webp",
];

type LandingMetric = { label: string; value: string; detail: string };
type LandingUseCase = { tag: string; title: string; description: string; bullets: string[] };
type LandingFaq = { tag?: string; question: string; answer: string };
type LandingCta = { label: string; href: string; bgColor: string };

type LandingPageContent = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  heroBadge: string;
  heroCtaLabel: string;
  heroCtaHref?: string;
  secondaryCtaLabel: string;
  serviceType: string;
  areaServed: string;
  cards: { title: string; description: string }[];
  steps: string[];
  valueProps: string[];
  metrics: LandingMetric[];
  outcomes: string[];
  useCases: LandingUseCase[];
  technologyFaqs: LandingFaq[];
  keywords: string[];
  cta?: LandingCta;
};

export default function InteligenciaArtificialEmpresas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["inteligencia-artificial-empresas"];
  const locale = useLocale();

  if (!content) throw new Error("Missing landing content: inteligencia-artificial-empresas");

  const isEn = locale.startsWith("en");
  const heroCtaHref = `/${isEn ? "en" : "es"}/contact`;
  const jumpToFormHref = "#ia-empresas-contact";
  const whatsappText = isEn
    ? `I want to scope ${content.serviceType.toLowerCase()} with Ordinaly`
    : `Quiero definir ${content.serviceType.toLowerCase()} con Ordinaly`;
  const secondaryCtaHref = `https://wa.me/34626270806?text=${encodeURIComponent(whatsappText)}`;
  const floatingCtaLabel = content.cta?.label ?? null;
  const floatingCtaHref = content.cta?.href ?? secondaryCtaHref;
  const floatingCtaBg = content.cta?.bgColor ?? "#e4572e";

  return (
    <div className="relative overflow-hidden bg-white text-slate-900 dark:bg-neutral-950 dark:text-white">

      {/* Gradient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(ellipse_at_top,rgba(228,87,46,0.10),transparent_65%)]" />
      </div>

      <div className="relative">

        {/* ─── HERO ─── */}
        <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight mb-5">
              {content.title}
            </h1>

            <p className="text-xl font-semibold text-slate-700 dark:text-neutral-300 mb-4">
              {content.subtitle}
            </p>

            <p className="text-slate-500 dark:text-neutral-400 mb-10 max-w-lg leading-relaxed">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="cobalt">
                <Link href={heroCtaHref}>{content.heroCtaLabel}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={jumpToFormHref}>{content.secondaryCtaLabel}</a>
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/3" }}>
              <Image
                src="/static/inteligencia_artificial_empresas/hero.webp"
                alt={content.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </section>

        {/* ─── METRICS ─── */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {content.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">{metric.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 3D FEATURE CARDS ─── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.cards.map((card, i) => (
              <CardContainer key={i} className="inter-var">
                <CardBody className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl h-full">
                  <CardItem translateZ={80} className="w-full">
                    <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "176px" }}>
                      <Image
                        src={CARD_IMAGES[i] ?? CARD_IMAGES[0]}
                        alt={card.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  </CardItem>
                  <CardItem translateZ={50} className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </CardItem>
                  <CardItem translateZ={30} className="mt-3 text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                    {card.description}
                  </CardItem>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </section>

        {/* ─── VALUE PROPS + OUTCOMES ─── */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-5">
              {isEn ? "What we deliver" : "Qué entregamos"}
            </p>
            <ul className="space-y-4">
              {content.valueProps.map((prop, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{prop}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-5">
              {isEn ? "Results you can measure" : "Resultados que mides"}
            </p>
            <ul className="space-y-4">
              {content.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── IMPLEMENTATION STEPS ─── */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">
            {isEn ? "How it works" : "Cómo lo hacemos"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-10">
            {isEn ? "Implementation sequence" : "Secuencia de implantación"}
          </h2>

          <ol className="space-y-6">
            {content.steps.map((step, i) => (
              <li key={i} className="flex gap-5 items-start">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-lg">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-slate-700 dark:text-neutral-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">
            {isEn ? "Use cases" : "Casos de uso"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-10">
            {isEn ? "Real workflows, not demos" : "Flujos reales, no demos"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {content.useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm"
              >
                <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
                  {useCase.tag}
                </span>
                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed mb-5">
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">
            {isEn ? "Technology FAQ" : "Preguntas frecuentes"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-10">
            {isEn ? "Common questions" : "Dudas habituales"}
          </h2>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {content.technologyFaqs.map((faq, idx) => (
              <details key={faq.question} className="group py-5" open={idx === 0}>
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-slate-900 dark:text-white list-none">
                  <div className="space-y-2">
                    {faq.tag && (
                      <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
                        {faq.tag}
                      </span>
                    )}
                    <span className="block">{faq.question}</span>
                  </div>
                  <span className="text-orange-500 text-xl transition-transform group-open:rotate-45 flex-shrink-0">+</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── CONTACT FORM ─── */}
        <section id="ia-empresas-contact" className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppBubble />

      {floatingCtaLabel && (
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
      )}
    </div>
  );
}
