"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Headset, Workflow, Globe, Phone, Mail, ArrowRight } from "lucide-react";
import { IconWhatsApp } from "@/components/ui/brand-icons";
import { ServicesShowcaseGrid } from "@/components/services/services-showcase-grid";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { UseCasesSection } from "@/components/services/use-cases-section";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { NewsletterBanner } from "@/components/ui/newsletter-banner";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false });
const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const ServicesPage = () => {
  const t = useTranslations("services");

  const quickLinks = [
    { href: "/agente-de-llamadas-ia", label: t("pills.callbot"), icon: <Headset className="h-4 w-4" /> },
    { href: "/automatizaciones-personalizadas-empresas-n8n", label: t("pills.automation"), icon: <Workflow className="h-4 w-4" /> },
    { href: "/implantacion-odoo", label: t("pills.odoo") } ,
    { href: "/desarrollo-de-app-webs", label: t("pills.pwa"), icon: <Globe className="h-4 w-4" /> },
  ];

  const advantageTexts = (t.raw("advantages.cards") ?? []) as { name: string; description: string }[];

  // Defined one by one (rather than mechanically mapped) so each card's
  // size can be chosen deliberately.
  const advantageCards: InfoCardItem[] = [
    { key: "support", size: "xl", title: advantageTexts[0]?.name, description: advantageTexts[0]?.description, image: "/static/servicios/support.webp" },
    { key: "engineers", size: "xl", title: advantageTexts[1]?.name, description: advantageTexts[1]?.description, image: "/static/servicios/engineers.webp" },
    { key: "vps", size: "xl", title: advantageTexts[2]?.name, description: advantageTexts[2]?.description, image: "/static/servicios/vps.webp" },
    { key: "floss", size: "xl", title: advantageTexts[3]?.name, description: advantageTexts[3]?.description, image: "/static/servicios/floss.webp" },
    { key: "pricing", size: "md", title: advantageTexts[4]?.name, description: advantageTexts[4]?.description, image: "/static/servicios/pricing.webp" },
    {
      key: "contact",
      size: "md",
      title: t("advantages.contact.title"),
      description: t("advantages.contact.description"),
      ctaLabel: t("advantages.contact.ctaLabel"),
      ctaIcons: [
        <Phone key="phone" className="h-4 w-4 shrink-0" />,
        <Mail key="mail" className="h-4 w-4 shrink-0" />,
        <IconWhatsApp key="whatsapp" size={16} className="shrink-0" />,
        <ArrowRight key="arrow" className="h-4 w-4 shrink-0" />,
      ],
      href: "/contacto",
    },
  ];

  // Measured from the live navbar so the pill bar sits flush under it at
  // every breakpoint instead of relying on hardcoded offsets that drift out
  // of sync whenever the navbar's own height changes.
  const pillBarRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(60);
  const [pillHeight, setPillHeight] = useState(52);

  useEffect(() => {
    const navEl = document.querySelector("nav");

    const measure = () => {
      setNavHeight(navEl?.getBoundingClientRect().height ?? 0);
      setPillHeight(pillBarRef.current?.getBoundingClientRect().height ?? 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (navEl) observer.observe(navEl);
    if (pillBarRef.current) observer.observe(pillBarRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg-primary] dark:bg-[--color-bg-inverted] text-slate-medium dark:text-cloud-medium transition-colors duration-300">
      <div
        ref={pillBarRef}
        className="fixed inset-x-0 z-40 bg-[--color-bg-primary] dark:bg-[--color-bg-inverted]"
        style={{ top: navHeight }}
      >
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto px-4 py-3 touch-pan-x [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {link.icon ? link.icon : null}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ height: navHeight + pillHeight }} aria-hidden="true" />

      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#d97757]">
              {t("showcase.eyebrow")}
            </p>
            <p className="mt-2 text-4xl font-bold leading-tight text-slate-dark dark:text-ivory-light md:text-6xl">
              {t("showcase.title")}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-medium dark:text-cloud-medium md:text-xl">
              {t("showcase.subtitle")}
            </p>
          </div>

          <div className="relative mx-auto mt-2 max-w-3xl lg:mt-3">
            <Image
              src="/static/servicios/services_banner.webp"
              alt={t("showcase.bannerAlt")}
              width={2500}
              height={1500}
              priority
              className="h-auto w-full rounded-3xl drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-slate-medium dark:text-cloud-medium md:text-lg">
            {t("showcase.description")}
          </p>

          <div className="mt-12 lg:mt-16">
            <ServicesShowcaseGrid />
          </div>
        </div>
      </section>


      <ToolsShowcase title={t("toolsTitle")} />


      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <br className="mb-18 block" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-slate-dark dark:text-ivory-light md:text-4xl">
              {t("advantages.title")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-medium dark:text-cloud-medium md:text-lg">
              {t("advantages.subtitle")}
            </p>
          </div>

          <div className="mt-10">
            <InfoCardCarousel items={advantageCards} className="mx-auto max-w-6xl" />
          </div>
        </div>
      </section>

      <UseCasesSection t={t} id="use-cases" />

      <section className="px-4 pb-12 sm:px-6 md:pb-16 lg:px-8">
        <br className="mb-8 block" />
        <NewsletterBanner className="mx-auto w-full max-w-[1600px]" />
      </section>
      <WhatsAppBubble />
      <Footer />
    </div>
  );
};

export default ServicesPage;
