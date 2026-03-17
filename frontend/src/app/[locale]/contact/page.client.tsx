"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Link as IntlLink } from "@/i18n/navigation";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import ThirdPartyConsent from "@/components/ui/third-party-consent";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import {
  ArrowRight,
  Building2,
  Clock3,
  ExternalLink,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Users,
  VideoIcon,
  Youtube,
  type LucideIcon,
} from "lucide-react";

const WhatsAppBubble = dynamic(
  () => import("@/components/home/whatsapp-bubble").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <WhatsAppBubbleSkeleton />,
  },
);

type SupportCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  kind: "page" | "anchor" | "external";
};

type ExploreCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  kind: "page" | "external";
};

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const tHome = useTranslations("home");
  const [locationImageIndex, setLocationImageIndex] = useState(0);
  const cookiePreferences = useCookiePreferences();
  const canLoadMedia = Boolean(cookiePreferences?.marketing);
  const [showWhatsAppBubble, setShowWhatsAppBubble] = useState(false);

  const team = useMemo(
    () => [
      {
        name: t("team.1.name"),
        title: t("team.1.role"),
        image: "/static/team/antonio.webp",
        bio: t("team.1.quote"),
        linkedin: "https://www.linkedin.com/in/antoniommff/",
      },
      {
        name: t("team.2.name"),
        title: t("team.2.role"),
        image: "/static/team/guillermo.webp",
        bio: t("team.2.quote"),
        linkedin: "https://www.linkedin.com/in/guillermomontero/",
      },
      {
        name: t("team.3.name"),
        title: t("team.3.role"),
        image: "/static/team/emilio.webp",
        bio: t("team.3.quote"),
        linkedin: "https://www.linkedin.com/in/emiliocidperez/",
      },
    ],
    [t],
  );

  const contactChannels = useMemo<SupportCard[]>(
    () => [
      {
        icon: Phone,
        title: t("info.phoneLabel"),
        description: "+34 626 27 08 06",
        href: "tel:+34626270806",
        kind: "external",
      },
      {
        icon: Mail,
        title: t("info.emailLabel"),
        description: "info@ordinaly.ai",
        href: "mailto:info@ordinaly.ai",
        kind: "external",
      },
      {
        icon: MapPin,
        title: t("info.addressLabel"),
        description: "Plaza del Duque de la Victoria 1, 3º 9. 41002, Sevilla, España",
        href: "https://maps.app.goo.gl/2a4Rheb6u94wFe46A",
        kind: "external",
      },
      {
        icon: Clock3,
        title: t("info.hoursLabel"),
        description: t("info.hoursValue"),
        href: "#contact-form",
        kind: "anchor",
      },
    ],
    [t],
  );

  const socials = useMemo(
    () => [
      {
        icon: Instagram,
        label: "Instagram",
        href: "https://www.instagram.com/ordinaly.ai",
        handle: "@ordinaly.ai",
        surfaceClass:
          "border-[#0255D5]/15 bg-[linear-gradient(135deg,rgba(2,85,213,0.12),rgba(255,255,255,0.92))] hover:border-[#0255D5]/35 dark:border-[#7DB5FF]/20 dark:bg-[linear-gradient(135deg,rgba(2,85,213,0.18),rgba(255,255,255,0.04))]",
        iconClass:
          "bg-[#0255D5]/12 text-[#0255D5] dark:bg-[#0255D5]/18 dark:text-[#7DB5FF]",
        handleClass: "text-[#0255D5] dark:text-[#7DB5FF]",
      },
      {
        icon: Youtube,
        label: "YouTube",
        href: "https://www.youtube.com/@ordinaly",
        handle: "youtube.com/@ordinaly",
        surfaceClass:
          "border-[#0d6e0c]/15 bg-[linear-gradient(135deg,rgba(13,110,12,0.1),rgba(255,255,255,0.92))] hover:border-[#1F8A0D]/35 dark:border-[#3FBD6F]/20 dark:bg-[linear-gradient(135deg,rgba(13,110,12,0.16),rgba(255,255,255,0.04))]",
        iconClass:
          "bg-[#1F8A0D]/12 text-[#0d6e0c] dark:bg-[#1F8A0D]/18 dark:text-[#3FBD6F]",
        handleClass: "text-[#0d6e0c] dark:text-[#3FBD6F]",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/ordinalysoftware/",
        handle: "linkedin.com/company/ordinalysoftware",
        surfaceClass:
          "border-[#0255D5]/15 bg-[linear-gradient(135deg,rgba(2,85,213,0.1),rgba(13,110,12,0.06),rgba(255,255,255,0.9))] hover:border-[#0255D5]/35 dark:border-[#7DB5FF]/20 dark:bg-[linear-gradient(135deg,rgba(2,85,213,0.16),rgba(13,110,12,0.1),rgba(255,255,255,0.04))]",
        iconClass:
          "bg-[#0255D5]/12 text-[#0255D5] dark:bg-[#0255D5]/18 dark:text-[#7DB5FF]",
        handleClass: "text-[#0255D5] dark:text-[#7DB5FF]",
      },
      {
        icon: VideoIcon,
        label: "TikTok",
        href: "https://www.tiktok.com/@ordinaly.ai",
        handle: "@ordinaly.ai",
        surfaceClass:
          "border-[#0d6e0c]/15 bg-[linear-gradient(135deg,rgba(13,110,12,0.08),rgba(2,85,213,0.08),rgba(255,255,255,0.92))] hover:border-[#1F8A0D]/35 dark:border-[#3FBD6F]/20 dark:bg-[linear-gradient(135deg,rgba(13,110,12,0.14),rgba(2,85,213,0.12),rgba(255,255,255,0.04))]",
        iconClass:
          "bg-[#0d6e0c]/12 text-[#0d6e0c] dark:bg-[#0d6e0c]/20 dark:text-[#3FBD6F]",
        handleClass: "text-[#0d6e0c] dark:text-[#3FBD6F]",
      },
    ],
    [],
  );

  const exploreCards = useMemo<ExploreCard[]>(
    () => [
      {
        icon: Users,
        title: t("explore.items.0.title"),
        description: t("explore.items.0.description"),
        cta: t("explore.items.0.cta"),
        href: "/about",
        kind: "page",
      },
      {
        icon: Youtube,
        title: t("explore.items.1.title"),
        description: t("explore.items.1.description"),
        cta: t("explore.items.1.cta"),
        href: "https://www.youtube.com/@ordinaly",
        kind: "external",
      },
      {
        icon: Building2,
        title: t("explore.items.2.title"),
        description: t("explore.items.2.description"),
        cta: t("explore.items.2.cta"),
        href: "https://maps.app.goo.gl/2a4Rheb6u94wFe46A",
        kind: "external",
      },
    ],
    [t],
  );

  const locationImages = useMemo(
    () => [
      { src: "/static/contact/office_01.webp", alt: t("map.photoAlt") },
      { src: "/static/contact/office_02.webp", alt: t("map.photoAlt") },
    ],
    [t],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationImageIndex((prev) => (prev + 1) % locationImages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [locationImages.length]);

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const scheduleBubble = () => setShowWhatsAppBubble(true);
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(scheduleBubble, { timeout: 800 });
    } else {
      timeoutHandle = window.setTimeout(scheduleBubble, 600);
    }

    return () => {
      if (idleHandle !== null) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      <section className="relative overflow-hidden border-b border-[--color-border-subtle] dark:border-[--color-border-strong]">
        <div className="relative u-container pb-14 pt-10 md:pb-20 md:pt-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <Image
                src="/logo.webp"
                alt={tHome("logo.alt")}
                width={220}
                height={220}
                className="h-24 w-24 rounded-[1.75rem] sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                priority
              />
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-medium dark:text-cloud-medium md:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <a href="#contact-form">{t("hero.primaryCta")}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
              <a href="tel:+34626270806">{t("hero.call")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <br/>

      <section className="u-container pb-12 md:pb-16" id="direct-contacts">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {contactChannels.map(({ icon: Icon, title, description, href, kind }) => (
            <a
              key={title}
              href={href}
              className="group rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-5 transition hover:-translate-y-1 hover:border-clay/35 dark:border-white/10 dark:bg-white/[0.04]"
              target={kind === "external" && href.startsWith("http") ? "_blank" : undefined}
              rel={kind === "external" && href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-oat text-clay dark:bg-white/10">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <p className="mt-5 text-sm uppercase tracking-[0.16em] text-cloud-dark dark:text-cloud-medium">
                {title}
              </p>
              <p className="mt-2 text-base font-semibold leading-snug group-hover:text-clay">
                {description}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="u-container pb-12 md:pb-16" id="contact-form">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
          <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-6 text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10 md:p-8">
            <p className="label-meta text-white/60">{t("formAside.eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              {t("formAside.title")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              {t("formAside.subtitle")}
            </p>
            <div className="mt-8 space-y-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                    {t(`formAside.items.${index}.label`)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {t(`formAside.items.${index}.value`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm
            className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0"
            recaptchaAction="contact_page_form"
            recaptchaBadgeId="recaptcha-badge-contact-page"
          />
        </div>
      </section>

      <section className="u-container pb-12 md:pb-16" id="location">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]">
            <div className="border-b border-[--color-border-subtle] p-6 dark:border-white/10 md:p-8">
              <p className="label-meta text-clay">{t("map.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                {t("map.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
                {t("map.subtitle")}
              </p>
            </div>

            {canLoadMedia ? (
              <iframe
                title="Ordinaly Software Sevilla - Plaza del Duque de la Victoria, 1, 3º 9. 41002 Sevilla"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.8818083265837!2d-5.995837400000001!3d37.39262730000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126d4f91b87a51%3A0xa8b9785b4669f853!2sOrdinaly%20Software%20-%20Automatizaciones%20e%20IA!5e0!3m2!1ses!2ses!4v1765702540305!5m2!1ses!2ses"
                width="100%"
                height="460"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            ) : (
              <div className="h-[460px] w-full bg-white/70 dark:bg-gray-900/60">
                <ThirdPartyConsent className="h-full w-full" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--ivory-medium]/75 p-6 dark:border-white/10 dark:bg-white/[0.05] md:p-7">
              <p className="label-meta text-clay">{t("team.eyebrow")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {t("team.title")}
              </h2>
              <div className="mt-5 space-y-4">
                {team.map((person) => (
                  <div key={person.name} className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[--color-border-subtle] dark:border-white/10">
                      <Image src={person.image} alt={person.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{person.name}</p>
                      <p className="text-sm text-slate-medium dark:text-cloud-medium">
                        {person.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                        {person.bio}
                      </p>
                    </div>
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn de ${person.name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[--color-border-subtle] transition hover:border-clay/40 hover:text-clay dark:border-white/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-6 w-full">
                <IntlLink href="/about">{t("team.cta")}</IntlLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="u-container pb-12 md:pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-6 text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10 md:p-8">
            <p className="label-meta text-white/60">{t("map.eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              {t("map.title")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              {t("map.subtitle")}
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
                Plaza del Duque
              </p>
              <p className="mt-2 text-lg font-semibold leading-tight text-white">
                Plaza del Duque de la Victoria 1, 3º 9
              </p>
              <p className="mt-1 text-sm text-white/70">41002 Sevilla, España</p>
            </div>
            <Button asChild variant="outline" className="mt-6 w-full justify-between border-white/15 bg-white/5 text-white hover:bg-white/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <a
                href="https://maps.app.goo.gl/2a4Rheb6u94wFe46A"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("map.cta")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]">
            <div className="relative h-[320px] md:h-[380px]">
              <button
                type="button"
                onClick={() => setLocationImageIndex((prev) => (prev + 1) % locationImages.length)}
                className="absolute inset-0 h-full w-full"
                aria-label={t("map.photoAlt")}
              >
                <Image
                  src={locationImages[locationImageIndex].src}
                  alt={locationImages[locationImageIndex].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-lg font-semibold leading-tight">
                  Plaza del Duque de la Victoria 1, 3º 9
                </p>
                <p className="mt-1 text-sm text-white/80">41002 Sevilla, España</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="u-container pb-16 md:pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t("explore.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
            {t("explore.subtitle")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {exploreCards.map(({ icon: Icon, title, description, cta, href, kind }) => {
            const content = (
              <div className="group flex h-full flex-col rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-6 transition hover:-translate-y-1 hover:border-clay/35 dark:border-white/10 dark:bg-white/[0.04]">
                <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-oat text-clay dark:bg-white/10">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {description}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-clay">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );

            if (kind === "page") {
              return (
                <IntlLink key={title} href={href} className="block h-full">
                  {content}
                </IntlLink>
              );
            }

            return (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {content}
              </a>
            );
          })}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[--color-border-subtle] bg-[linear-gradient(135deg,rgba(2,85,213,0.06),rgba(13,110,12,0.06),rgba(255,255,255,0.88))] p-4 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(2,85,213,0.12),rgba(13,110,12,0.1),rgba(255,255,255,0.03))] sm:p-5">
          <div className="flex flex-wrap justify-center gap-3">
            {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-sm font-medium shadow-[0_16px_36px_-26px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 ${item.surfaceClass}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${item.iconClass}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <span className={`transition group-hover:text-slate-dark dark:group-hover:text-ivory-light ${item.handleClass}`}>
                {item.handle}
              </span>
            </a>
            ))}
          </div>
        </div>
      </section>

      {showWhatsAppBubble ? <WhatsAppBubble /> : <WhatsAppBubbleSkeleton />}
      <Footer />
    </div>
  );
}
