"use client";

import { useMessages } from "next-intl";
import LandingPageView from "@/components/landings/landing-page-view";
import type { LandingPageContent } from "@/components/landings/landing-page-view";

export default function ChatbotsEmpresasSevillaPage() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["chatbots-empresas-sevilla"];
  if (!content) throw new Error("Missing landing content: chatbots-empresas-sevilla");
  return <LandingPageView content={content} />;
}
