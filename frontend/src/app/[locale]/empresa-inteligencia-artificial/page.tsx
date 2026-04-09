import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import EmpresaInteligenciaArtificial from "./page.client"

const slug = "empresa-inteligencia-artificial" as const;
const EMPRESA_INTELIGENCIA_ARTIFICIAL_HERO_IMAGE = "/static/empresa-inteligencia-artificial/hero-blurred.webp";
type LandingMetadataContent = {
  title: string;
  description: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const landing = (messages as { landings?: Record<string, LandingMetadataContent> }).landings?.[slug];

  if (!landing) {
    throw new Error(`Missing landing content: ${slug}`);
  }

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: landing.title,
    description: landing.description,
    image: EMPRESA_INTELIGENCIA_ARTIFICIAL_HERO_IMAGE,
  });
}

export default async function EmpresaDeInteligenciaArtificial() {
  return <EmpresaInteligenciaArtificial />;
}
