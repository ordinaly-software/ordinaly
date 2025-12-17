import type { Metadata } from "next";
import ServicesPage from "../page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  return createPageMetadata({
    locale,
    path: `/services/${slug}`,
    title: "Servicios de automatización para empresas",
    description:
      "Explora servicios, productos y soluciones de automatización con IA para empresas.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  return <ServicesPage initialServiceSlug={slug} />;
}

