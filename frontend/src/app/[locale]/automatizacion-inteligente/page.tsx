import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionInteligente from "./page.client"

const slug = "automatizacion-inteligente" as const;
const AUTOMATIZACION_INTELIGENTE_HERO_IMAGE = "/static/automatizacion-inteligente/hero-blurred.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Automatización Inteligente para empresas | Ordinaly",
    description:
      "Automatización inteligente en la empresa para flujos eficientes. Implementamos agentes de IA que eliminan tareas repetitivas y escalan tu productividad hoy",
    image: AUTOMATIZACION_INTELIGENTE_HERO_IMAGE,
  });
}

export default async function AutomatizacionesInteligentes() {
  return <AutomatizacionInteligente />;
}
