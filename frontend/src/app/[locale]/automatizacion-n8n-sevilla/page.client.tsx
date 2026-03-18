"use client";

import { LocalLandingPage } from "@/components/ui/local-landing";
import { getLandingMeta } from "@/app/[locale]/landings";

const meta = getLandingMeta("automatizacion-n8n-sevilla")!;

export default function AutomatizacionN8nSevillaPage({ locale }: { locale: string }) {
  return <LocalLandingPage locale={locale} meta={meta} />;
}
