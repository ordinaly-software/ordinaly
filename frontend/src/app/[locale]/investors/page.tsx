import type { Metadata } from "next";
import InvestorsPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/investors",
    title: isEs
      ? "Ordinaly Investors | Automatización inteligente para empresas"
      : "Ordinaly Investors | Intelligent automation for enterprises",
    description: isEs
      ? "Súmate a la misión de Ordinaly: agentes con IA, automatizaciones y formación para transformar procesos empresariales."
      : "Join Ordinaly’s journey: AI agents, automation and training that accelerate enterprise operations.",
    image: "/static/backgrounds/us_background.webp",
  });
}

export default async function Investors({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <InvestorsPage />;
}
