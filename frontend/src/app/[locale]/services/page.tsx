import type { Metadata } from "next";
import ServicesPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/services",
    title: "Servicios de automatización para empresas | Ordinaly",
    description:
      "Explora servicios, productos y soluciones de automatización con IA para empresas.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function Services({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ServicesPage />;
}
