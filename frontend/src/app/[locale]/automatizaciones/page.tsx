import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionesCampaign from "./page.client";

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
    path: "/automatizaciones",
    title: "Automatizaciones personalizadas para empresas",
    description:
      "Automatizaciones a medida con n8n para empresas y pymes: software libre, en tu propio servidor y sin pagar por ejecución.",
    image: "/og/automatizaciones-personalizadas-empresas-n8n.webp",
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
  return <AutomatizacionesCampaign />;
}
