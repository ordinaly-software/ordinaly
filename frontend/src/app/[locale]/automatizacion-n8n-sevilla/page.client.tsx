"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function AutomatizacionN8nSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-n8n-sevilla"];
  if (!content) throw new Error("Missing landing content: automatizacion-n8n-sevilla");
  return <LandingPageView content={content} />;
}
