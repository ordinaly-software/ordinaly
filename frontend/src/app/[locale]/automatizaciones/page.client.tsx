"use client";

import { useMessages } from "next-intl";
import { ArrowRight, Bell } from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import N8nFlow, { type N8nFlowContent } from "@/components/landing/n8n-flow";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { AnimatedList } from "@/components/ui/animated-list";
import { CampaignFooter, CampaignHeader } from "@/components/campaign/campaign-chrome";
import ReCaptchaWrapper from "../recaptcha-provider";

// Ad campaign version of /automatizaciones-personalizadas-empresas-n8n: same copy and components,
// trimmed down so the only way forward is the form.
const slug = "automatizaciones-personalizadas-empresas-n8n" as const;
// Short FAQ: only the questions that matter before asking for a quote.
const FAQ_COUNT = 4;

type WorkflowEvent = { title: string; description: string; time: string };

type LandingContent = {
  title: string;
  subtitle: string;
  heroCtaLabel: string;
  sectionTitles?: {
    infocardsTitle?: string;
    faq?: string;
    howItWorks?: string;
  };
  workflowAnimation?: N8nFlowContent;
  howItWorksSteps?: { title: string; description: string }[];
  infocards?: { cards: { name: string; description?: string }[] };
  observability?: { title: string; events: WorkflowEvent[] };
  pricing?: {
    instanceLabel: string;
    instancePrice: string;
    workflowLabel: string;
    workflowNote: string;
  };
  faq: { question: string; answer: string }[];
};

function WorkflowEventCard({ event }: { event: WorkflowEvent }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-[--color-border-subtle] bg-white p-3 shadow-sm dark:border-white/10 dark:bg-neutral-800">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/10 text-clay">
        <Bell className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-dark dark:text-ivory-light">{event.title}</p>
        <p className="truncate text-xs text-slate-medium dark:text-cloud-medium">{event.description}</p>
      </div>
      <span className="shrink-0 text-[11px] text-slate-medium dark:text-cloud-medium">{event.time}</span>
    </div>
  );
}

export default function AutomatizacionesCampaign() {
  const messages = useMessages() as { landings?: Record<string, LandingContent> };
  const content = messages.landings?.[slug];

  if (!content) throw new Error(`Missing landing content: ${slug}`);

  const infoCardTexts = content.infocards?.cards ?? [];
  const observabilityEvents = content.observability?.events ?? [];
  const pricing = content.pricing;

  const observabilityCard: InfoCardItem[] = observabilityEvents.length
    ? [
        {
          key: "observability",
          size: "md",
          eyebrow: content.observability?.title,
          description: (
            <div className="not-italic w-full max-h-[380px] overflow-hidden">
              <AnimatedList delay={900} className="items-stretch gap-2">
                {observabilityEvents.map((event, i) => (
                  <WorkflowEventCard key={i} event={event} />
                ))}
              </AnimatedList>
            </div>
          ),
        },
      ]
    : [];

  // The pricing card leads to the form instead of WhatsApp/email/phone.
  const pricingCard: InfoCardItem[] = pricing
    ? [
        {
          key: "pricing",
          size: "lg",
          eyebrow: pricing.instanceLabel,
          title: pricing.instancePrice,
          description: (
            <span className="not-italic mt-4 block rounded-xl bg-clay/10 p-3">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-clay">
                {pricing.workflowLabel}
              </span>
              <span className="mt-1 block text-sm font-normal text-slate-medium dark:text-cloud-medium">
                {pricing.workflowNote}
              </span>
            </span>
          ),
          ctaLabel: content.heroCtaLabel,
          ctaIcons: [<ArrowRight key="arrow" className="h-4 w-4 shrink-0" />],
          href: "#formulario",
        },
      ]
    : [];

  const infocards: InfoCardItem[] = [
    { key: "workflow-image", size: "lg", image: `/static/${slug}/workflow.webp` },
    ...observabilityCard,
    {
      key: "vps",
      size: "lg",
      title: infoCardTexts[1]?.name,
      description: infoCardTexts[1]?.description,
      image: `/static/servicios/vps.webp`,
    },
    { key: "no-limits", size: "sm", title: infoCardTexts[2]?.name, description: infoCardTexts[2]?.description },
    {
      key: "team",
      size: "lg",
      title: infoCardTexts[3]?.name,
      description: infoCardTexts[3]?.description,
      image: `/static/${slug}/engineers.webp`,
    },
    { key: "free-software", size: "sm", title: infoCardTexts[0]?.name, description: infoCardTexts[0]?.description },
    ...pricingCard,
  ];

  return (
    <div className="relative bg-white dark:bg-neutral-900">
      <CampaignHeader />

      {/* HERO — always black with the n8n dot grid, so it opts into the dark palette
          (`dark` class) regardless of the site theme. */}
      <section id="inicio" className="scroll-mt-24 dark relative w-full overflow-hidden bg-[#141414] text-white">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.28) 1px, transparent 1.4px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/4 size-[28rem] rounded-full bg-clay/20 blur-[160px]"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
          <div className="text-left">
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">{content.title}</h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl">{content.subtitle}</p>
            <a
              href="#formulario"
              className="mt-10 inline-flex rounded-xl bg-clay-fill dark:bg-clay-fill px-8 py-4 font-semibold text-white dark:text-white shadow-lg transition hover:scale-105"
            >
              {content.heroCtaLabel}
            </a>
          </div>

          {content.workflowAnimation && (
            <div className="flex justify-center md:justify-end">
              <N8nFlow content={content.workflowAnimation} />
            </div>
          )}
        </div>
      </section>

      <div id="como-funciona" className="scroll-mt-24">
        <HowItWorksVideoSection
          title={content.sectionTitles?.howItWorks}
          videoUrl="https://www.youtube.com/watch?v=BydOXJ-Ojdk"
          thumbnailSrc={`/static/${slug}/video_thumbnail.webp`}
          steps={content.howItWorksSteps}
        />
      </div>

      {/* INFO CARDS: benefits, vps, observability, team, pricing */}
      <section id="beneficios" className="scroll-mt-24 py-14 md:py-16 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      <div id="preguntas-frecuentes" className="scroll-mt-24">
        <FaqAccordion
          className="bg-white dark:bg-neutral-900"
          title={content.sectionTitles?.faq}
          items={content.faq.slice(0, FAQ_COUNT).map((faq) => ({ question: faq.question, answer: faq.answer }))}
        />
      </div>

      {/* FORM */}
      <section id="formulario" className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ReCaptchaWrapper badgeContainerId="recaptcha-badge-automatizaciones-campaign">
            <ContactForm
              className="[&>section]:max-w-none [&>section]:bg-black [&>section]:px-0 [&>section]:py-0"
              recaptchaAction="campaign_form"
              recaptchaBadgeId="recaptcha-badge-automatizaciones-campaign"
              redirectTo="/gracias?origen=automatizaciones"
            />
          </ReCaptchaWrapper>
        </div>
      </section>

      <CampaignFooter />
    </div>
  );
}
