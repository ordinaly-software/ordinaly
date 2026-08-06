"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Globe, MonitorSmartphone, Zap } from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { PortfolioList, type PortfolioProject } from "@/components/landing/portfolio-list";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";

const PWA_BULLET_ICONS = [Globe, MonitorSmartphone, Zap];

function highlightWord(text: string | undefined, word: string) {
  if (!text) return text;
  const parts = text.split(new RegExp(`(${word})`));
  return parts.map((part, i) =>
    part === word ? (
      <em key={i} className="italic">
        {part}
      </em>
    ) : (
      part
    )
  );
}

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

export default function DesarrolloDeAppWebs() {
  const messages = useMessages() as any;
  const content = messages.landings?.["desarrollo-de-app-webs"];

  if (!content) {
    throw new Error("Missing landing content: desarrollo-de-app-webs");
  }

  const infoCardTexts = (content.infocards?.cards ?? []) as { name: string; description?: string }[];

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
          size: "md",
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

  // Defined one by one (rather than mechanically mapped) so each card's
  // size can be chosen deliberately.
  const infocards: InfoCardItem[] = [
    { key: "design", size: "xl", title: infoCardTexts[0]?.name, description: infoCardTexts[1]?.description, image: "/static/desarrollo-de-app-webs/design.webp" },
    { key: "seo", size: "md", title: infoCardTexts[1]?.name, description: infoCardTexts[2]?.description, image: "/static/desarrollo-de-app-webs/seo.webp" },
    { key: "automation", size: "md", title: infoCardTexts[2]?.name, description: infoCardTexts[3]?.description, image: "/static/desarrollo-de-app-webs/automation.webp" },
    { key: "ui", size: "xl", title: infoCardTexts[5]?.name, description: infoCardTexts[6]?.description, video: "/static/desarrollo-de-app-webs/ui.mp4", videoPlaybackRate: 0.4 },
    { key: "responsive", size: "lg", title: infoCardTexts[4]?.name, description: infoCardTexts[5]?.description, image: "/static/desarrollo-de-app-webs/responsive.webp" },  
    { key: "vps", size: "md", title: infoCardTexts[3]?.name, description: infoCardTexts[4]?.description, image: "/static/desarrollo-de-app-webs/vps.webp" },
    ...requirementsCard,
    ...pricingCard,
  ];

  const portfolioTexts = (content.portfolio?.projects ?? []) as { name: string; description: string }[];

  const portfolioProjects: PortfolioProject[] = [
    { key: "ordinaly", name: portfolioTexts[0]?.name, description: portfolioTexts[0]?.description, image: "/static/desarrollo-de-app-webs/ordinaly.webp", href: "https://ordinaly.ai" },
    { key: "geesol", name: portfolioTexts[1]?.name, description: portfolioTexts[1]?.description, image: "/static/desarrollo-de-app-webs/geesol.webp", href: "https://geesol.com" },
    { key: "fisiofind", name: portfolioTexts[2]?.name, description: portfolioTexts[2]?.description, image: "/static/desarrollo-de-app-webs/fisiofind.webp", href: "https://fisiofind-landing-page.netlify.app" },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-125"
          style={{ backgroundImage: "url('/static/desarrollo-de-app-webs/desarrollo_de_app_webs.webp')" }}
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

      <section className="py-14 md:py-16 bg-neutral-50 dark:bg-neutral-800 transition-colors">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {highlightWord(content.videoSection?.title, "Agile")}
        </h2>

        <div className="max-w-3xl mx-auto">
          <HeroVideoDialog
            className="w-full"
            animationStyle="from-center"
            videoUrl={content.videoSection?.videoUrl}
            thumbnailSrc="/static/desarrollo-de-app-webs/video_thumbnail.webp"
            thumbnailAlt={content.videoSection?.videoCaptionText}
          />
            <div className="mt-4 text-center">
              <p className="font-semibold text-slate-dark dark:text-ivory-light">
                {content.videoSection?.videoCaptionName}
              </p>
              <p className="text-sm text-slate-medium dark:text-cloud-medium">
                {content.videoSection?.videoCaptionRole}
              </p>
            </div>
        </div>
      </div>
      </section>

      {/* WHAT IS A PWA */}
      <section className="py-16 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-dark dark:text-ivory-light mb-5 leading-tight">
                {content.sectionTitles?.whatIsPWA}
              </h2>
              <p className="text-lg text-slate-medium dark:text-cloud-medium leading-relaxed mb-8">
                {content.whatIsPWA?.intro}
              </p>

              <ul className="space-y-2">
                {content.whatIsPWA?.bullets?.map((bullet: string, i: number) => {
                  const Icon = PWA_BULLET_ICONS[i % PWA_BULLET_ICONS.length];
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-4 rounded-xl p-3 -mx-3 transition-colors hover:bg-ivory-medium dark:hover:bg-neutral-800"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay/10 text-clay dark:bg-clay/15">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="pt-1.5 text-slate-dark dark:text-ivory-light leading-relaxed">
                        {bullet}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-center">
              <Image
                src="/static/desarrollo-de-app-webs/pwa.webp"
                alt={content.title}
                width={2048}
                height={771}
                className="w-full max-w-md h-auto object-contain dark:invert transition-[filter] duration-300"
              />
            </div>
          </div>

          {content.whatIsPWA?.highlight && (
            <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-ivory-light dark:bg-neutral-800 border-l-4 border-clay p-6 md:p-8 transition-colors">
              <p className="text-lg font-medium text-slate-dark dark:text-ivory-light leading-relaxed">
                {content.whatIsPWA.highlight}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="py-14 md:py-16 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-6xl mx-auto" />
      </section>

      {/* PORTFOLIO */}
      <section className="py-14 md:py-16 px-6 bg-white dark:bg-neutral-900 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
          {content.sectionTitles?.portfolioTitle}
        </h2>
        <PortfolioList
          projects={portfolioProjects}
          ctaLabel={content.portfolio?.ctaLabel}
          className="max-w-5xl mx-auto"
        />
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
