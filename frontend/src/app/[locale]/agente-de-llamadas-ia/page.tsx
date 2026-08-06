import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import AgenteDeLlamadasIA from "./page.client";

const slug = "agente-de-llamadas-ia" as const;
const HERO_IMAGE = "/static/servicios/chatbot_recepcionista.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs
      ? "Agente de Llamadas con IA | Recepción y Ventas Salientes"
      : "AI Calling Agent | Inbound Reception & Outbound Sales",
    description: isEs
      ? "Automatiza tus llamadas entrantes y salientes con agentes de voz IA. Recepcionista virtual 24/7 y campañas de llamadas salientes con n8n, ElevenLabs, Gemini, Retell y Netelip."
      : "Automate your inbound and outbound calls with AI voice agents. A 24/7 virtual receptionist and outbound calling campaigns powered by n8n, ElevenLabs, Gemini, Retell and Netelip.",
    image: HERO_IMAGE,
  });
}

export default async function AgenteDeLlamadasIAPage() {
  return <AgenteDeLlamadasIA />;
}
