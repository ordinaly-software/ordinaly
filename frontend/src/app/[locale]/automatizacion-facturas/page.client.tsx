"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function AutomatizacionFacturas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-facturas"];
  if (!content) throw new Error("Missing landing content: automatizacion-facturas");
  return <LandingPageView content={content} />;
}
