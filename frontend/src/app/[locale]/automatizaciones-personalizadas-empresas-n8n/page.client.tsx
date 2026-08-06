"use client";

import { useMessages } from "next-intl";
import Image from "next/image";
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
  IconArrowUpRight,
} from "@tabler/icons-react";
import { Mail, Phone, Bell } from "lucide-react";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import N8nFlow, { type N8nFlowContent } from "@/components/landing/n8n-flow";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { IconN8n, IconWhatsApp, IconOdoo } from "@/components/ui/brand-icons";
import { HowItWorksVideoSection } from "@/components/landing/how-it-works-video-section";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { AnimatedList } from "@/components/ui/animated-list";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import ReCaptchaWrapper from "../recaptcha-provider";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const slug = "automatizaciones-personalizadas-empresas-n8n" as const;
const ICON_SIZE = 36;

type WorkflowEvent = { title: string; description: string; time: string };

type LandingContent = {
  title: string;
  subtitle: string;
  description: string;
  heroBadge?: string;
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
    ctaSubtitle?: string;
    howItWorks?: string;
  };
  whatIsN8N: string;
  whatIsN8NHighlight?: string;
  workflowAnimation?: N8nFlowContent;
  howItWorksSteps?: { title: string; description: string }[];
  team?: { title: string; description: string };
  benefitCards?: { title: string; description: string }[];
  vpsCard?: { title: string; description: string };
  observability?: { title: string; events: WorkflowEvent[] };
  security?: { trustPoints?: string[] };
  pricing?: {
    instanceLabel: string;
    instancePrice: string;
    workflowLabel: string;
    workflowNote: string;
    contactLabel: string;
  };
  faq: { question: string; answer: string }[];
  cta?: { label: string; href: string; trust?: string };
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

