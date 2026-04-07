"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function AutomatizacionN8nSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-n8n-sevilla"];
  if (!content) throw new Error("Missing landing content: automatizacion-n8n-sevilla");
  const assets = LANDING_ASSETS["automatizacion-n8n-sevilla"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
