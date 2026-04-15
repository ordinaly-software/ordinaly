import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialEmpresas from "./page.client"

const slug = "inteligencia-artificial-empresas" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Inteligencia artificial para empresas | Ordinaly",
    description:
      "Inteligencia artificial para empresas que buscan competitividad. Optimizamos procesos y potenciamos la toma de decisiones con soluciones de IA a medida",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function InteligenciaArtificialParaEmpresas() {
  return <InteligenciaArtificialEmpresas />;
}
