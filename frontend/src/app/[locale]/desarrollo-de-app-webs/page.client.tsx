"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { InfoCardCarousel, type InfoCardItem } from "@/components/ui/info-card-carousel";
import { HowItWorksVideoSection } from "@/components/ui/how-it-works-video-section";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const CARD_SIZES: InfoCardItem["size"][] = ["lg", "sm", "md", "sm", "md", "sm", "md"];

export default function DesarrolloDeAppWebs() {
  const messages = useMessages() as any;
  const content = messages.landings?.["desarrollo-de-app-webs"];

  if (!content) {
    throw new Error("Missing landing content: desarrollo-de-app-webs");
  }

  const includedCards: InfoCardItem[] = (content.included?.items ?? []).map(
    (item: { title: string; description?: string }, i: number) => ({
      key: `included-${i}`,
      size: CARD_SIZES[i % CARD_SIZES.length],
      title: item.title,
      description: item.description || undefined,
    }),
  );

  const ventajasCards: InfoCardItem[] = (content.ventajas ?? []).map(
    (item: { title: string; description?: string }, i: number) => ({
      key: `ventajas-${i}`,
      size: CARD_SIZES[i % CARD_SIZES.length],
      title: item.title,
      description: item.description || undefined,
    }),
  );

  const requirements: string[] = content.security?.requirements ?? [];
  const pricing = content.pricing;

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
          description: pricing.implementationTime ? (
            <span className="not-italic mt-4 block text-sm">
              <span className="font-semibold">{pricing.implementationLabel}</span> {pricing.implementationTime}
            </span>
          ) : undefined,
          ctaLabel: pricing.ctaLabel,
          href: pricing.ctaHref,
        },
      ]
    : [];

  const requirementsCards: InfoCardItem[] = [...requirementsCard, ...pricingCard];
  const howItWorksSteps = [
    {
      title: "Análisis funcional",
      description: "Aterrizamos objetivos, usuarios y funcionalidades clave del proyecto.",
    },
    {
      title: "Diseño y desarrollo",
      description: "Construimos la PWA a medida y optimizamos la experiencia de uso.",
    },
    {
      title: "Pruebas y validación",
      description: "Comprobamos rendimiento, SEO y comportamiento en distintos dispositivos.",
    },
    {
      title: "Despliegue y mantenimiento",
      description: "La publicamos en tu infraestructura y dejamos la base lista para crecer.",
    },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-125"
          style={{ backgroundImage: "url('/static/desarrollo-de-app-webs/desarrollo-de-app-webs.webp')" }}
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

      <HowItWorksVideoSection steps={howItWorksSteps} />

      {/* WHAT IS A PWA */}
      <section className="py-20 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
            {content.sectionTitles?.whatIsPWA}
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {content.whatIsPWA?.intro}
              </p>
              <ul className="space-y-3">
                {content.whatIsPWA?.bullets?.map((bullet: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                    <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[#d97757]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center md:justify-end">
              <Image
                src="/static/desarrollo-de-app-webs/desarrollo-de-app-webs.webp"
                alt={content.title}
                width={720}
                height={540}
                className="w-full max-w-[520px] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 object-cover"
              />
            </div>
          </div>

          {content.whatIsPWA?.highlight && (
            <p className="mt-12 max-w-3xl mx-auto text-center text-lg font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {content.whatIsPWA.highlight}
            </p>
          )}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-20 md:py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
            {content.sectionTitles?.included}
          </h2>

          <InfoCardCarousel items={includedCards} className="max-w-6xl mx-auto" />
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

      {/* REQUIREMENTS + PRICING */}
      <section className="py-20 md:py-24 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {content.sectionTitles?.requirements}
        </h2>
        <InfoCardCarousel items={requirementsCards} className="max-w-6xl mx-auto" />
      </section>

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-pwa-contact">
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
