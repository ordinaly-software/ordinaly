"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { InfoCardCarousel, type InfoCardItem } from "@/components/ui/info-card-carousel";
import { HowItWorksVideoSection } from "@/components/ui/how-it-works-video-section";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const CARD_SIZES: InfoCardItem["size"][] = ["lg", "sm", "md", "sm", "md"];

export default function AutomatizacionFacturas() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-facturas"];

  if (!content) {
    throw new Error("Missing landing content: automatizacion-facturas");
  }

  const funcionesCards: InfoCardItem[] = (content.funciones?.items ?? []).map(
    (item: { title: string }, i: number) => ({
      key: `funciones-${i}`,
      size: CARD_SIZES[i % CARD_SIZES.length],
      title: item.title,
    }),
  );

  const ventajasCards: InfoCardItem[] = (content.ventajas ?? []).map(
    (item: { title: string; description?: string }, i: number) => ({
      key: `ventajas-${i}`,
      size: CARD_SIZES[i % CARD_SIZES.length],
      title: item.title,
      description: item.description,
    }),
  );

  const trustPoints: string[] = content.security?.trustPoints ?? [];
  const requirements: string[] = content.security?.requirements ?? [];
  const pricing = content.pricing;

  const trustCard: InfoCardItem[] = trustPoints.length
    ? [
        {
          key: "trust",
          size: "md",
          title: content.sectionTitles?.security,
          description: (
            <ul className="not-italic space-y-2 text-left">
              {trustPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-clay" />
                  {point}
                </li>
              ))}
            </ul>
          ),
        },
      ]
    : [];

  const requirementsCard: InfoCardItem[] = requirements.length
    ? [
        {
          key: "requirements",
          size: "md",
          title: content.sectionTitles?.requirements,
          description: (
            <ul className="not-italic space-y-2 text-left">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-clay" />
                  {req}
                </li>
              ))}
            </ul>
          ),
        },
      ]
    : [];

  const pricingCard: InfoCardItem[] = pricing
    ? [
        {
          key: "pricing",
          size: "lg",
          eyebrow: pricing.individualLabel,
          title: pricing.individualPrice,
          description: (
            <>
              {pricing.comboPrice && (
                <span className="not-italic mt-4 block rounded-xl bg-clay/10 p-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest text-clay">
                    {pricing.comboLabel}
                  </span>
                  <span className="mt-1 block text-xl font-bold text-slate-dark dark:text-ivory-light">
                    {pricing.comboPrice}
                  </span>
                  {pricing.comboNote && (
                    <span className="mt-1 block text-xs font-normal text-slate-medium dark:text-cloud-medium">
                      {pricing.comboNote}
                    </span>
                  )}
                </span>
              )}
              {pricing.implementationTime && (
                <span className="not-italic mt-4 block text-sm">
                  <span className="font-semibold">{pricing.implementationLabel}</span> {pricing.implementationTime}
                </span>
              )}
            </>
          ),
          ctaLabel: pricing.ctaLabel,
          href: pricing.ctaHref,
        },
      ]
    : [];

  const securityCards: InfoCardItem[] = [...trustCard, ...requirementsCard, ...pricingCard];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-125"
          style={{ backgroundImage: "url('/static/automatizacion-facturas/automatizacion-facturas.webp')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,20,19,0.55),rgba(20,20,19,0.3),rgba(20,20,19,0.55))]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-xl leading-tight">
            {content.title}
          </h1>

          <p className="mt-6 text-neutral-300 max-w-2xl leading-relaxed">
            {content.heroText}
          </p>

          <a
            href="#formulario"
            className="mt-10 px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: "#d97757" }}
          >
            {content.heroCtaLabel}
          </a>
        </div>
      </section>

      <HowItWorksVideoSection
        title={content.sectionTitles?.howItWorks}
        steps={content.steps ?? []}
      />

      {/* FUNCIONES */}
      <section className="py-20 md:py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
            {content.sectionTitles?.funciones}
          </h2>

          <InfoCardCarousel items={funcionesCards} className="max-w-6xl mx-auto" />

          <div className="mt-14 max-w-3xl mx-auto space-y-4">
            {content.funciones?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-center">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="py-20 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
            {content.sectionTitles?.ventajas}
          </h2>

          <InfoCardCarousel items={ventajasCards} className="max-w-6xl mx-auto" />
        </div>
      </section>

      {/* SECURITY + REQUIREMENTS */}
      <section className="py-20 md:py-24 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {content.sectionTitles?.security}
        </h2>
        <InfoCardCarousel items={securityCards} className="max-w-6xl mx-auto" />
      </section>

      {/* TECHNOLOGY FAQS */}
      {content.technologyFaqs?.length > 0 && (
        <FaqAccordion
          className="bg-white dark:bg-neutral-900 transition-colors"
          title={content.sectionTitles?.technologyFaqs}
          items={content.technologyFaqs.map((faq: { tag: string; question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer,
            tag: faq.tag,
          }))}
        />
      )}

      {/* FORM */}
      <section id="formulario">
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-home-contact">
            <ContactForm />
          </ReCaptchaWrapper>
      </section>

      <a
        href="https://wa.me/34626270806"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
        style={{ backgroundColor: "#d97757" }}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.64a12 12 0 0 0 5.74 1.46h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.4ZM12.05 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.74.97 1-3.64-.22-.37a9.28 9.28 0 0 1-1.42-4.9c0-5.14 4.18-9.32 9.33-9.32 2.49 0 4.83.97 6.6 2.73a9.27 9.27 0 0 1 2.73 6.6c0 5.15-4.18 9.33-9.33 9.33Zm5.13-6.96c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.9.14.19 1.96 3 4.75 4.2.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33Z" />
        </svg>
        <span>{content.secondaryCtaLabel}</span>
      </a>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
