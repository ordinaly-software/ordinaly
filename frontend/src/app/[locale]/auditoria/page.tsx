import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import AuditoriaCampaign from "./page.client";

// Ad campaign landing: Spanish only and kept out of search results.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") notFound();
  return createPageMetadata({
    locale,
    path: "/auditoria",
    title: "Auditoría de cumplimiento del Reglamento europeo de IA",
    description:
      "Auditamos tus chatbots, agentes de voz y contenidos generados con IA frente al artículo 50 del Reglamento europeo de IA. Informe fechado y plan de corrección.",
    image: "/og/auditoria-cumplimiento-ia.webp",
    index: false,
    alternateLocales: ["es"],
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale === "en") notFound();
  return <AuditoriaCampaign />;
}
