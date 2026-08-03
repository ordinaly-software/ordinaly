"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import Footer from "@/components/ui/footer";
import ContactForm from "@/components/ui/contact-form.client";
import { InfoCardCarousel, type InfoCardItem } from "@/components/ui/info-card-carousel";
import { FlipCard } from "@/components/ui/flip-card";
import { HowItWorksVideoSection } from "@/components/ui/how-it-works-video-section";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { MousePointerClick } from "lucide-react";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

type PlatformCardContent = {
  title?: string;
  bullets?: string[];
  price?: string;
  priceNote?: string;
  ctaLabel?: string;
};

function PlatformFlipCard({
  frontImage,
  content,
  accentColor,
  tapHint,
}: {
  frontImage: string;
  content: PlatformCardContent;
  accentColor: string;
  tapHint?: string;
}) {
  return (
    <FlipCard
      ariaLabel={content.title}
      front={
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <Image src={frontImage} alt={content.title ?? ""} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          {tapHint && (
            <div className="relative z-10 inline-flex animate-pulse items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
              <MousePointerClick className="h-4 w-4" />
              {tapHint}
            </div>
          )}
        </div>
      }
      back={
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">{content.title}</h3>
            <ul className="mt-4 space-y-2">
              {(content.bullets ?? []).map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between gap-4">
            {content.price && (
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {content.price}
                {content.priceNote && (
                  <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                    {content.priceNote}
                  </span>
                )}
              </p>
            )}
            {content.ctaLabel && (
              <a
                href="#formulario"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110"
                style={{ backgroundColor: accentColor }}
              >
                {content.ctaLabel}
              </a>
            )}
          </div>
        </div>
      }
    />
  );
}

export default function AutomatizacionRedesSocialesPage() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-redes-sociales"];

  if (!content) throw new Error("Missing content: automatizacion-redes-sociales");

  const pricing = content.pricing;
  const pricingCard: InfoCardItem[] = pricing
    ? [
        {
          key: "pricing",
          size: "lg",
          eyebrow: pricing.individualLabel,
          title: pricing.individualPrice,
          description: pricing.comboPrice ? (
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
          ) : undefined,
          ctaLabel: pricing.ctaLabel,
          href: pricing.ctaHref,
        },
      ]
    : [];

  // Defined one by one (rather than mechanically mapped) so each card's
  // size and background can be chosen deliberately.
  const infoCardTexts = (content.infocards?.cards ?? []) as { name: string; description: string }[];
  const infocards: InfoCardItem[] = [
    {
      key: "workflow",
      size: "xl",
      image: "/static/automatizacion-redes-sociales/workflow.webp",
    },
    {
      key: "software",
      size: "sm",
      title: infoCardTexts[1]?.name,
      description: infoCardTexts[1]?.description,
    },
    {
      key: "vps",
      size: "lg",
      title: infoCardTexts[0]?.name,
      description: infoCardTexts[0]?.description,
      image: "/static/automatizacion-redes-sociales/vps.webp",
    },
    {
      key: "accounts",
      size: "md",
      title: infoCardTexts[3]?.name,
      description: infoCardTexts[3]?.description,
    },
    {
      key: "sensitive-data",
      size: "sm",
      title: infoCardTexts[2]?.name,
      description: infoCardTexts[2]?.description,
      image: "/static/automatizacion-redes-sociales/sensitive_data.webp",
    },
    ...pricingCard,
  ];

  return (
    <div className="relative bg-white dark:bg-neutral-900">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-125"
          style={{ backgroundImage: "url('/static/automatizacion-redes-sociales/automatizacion-redes-sociales.webp')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,20,19,0.55),rgba(20,20,19,0.3),rgba(20,20,19,0.55))]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-xl leading-tight">
            {content.title}
          </h1>
          <p className="mt-4 text-neutral-200 text-lg md:text-xl max-w-2xl">
            {content.subtitle}
          </p>
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

      {/* PLATFORM CARDS */}
      <section className="py-20 md:py-24 px-6 bg-white dark:bg-neutral-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
          {content.sectionTitles?.cards}
        </h2>

        <div className="grid sm:grid-cols-2 gap-10 max-w-3xl mx-auto">
          <PlatformFlipCard
            content={content.cards?.meta}
            accentColor="#d97757"
            tapHint={content.cards?.tapHint}
            frontImage="/static/automatizacion-redes-sociales/instagram_card.webp"
          />

          <PlatformFlipCard
            content={content.cards?.linkedin}
            accentColor="#0A66C2"
            tapHint={content.cards?.tapHint}
            frontImage="/static/automatizacion-redes-sociales/linkedin_card.webp"
          />
        </div>

        {content.offer && (
          <div className="mt-12 w-full max-w-3xl mx-auto rounded-2xl border-2 border-dashed border-[#d97757] bg-[#d97757]/5 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d97757] mb-2">
              {content.offer.label}
            </p>
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{content.offer.price}</span>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-sm">{content.offer.note}</p>
          </div>
        )}
      </section>

      <HowItWorksVideoSection
        title={content.sectionTitles?.howItWorks}
        steps={content.steps ?? []}
      />

      {/* SECURITY + REQUIREMENTS */}
      <section className="py-20 md:py-24 px-6 bg-white dark:bg-neutral-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {content.sectionTitles?.security}
        </h2>

        <InfoCardCarousel items={infocards} className="max-w-6xl mx-auto" />
      </section>

      {/* FORM */}
      <section id="formulario" className="py-20 bg-white dark:bg-neutral-900">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-redes-sociales-contact">
          <ContactForm />
        </ReCaptchaWrapper>
      </section>
      

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
