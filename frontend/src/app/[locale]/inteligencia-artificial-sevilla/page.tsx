import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialSevilla from "./page.client"

const slug = "inteligencia-artificial-sevilla" as const;
const INTELIGENCIA_ARTIFICIAL_SEVILLA_HERO_IMAGE = "/static/inteligencia-artificial-sevilla/hero-blurred.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Inteligencia artificial en Sevilla | Ordinaly Software",
    description:
      "Inteligencia artificial en Sevilla para empresas que buscan innovar. Optimizamos tus procesos con soluciones de IA personalizadas para mejorar la rentabilidad",
    image: INTELIGENCIA_ARTIFICIAL_SEVILLA_HERO_IMAGE,
  });
}

export default async function InteligenciaArtificialEnSevilla() {
  return <InteligenciaArtificialSevilla />;
}
