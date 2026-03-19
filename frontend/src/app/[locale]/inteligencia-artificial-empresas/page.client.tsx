"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function InteligenciaArtificialEmpresas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["inteligencia-artificial-empresas"];
  if (!content) throw new Error("Missing landing content: inteligencia-artificial-empresas");
  return <LandingPageView content={content} />;
}
