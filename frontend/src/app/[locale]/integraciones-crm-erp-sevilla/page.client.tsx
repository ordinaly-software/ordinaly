"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function IntegracionesCrmErpSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["integraciones-crm-erp-sevilla"];
  if (!content) throw new Error("Missing landing content: integraciones-crm-erp-sevilla");
  return <LandingPageView content={content} />;
}
