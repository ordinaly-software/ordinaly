"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function AgenciaAutomatizacionIA() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["agencia-automatizacion-ia"];
  if (!content) throw new Error("Missing landing content: agencia-automatizacion-ia");
  const assets = LANDING_ASSETS["agencia-automatizacion-ia"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
