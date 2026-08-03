"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Link as IntlLink } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { openCookieSettings } from "@/utils/cookie-manager";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { Dock, DockIcon } from "@/components/ui/dock";
import { NewsletterBanner } from "@/components/ui/newsletter-banner";
import { SiTiktok } from "react-icons/si";
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
  const tCookie = useTranslations("cookie");
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
        dockClass:
          "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white hover:brightness-110",
      },
      {
        icon: Youtube,
        label: "YouTube",
        href: "https://www.youtube.com/@ordinaly",
        handle: "youtube.com/@ordinaly",
        dockClass: "bg-[#FF0000] text-white hover:brightness-110",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/ordinalysoftware/",
        handle: "linkedin.com/company/ordinalysoftware",
        dockClass: "bg-[#0A66C2] text-white hover:brightness-110",
      },
      {
        icon: SiTiktok,
        label: "TikTok",
        href: "https://www.tiktok.com/@ordinaly.ai",
        handle: "@ordinaly.ai",
        dockClass: "bg-black text-white ring-1 ring-inset ring-[#25F4EE]/40 hover:ring-[#FE2C55]/60",
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
        href: "/nosotros",
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
      { src: "/static/contact/office_03.webp", alt: t("map.photoAlt") },
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
        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-14 pt-10 sm:px-6 lg:px-8 md:pb-20 md:pt-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
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

      <section className="pb-12 md:pb-16" id="direct-contacts">
        <div className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {contactChannels.map(({ icon: Icon, title, description, href, kind }) => (
            <a
              key={title}
              href={href}
              className="group flex h-full flex-col rounded-[1.75rem] border border-[--color-border-subtle] bg-white/75 p-5 transition hover:-translate-y-1 hover:border-clay/35 dark:border-white/10 dark:bg-white/[0.04]"
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

      <section id="contact-form" className="bg-[--swatch--slate-dark] py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
            <div className="h-full rounded-[2rem] border border-white/10 bg-white/6 p-6 text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] md:p-8">
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
              className="h-full [&>section]:max-w-none [&>section]:bg-transparent [&>section]:px-0 [&>section]:py-0"
              recaptchaAction="contact_page_form"
              recaptchaBadgeId="recaptcha-badge-contact-page"
            />
          </div>
        </div>
      </section>

      <section className="container pb-12 md:pb-16" id="location">
        <div className="mx-auto w-full max-w-[3400px] px-4 sm:px-6 lg:px-8"/>
          <div className="mb-8 text-center"> </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]">
            <div className="border-b border-[--color-border-subtle] p-6 dark:border-white/10 md:p-8">
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                {t("map.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
                {t("map.subtitle")}
              </p>
            </div>

            <div className="relative min-h-[320px] flex-1">
              {canLoadMedia ? (
                <iframe
                  title="Ordinaly Software Sevilla - Plaza del Duque de la Victoria, 1, 3º 9. 41002 Sevilla"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.8818083265837!2d-5.995837400000001!3d37.39262730000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126d4f91b87a51%3A0xa8b9785b4669f853!2sOrdinaly%20Software%20-%20Automatizaciones%20e%20IA!5e0!3m2!1ses!2ses!4v1765702540305!5m2!1ses!2ses"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-oat/60 px-6 py-8 text-center dark:bg-white/[0.04]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0255D5]/15 text-[#0255D5] dark:text-[#7DB5FF]">
                    <MapPin className="h-6 w-6" strokeWidth={1.6} />
                  </span>
                  <p className="text-sm font-semibold text-slate-dark dark:text-ivory-light">
                    {t("map.fallbackTitle")}
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed text-slate-medium dark:text-cloud-medium">
                    {t("map.fallbackDescription")}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/2a4Rheb6u94wFe46A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#0144AA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0255D5] dark:bg-[#7DB5FF] dark:text-black"
                  >
                    {t("map.cta")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={openCookieSettings}
                    className="text-[11px] font-medium text-slate-medium underline underline-offset-2 hover:text-clay dark:text-cloud-medium"
                  >
                    {tCookie("openCookieSettings")}
                  </button>
                </div>
              )}
            </div>
          </div>


            <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-white/75 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="relative min-h-[320px] flex-1">
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

      <section className="pb-12 md:pb-16">
        <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:px-8">
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-6 text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10 md:p-8">
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {t("socialShowcase.title")}
              </h2>
              <Dock
                direction="middle"
                iconSize={52}
                iconMagnification={66}
                iconDistance={120}
                className="mt-6 border-white/10 bg-white/5 px-4 py-4"
              >
                {socials.map((social) => (
                  <DockIcon
                    key={social.label}
                    className={cn("shadow-lg transition-transform", social.dockClass)}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-full w-full items-center justify-center"
                    >
                      <social.icon className="h-full w-full" strokeWidth={1.3} />
                    </a>
                  </DockIcon>
                ))}
              </Dock>
            </div>

            <NewsletterBanner className="mx-auto w-full max-w-[1600px]" />
          </div>


          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col justify-center rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--ivory-medium]/75 p-6 dark:border-white/10 dark:bg-white/[0.05] md:p-7">
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
                <IntlLink href="/nosotros">{t("team.cta")}</IntlLink>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {showWhatsAppBubble ? <WhatsAppBubble /> : <WhatsAppBubbleSkeleton />}
      <Footer />
    </div>
  );
}
