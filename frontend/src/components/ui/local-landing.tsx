"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MapPin, Sparkles, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
// Local landings metadata now lives under /[locale]/landings instead of /services.
import type { LocalLandingMeta } from "@/app/[locale]/landings";
import { TestimonialsSection } from "../home/testimonials-section";

const cardClass =
  "rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1729] shadow-sm";

export function LocalLandingPage({ slug, locale, meta }: { slug: string; locale: string; meta: LocalLandingMeta }) {
  const t = useTranslations("home");
  const tLanding = useTranslations(`landings.${slug}`);
  const isEn = locale.startsWith("en");

  const buildList = (base: string, count: number) =>
    Array.from({ length: count }, (_, idx) => tLanding(`${base}.${idx}`));

  const valueProps = buildList("valueProps", meta.valueProps);
  const outcomes = buildList("outcomes", meta.outcomes);
  const steps = buildList("steps", meta.steps);
  const keywords = buildList("keywords", meta.keywords);
  const faqs = Array.from({ length: meta.faqs }, (_, idx) => ({
    question: tLanding(`faqs.${idx}.q`),
    answer: tLanding(`faqs.${idx}.a`),
  }));

  const heroCtaHref = `/${isEn ? "en" : "es"}/contact`;
  const whatsappText = isEn ? "I want to automate my company with AI" : "Quiero automatizar mi empresa con IA";
  const secondaryCtaHref = `https://wa.me/34626270806?text=${encodeURIComponent(whatsappText)}`;

  const content = {
    title: tLanding("title"),
    subtitle: tLanding("subtitle"),
    description: tLanding("description"),
    heroBadge: tLanding("heroBadge"),
    heroCtaLabel: tLanding("heroCtaLabel"),
    secondaryCtaLabel: tLanding("secondaryCtaLabel"),
    serviceType: tLanding("serviceType"),
    areaServed: tLanding("areaServed"),
    keywords,
    heroImage: meta.heroImage || "/static/backgrounds/services_background.webp",
  };
  const jumpCtaLabel = isEn ? "Talk now" : "Hablar ahora";
  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    [faqs],
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

  const testimonials = isEn
    ? [
        {
          quote: "We went from hours to minutes on WhatsApp and web without losing CRM traceability.",
          name: "Retail B2C, Seville",
        },
        {
          quote: "We automated reconciliations and alerts in n8n; manual errors dropped and support is happier.",
          name: "Industrial distribution, Andalusia",
        },
        {
          quote: "AI agents handle order status and only escalate the complex cases; CSAT climbed with the same team.",
          name: "Fashion ecommerce, Spain",
        },
      ]
    : [
        {
          quote:
            "Pasamos de responder en horas a minutos en WhatsApp y web sin perder trazabilidad en el CRM.",
          name: "Retail B2C, Sevilla",
        },
        {
          quote:
            "Automatizamos conciliaciones y alertas en n8n; bajamos errores manuales y soporte nos lo agradece.",
          name: "Distribución industrial, Andalucía",
        },
        {
          quote:
            "Los agentes IA resuelven estado de pedidos y derivan sólo lo complejo; el CSAT subió con el mismo equipo.",
          name: "Ecommerce moda, España",
        },
      ];

  const ui = {
    results: isEn ? "Results" : "Resultados",
    impact: isEn ? "Impact in Seville" : "Impacto en Sevilla",
    how: isEn ? "How we do it" : "Cómo lo hacemos",
    faq: isEn ? "Frequently asked questions" : "Preguntas frecuentes",
    ready: isEn ? "Ready to start?" : "¿Listo para empezar?",
    readyText: isEn
      ? "We prepare a plan in 48h with scope, timing and owners. Includes pilot in Seville."
      : "Preparamos un plan en 48h con alcance, tiempos y responsables. Incluye piloto en Sevilla.",
    testimonials: isEn ? "Local testimonials" : "Testimonios locales",
    localTeam: isEn ? "Local team in Seville" : "Equipo local en Sevilla",
  };

  return (
    <div className="bg-gradient-to-b from-[#f7fbf4] via-white to-[#f7fbf4] dark:from-[#0b1220] dark:via-[#0b1220] dark:to-[#0b1220] text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col gap-10">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            {content.heroBadge ? (
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f8a0d] dark:text-[#3FBD6F]">
                <Sparkles className="h-4 w-4" />
                {content.heroBadge}
              </span>
            ) : null}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{content.title}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">{content.subtitle}</p>
            <p className="text-base text-gray-600 dark:text-gray-400">{content.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-[#0f8a0d] hover:bg-[#0c6d0b] text-white shadow">
                <Link href={heroCtaHref}>{content.heroCtaLabel}</Link>
              </Button>
              <Button
                asChild
                className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg px-5 py-3 text-sm md:text-base"
              >
                <Link href="#landing-contact">{jumpCtaLabel}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#0f8a0d]/30 text-[#0f8a0d] dark:text-[#3FBD6F]"
              >
                <Link href={secondaryCtaHref}>{content.secondaryCtaLabel}</Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" /> {content.areaServed}
              <span className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 px-2 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" /> {ui.localTeam}
              </span>
            </div>
          </div>
          <div className={`${cardClass} overflow-hidden relative min-h-[260px]`}> 
            {content.heroImage ? (
              <Image
                src={content.heroImage}
                alt={content.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 540px, 100vw"
                priority
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-emerald-100 via-white to-emerald-50 dark:from-emerald-900/30 dark:via-[#0b1220] dark:to-emerald-800/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {valueProps.map((item, idx) => (
            <div key={idx} className={`${cardClass} p-4 flex gap-3`}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{item}</p>
            </div>
          ))}
        </section>

        <section className={`${cardClass} p-6 grid lg:grid-cols-2 gap-6`}>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{ui.results}</p>
            <h2 className="text-2xl font-bold">{ui.impact}</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              {outcomes.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <Clock3 className="h-4 w-4 mt-1 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{ui.how}</p>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              {steps.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${cardClass} p-6 space-y-4`}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" /> {ui.testimonials}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 shadow-sm">
                <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">“{item.quote}”</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300 font-semibold">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_0.9fr] gap-6 items-start">
          <div className={`${cardClass} p-6 space-y-4`}>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> {ui.faq}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {faqs.map((faq, idx) => (
                <details key={idx} className="py-3 group" open={idx === 0}>
                  <summary className="cursor-pointer text-base font-medium text-gray-900 dark:text-gray-100 flex items-start justify-between gap-3">
                    <span>{faq.question}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <div className={`${cardClass} p-6 space-y-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-[#0b1220]`}>
            <h3 className="text-xl font-semibold">{ui.ready}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{ui.readyText}</p>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-[#0f8a0d] hover:bg-[#0c6d0b] text-white">
                <Link href={heroCtaHref}>{content.heroCtaLabel}</Link>
              </Button>
              <Button asChild variant="outline" className="border-[#0f8a0d]/30 text-[#0f8a0d] dark:text-[#3FBD6F]">
                <Link href={secondaryCtaHref}>{content.secondaryCtaLabel}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <TestimonialsSection t={t} />
        </section>

        <section id="landing-contact">
          <ContactForm />
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
