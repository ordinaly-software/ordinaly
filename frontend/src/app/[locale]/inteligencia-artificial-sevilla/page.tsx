import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialSevilla from "./page.client"

const slug = "inteligencia-artificial-sevilla" as const;
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
  const messagesWithLandings = messages as { landings?: Record<string, LandingMetadataContent> };
  const landing: LandingMetadataContent =
    messagesWithLandings.landings?.[slug] ?? {
      title: slug,
      description: "",
    };
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: landing.title,
    description: landing.description,
    image: landing.heroImage || "/static/backgrounds/services_background.webp",
  });
}

export default async function InteligenciaArtificialEnSevilla() {
  return <InteligenciaArtificialSevilla />;
}
