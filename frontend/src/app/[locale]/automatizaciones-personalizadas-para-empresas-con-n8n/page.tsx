import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/metadata";
import Footer from "@/components/ui/footer";
import ContactForm from "@/components/ui/contact-form.client";
import N8nFlow from "@/components/landing/n8n-flow";
import RelojArenaMagico from "@/components/ui/hourglass";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { IconN8n } from "@/components/ui/brand-icons";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import ReCaptchaWrapper from "../recaptcha-provider";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const slug = "automatizaciones-personalizadas-para-empresas-con-n8n" as const;
const HERO_IMAGE = "/static/backgrounds/n8n_background.webp";

type LandingContent = {
  title: string;
  subtitle: string;
  description: string;
  heroCtaLabel: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  n8nCtaLabel: string;
  sectionTitles?: {
    whatIsN8N?: string;
    integrations?: string;
    benefits?: string;
    security?: string;
    faq?: string;
    ctaTitle?: string;
  };
  whatIsN8N: string;
  howItWorksSteps?: { title: string; description: string }[];
  team?: { title: string; description: string };
  benefits?: { name: string }[];
  security?: { trustPoints?: string[] };
  pricing?: { price: string; label: string; ctaLabel: string; ctaHref: string };
  faq: { question: string; answer: string }[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const landing = (messages as { landings?: Record<string, LandingContent> }).landings?.[slug];

  if (!landing) {
    throw new Error(`Missing landing content: ${slug}`);
  }

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: landing.title,
    description: landing.description,
    image: HERO_IMAGE,
  });
}

export default async function AutomatizacionesPersonalizadasN8n({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const content = (messages as { landings?: Record<string, LandingContent> }).landings?.[slug];

  if (!content) throw new Error(`Missing landing content: ${slug}`);

  const trustPoints = content.security?.trustPoints ?? [];
  const benefits = content.benefits ?? [];
  const pricing = content.pricing;

  return (
    <div className="relative bg-white dark:bg-neutral-900">

      {/* HERO */}
      <section className="w-full py-32 px-6 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {content.title}
            </h1>

            <p className="mt-6 text-lg text-neutral-300 max-w-xl">
              {content.subtitle}
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-2xl">
              <a
                href="#formulario"
                className="flex flex-col items-start justify-center gap-1 rounded-2xl px-6 py-6 font-semibold text-white shadow-lg transition hover:scale-105"
                style={{ backgroundColor: "#d97757" }}
              >
                <span className="text-base">{content.heroCtaLabel}</span>
              </a>

              <a
                href={content.secondaryCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start justify-center gap-2 rounded-2xl px-6 py-6 font-semibold border border-neutral-600 text-neutral-200 hover:text-white hover:border-white transition hover:scale-[1.03]"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.64a12 12 0 0 0 5.74 1.46h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.4ZM12.05 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.74.97 1-3.64-.22-.37a9.28 9.28 0 0 1-1.42-4.9c0-5.14 4.18-9.32 9.33-9.32 2.49 0 4.83.97 6.6 2.73a9.27 9.27 0 0 1 2.73 6.6c0 5.15-4.18 9.33-9.33 9.33Zm5.13-6.96c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.9.14.19 1.96 3 4.75 4.2.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33Z" />
                </svg>
                <span className="text-base">{content.secondaryCtaLabel}</span>
              </a>

              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start justify-center gap-2 rounded-2xl px-6 py-6 font-semibold bg-white text-neutral-900 shadow-lg transition hover:scale-[1.03] hover:bg-neutral-100"
              >
                <IconN8n size={24} />
                <span className="text-base">{content.n8nCtaLabel}</span>
              </a>
            </div>
          </div>

          {/* Reloj */}
          <div className="flex justify-center md:justify-end max-w-sm mx-auto md:mx-0">
            <RelojArenaMagico />
          </div>

        </div>
      </section>

      <HowItWorksVideoSection steps={content.howItWorksSteps} />

      {/* WHAT IS N8N */}
      <section className="py-24 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 dark:text-white">
              {content.sectionTitles?.whatIsN8N}
            </h2>

            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {content.whatIsN8N}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              src={`/static/${slug}/n8n-integration.webp`}
              alt={content.title}
              width={760}
              height={507}
              className="w-full max-w-[760px] h-auto rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700"
            />
          </div>

        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="py-24 px-6 bg-white dark:bg-neutral-900">
        <p className="text-3xl md:text-4xl font-bold text-center mb-16 dark:text-white">
          {content.sectionTitles?.integrations}
        </p>
        <div className="max-w-6xl mx-auto">
          <N8nFlow />
        </div>
      </section>

      {/* BENEFITS */}
      {benefits.length > 0 && (
        <section className="py-16 px-6 bg-neutral-50 dark:bg-neutral-800">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
            {content.sectionTitles?.benefits}
          </h2>
          <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.name}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 py-8 text-center shadow-sm"
              >
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {benefit.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TEAM */}
      {content.team && (
        <section className="py-16 px-6 bg-white dark:bg-neutral-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-900 dark:text-white">
              {content.team.title}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {content.team.description}
            </p>
          </div>
        </section>
      )}

      {/* SECURITY + PRICING */}
      {(trustPoints.length > 0 || pricing) && (
        <section className="py-16 px-6 bg-neutral-50 dark:bg-neutral-800">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1.3fr_1fr] gap-12 items-start">
            {trustPoints.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
                  {content.sectionTitles?.security}
                </h2>
                <ul className="space-y-3">
                  {trustPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                      <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-clay" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pricing && (
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 shadow-sm">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  {pricing.price}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  {pricing.label}
                </p>
                <a
                  href={pricing.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
                  style={{ backgroundColor: "#d97757" }}
                >
                  {pricing.ctaLabel}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <FaqAccordion
        className="bg-white dark:bg-neutral-900"
        title={content.sectionTitles?.faq}
        items={content.faq.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
        footer={
          <a
            href="#formulario"
            className="
              inline-flex items-center gap-2 px-6 py-3 rounded-full
              border-2 border-clay text-clay font-semibold shadow-md
              transition-all duration-300 hover:bg-clay hover:text-white
              hover:shadow-lg hover:shadow-clay/20 group
            "
          >
            {content.sectionTitles?.ctaTitle}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </a>
        }
      />

      {/* FORM */}
      <section id="formulario" className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-automatizaciones-n8n-contact">
            <ContactForm className="[&>section]:max-w-none [&>section]:bg-black [&>section]:px-0 [&>section]:py-0" />
          </ReCaptchaWrapper>
        </div>
      </section>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
