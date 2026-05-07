import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionFacturas from "./page.client"

const slug = "automatizacion-facturas" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Automatización de facturas para empresas",
    description:
      "Automatización de facturas para departamentos contables. Procesa tus documentos sin errores y ahorra tiempo con tecnología de procesamiento inteligente",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function AutomatizacionDeFacturas() {
  return <AutomatizacionFacturas />;
}
