import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import ConsultoraTecnologicaSevillaPage from "./page.client";

const slug = "consultora-tecnologica-sevilla" as const;
const HERO_IMAGE = "/static/servicios/engineers.webp";

type LandingMetadataContent = {
  title: string;
  shortTitle?: string;
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

export default async function ConsultoraTecnologicaSevilla({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  const messages = await getMessages({ locale });
  const landing = (messages as { landings?: Record<string, LandingMetadataContent> }).landings?.[slug];

  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Nosotros" : "About", path: "/nosotros" },
          { name: landing?.shortTitle ?? landing?.title ?? (isEs ? "Consultora tecnológica en Sevilla" : "Technology consulting in Seville") },
        ]}
      />
      <ConsultoraTecnologicaSevillaPage />
    </>
  );
}
