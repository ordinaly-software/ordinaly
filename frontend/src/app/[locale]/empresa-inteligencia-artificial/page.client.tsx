"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function EmpresaInteligenciaArtificial() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["empresa-inteligencia-artificial"];
  if (!content) throw new Error("Missing landing content: empresa-inteligencia-artificial");
  const assets = LANDING_ASSETS["empresa-inteligencia-artificial"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
