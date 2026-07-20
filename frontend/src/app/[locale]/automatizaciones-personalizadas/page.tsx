import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionesPersonalizadas from "./page.client"

const slug = "automatizaciones-personalizadas" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Automatizaciones personalizadas para empresas y pymes",
    description:
      "Diseñamos automatizaciones a medida con n8n y software libre para procesos que no encajan en soluciones estándar: más trazabilidad, menos errores y más tiempo libre.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function AutomatizacionesPersonalizadasPage() {
  return <AutomatizacionesPersonalizadas />;
}
