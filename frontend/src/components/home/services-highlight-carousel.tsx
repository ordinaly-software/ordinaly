"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Workflow, Headset, Globe, ArrowRight, LayoutGrid } from "lucide-react";
import { IconOdoo } from "@/components/ui/brand-icons";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface HighlightService {
  key: string;
  href: string;
  icon: React.ReactNode;
  image?: string;
  noteKey?: string;
}

const highlightedServices: HighlightService[] = [
  {
    key: "personalizadas",
    href: "/automatizaciones-personalizadas",
    icon: <Workflow className="h-14 w-14" />,
    image: "/static/servicios/automatizaciones-personalizadas.webp",
    noteKey: "automationNote",
  },
  {
    key: "chatbotRecepcionista",
    href: "/automatizaciones-chatbots",
    icon: <Headset className="h-14 w-14" />,
    image: "/static/servicios/chatbot-recepcionista.webp",
    noteKey: "chatbotRecepcionistaNote",
  },
  {
    key: "odoo",
    href: "/implantacion-odoo",
    icon: <IconOdoo size={56} />,
    image: "/static/servicios/odoo.webp",
    noteKey: "odooNote",
  },
  {
    key: "pwa",
    href: "/desarrollo-de-app-webs",
    icon: <Globe className="h-14 w-14" />,
    image: "/static/servicios/pwa.webp",
  },
];

const CARD_SIZE = "h-[440px] w-full";

function HighlightCard({
  href,
  title,
  note,
  icon,
  image,
  cta,
}: {
  href: string;
  title: string;
  note?: string;
  icon: React.ReactNode;
  image?: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-[2rem] transition duration-300 hover:-translate-y-1 hover:shadow-2xl",
        CARD_SIZE,
      )}
    >
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 60vw, 32vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-clay/30 via-[--swatch--slate-dark] to-cobalt/30">
            <div className="text-white/80">{icon}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
      </div>

      <div className="relative z-10 m-4 rounded-2xl border border-white/45 bg-white/14 p-4 text-white shadow-[0_18px_50px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,22,34,0.55)]">
        <h3 className="text-lg font-bold leading-snug">{title}</h3>
        {note && <p className="mt-0.5 text-xs text-white/75">{note}</p>}
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white/90">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function ServicesHighlightCarousel() {
  const t = useTranslations("services");

  return (
    <Carousel
      items={highlightedServices}
      getKey={(item) => item.key}
      slideClassName="shrink-0 grow-0 basis-[85%] sm:basis-[60%] lg:basis-[32%] pl-4"
      renderItem={(item) => (
        <HighlightCard
          href={item.href}
          title={t(`showcase.${item.key}`)}
          note={item.noteKey ? t(`showcase.${item.noteKey}`) : undefined}
          icon={item.icon}
          image={item.image}
          cta={t("showcase.viewMore")}
        />
      )}
      trailingSlide={
        <Link
          href="/servicios"
          className={cn(
            "group relative flex flex-col justify-end overflow-hidden rounded-[2rem] transition duration-300 hover:-translate-y-1 hover:shadow-2xl",
            CARD_SIZE,
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[--swatch--slate-dark] to-[--swatch--cobalt-dark]">
            <div className="flex h-full w-full items-center justify-center text-white/80">
              <LayoutGrid className="h-14 w-14" />
            </div>
          </div>

          <div className="relative z-10 m-4 rounded-2xl border border-white/45 bg-white/14 p-4 text-white shadow-[0_18px_50px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,22,34,0.55)]">
            <h3 className="text-lg font-bold leading-snug">{t("showcase.viewCatalog")}</h3>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white/90">
              {t("showcase.viewCatalogCta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      }
    />
  );
}
