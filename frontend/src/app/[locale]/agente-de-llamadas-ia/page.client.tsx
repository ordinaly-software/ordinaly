"use client";

import { useLocale, useMessages } from "next-intl";
import dynamic from "next/dynamic";
import { Mail, Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { IconBrandJavascript, IconApi } from "@tabler/icons-react";
import Strands from "@/components/ui/strands";
import { AnimatedList } from "@/components/ui/animated-list";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { ProvidersShowcase } from "@/components/services/providers-showcase";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { IconN8n, IconWhatsApp } from "@/components/ui/brand-icons";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { BlurText } from "@/components/ui/blur-text";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const ICON_SIZE = 36;

const VOICES_VIDEO = "/static/agente-de-llamadas-ia/voices_card.mp4";
const BATCH_CALL_VIDEO = "/static/agente-de-llamadas-ia/batch_call_card.mp4";
const USE_CASES_VIDEO: Record<string, string> = {
  es: "/static/agente-de-llamadas-ia/use_cases_card_es.mp4",
  en: "/static/agente-de-llamadas-ia/use_cases_card_en.mp4",
};

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

type CallPricing = {
  instanceLabel?: string;
  instancePrice?: string;
  workflowLabel?: string;
  workflowNote?: string;
  workflowNoteLinkLabel?: string;
  contactLabel?: string;
};

// Same shape as automatizaciones-personalizadas-empresas-n8n's pricing card:
// a closed installation price, a note on the variable external monthly cost
// (linking to the FAQ for detail), and direct contact links.
function buildPricingCard(key: string, pricing: CallPricing | undefined, whatsappHref: string, phoneAriaLabel: string): InfoCardItem[] {
  if (!pricing) return [];
  return [
    {
      key,
      size: "lg",
      eyebrow: pricing.instanceLabel,
      title: pricing.instancePrice,
      description: (
        <>
          <span className="not-italic mt-4 block rounded-xl bg-clay/10 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-clay">
              {pricing.workflowLabel}
            </span>
            <span className="mt-1 block text-sm font-normal text-slate-medium dark:text-cloud-medium">
              {pricing.workflowNote}{" "}
              {pricing.workflowNoteLinkLabel && (
                <a
                  href="#faq"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-clay underline underline-offset-2"
                >
                  {pricing.workflowNoteLinkLabel}
                </a>
              )}
            </span>
          </span>
          <span className="not-italic mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-medium dark:text-cloud-medium">
            {pricing.contactLabel}
          </span>
          <span className="not-italic mt-2 flex items-center gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-white transition hover:brightness-110"
            >
              <IconWhatsApp size={18} />
            </a>
            <a
              href="mailto:info@ordinaly.ai"
              onClick={(e) => e.stopPropagation()}
              aria-label="Email"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt text-white transition hover:brightness-110"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="tel:+34626270806"
              onClick={(e) => e.stopPropagation()}
              aria-label={phoneAriaLabel}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[--swatch--slate-dark] text-white transition hover:brightness-110 dark:bg-[--swatch--slate-medium]"
            >
              <Phone className="h-4 w-4" />
            </a>
          </span>
        </>
      ),
    },
  ];
}

export default function AgenteDeLlamadasIA() {
  const messages = useMessages() as any;
  const content = messages.landings?.["agente-de-llamadas-ia"];
  const locale = useLocale();
  const useCasesVideo = USE_CASES_VIDEO[locale] ?? USE_CASES_VIDEO.es;

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

  const phoneAriaLabel = locale === "en" ? "Phone" : "Teléfono";

  const inboundInfoTexts = (content.inbound?.infocards ?? []) as InfoCardText[];
  const inboundEvents = (content.inbound?.events ?? []) as CallEvent[];
  const inboundRequirements: string[] = content.inbound?.requirements?.items ?? [];
  const inboundPricingCard = buildPricingCard(
    "inbound-pricing",
    content.inbound?.pricing,
    "https://wa.me/34626270806?text=Quiero%20consultar%20precio%20de%20un%20recepcionista%20virtual%20con%20IA",
    phoneAriaLabel
  );

  const inboundRequirementsCard: InfoCardItem[] = inboundRequirements.length
    ? [
        {
          key: "inbound-requirements",
          size: "lg",
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
      title: inboundInfoTexts[0]?.name,
      description: inboundInfoTexts[0]?.description,
      media: (
        <div className="h-full w-full bg-[--swatch--slate-dark]">
          <Strands className="h-full w-full" count={3} opacity={0.85} />
        </div>
      ),
    },
    {
      key: "inbound-events",
      size: "md",
      eyebrow: content.inbound?.eventsTitle,
      description: (
        <div className="not-italic w-full max-h-[380px] overflow-hidden">
          <AnimatedList delay={900} className="items-stretch gap-2">
            {inboundEvents.map((event, i) => (
              <CallEventCard key={i} event={event} />
            ))}
          </AnimatedList>
        </div>
      ),
    },
    {
      key: "inbound-voice",
      size: "lg",
      eyebrow: "ElevenLabs",
      title: inboundInfoTexts[1]?.name,
      description: inboundInfoTexts[1]?.description,
      video: VOICES_VIDEO,
    },
    {
      key: "inbound-use-cases",
      size: "md",
      video: useCasesVideo,
      title: inboundInfoTexts[2]?.name,
    },
    ...inboundRequirementsCard,
    ...inboundPricingCard,
  ];

  const outboundInfoTexts = (content.outbound?.infocards ?? []) as InfoCardText[];
  const outboundRequirements: string[] = content.outbound?.requirements?.items ?? [];

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

  const outboundPricingCard = buildPricingCard(
    "outbound-pricing",
    content.outbound?.pricing,
    "https://wa.me/34626270806?text=Quiero%20consultar%20precio%20de%20un%20agente%20de%20llamadas%20salientes%20con%20IA",
    phoneAriaLabel
  );

  const outboundInfocards: InfoCardItem[] = [
    {
      key: "outbound-batch-limits",
      size: "lg",
      title: outboundInfoTexts[0]?.name,
      description: outboundInfoTexts[0]?.description,
      video: BATCH_CALL_VIDEO,
      videoClassName: "blur-[2px]",
    },
    {
      key: "outbound-voice",
      size: "md",
      eyebrow: "ElevenLabs",
      title: outboundInfoTexts[1]?.name,
      description: outboundInfoTexts[1]?.description,
      video: VOICES_VIDEO,
    },
    {
      key: "outbound-use-cases",
      size: "sm",
      title: outboundInfoTexts[2]?.name,
      description: outboundInfoTexts[2]?.description,
      video: useCasesVideo,
    },
    ...outboundRequirementsCard,
    ...outboundPricingCard,
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-[--swatch--slate-dark] text-white">
        <div className="absolute inset-0">
          <Strands
            className="h-full w-full"
            colors={["#D97757", "#E15D31", "#C46686", "#0255D5", "#6A9BCC"]}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--swatch--slate-dark]/50 to-[--swatch--slate-dark]" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center md:py-32">
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
      {/* <ToolsShowcase title={content.sectionTitles?.techStack} logos={techLogos} className="pt-14" /> */}
      <br />

      {/* PROVIDERS */}
      <ProvidersShowcase
        title={content.providers?.title}
        subtitle={content.providers?.subtitle}
        ctaLabel={content.providers?.ctaLabel}
        ctaHref="#formulario"
      />

      {/* INBOUND */}
      <section id="inbound" className="scroll-mt-24 bg-neutral-50 dark:bg-neutral-800">
        <div className="flex flex-col items-center gap-5 px-6 pb-2 pt-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-clay">
            <PhoneIncoming className="h-3.5 w-3.5" strokeWidth={2.5} />
            {content.sectionTitles?.inboundPill}
          </span>
          <BlurText
            as="h2"
            text={content.inbound?.title ?? ""}
            className="max-w-3xl justify-center text-3xl font-bold leading-[1.1] tracking-tight text-neutral-900 dark:text-white md:text-5xl"
          />
        </div>

        <HowItWorksVideoSection
          title={content.inbound?.videoCaptionText}
          body={[
            <p key="name" className="font-semibold text-slate-dark dark:text-ivory-light">
              {content.inbound?.videoCaptionName}
            </p>,
            <p key="role" className="text-sm text-slate-medium dark:text-cloud-medium">
              {content.inbound?.videoCaptionRole}
            </p>,
          ]}
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
        <div className="flex flex-col items-center gap-5 px-6 pb-2 pt-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-flame">
            <PhoneOutgoing className="h-3.5 w-3.5" strokeWidth={2.5} />
            {content.sectionTitles?.outboundPill}
          </span>
          <BlurText
            as="h2"
            text={content.outbound?.title ?? ""}
            className="max-w-3xl justify-center text-3xl font-bold leading-[1.1] tracking-tight text-neutral-900 dark:text-white md:text-5xl"
          />
        </div>

        <HowItWorksVideoSection
          title={content.outbound?.videoCaptionText}
          steps={content.outbound?.steps ?? []}
          className="bg-white pb-8 md:pb-10"
        />

        <section className="px-6 pb-14 pt-6 md:pb-16 md:pt-8 transition-colors">
          <h3 className="mb-8 text-center text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
            {content.outbound?.infocardsTitle}
          </h3>
          <InfoCardCarousel items={outboundInfocards} className="max-w-6xl mx-auto" />
        </section>
      </section>

      {/* FAQ */}
      {content.technologyFaqs?.length > 0 && (
        <div id="faq" className="scroll-mt-24">
          <FaqAccordion
            className="bg-white bg-neutral-50 dark:bg-neutral-800 transition-colors"
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

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
