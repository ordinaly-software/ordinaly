import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
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
      ? "Agente de llamadas con IA para empresas"
      : "AI calling agent for businesses",
    description: isEs
      ? "Automatiza las llamadas entrantes y salientes con agentes de voz IA: recepcionista virtual 24/7 y campañas salientes con n8n, ElevenLabs y Retell."
      : "Automate inbound and outbound calls with AI voice agents: a 24/7 virtual receptionist and outbound campaigns powered by n8n, ElevenLabs and Retell.",
    image: HERO_IMAGE,
  });
}

export default async function AgenteDeLlamadasIAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Servicios" : "Services", path: "/servicios" },
          { name: isEs ? "Agente de Llamadas IA" : "AI Calling Agent" },
        ]}
      />
      <AgenteDeLlamadasIA />
    </>
  );
}
