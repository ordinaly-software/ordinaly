import type { Metadata } from "next";
import HomePage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  const base = createPageMetadata({
    locale,
    path: "/",
    title: isEs
      ? "Automatización empresarial con IA para PYMES"
      : "Enterprise AI automation for SMEs",
    description: isEs
      ? "Consultora de software en Sevilla especializada en automatización empresarial con IA. Implantamos soluciones a medida para tu PYME en 2-4 semanas."
      : "Software consultancy in Seville specialized in enterprise automation with AI. We ship tailored solutions for your SME in just 2-4 weeks.",
    image: "/og-image.png",
  });
  return {
    ...base,
    keywords: isEs
      ? ["automatización empresarial IA", "automatización con IA Sevilla", "agentes de IA para empresas", "automatización n8n", "agente de voz IA", "automatización de facturas", "implantación Odoo 18", "formación IA para PYMES", "consultora de software Sevilla"]
      : ["enterprise AI automation", "AI automation Seville", "AI agents for business", "n8n automation", "AI voice agent", "invoice automation", "Odoo 18 implementation", "software consultancy Spain"],
  };
}

export const revalidate = 3600; // ISR: revalidate home every hour

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage renderedAt={Date.now()} />;
}
