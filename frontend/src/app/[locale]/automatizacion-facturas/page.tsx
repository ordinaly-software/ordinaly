import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { LANDING_ASSETS } from "@/lib/landing-assets";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionFacturas from "./page.client"

const slug = "automatizacion-facturas" as const;
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
    image: LANDING_ASSETS[slug].heroImage,
  });
}

export default async function AutomatizacionDeFacturas() {
  return <AutomatizacionFacturas />;
}
