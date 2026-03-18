"use client";

import { useMessages, useTranslations } from "next-intl";
import { AiChatDemo } from "@/components/home/ai-chat-demo";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function AgentesIaAtencionClienteSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const tHome = useTranslations("home");
  const content = messages.landings?.["agentes-ia-atencion-cliente-sevilla"];

  if (!content) throw new Error("Missing landing content: agentes-ia-atencion-cliente-sevilla");

  return <LandingPageView content={content} architectureOverride={<AiChatDemo t={tHome} />} />;
}
