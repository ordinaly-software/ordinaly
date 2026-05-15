import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import FormacionIaPymesSevillaPage from "./page.client";

const slug = "formacion-ia-sevilla" as const;
const FORMACION_IA_PYMES_SEVILLA_HERO_IMAGE = "/static/formacion-ia-sevilla/hero-blurred.webp";
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
    image: FORMACION_IA_PYMES_SEVILLA_HERO_IMAGE,
  });
}

export default async function FormacionIaPymesSevilla() {
  return <FormacionIaPymesSevillaPage />;
}
