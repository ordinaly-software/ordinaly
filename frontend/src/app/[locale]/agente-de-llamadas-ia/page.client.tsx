"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import { Phone } from "lucide-react";
import { IconBrandJavascript, IconApi } from "@tabler/icons-react";
import Strands from "@/components/ui/strands";
import { AnimatedList } from "@/components/ui/animated-list";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { ProvidersShowcase } from "@/components/services/providers-showcase";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { IconN8n } from "@/components/ui/brand-icons";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const ICON_SIZE = 36;

type InfoCardText = { name: string; description?: string };
type CallEvent = { title: string; description: string; time: string };

function CallEventCard({ event }: { event: CallEvent }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-[--color-border-subtle] bg-white p-3 shadow-sm dark:border-white/10 dark:bg-neutral-800">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/10 text-clay">
        <Phone className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-dark dark:text-ivory-light">{event.title}</p>
        <p className="truncate text-xs text-slate-medium dark:text-cloud-medium">{event.description}</p>
      </div>
      <span className="shrink-0 text-[11px] text-slate-medium dark:text-cloud-medium">{event.time}</span>
    </div>
  );
}

export default function AgenteDeLlamadasIA() {
  const messages = useMessages() as any;
  const content = messages.landings?.["agente-de-llamadas-ia"];

  if (!content) {
    throw new Error("Missing landing content: agente-de-llamadas-ia");
  }

  const techLogos = [
    { node: <IconN8n size={ICON_SIZE} />, title: "n8n", href: "https://n8n.io" },
    {
      node: <IconBrandJavascript size={ICON_SIZE} />,
      title: "JavaScript",
      href: "https://developer.mozilla.org/docs/Web/JavaScript",
    },
    { node: <IconApi size={ICON_SIZE} />, title: "API REST" },
  ];

  const inboundInfoTexts = (content.inbound?.infocards ?? []) as InfoCardText[];
  const inboundEvents = (content.inbound?.events ?? []) as CallEvent[];
  const inboundRequirements: string[] = content.inbound?.requirements?.items ?? [];

  const inboundRequirementsCard: InfoCardItem[] = inboundRequirements.length
    ? [
        {
          key: "inbound-requirements",
          size: "md",
          title: content.inbound?.requirements?.title,
          description: (
            <ul className="not-italic space-y-2 text-left">
              {inboundRequirements.map((req, i) => (
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

  // Defined one by one (rather than mechanically mapped) so each card's
  // size and background can be chosen deliberately.
  const inboundInfocards: InfoCardItem[] = [
    {
      key: "inbound-workflow",
      size: "xl",
      image: "/static/servicios/chatbot_recepcionista.webp",
    },
    {
      key: "inbound-available",
      size: "sm",
      title: inboundInfoTexts[0]?.name,
      description: inboundInfoTexts[0]?.description,
    },
    {
      key: "inbound-events",
      size: "md",
      eyebrow: content.inbound?.eventsTitle,
      description: (
        <div className="not-italic w-full max-h-[380px] overflow-hidden">
          <AnimatedList delay={1600} className="items-stretch gap-2">
            {inboundEvents.map((event, i) => (
              <CallEventCard key={i} event={event} />
            ))}
          </AnimatedList>
        </div>
      ),
    },
    {
      key: "inbound-voice",
      size: "sm",
      title: inboundInfoTexts[1]?.name,
      description: inboundInfoTexts[1]?.description,
    },
    ...inboundRequirementsCard,
  ];

  const outboundInfoTexts = (content.outbound?.infocards ?? []) as InfoCardText[];
  const outboundRequirements: string[] = content.outbound?.requirements?.items ?? [];
  const outboundPricing = content.outbound?.pricing;

  const outboundRequirementsCard: InfoCardItem[] = outboundRequirements.length
    ? [
        {
          key: "outbound-requirements",
          size: "md",
          title: content.outbound?.requirements?.title,
          description: (
            <ul className="not-italic space-y-2 text-left">
              {outboundRequirements.map((req, i) => (
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

  const outboundPricingCard: InfoCardItem[] = outboundPricing
    ? [
        {
          key: "outbound-pricing",
          size: "lg",
          eyebrow: outboundPricing.individualLabel,
          title: outboundPricing.individualPrice,
          description: outboundPricing.implementationTime && (
            <span className="not-italic mt-4 block text-sm">
              <span className="font-semibold">{outboundPricing.implementationLabel}</span>{" "}
              {outboundPricing.implementationTime}
            </span>
          ),
          ctaLabel: outboundPricing.ctaLabel,
          href: outboundPricing.ctaHref,
        },
      ]
    : [];

  const outboundInfocards: InfoCardItem[] = [
    {
      key: "outbound-workflow",
      size: "xl",
      image: "/static/servicios/chatbot_comercial.webp",
    },
    {
      key: "outbound-scale",
      size: "sm",
      title: outboundInfoTexts[0]?.name,
      description: outboundInfoTexts[0]?.description,
    },
    {
      key: "outbound-compliance",
      size: "sm",
      title: outboundInfoTexts[1]?.name,
      description: outboundInfoTexts[1]?.description,
    },
    ...outboundRequirementsCard,
    ...outboundPricingCard,
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-[--swatch--slate-dark] text-white">
        <div className="absolute inset-0">
          <Strands className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--swatch--slate-dark]/50 to-[--swatch--slate-dark]" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center md:py-32">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80">
            {content.heroBadge}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">{content.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{content.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#formulario"
              className="rounded-xl bg-clay px-8 py-4 font-semibold text-white shadow-lg transition hover:scale-105"
            >
              {content.heroCtaLabel}
            </a>
            <a
              href="#inbound"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              {content.sectionTitles?.inboundPill}
            </a>
            <a
              href="#outbound"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              {content.sectionTitles?.outboundPill}
            </a>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <ToolsShowcase title={content.sectionTitles?.techStack} logos={techLogos} className="pt-14" />

      {/* PROVIDERS */}
      <ProvidersShowcase
        badge={content.providers?.badge}
        title={content.providers?.title}
        subtitle={content.providers?.subtitle}
        ctaLabel={content.providers?.ctaLabel}
        ctaHref="#formulario"
      />

      {/* INBOUND */}
      <section id="inbound" className="scroll-mt-24">
        <h2 className="pt-6 text-center text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
          {content.inbound?.title}
        </h2>

        <HowItWorksVideoSection
          title={content.inbound?.howItWorksTitle}
          steps={content.inbound?.steps ?? []}
        />

        <section className="px-6 py-14 md:py-16 bg-neutral-50 dark:bg-neutral-800 transition-colors">
          <h3 className="mb-8 text-center text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
            {content.inbound?.infocardsTitle}
          </h3>
          <InfoCardCarousel items={inboundInfocards} className="max-w-6xl mx-auto" />
        </section>
      </section>

      {/* OUTBOUND */}
      <section id="outbound" className="scroll-mt-24">
        <h2 className="pt-14 text-center text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
          {content.outbound?.title}
        </h2>

        <HowItWorksVideoSection
          title={content.outbound?.howItWorksTitle}
          steps={content.outbound?.steps ?? []}
        />

        <section className="px-6 py-14 md:py-16 bg-neutral-50 dark:bg-neutral-800 transition-colors">
          <h3 className="mb-8 text-center text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
            {content.outbound?.infocardsTitle}
          </h3>
          <InfoCardCarousel items={outboundInfocards} className="max-w-6xl mx-auto" />
        </section>
      </section>

      {/* FAQ */}
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition bg-clay"
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
