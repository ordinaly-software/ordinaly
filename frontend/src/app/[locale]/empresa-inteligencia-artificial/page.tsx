import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import EmpresaInteligenciaArtificial from "./page.client"

const slug = "empresa-inteligencia-artificial" as const;
const EMPRESA_INTELIGENCIA_ARTIFICIAL_HERO_IMAGE = "/static/empresa-inteligencia-artificial/hero-blurred.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Empresa de inteligencia artificial | Ordinaly Sevilla",
    description:
      "Empresa de inteligencia artificial especializada en soluciones B2B. Ayudamos a tu empresa a integrar tecnología avanzada para liderar tu sector",
    image: EMPRESA_INTELIGENCIA_ARTIFICIAL_HERO_IMAGE,
  });
}

export default async function EmpresaDeInteligenciaArtificial() {
  return <EmpresaInteligenciaArtificial />;
}
