"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function EmpresaInteligenciaArtificial() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["empresa-inteligencia-artificial"];
  if (!content) throw new Error("Missing landing content: empresa-inteligencia-artificial");
  return <LandingPageView content={content} />;
}
