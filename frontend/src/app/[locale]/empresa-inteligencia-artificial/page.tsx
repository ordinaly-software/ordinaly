import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import EmpresaInteligenciaArtificial from "./page.client"

const slug = "empresa-inteligencia-artificial" as const;
type LandingMetadataContent = {
  title: string;
  description: string;
  heroImage?: string;
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
    image: landing.heroImage || "/static/backgrounds/services_background.webp",
  });
}

export default async function EmpresaDeInteligenciaArtificial() {
  return <EmpresaInteligenciaArtificial />;
}
