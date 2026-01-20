"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import ThirdPartyConsent from "@/components/ui/third-party-consent";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import { WorkWithUsSection } from "@/components/ui/work-with-us";
import { Mail, Phone, MapPin, Clock, Send, Instagram, Youtube, Pin, Linkedin, VideoIcon, ExternalLink } from "lucide-react";
import Footer from "@/components/ui/footer";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(
  () => import("@/components/home/whatsapp-bubble").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <WhatsAppBubbleSkeleton />,
  },
);

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const [locationImageIndex, setLocationImageIndex] = useState(0);
  const cookiePreferences = useCookiePreferences();
  const canLoadMedia = Boolean(cookiePreferences?.thirdParty);
  const [showWhatsAppBubble, setShowWhatsAppBubble] = useState(false);

  const team = [
    {
      name: t('team.1.name'),
      title: t('team.1.role'),
      image: "/static/team/antonio.webp",
      bio: t('team.1.quote'),
      linkedin: "https://www.linkedin.com/in/antoniommff/",
    },
    {
      name: t('team.2.name'),
      title: t('team.2.role'),
      image: "/static/team/guillermo.webp",
      bio: t('team.2.quote'),
      linkedin: "https://www.linkedin.com/in/guillermomontero/",
    },
    {
      name: t('team.3.name'),
      title: t('team.3.role'),
      image: "/static/team/emilio.webp",
      bio: t('team.3.quote'),
      linkedin: "https://www.linkedin.com/in/emiliocidperez/",
    },
  ];

  const contactMethods = useMemo(
    () => [
      {
        icon: Mail,
        label: t("info.emailLabel"),
        value: "info@ordinaly.ai",
        href: "mailto:info@ordinaly.ai",
      },
      {
        icon: Phone,
        label: t("info.phoneLabel"),
        value: "+34 626 27 08 06",
        href: "tel:+34626270806",
      },
      {
        icon: MapPin,
        label: t("info.addressLabel"),
        value: "Plaza del Duque de la Victoria 1, 3º 9. 41002, Sevilla, España",
        href: "https://maps.app.goo.gl/2a4Rheb6u94wFe46A",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        icon: Clock,
        label: t("info.hoursLabel"),
        value: t("info.hoursValue"),
      },
    ],
    [t]
  );

  const socials = useMemo(
    () => [
      {
        icon: Instagram,
        label: "Instagram",
        href: "https://www.instagram.com/ordinaly.ai",
        handle: "@ordinaly.ai",
        color: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 75%, #515bd4 100%)",
      },
      {
        icon: Youtube,
        label: "YouTube",
        href: "https://www.youtube.com/@ordinaly",
        handle: "youtube.com/@ordinaly",
        color: "#FF0000",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/ordinalysoftware/",
        handle: "LinkedIn",
        color: "#0A66C2",
      },
      {
        icon: VideoIcon,
        label: "TikTok",
        href: "https://www.tiktok.com/@ordinaly.ai",
        handle: "TikTok @ordinaly.ai",
        color: "#010101",
      },
    ],
    []
  );

  const locationImages = useMemo(
    () => [
      { src: "/static/contact/office_01.webp", alt: t("map.photoAlt") },
      { src: "/static/contact/office_02.webp", alt: t("map.photoAlt") },
    ],
    [t]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationImageIndex((prev) => (prev + 1) % locationImages.length);
    }, 3000);
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
    <div className="bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white min-h-screen">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-[url('/static/backgrounds/services_background.webp')] bg-cover bg-center opacity-60 scale-110"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F8A0D]/20 dark:from-[#3FBD6F]/20 via-[#46B1C9]/20 to-[#623CEA]/15 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                {t("hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="inline-flex items-center gap-2 bg-[#0d6e0c] dark:bg-[#3FBD6F] text-white dark:text-black"
                >
                  <a href="#location">
                    <Pin className="h-4 w-4" />
                    {t("hero.location")}
                  </a>
                </Button>
                <Button
                  asChild
                  className="inline-flex items-center gap-2 py-3 rounded-xl font-semibold border border-gray-300/70 dark:border-gray-700 hover:-translate-y-0.5 transition-transform bg-white/70 dark:bg-white/5 text-gray-800 dark:text-white"
                >
                  <a href="#contact-form">
                    <Send className="h-4 w-4" />
                    {t("hero.secondaryCta")}
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 bg-white/50 dark:bg-black/30 blur-3xl rounded-full" />
              <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full">
                  <div className="relative w-full aspect-video overflow-hidden">
                    {/* <video
                      ref={heroVideoRef}
                      className="absolute inset-0 h-full w-full object-cover"
                      playsInline
                      muted
                      loop
                      preload="none"
                      controls={false}
                      poster="/static/contact/contact_pic.webp"
                    >
                      {shouldLoadHeroVideo && (
                        <>
                          <source src="/static/office_video.mp4" type="video/mp4" />
                        </>
                      )}
                    </video> */}
                    <Image
                      src="/static/contact/contact_pic.webp"
                      alt="Contact us at Ordinaly Software"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      priority={true}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("hero.contactCardTitle")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{t("hero.contactCardText")}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400">{t("info.emailLabel")}</p>
                      <a
                        href="mailto:info@ordinaly.ai"
                        className="font-semibold text-[#1F8A0D] dark:text-[#3FBD6F] hover:underline"
                      >
                        info@ordinaly.ai
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400">{t("info.phoneLabel")}</p>
                      <a
                        href="tel:+34626270806"
                        className="font-semibold text-[#1F8A0D] dark:text-[#3FBD6F] hover:underline"
                      >
                        +34 626 27 08 06
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" id="contact-form">
        <ContactForm />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" id="direct-contacts">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t("info.title")}
          </h3>
          <div className="space-y-3">
            {contactMethods.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#1F8A0D] dark:text-[#3FBD6F]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                  <a
                    href={item.href}
                    className="font-semibold text-gray-900 dark:text-white hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F]"
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#3FBD6F] font-semibold mb-3">
              {t("info.socialTitle")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{
                    background: item.color,
                    borderColor: "transparent",
                  }}
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" id="location">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("map.title")}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t("map.subtitle")}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
              {canLoadMedia ? (
                <iframe
                  title="Ordinaly Software Sevilla - Plaza del Duque de la Victoria, 1, 3º 9. 41002 Sevilla"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.8818083265837!2d-5.995837400000001!3d37.39262730000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126d4f91b87a51%3A0xa8b9785b4669f853!2sOrdinaly%20Software%20-%20Automatizaciones%20e%20IA!5e0!3m2!1ses!2ses!4v1765702540305!5m2!1ses!2ses"
                  width="100%"
                  height="420"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              ) : (
                <div className="h-[420px] w-full bg-white/70 dark:bg-gray-900/60">
                  <ThirdPartyConsent className="h-full w-full" />
                </div>
              )}
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="relative h-full min-h-[260px]">
                <button
                  type="button"
                  onClick={() => setLocationImageIndex((prev) => (prev + 1) % locationImages.length)}
                  className="absolute inset-0 h-full w-full"
                  aria-label={t("map.title")}
                >
                  <Image
                    src={locationImages[locationImageIndex].src}
                    alt={locationImages[locationImageIndex].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={false}
                  />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-1 pointer-events-none">
                  <p className="text-lg font-semibold leading-tight">
                    Plaza del Duque de la Victoria 1, 3º 9 <br />
                    41002 Sevilla, España
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t("team.title")}
          </h3>
          <div className="space-y-4">
            {team.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50"
              >
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white flex-shrink-0">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{person.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{person.title}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{person.bio}</p>
                </div>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn de ${person.name}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{background: "#0A66C2", borderColor: "transparent"}}                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            ))}
          </div>
          <div className="pt-4 align-center flex justify-center">
            <Button
              asChild
              className="bg-[#0d6e0c] dark:bg-[#3FBD6F] text-white dark:text-black shadow-[0_15px_40px_rgba(31,138,13,0.35)] hover:shadow-[0_20px_50px_rgba(31,138,13,0.4)] hover:bg-[#0A4D08] normal-case not-italic font-semibold tracking-tight"
            >
              <Link href="/about" scroll={true}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("team.cta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <WorkWithUsSection />
      {showWhatsAppBubble ? <WhatsAppBubble /> : <WhatsAppBubbleSkeleton />}

      <Footer />
    </div>
  );
}
