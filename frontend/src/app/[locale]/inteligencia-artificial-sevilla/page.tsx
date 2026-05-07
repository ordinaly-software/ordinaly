import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import InteligenciaArtificialSevilla from "./page.client"

const slug = "inteligencia-artificial-sevilla" as const;
const INTELIGENCIA_ARTIFICIAL_SEVILLA_HERO_IMAGE = "/static/inteligencia-artificial-sevilla/hero-blurred.webp";

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
    image: INTELIGENCIA_ARTIFICIAL_SEVILLA_HERO_IMAGE,
  });
}

export default async function InteligenciaArtificialEnSevilla() {
  return <InteligenciaArtificialSevilla />;
}
