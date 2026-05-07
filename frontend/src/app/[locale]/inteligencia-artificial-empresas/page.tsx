import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialEmpresas from "./page.client"

const slug = "inteligencia-artificial-empresas" as const;

type LandingMeta = { seoTitle?: string; title?: string; seoDescription?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const landing = (messages as { landings?: Record<string, LandingMeta> }).landings?.[slug] ?? {};
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: landing.seoTitle ?? landing.title ?? slug,
    description: landing.seoDescription,
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function InteligenciaArtificialParaEmpresas() {
  return <InteligenciaArtificialEmpresas />;
}
