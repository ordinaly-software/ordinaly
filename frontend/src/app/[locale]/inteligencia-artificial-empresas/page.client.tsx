"use client";

import { useMessages } from "next-intl";
import InteligenciaArtificialEmpresasView from "@/components/landings/ia-empresas-view";
import type { LandingPageContent } from "@/components/landings/ia-empresas-view";

export default function InteligenciaArtificialEmpresas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["inteligencia-artificial-empresas"];

  if (!content) {
    throw new Error("Missing landing content: inteligencia-artificial-empresas");
  }

  return <InteligenciaArtificialEmpresasView content={content} />;
}
