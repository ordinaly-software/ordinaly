import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionesPersonalizadasN8nPage from "./page.client";

const slug = "automatizaciones-personalizadas-empresas-n8n" as const;
const HERO_IMAGE = "/static/backgrounds/n8n_background.webp";

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
    image: HERO_IMAGE,
  });
}

export default async function AutomatizacionesPersonalizadasN8n() {
  return <AutomatizacionesPersonalizadasN8nPage />;
}
