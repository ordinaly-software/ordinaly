"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function AutomatizacionInteligente() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-inteligente"];
  if (!content) throw new Error("Missing landing content: automatizacion-inteligente");
  const assets = LANDING_ASSETS["automatizacion-inteligente"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
