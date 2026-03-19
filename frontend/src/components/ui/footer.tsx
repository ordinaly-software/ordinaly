"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Sun,
  type LucideIcon,
} from "lucide-react";
import LocaleSwitcher from "./locale-switcher";
import { useTheme } from "@/contexts/theme-context";
import { getWhatsAppUrl } from "@/utils/whatsapp";
import { openCookieSettings } from "@/utils/cookieManager";
import { cn } from "@/lib/utils";

const LANDING_SLUGS = [
  "agencia-automatizacion-ia",
  "automatizacion-n8n-sevilla",
  "automatizacion-facturas",
  "automatizacion-inteligente",
  "formacion-ia-pymes-sevilla",
  "empresa-inteligencia-artificial",
  "inteligencia-artificial-empresas",
  "inteligencia-artificial-sevilla"
] as const;

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
  icon?: LucideIcon;
};

type FooterGroup = {
  title: string;
  links: FooterLinkItem[];
};

type LandingFooterContent = {
  shortTitle?: string;
};

const Footer = () => {
  const t = useTranslations("home");
  const tCookie = useTranslations("cookie");
  const locale = useLocale();
  const messages = useMessages();
  const { isDark, setIsDark } = useTheme();
  const currentYear = new Date().getUTCFullYear();
  const whatsappUrl = getWhatsAppUrl(t("navigation.ctaConsultationMessage"));

  const footerGroups = useMemo<FooterGroup[]>(() => {
    const connectLinks: FooterLinkItem[] = [
      {
        label: t("footer.links.emailUs"),
        href: `mailto:${t("footer.contact.email")}`,
        external: true,
        icon: Mail,
      },
      {
        label: t("footer.links.callUs"),
        href: `tel:${t("footer.contact.phone")}`,
        external: true,
        icon: Phone,
      },
      {
        label: t("footer.links.officeMap"),
        href: "https://maps.app.goo.gl/2a4Rheb6u94wFe46A",
        external: true,
        icon: MapPin,
      },
      {
        label: t("footer.links.linkedin"),
        href: "https://www.linkedin.com/company/ordinalysoftware/",
        external: true,
        icon: Linkedin,
      },
    ];

    if (whatsappUrl) {
      connectLinks.unshift({
        label: t("footer.links.whatsapp"),
        href: whatsappUrl,
        external: true,
        icon: MessageCircle,
      });
    }

    const landingMessages = (messages as { landings?: Record<string, LandingFooterContent> }).landings ?? {};
    const landingLinks: FooterLinkItem[] = LANDING_SLUGS.map((slug) => ({
      label: landingMessages[slug]?.shortTitle ?? slug,
      href: `/${slug}`,
    }));

    return [
      {
        title: t("footer.sections.navigate"),
        links: [
          { label: t("footer.links.home"), href: "/" },
          { label: t("footer.links.services"), href: "/services" },
          { label: t("footer.links.formation"), href: "/formation" },
          { label: t("footer.links.blog"), href: "/blog" },
          { label: t("footer.links.news"), href: "/news" },
          { label: t("footer.links.faq"), href: "/faq" },
        ],
      },
      {
        title: t("footer.sections.company"),
        links: [
          { label: t("footer.links.about"), href: "/about" },
          { label: t("footer.links.investors"), href: "/investors" },
          { label: t("footer.links.contact"), href: "/contact" },
        ],
      },
      {
        title: t("footer.sections.landings"),
        links: landingLinks,
      },
      {
        title: t("footer.sections.connect"),
        links: connectLinks,
      },
    ];
  }, [messages, t, whatsappUrl]);

  const utilityLinks = useMemo<FooterLinkItem[]>(
    () => [
      { label: t("footer.legal.terms"), href: "/legal?tab=terms" },
      { label: t("footer.legal.privacy"), href: "/legal?tab=privacy" },
      { label: t("footer.legal.cookies"), href: "/legal?tab=cookies" },
      { label: t("footer.legal.license"), href: "/legal?tab=license" },
    ],
    [t],
  );

  return (
    <footer className="border-t border-[--color-border-subtle] bg-[#f5f5f7] text-slate-medium dark:border-[--color-border-strong] dark:bg-[#0f1012] dark:text-cloud-medium">
      <div className="u-container py-10 md:py-12">
        <div className="border-b border-[--color-border-subtle] pb-4 text-sm leading-relaxed dark:border-[--color-border-strong]">
            <Image
              src="/logo_80.webp"
              alt={t("footer.logo.alt")}
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
              style={{
                filter: isDark
                  ? "grayscale(1) brightness(0) invert(1)"
                  : "grayscale(1) brightness(0) opacity(0.86)",
              }}
            />
        </div>

        <div className="grid gap-10 py-8 md:grid-cols-2 xl:grid-cols-[1.35fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.16em] text-slate-dark dark:text-ivory-light">
                  {t("footer.logo.title")}
                </p>
                <p className="text-sm">{t("footer.description")}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm leading-relaxed">
              <p>{t("footer.contact.location")}</p>
              <a
                href={`mailto:${t("footer.contact.email")}`}
                className="block transition hover:text-clay"
              >
                {t("footer.contact.email")}
              </a>
              <a
                href={`tel:${t("footer.contact.phone")}`}
                className="block transition hover:text-clay"
              >
                {t("footer.contact.phone")}
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold tracking-[0.14em] text-slate-dark dark:text-ivory-light">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {group.links.map((item) => (
                  <li key={`${group.title}-${item.label}`}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 transition hover:text-slate-dark dark:hover:text-ivory-light"
                      >
                        {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
                        <span>{item.label}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 transition hover:text-slate-dark dark:hover:text-ivory-light"
                      >
                        {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[--color-border-subtle] pt-5 dark:border-[--color-border-strong]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-xs leading-relaxed">
              {t("footer.copyright", { year: currentYear })}
            </p>

            <LocaleSwitcher variant="pill" label={t("footer.utility.language")} />

            <div className="inline-flex self-start items-center rounded-full border border-[--color-border-subtle] bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="px-3 text-xs font-medium uppercase tracking-[0.14em] text-cloud-dark dark:text-cloud-medium">
                {t("footer.utility.theme")}
              </span>
              <button
                type="button"
                onClick={() => setIsDark(false)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition",
                  !isDark
                    ? "bg-[--swatch--slate-dark] text-white"
                    : "text-slate-medium hover:text-slate-dark dark:text-cloud-medium dark:hover:text-ivory-light",
                )}
                aria-label={t("navigation.lightMode")}
              >
                <Sun className="h-4 w-4" />
                <span>{t("footer.utility.light")}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDark(true)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition",
                  isDark
                    ? "bg-white text-slate-dark"
                    : "text-slate-medium hover:text-slate-dark dark:text-cloud-medium dark:hover:text-ivory-light",
                )}
                aria-label={t("navigation.darkMode")}
              >
                <Moon className="h-4 w-4" />
                <span>{t("footer.utility.dark")}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {utilityLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition hover:text-slate-dark dark:hover:text-ivory-light"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openCookieSettings}
              className="transition hover:text-slate-dark dark:hover:text-ivory-light"
            >
              {tCookie("openCookieSettings")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
