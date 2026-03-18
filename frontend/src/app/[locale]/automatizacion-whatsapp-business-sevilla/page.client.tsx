"use client";

import { LocalLandingPage } from "@/components/ui/local-landing";
import { getLandingMeta } from "@/app/[locale]/landings";

const meta = getLandingMeta("automatizacion-whatsapp-business-sevilla")!;

export default function AutomatizacionWhatsappBusinessSevillaPage({ locale }: { locale: string }) {
  return <LocalLandingPage locale={locale} meta={meta} />;
}
