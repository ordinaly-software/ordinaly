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
      ? "Agencia de Automatización IA en Sevilla | Ordinaly Software"
      : "AI Automation Agency in Seville | Ordinaly Software",
    description: isEs
      ? "Agencia de automatización IA especializada en chatbots, agentes y n8n en Sevilla. Impulsamos tu PYME con soluciones efectivas en 2-4 semanas."
      : "AI automation agency specialized in chatbots, agents and n8n in Seville. We boost your SME with effective solutions in just 2-4 weeks.",
    image: "/og-image.png",
  });
  return {
    ...base,
    keywords: isEs
      ? ["automatización IA Sevilla", "agentes IA empresas", "chatbots empresas", "formación IA Sevilla", "n8n automatización", "WhatsApp CRM IA", "agencia automatización Sevilla", "inteligencia artificial PYMES"]
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
