"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function AgenciaAutomatizacionIA() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["agencia-automatizacion-ia"];
  if (!content) throw new Error("Missing landing content: agencia-automatizacion-ia");
  return <LandingPageView content={content} />;
}
