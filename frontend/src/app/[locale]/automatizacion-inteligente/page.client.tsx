"use client";

import { useMessages } from "next-intl";
import AutomatizacionInteligenteView from "@/components/landings/automatizacionInteligente-page-view";
import type { LandingPageContent } from "@/components/landings/automatizacionInteligente-page-view";

export default function AutomatizacionInteligente() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-inteligente"] as LandingPageContent;
  if (!content) throw new Error("Missing landing content: automatizacion-inteligente");
  return <AutomatizacionInteligenteView content={content} />;
}
