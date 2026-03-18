"use client";

import { LocalLandingPage } from "@/components/ui/local-landing";
import { getLandingMeta } from "@/app/[locale]/landings";

const meta = getLandingMeta("formacion-ia-pymes-sevilla")!;

export default function FormacionIaPymesSevillaPage({ locale }: { locale: string }) {
  return <LocalLandingPage locale={locale} meta={meta} />;
}
