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
      ? "Automatización empresarial con Inteligencia Artificial | Ordinaly Software"
      : "Enterprise Automation with Artificial Intelligence | Ordinaly Software",
    description: isEs
      ? "Consultora software especializada en automatización empresarial con Inteligencia Artificial. Impulsamos tu PYME con soluciones efectivas en tan solo 2-4 semanas."
      : "Software consultancy specialized in enterprise automation with Artificial Intelligence. We empower your SME with effective solutions in just 2-4 weeks.",
    image: "/og-image.png",
  });
  return {
    ...base,
    keywords: isEs
      ? ["automatización IA Sevilla", "agentes IA empresas", "chatbots empresas", "formación IA Sevilla", "n8n automatización", "WhatsApp CRM IA", "consultora software Sevilla", "inteligencia artificial PYMES"]
      : ["AI automation Seville", "AI agents business", "business chatbots", "AI training Seville", "n8n automation", "WhatsApp CRM AI"],
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
