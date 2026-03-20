"use client";

import { useMessages } from "next-intl";
import IaSevillaView from "@/components/landings/ia-sevilla-view";
import type { LandingPageContent } from "@/components/landings/ia-sevilla-view";
import { BackgroundBoxesDemo } from "@/components/ui/background-boxes-demo"; 

export default function InteligenciaArtificialSevilla() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["inteligencia-artificial-sevilla"];

  if (!content) {
    throw new Error("Missing landing content: inteligencia-artificial-sevilla");
  }

  return (
    <>
      {/* Boxes */}
      <BackgroundBoxesDemo />
      <IaSevillaView content={content} />
    </>
  );
}
