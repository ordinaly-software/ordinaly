"use client";

import { useLocale, useMessages } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Zap,
  Wand2,
  Star,
  Scale,
  Building2,
  Home,
  Megaphone,
  GraduationCap,
  Mail,
  Phone,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import Footer from "@/components/ui/footer";
import ContactForm from "@/components/ui/contact-form.client";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { IconN8n, IconWhatsApp, IconOdoo } from "@/components/ui/brand-icons";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import ReCaptchaWrapper from "../recaptcha-provider";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const slug = "consultora-tecnologica-sevilla" as const;

type FeatureItem = { title: string; description: string };
type SolutionItem = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: string;
  imageAlt: string;
};

type LandingContent = {
  title: string;
  shortTitle?: string;
  description: string;
  heroTitle: string;
  heroBody: string;
  heroCtaLabel: string;
  heroSecondaryCtaLabel: string;
  heroImageAlt: string;
  sectionTitles?: {
    company?: string;
    solutions?: string;
    services?: string;
    training?: string;
    faq?: string;
    contact?: string;
  };
  company?: { intro: string; features: FeatureItem[] };
  solutions?: { intro: string; items: SolutionItem[] };
  services?: { intro: string; sectors: FeatureItem[] };
  training?: { body: string; ctaLabel: string; href: string };
  faq: { question: string; answer: string }[];
  contact?: { body: string };
};

const companyIcons = [Zap, Wand2, Star];
const sectorIcons = [Scale, Building2, Home, Megaphone];
const solutionIcons = [IconN8n, Phone, IconOdoo, ArrowUpRight];

export default function ConsultoraTecnologicaSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingContent> };
  const content = messages.landings?.[slug];
  const locale = useLocale();
  const isEs = locale?.startsWith("es");

  if (!content) throw new Error(`Missing landing content: ${slug}`);

  const features = content.company?.features ?? [];
  const solutions = content.solutions?.items ?? [];
  const sectors = content.services?.sectors ?? [];

  return (
    <div className="relative bg-white dark:bg-neutral-900">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F5F7FF] via-[#FFFBEE] to-[#E6EFFF] dark:from-[--swatch--slate-dark] dark:via-[--swatch--slate-dark] dark:to-[--swatch--slate-medium] px-3 sm:px-10 pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/4 size-[28rem] rounded-full bg-clay/20 blur-[160px]"
        />

        <div className="relative z-10 flex flex-col items-center max-w-7xl mx-auto w-full text-center">
          <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-[-0.02em] text-neutral-900 dark:text-white">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-white/70">
            {content.heroBody}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#formulario"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 active:scale-[0.97]"
            >
              {content.heroCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#soluciones"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900 hover:scale-[1.03] active:scale-[0.97] dark:border-white/20 dark:text-white/85 dark:hover:border-white/40 dark:hover:text-white"
            >
              {content.heroSecondaryCtaLabel}
            </a>
          </div>

          <Image
            src="/static/servicios/engineers.webp"
            alt={content.heroImageAlt}
            width={1200}
            height={630}
            priority
            className="mt-16 h-72 sm:h-96 w-full max-w-5xl rounded-t-[50px] border border-b-0 border-[--color-border-subtle] object-cover dark:border-white/10"
          />
        </div>
      </section>

      {/* EMPRESA CONSULTORA TECNOLÓGICA EN SEVILLA */}
      <section className="py-20 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {content.sectionTitles?.company}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            {content.company?.intro}
          </p>
        </div>

        <div className="mt-14 max-w-6xl mx-auto grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = companyIcons[i] ?? Zap;
            return (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-[--color-border-subtle] bg-neutral-50 p-8 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-neutral-800"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay/10 text-clay">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-dark dark:text-ivory-light">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOLUCIONES TECNOLÓGICAS */}
      <section id="soluciones" className="scroll-mt-24 py-20 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {content.sectionTitles?.solutions}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            {content.solutions?.intro}
          </p>
        </div>

        <div className="mt-16 max-w-6xl mx-auto flex flex-col gap-20">
          {solutions.map((item, i) => {
            const Icon = solutionIcons[i] ?? ArrowUpRight;
            const reversed = i % 2 === 1;
            return (
              <div
                key={item.href}
                className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight text-slate-dark dark:text-ivory-light">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-clay transition hover:text-clay/80"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div>
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    width={700}
                    height={460}
                    className="w-full h-auto rounded-2xl shadow-xl border border-[--color-border-subtle] dark:border-white/10 object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ToolsShowcase
        title={isEs ? "Tecnologías con las que trabajamos" : "Technologies we work with"}
        titleTag="h3"
        className="pt-14"
      />

      {/* SERVICIOS DE CONSULTORA TECNOLÓGICA EN SEVILLA */}
      <section className="py-20 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {content.sectionTitles?.services}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            {content.services?.intro}
          </p>
        </div>

        <div className="mt-14 max-w-6xl mx-auto grid gap-6 sm:grid-cols-2">
          {sectors.map((sector, i) => {
            const Icon = sectorIcons[i] ?? Building2;
            return (
              <div
                key={sector.title}
                className="rounded-[1.75rem] border border-[--color-border-subtle] bg-neutral-50 p-8 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-neutral-800"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-dark dark:text-ivory-light">
                  {sector.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {sector.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FORMACIÓN */}
      {content.training && (
        <section className="bg-white px-4 pb-10 pt-4 dark:bg-neutral-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[--swatch--slate-dark] to-[--swatch--cobalt-dark] px-8 py-12 text-white shadow-[0_28px_90px_-45px_rgba(2,85,213,0.45)] md:px-14 md:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cobalt/25 blur-3xl"
              />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                    <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-5 text-2xl md:text-4xl font-bold leading-tight tracking-[-0.02em]">
                    {content.sectionTitles?.training}
                  </h2>
                  <p className="mt-4 text-white/75 md:text-lg leading-relaxed">{content.training.body}</p>
                </div>
                <Link
                  href={content.training.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-[--swatch--slate-dark] shadow-lg transition hover:scale-105 active:scale-[0.97] hover:bg-neutral-100"
                >
                  {content.training.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <FaqAccordion
        title={content.sectionTitles?.faq}
        className="bg-white dark:bg-neutral-900"
        items={content.faq.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      {/* CONTACTO */}
      <section id="formulario" className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {content.sectionTitles?.contact}
            </h2>
            {content.contact?.body && (
              <p className="mt-4 text-white/70 max-w-2xl mx-auto leading-relaxed">{content.contact.body}</p>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="https://wa.me/34626270806?text=Quiero%20solicitar%20una%20consultor%C3%ADa%20tecnol%C3%B3gica%20gratuita"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-clay text-white transition hover:brightness-110"
              >
                <IconWhatsApp size={18} />
              </a>
              <a
                href="mailto:info@ordinaly.ai"
                aria-label="Email"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cobalt text-white transition hover:brightness-110"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="tel:+34626270806"
                aria-label="Teléfono"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-700 text-white transition hover:brightness-110"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-consultora-tecnologica-sevilla-contact">
            <ContactForm className="[&>section]:max-w-none [&>section]:bg-black [&>section]:px-0 [&>section]:py-0" />
          </ReCaptchaWrapper>
        </div>
      </section>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
