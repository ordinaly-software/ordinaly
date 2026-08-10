"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Tile({
  href,
  title,
  image,
  note,
  className,
}: {
  href: string;
  title: string;
  image: string;
  note?: string;
  className?: string;
}) {
  const t = useTranslations("services");

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-700",
        className,
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      </div>

      <div className="relative z-10">
        <h3 className="text-lg md:text-xl font-bold leading-snug text-white">{title}</h3>
        {note && <p className="mt-1 text-xs text-white/75">{note}</p>}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
          {t("showcase.viewMore")}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
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
        image="/static/servicios/automatizacion_facturas.webp"
        className="h-56 sm:col-span-2"
      />
      <Tile
        href="/automatizacion-redes-sociales"
        title={t("showcase.meta")}
        image="/static/servicios/meta.webp"
        className="h-56 sm:col-span-2"
      />
      <Tile
        href="/automatizacion-redes-sociales"
        title={t("showcase.linkedin")}
        image="/static/servicios/linkedin.webp"
        className="h-56 sm:col-span-2"
      />

      <Tile
        href="/automatizaciones-personalizadas-empresas-n8n"
        title={t("showcase.personalizadas")}
        image="/static/servicios/automatizaciones_personalizadas.webp"
        className="h-72 sm:col-span-4"
      />
      <Tile
        href="/automatizacion-informes"
        title={t("showcase.informes")}
        image="/static/servicios/automatizacion_informes.webp"
        className="h-72 sm:col-span-2"
      />

      <Tile
        href="/agente-de-llamadas-ia#outbound"
        title={t("showcase.chatSalientes")}
        image="/static/servicios/chatbot_comercial.webp"
        className="h-72 sm:col-span-2"
      />
      <Tile
        href="/agente-de-llamadas-ia#inbound"
        title={t("showcase.chatbotRecepcionista")}
        image="/static/servicios/chatbot_recepcionista.webp"
        className="h-72 sm:col-span-4"
      />

      <Tile
        href="/implantacion-odoo"
        title={t("showcase.odoo")}
        image="/static/servicios/implantacion_odoo.webp"
        note={t("showcase.odooNote")}
        className="h-72 sm:col-span-3"
      />
      <Tile
        href="/desarrollo-de-app-webs"
        title={t("showcase.pwa")}
        image="/static/servicios/desarrollo_de_app_webs.webp"
        className="h-72 sm:col-span-3"
      />
    </div>
  );
}
