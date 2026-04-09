import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionInteligente from "./page.client"

const slug = "automatizacion-inteligente" as const;
const AUTOMATIZACION_INTELIGENTE_HERO_IMAGE = "/static/automatizacion-inteligente/hero-blurred.webp";
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
    image: AUTOMATIZACION_INTELIGENTE_HERO_IMAGE,
  });
}

export default async function AutomatizacionesInteligentes() {
  return <AutomatizacionInteligente />;
}
