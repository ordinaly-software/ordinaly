"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function InteligenciaArtificialSevilla() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["inteligencia-artificial-sevilla"];
  if (!content) throw new Error("Missing landing content: inteligencia-artificial-sevilla");
  const assets = LANDING_ASSETS["inteligencia-artificial-sevilla"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
