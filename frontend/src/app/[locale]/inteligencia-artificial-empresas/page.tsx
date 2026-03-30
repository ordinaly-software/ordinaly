import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialEmpresas from "./page.client"

const slug = "inteligencia-artificial-empresas" as const;
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
  const effectiveLanding: LandingMetadataContent =
    landing ?? {
      title: "Artificial Intelligence for Businesses",
      description: "Discover how our AI solutions can help your company improve efficiency and decision-making.",
      heroImage: "/static/backgrounds/services_background.webp",
    };

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: effectiveLanding.title,
    description: effectiveLanding.description,
    image: effectiveLanding.heroImage || "/static/backgrounds/services_background.webp",
  });
}

export default async function InteligenciaArtificialParaEmpresas() {
  return <InteligenciaArtificialEmpresas />;
}
