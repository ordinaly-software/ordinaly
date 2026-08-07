import type { Metadata } from "next";
import ServicesPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/servicios",
    title: isEs
      ? "Servicios y productos de automatización con IA"
      : "AI automation services and products",
    description: isEs
      ? "Catálogo de servicios personalizados y productos listos para usar: agentes de IA, automatización de procesos, CRM/ERP y más."
      : "Catalog of tailored services and ready-to-use products: AI agents, process automation, CRM/ERP, and more.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function Services({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Servicios" : "Services" },
        ]}
      />
      <ServicesPage />
    </>
  );
}
