"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import { FloatingCta } from "@/components/landing/floating-cta";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

export default function AutomatizacionInformes() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-informes"];

  if (!content) {
    throw new Error("Missing landing content: automatizacion-informes");
  }
  const infoCardTexts = (content.infocards?.cards ?? []) as { name: string; description?: string }[];

  const requirements: string[] = content.security?.requirements ?? [];
  const pricing = content.pricing;
  const howItWorksSteps: { title: string; description: string }[] = content.howItWorks?.steps ?? [];

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

  // Defined one by one (rather than mechanically mapped) so each card's
  // size and background can be chosen deliberately.
  const infocards: InfoCardItem[] = [
    {
      key: "workflow",
      size: "xl",
      image: "/static/automatizacion-informes/workflow.webp",
    },
    {
      key: "software",
      size: "sm",
      title: infoCardTexts[1]?.name,
      description: infoCardTexts[1]?.description,
      image: "/static/servicios/software.webp",
    },
    {
      key: "compatibilidad",
      size: "xl",
      title: infoCardTexts[0]?.name,
      description: infoCardTexts[0]?.description,
      image: "/static/servicios/compatibilidad.webp",
    },
    {
      key: "vps",
      size: "md",
      title: infoCardTexts[2]?.name,
      description: infoCardTexts[2]?.description,
      image: "/static/servicios/vps.webp",
    },
    {
      key: "sensitive-data",
      size: "md",
      title: infoCardTexts[3]?.name,
      description: infoCardTexts[3]?.description,
      image: "/static/servicios/sensitive_data.webp",
    },
    ...requirementsCard,
    ...pricingCard,
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section id="inicio" className="scroll-mt-24 relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-125"
          style={{ backgroundImage: "url('/static/automatizacion-informes/automatizacion_informes.webp')" }}
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
            style={{ backgroundColor: "var(--swatch--clay-fill)" }}
          >
            {content.heroCtaLabel}
          </a>

        </div>
      </section>

      <div id="como-funciona" className="scroll-mt-24">
        <HowItWorksVideoSection
        title={content.sectionTitles?.howItWorks}
        videoUrl={content.howItWorks?.videoUrl}
        body={content.howItWorks?.paragraphs?.map((p: string, i: number) => (
          <p key={i} className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-center">
            {p}
          </p>
        ))}
        steps={howItWorksSteps}
      />
      </div>

      {/* INFO CARDS */}
      <section id="beneficios" className="scroll-mt-24 py-14 md:py-16 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* TECHNOLOGY FAQS */}
      {content.technologyFaqs?.length > 0 && (
        <div id="preguntas-frecuentes" className="scroll-mt-24">
          <FaqAccordion
            className="bg-white dark:bg-neutral-900 transition-colors"
            title={content.sectionTitles?.technologyFaqs}
            items={content.technologyFaqs.map((faq: { tag: string; question: string; answer: string }) => ({
              question: faq.question,
              answer: faq.answer,
              tag: faq.tag,
            }))}
          />
        </div>
      )}

      {/* FORM */}
      <section id="formulario">
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-home-contact">
            <ContactForm />
          </ReCaptchaWrapper>
      </section>

      <FloatingCta href="https://wa.me/34626270806" label={content.secondaryCtaLabel} />

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
