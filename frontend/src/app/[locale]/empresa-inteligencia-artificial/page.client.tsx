"use client";

import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
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
  heroCtaLabel: string;
  heroCtaHref: string;
  secondaryCtaLabel: string;
  serviceType: string;
  areaServed: string;
  metrics: LandingMetric[];
  valueProps: string[];
  outcomes: string[];
  steps: string[];
  before: string[];
  after: string[];
  useCases: LandingUseCase[];
  technologyFaqs: LandingFaq[];
  keywords: string[];
  cta?: LandingCta;
  sectionTitles?: Record<string, string>;
};

const USE_CASE_ICONS = [
  // Automation
  <svg key="auto" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Copilots
  <svg key="cop" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <circle cx="12" cy="8" r="4" strokeWidth="2" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  // Strategy
  <svg key="strat" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <path d="M12 3a4 4 0 00-4 4v1H7a4 4 0 000 8h1v1a4 4 0 008 0v-1h1a4 4 0 000-8h-1V7a4 4 0 00-4-4z" strokeWidth="2" />
  </svg>,
  // Private models
  <svg key="priv" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  // Predictive
  <svg key="pred" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Integration
  <svg key="int" width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
    <path d="M4 4h7v7H4zM13 13h7v7h-7zM4 13l7 7M13 4l7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function EmpresaInteligenciaArtificial() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["empresa-inteligencia-artificial"];
  const locale = useLocale();

  if (!content) throw new Error("Missing landing content: empresa-inteligencia-artificial");

  const isEn = locale.startsWith("en");
  const jumpToFormHref = "#empresa-ia-contact";
  const floatingCtaLabel = content.cta?.label ?? null;
  const floatingCtaHref = content.cta?.href ?? "#";
  const floatingCtaBg = content.cta?.bgColor ?? "#0255D5";

  return (
    <div className="relative overflow-hidden bg-white text-slate-900 dark:bg-neutral-950 dark:text-white">

      {/* Gradient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(ellipse_at_top,rgba(2,85,213,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(2,85,213,0.15),transparent_65%)]" />
      </div>

      <div className="relative">

        {/* ─── HERO ─── */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-6 dark:border-blue-500/20 dark:bg-blue-500/10">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {content.serviceType}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
              {content.title}
            </h1>

            <p className="text-xl font-semibold text-slate-700 dark:text-neutral-300 mb-4 leading-snug">
              {content.subtitle}
            </p>

            <p className="text-slate-500 dark:text-neutral-400 mb-10 max-w-lg leading-relaxed">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="cobalt">
                <a href={jumpToFormHref}>{content.heroCtaLabel}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#use-cases" className="flex items-center gap-2">
                  {content.secondaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Area served */}
            <p className="mt-8 text-xs text-slate-400 dark:text-neutral-500">
              {isEn ? "Available in" : "Disponible en"}: <span className="font-medium text-slate-500 dark:text-neutral-400">{content.areaServed}</span>
            </p>
          </div>

          {/* Right side: visual stats grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {content.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6 flex flex-col justify-between"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">{metric.label}</p>
                <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">{metric.detail}</p>
              </div>
            ))}
            {/* Decorative 4th cell */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex flex-col justify-end">
              <Sparkles className="h-8 w-8 text-blue-200 mb-3" />
              <p className="text-base font-bold text-white leading-snug">
                {isEn ? "AI that works in production." : "IA que funciona en producción."}
              </p>
            </div>
          </div>
        </section>

        {/* ─── METRICS (mobile) ─── */}
        <section className="lg:hidden max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {content.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">{metric.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── VALUE PROPS + OUTCOMES ─── */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-5">
              {content.sectionTitles?.valueProps}
            </p>
            <ul className="space-y-4">
              {content.valueProps.map((prop, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{prop}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-5">
              {content.sectionTitles?.outcomes}
            </p>
            <ul className="space-y-4">
              {content.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── IMPLEMENTATION STEPS ─── */}
        <section className="bg-neutral-50 dark:bg-neutral-900/50 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
              {content.sectionTitles?.steps}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
              Tu empresa de inteligencia artificial
            </h2>

            <ol className="space-y-6">
              {content.steps.map((step, i) => (
                <li key={i} className="flex gap-5 items-start">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-sm">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">{step}</p>
                    {i < content.steps.length - 1 && (
                      <div className="mt-4 ml-0.5 h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── BEFORE / AFTER ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3 text-center">
            {content.sectionTitles?.beforeAfter}
          </p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight mb-12 text-center">
            {isEn ? "The before and after is real" : "El antes y después es real"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8">
              <h3 className="font-semibold text-lg mb-5 flex items-center gap-3 text-slate-900 dark:text-neutral-200">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                </span>
                {content.sectionTitles?.before}
              </h3>
              <ul className="space-y-3">
                {content.before.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-neutral-400">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-green-100 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 p-8">
              <h3 className="font-semibold text-lg mb-5 flex items-center gap-3 text-slate-900 dark:text-neutral-200">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                </span>
                {content.sectionTitles?.after}
              </h3>
              <ul className="space-y-3">
                {content.after.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-neutral-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section id="use-cases" className="bg-neutral-50 dark:bg-neutral-900/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
              {content.sectionTitles?.useCases}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
              Empresa de inteligencia artificial en Sevilla
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.useCases.map((useCase, idx) => (
                <div
                  key={useCase.title}
                  className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                      {USE_CASE_ICONS[idx % USE_CASE_ICONS.length]}
                    </span>
                    <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                      {useCase.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{useCase.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed mb-5">
                    {useCase.description}
                  </p>
                  <ul className="space-y-2">
                    {useCase.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
            {content.sectionTitles?.technologyFaqs}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Empresa de inteligencia artificial y automatizaciones
          </h2>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {content.technologyFaqs.map((faq, idx) => (
              <details key={faq.question} className="group py-5" open={idx === 0}>
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-slate-900 dark:text-white list-none">
                  <div className="space-y-2">
                    {faq.tag && (
                      <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                        {faq.tag}
                      </span>
                    )}
                    <span className="block">{faq.question}</span>
                  </div>
                  <span className="text-blue-500 text-xl transition-transform group-open:rotate-45 flex-shrink-0 mt-1">+</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="max-w-7xl mx-auto px-6 pb-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white mb-2">
                {isEn ? "Ready to work with an AI company that delivers?" : "¿Listo para trabajar con una empresa de IA que cumple?"}
              </p>
              <p className="text-blue-200 max-w-xl leading-relaxed">
                {isEn
                  ? "Tell us your process and we'll design your first pilot in 48 hours."
                  : "Cuéntanos tu proceso y diseñamos tu primer piloto en 48 horas."}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="whitespace-nowrap shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg"
            >
              <a href={jumpToFormHref} className="flex items-center gap-2">
                {isEn ? "Start now" : "Empezar ahora"}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* ─── CONTACT FORM ─── */}
        <section id="empresa-ia-contact" className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
          </div>
        </section>

      </div>

      <Footer />
      <WhatsAppBubble />

      {/* Floating CTA */}
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
