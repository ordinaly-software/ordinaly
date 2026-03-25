"use client";

import { useMessages } from "next-intl";
import AutomatizacionFacturasView from "@/components/landings/automatizacionFactura-page-view";
import type { LandingPageContent } from "@/components/landings/automatizacionFactura-page-view";

export default function AutomatizacionFacturas() {
  const messages = useMessages() as { landings?: Record<string, LandingPageContent> };
  const content = messages.landings?.["automatizacion-facturas"];

  if (!content) {
    throw new Error("Missing landing content: automatizacion-facturas");
  }

  return <AutomatizacionFacturasView content={content} />;
}