export default function AutomatizacionesPersonalizadasN8nPage() {
  const messages = useMessages() as { landings?: Record<string, LandingContent> };
  const content = messages.landings?.[slug];

  if (!content) throw new Error(`Missing landing content: ${slug}`);

  const trustPoints = content.security?.trustPoints ?? [];
  const benefits = content.benefitCards ?? [];
  const observabilityEvents = content.observability?.events ?? [];
  const pricing = content.pricing;

  const benefitCards: InfoCardItem[] = benefits.map((benefit, i) => ({
    key: `benefit-${i}`,
    size: "sm",
    title: benefit.title,
    description: benefit.description,
  }));

  const vpsCard: InfoCardItem[] = content.vpsCard
    ? [
        {
          key: "vps",
          size: "lg",
          title: content.vpsCard.title,
          description: content.vpsCard.description,
          image: `/static/${slug}/vps.webp`,
        },
      ]
    : [];

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

  const teamCard: InfoCardItem[] = content.team
    ? [
        {
          key: "team",
          size: "lg",
          title: content.team.title,
          description: content.team.description,
          image: `/static/${slug}/engineers.webp`,
        },
      ]
    : [];

  const securityCard: InfoCardItem[] = trustPoints.length
    ? [
        {
          key: "security",
          size: "lg",
          title: content.sectionTitles?.security,
          description: (
            <ul className="not-italic space-y-2 text-left text-base">
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

  const pricingCard: InfoCardItem[] = pricing
    ? [
        {
          key: "pricing",
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
                  {pricing.workflowNote}
                </span>
              </span>
              <span className="not-italic mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-medium dark:text-cloud-medium">
                {pricing.contactLabel}
              </span>
              <span className="not-italic mt-2 flex items-center gap-2">
                <a
                  href="https://wa.me/34626270806?text=Quiero%20consultar%20precio%20de%20una%20automatizaci%C3%B3n%20personalizada"
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
                  aria-label="Teléfono"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[--swatch--slate-dark] text-white transition hover:brightness-110 dark:bg-[--swatch--slate-medium]"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </span>
            </>
          ),
        },
      ]
    : [];

  // Defined one by one (rather than mechanically mapped) so each card's
  // size can be chosen deliberately.
  const infocards: InfoCardItem[] = [
    {
      key: "workflow-image",
      size: "xl",
      image: `/static/${slug}/automatizaciones_personalizadas.webp`,
    },
    ...benefitCards,
    ...vpsCard,
    ...observabilityCard,
    ...teamCard,
    ...securityCard,
    ...pricingCard,
  ];

  return (
    <div className="relative bg-white dark:bg-neutral-900">
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-[--swatch--slate-dark] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
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

            <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-2xl">
              <a
                href="#formulario"
                className="flex flex-col items-start justify-center gap-1 rounded-2xl bg-clay px-6 py-6 font-semibold text-white shadow-lg transition hover:scale-105"
              >
                <span className="text-base">{content.heroCtaLabel}</span>
              </a>

              <a
                href={content.secondaryCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start justify-center gap-2 rounded-2xl px-6 py-6 font-semibold border border-white/15 text-white/80 hover:text-white hover:border-white/40 transition hover:scale-[1.03]"
              >
                <IconWhatsApp size={22} />
                <span className="text-base">{content.secondaryCtaLabel}</span>
              </a>

              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start justify-center gap-2 rounded-2xl px-6 py-6 font-semibold bg-white text-neutral-900 shadow-lg transition hover:scale-[1.03] hover:bg-neutral-100"
              >
                <IconN8n size={22} />
                <span className="flex items-center gap-1 text-base">
                  {content.n8nCtaLabel}
                  <IconArrowUpRight size={18} />
                </span>
              </a>
            </div>
          </div>

          {content.workflowAnimation && (
            <div className="flex justify-center md:justify-end">
              <N8nFlow content={content.workflowAnimation} />
            </div>
          )}
        </div>
      </section>

      <HowItWorksVideoSection title={content.sectionTitles?.howItWorks} steps={content.howItWorksSteps} />

      {/* WHAT IS N8N */}
      <section className="py-24 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight dark:text-white">
              {content.sectionTitles?.whatIsN8N}
            </h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {content.whatIsN8N}
              {content.whatIsN8NHighlight && (
                <>
                  {" "}
                  <em className="italic">{content.whatIsN8NHighlight}</em>
                </>
              )}
            </p>
            <Button variant="outline" size="lg" className="mt-8 gap-2" asChild>
              <a href="https://n8n.io" target="_blank" rel="noopener noreferrer">
                <IconN8n size={20} />
                {content.n8nCtaLabel}
                <IconArrowUpRight size={18} />
              </a>
            </Button>
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

      {/* INTEGRATIONS MARQUEE */}
      {content.sectionTitles?.integrations && (
        <ToolsShowcase title={content.sectionTitles.integrations} logos={integrationLogos} />
      )}

      {/* INFO CARDS: benefits, team, security, pricing */}
      <section className="py-14 md:py-16 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.benefits}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-6xl mx-auto" />
      </section>

      {/* CTA BANNER */}
      {content.cta && (
        <section className="bg-white px-4 pb-24 pt-10 dark:bg-neutral-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[--swatch--slate-dark] to-[--swatch--cobalt-dark] px-8 py-12 text-white shadow-[0_28px_90px_-45px_rgba(2,85,213,0.45)] md:px-14 md:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cobalt/25 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-clay/15 blur-3xl"
              />

              <div className="relative flex flex-col items-start">
                {content.cta.trust && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[
                        { initials: "AG", from: "from-clay", to: "to-[#C6613F]" },
                        { initials: "JM", from: "from-cobalt", to: "to-[#0144B0]" },
                        { initials: "LR", from: "from-[#D4A27F]", to: "to-[#D97757]" },
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

                <h2 className="mt-6 max-w-2xl bg-gradient-to-r from-white to-[--swatch--sky] bg-clip-text text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-transparent md:text-5xl">
                  {content.sectionTitles?.ctaTitle}
                </h2>

                <p className="mt-4 max-w-xl text-white/75 md:text-lg">{content.sectionTitles?.ctaSubtitle}</p>

                <a
                  href={content.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-[--swatch--slate-dark] shadow-lg transition hover:scale-105 hover:bg-neutral-100"
                >
                  {content.cta.label}
                </a>
              </div>
            </div>
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
