"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";
import { LANDING_ASSETS } from "@/lib/landing-assets";

export default function AutomatizacionFacturas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-facturas"];
  if (!content) throw new Error("Missing landing content: automatizacion-facturas");
  const assets = LANDING_ASSETS["automatizacion-facturas"];
  return <LandingPageView content={content} heroImage={assets.heroImage} heroImagePosition={assets.heroImagePosition} />;
}
