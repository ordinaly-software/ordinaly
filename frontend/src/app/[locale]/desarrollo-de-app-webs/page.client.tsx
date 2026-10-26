"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Globe, MonitorSmartphone, Zap } from "lucide-react";
import { FloatingCta } from "@/components/landing/floating-cta";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { PortfolioList, type PortfolioProject } from "@/components/landing/portfolio-list";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "@/contexts/theme-context";

// Literal hex arbitrary-value classes (not the `clay`/`cobalt` design-system
// tokens) because Tailwind can't generate opacity-modified utilities for
// colors that are defined as a CSS variable — `bg-clay/10` silently
// produces no rule. Written out in full per bullet, rather than built from
// a shared hex string, so Tailwind's static scanner can find each class.
const PWA_BULLETS = [
  {
    icon: Globe,
    iconClass: "bg-cobalt/10 text-cobalt dark:text-cobalt-light dark:bg-cobalt/15",
    hoverClass: "hover:bg-cobalt/10 dark:hover:bg-cobalt/15",
  },
  {
    icon: MonitorSmartphone,
    iconClass: "bg-clay/10 text-clay dark:bg-clay/15",
    hoverClass: "hover:bg-clay/10 dark:hover:bg-clay/15",
  },
  {
    icon: Zap,
    iconClass: "bg-[#788C5D]/10 text-[#788C5D] dark:bg-[#788C5D]/15",
    hoverClass: "hover:bg-[#788C5D]/10 dark:hover:bg-[#788C5D]/15",
  },
] as const;

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
  const { isDark, setIsDark } = useTheme();

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

  const themeDemo = content.themeDemo;

  const themeDemoCard: InfoCardItem[] = themeDemo
    ? [
        {
          key: "theme-demo",
          size: "md",
          media: (
            <div className="absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-br from-clay-fill to-[#9A3C1A] p-8 text-center text-white">
              <h3 className="text-2xl sm:text-3xl font-bold leading-snug">{themeDemo.title}</h3>
              <div className="relative flex items-center justify-center">
                <span className="absolute h-28 w-28 animate-ping rounded-full bg-white/40" />
                <AnimatedThemeToggler
                  theme={isDark ? "dark" : "light"}
                  onThemeChange={(theme) => setIsDark(theme === "dark")}
                  className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white text-clay shadow-2xl ring-4 ring-white/30 transition hover:scale-110 active:scale-95 [&_svg]:h-12 [&_svg]:w-12"
                />
              </div>
              <p className="text-base italic leading-relaxed text-white/90">{themeDemo.description}</p>
            </div>
          ),
        },
      ]
    : [];

  // Defined one by one (rather than mechanically mapped) so each card's
  // size can be chosen deliberately.
  const infocards: InfoCardItem[] = [
    { key: "design", size: "xl", title: infoCardTexts[0]?.name, description: infoCardTexts[1]?.description, image: "/static/servicios/engineers.webp" },
    { key: "seo", size: "md", title: infoCardTexts[1]?.name, description: infoCardTexts[2]?.description, image: "/static/desarrollo-de-app-webs/seo.webp" },
    { key: "automation", size: "md", title: infoCardTexts[2]?.name, description: infoCardTexts[3]?.description, image: "/static/servicios/software.webp" },
    { key: "ui", size: "xl", title: infoCardTexts[5]?.name, description: infoCardTexts[6]?.description, video: "/static/desarrollo-de-app-webs/ui.mp4", videoPlaybackRate: 0.4 },
    ...themeDemoCard,
    { key: "responsive", size: "lg", title: infoCardTexts[4]?.name, description: infoCardTexts[5]?.description, image: "/static/desarrollo-de-app-webs/responsive.webp" },  
    { key: "vps", size: "md", title: infoCardTexts[3]?.name, description: infoCardTexts[4]?.description, image: "/static/servicios/vps.webp" },
    ...requirementsCard,
    ...pricingCard,
  ];

  const portfolioTexts = (content.portfolio?.projects ?? []) as { name: string; description: string }[];

  const portfolioProjects: PortfolioProject[] = [
    { key: "ordinaly", name: portfolioTexts[0]?.name, description: portfolioTexts[0]?.description, image: "/static/desarrollo-de-app-webs/ordinaly.png", href: "https://ordinaly.ai" },
    { key: "geesol", name: portfolioTexts[1]?.name, description: portfolioTexts[1]?.description, image: "/static/desarrollo-de-app-webs/geesol.png", href: "https://geesol.com" },
    { key: "erp-madruga", name: portfolioTexts[2]?.name, description: portfolioTexts[2]?.description, image: "/static/desarrollo-de-app-webs/erp_madruga.png", href: "https://erp.madrugaconsulting.es" },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section id="inicio" className="scroll-mt-24 relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
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
            style={{ backgroundColor: "var(--swatch--clay-fill)" }}
          >
            {content.heroCtaLabel}
          </a>
        </div>
      </section>

      <section id="metodologia" className="scroll-mt-24 py-14 md:py-16 bg-neutral-50 dark:bg-neutral-800 transition-colors">
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
      <section id="que-es-una-pwa" className="scroll-mt-24 py-16 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
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
                  const { icon: Icon, iconClass, hoverClass } = PWA_BULLETS[i % PWA_BULLETS.length];
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-4 rounded-xl p-3 -mx-3 transition-colors ${hoverClass}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
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

        </div>
      </section>

      {/* INFO CARDS */}
      <section id="beneficios" className="scroll-mt-24 py-14 md:py-16 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="scroll-mt-24 py-14 md:py-16 px-6 bg-white dark:bg-neutral-900 transition-colors">
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

      <FloatingCta href="https://wa.me/34626270806" label={content.secondaryCtaLabel} />

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
