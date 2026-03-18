"use client";

import { LocalLandingPage } from "@/components/ui/local-landing";
import { getLandingMeta } from "@/app/[locale]/landings";

const meta = getLandingMeta("integraciones-crm-erp-sevilla")!;

export default function IntegracionesCrmErpSevillaPage({ locale }: { locale: string }) {
  return <LocalLandingPage locale={locale} meta={meta} />;
}
