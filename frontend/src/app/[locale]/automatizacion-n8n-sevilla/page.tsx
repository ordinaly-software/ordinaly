import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionN8nSevillaPage from "./page.client";

const slug = "automatizacion-n8n-sevilla" as const;
const AUTOMATIZACION_N8N_SEVILLA_HERO_IMAGE = "/static/automatizacion-n8n-sevilla/hero-blurred.webp";
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
    image: AUTOMATIZACION_N8N_SEVILLA_HERO_IMAGE,
  });
}

export default async function AutomatizacionN8nSevilla() {
  return <AutomatizacionN8nSevillaPage />;
}
