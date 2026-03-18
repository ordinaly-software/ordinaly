"use client";

import { LocalLandingPage } from "@/components/ui/local-landing";
import { getLandingMeta } from "@/app/[locale]/landings";

const meta = getLandingMeta("agentes-ia-atencion-cliente-sevilla")!;

export default function AgentesIaAtencionClienteSevillaPage({ locale }: { locale: string }) {
  return <LocalLandingPage locale={locale} meta={meta} />;
}
