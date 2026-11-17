"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import {
  IconBrandGmail,
  IconBrandSlack,
  IconBrandGoogleDrive,
  IconBrandNotion,
  IconBrandAirtable,
  IconBrandTelegram,
  IconBrandStripe,
  IconBrandGithub,
  IconBrandOnedrive,
  IconCalendarEvent,
  IconFileTypeXls,
  IconWebhook,
  IconClock,
} from "@tabler/icons-react";
import { ArrowRight, Bell } from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import N8nFlow, { type N8nFlowContent } from "@/components/landing/n8n-flow";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { FloatingCta } from "@/components/landing/floating-cta";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { IconWhatsApp, IconOdoo } from "@/components/ui/brand-icons";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { AnimatedList } from "@/components/ui/animated-list";
import { CampaignFooter, CampaignNavbar } from "@/components/campaign/campaign-navbar-footer";
import GoogleTagManager from "@/components/analytics/google-tag-manager";
import ReCaptchaWrapper from "../recaptcha-provider";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

// Ad campaign version of /automatizaciones-personalizadas-empresas-n8n: same copy and components,
// trimmed down so the only way forward is the form.
const slug = "automatizaciones-personalizadas-empresas-n8n" as const;
// Short FAQ: only the questions that matter before asking for a quote.
const FAQ_COUNT = 4;
const ICON_SIZE = 36;

// Same integrations as /automatizaciones-personalizadas-empresas-n8n (no links, so visitors stay on the page).
const integrationLogos = [
  { node: <IconBrandGmail size={ICON_SIZE} />, title: "Gmail" },
  { node: <IconBrandSlack size={ICON_SIZE} />, title: "Slack" },
  { node: <IconBrandGoogleDrive size={ICON_SIZE} />, title: "Google Drive" },
  { node: <IconCalendarEvent size={ICON_SIZE} />, title: "Google Calendar" },
  { node: <IconBrandNotion size={ICON_SIZE} />, title: "Notion" },
  { node: <IconBrandAirtable size={ICON_SIZE} />, title: "Airtable" },
  { node: <IconBrandTelegram size={ICON_SIZE} />, title: "Telegram" },
  { node: <IconWhatsApp size={ICON_SIZE} />, title: "WhatsApp" },
  { node: <IconBrandStripe size={ICON_SIZE} />, title: "Stripe" },
  { node: <IconBrandOnedrive size={ICON_SIZE} />, title: "OneDrive" },
  { node: <IconFileTypeXls size={ICON_SIZE} />, title: "Excel" },
  { node: <IconOdoo size={ICON_SIZE} />, title: "Odoo" },
  { node: <IconWebhook size={ICON_SIZE} />, title: "Webhook" },
  { node: <IconClock size={ICON_SIZE} />, title: "Time Trigger" },
  { node: <IconBrandGithub size={ICON_SIZE} />, title: "GitHub" },
];

type WorkflowEvent = { title: string; description: string; time: string };

type LandingContent = {
  title: string;
  subtitle: string;
  heroCtaLabel: string;
  floatingCtaLabel: string;
  sectionTitles?: {
    integrations?: string;
    infocardsTitle?: string;
    faq?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
  };
  workflowAnimation?: N8nFlowContent;
  infocards?: { cards: { name: string; description?: string }[] };
  observability?: { title: string; events: WorkflowEvent[] };
  pricing?: {
    instanceLabel: string;
    instancePrice: string;
    workflowLabel: string;
    workflowNote: string;
  };
  faq: { question: string; answer: string }[];
  cta?: { trust?: string; formLabel?: string };
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
      <GoogleTagManager />
      <CampaignNavbar />

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

      {/* INTEGRATIONS MARQUEE */}
      {content.sectionTitles?.integrations && (
        <div id="integraciones" className="scroll-mt-24 bg-white pt-14 md:pt-16 dark:bg-neutral-900">
          <ToolsShowcase title={content.sectionTitles.integrations} logos={integrationLogos}>
            <div className="mt-8 flex justify-center">
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-[--swatch--slate-dark] shadow-lg transition hover:scale-105 hover:bg-neutral-100"
              >
                {content.heroCtaLabel}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </ToolsShowcase>
        </div>
      )}

      {/* INFO CARDS: benefits, vps, observability, team, pricing */}
      <section id="beneficios" className="scroll-mt-24 py-14 md:py-16 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* CTA BANNER */}
      {content.cta && (
        <section id="contacto" className="scroll-mt-24 bg-white px-4 pb-10 pt-10 dark:bg-neutral-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[--swatch--slate-dark] to-cobalt-dark px-8 py-12 text-white shadow-[0_28px_90px_-45px_rgba(2,85,213,0.45)] md:px-14 md:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cobalt/25 blur-3xl"
              />

              <div className="relative flex flex-col items-start">
                {content.cta.trust && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[
                        { initials: "AG", from: "from-clay-fill", to: "to-[#9A3C1A]" },
                        { initials: "JM", from: "from-cobalt", to: "to-[#0144B0]" },
                        { initials: "LR", from: "from-[#9A3C1A]", to: "to-clay-fill" },
                      ].map((avatar) => (
                        <span
                          key={avatar.initials}
                          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} text-xs font-semibold text-white ring-2 ring-[--swatch--slate-dark] transition hover:-translate-y-px`}
                        >
                          {avatar.initials}
                        </span>
                      ))}
                    </div>
                    <a
                      href="https://maps.app.goo.gl/2a4Rheb6u94wFe46A"
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg key={index} className="h-3 w-3" viewBox="0 0 20 20" fill="#FACC15">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-white/60 group-hover:text-white/80 group-hover:underline underline-offset-2">
                        {content.cta.trust}
                      </p>
                    </a>
                  </div>
                )}

                <h2 className="mt-6 max-w-2xl font-serif text-3xl font-normal leading-[1.05] tracking-[-0.01em] text-white md:text-5xl">
                  {content.sectionTitles?.ctaTitle}
                </h2>

                <p className="mt-4 max-w-xl text-white/75 md:text-lg">{content.sectionTitles?.ctaSubtitle}</p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#formulario"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 font-semibold text-white transition hover:border-white/50 hover:bg-white/10 hover:scale-105"
                  >
                    {content.cta.formLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
      <FloatingCta href="https://wa.me/34626270806" label={content.floatingCtaLabel} />
      <WhatsAppBubble />
    </div>
  );
}
