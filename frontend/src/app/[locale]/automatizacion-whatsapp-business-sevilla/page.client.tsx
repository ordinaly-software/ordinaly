"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function AutomatizacionWhatsappBusinessSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-whatsapp-business-sevilla"];
  if (!content) throw new Error("Missing landing content: automatizacion-whatsapp-business-sevilla");
  return <LandingPageView content={content} />;
}
