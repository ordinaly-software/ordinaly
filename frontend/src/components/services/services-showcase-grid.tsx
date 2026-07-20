"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FileText,
  Instagram,
  Linkedin,
  Workflow,
  PhoneOutgoing,
  Headset,
  Globe,
} from "lucide-react";
import { IconOdoo } from "@/components/services/brand-icons";
import { cn } from "@/lib/utils";

function Tile({
  href,
  title,
  image,
  icon,
  highlighted,
  featuredLabel,
  note,
  className,
}: {
  href: string;
  title: string;
  image?: string;
  icon: React.ReactNode;
  highlighted?: boolean;
  featuredLabel?: string;
  note?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        highlighted
          ? "border-[#d97757] ring-2 ring-[#d97757]/50 shadow-lg shadow-[#d97757]/20"
          : "border-neutral-200 dark:border-neutral-700",
        className,
      )}
    >
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97757]/25 via-neutral-100 to-neutral-50 text-[#d97757] dark:from-[#d97757]/15 dark:via-neutral-900 dark:to-neutral-800">
            <div className="opacity-80">{icon}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      </div>

      {highlighted && featuredLabel && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-[#d97757] px-3 py-1 text-xs font-semibold text-white shadow-md">
          {featuredLabel}
        </span>
      )}

      <div className="relative z-10">
        <h3 className="text-lg md:text-xl font-bold leading-snug text-white">{title}</h3>
        {note && <p className="mt-1 text-xs text-white/75">{note}</p>}
      </div>
    </Link>
  );
}

export function ServicesShowcaseGrid() {
  const t = useTranslations("services");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <Tile
        href="/automatizacion-facturas"
        title={t("showcase.facturas")}
        image="/static/automatizacion-facturas/automatizacion-facturas.webp"
        icon={<FileText className="h-10 w-10" />}
        className="h-56 sm:col-span-2"
      />
      <Tile
        href="/automatizacion-redes-sociales"
        title={t("showcase.meta")}
        image="/static/mail/meta.png"
        icon={<Instagram className="h-10 w-10" />}
        className="h-56 sm:col-span-2"
      />
      <Tile
        href="/automatizacion-redes-sociales"
        title={t("showcase.linkedin")}
        image="/static/mail/linkedin.png"
        icon={<Linkedin className="h-10 w-10" />}
        className="h-56 sm:col-span-2"
      />

      <Tile
        href="/automatizaciones-personalizadas"
        title={t("showcase.personalizadas")}
        icon={<Workflow className="h-14 w-14" />}
        highlighted
        featuredLabel={t("featured")}
        className="h-72 sm:col-span-4"
      />
      <Tile
        href="/automatizacion-informes"
        title={t("showcase.informes")}
        image="/static/automatizacion-informes/automatizacion-informes.webp"
        icon={<FileText className="h-10 w-10" />}
        className="h-72 sm:col-span-2"
      />

      <Tile
        href="/automatizaciones-chatbots"
        title={t("showcase.chatSalientes")}
        icon={<PhoneOutgoing className="h-10 w-10" />}
        className="h-72 sm:col-span-2"
      />
      <Tile
        href="/automatizaciones-chatbots"
        title={t("showcase.chatbotRecepcionista")}
        icon={<Headset className="h-14 w-14" />}
        highlighted
        featuredLabel={t("featured")}
        className="h-72 sm:col-span-4"
      />

      <Tile
        href="/implantacion-odoo"
        title={t("showcase.odoo")}
        note={t("showcase.odooNote")}
        icon={<IconOdoo size={56} />}
        className="h-72 sm:col-span-3"
      />
      <Tile
        href="/desarrollo-de-app-webs"
        title={t("showcase.pwa")}
        image="/static/desarrollo-de-app-webs/desarrollo-de-app-webs.webp"
        icon={<Globe className="h-10 w-10" />}
        className="h-72 sm:col-span-3"
      />
    </div>
  );
}
