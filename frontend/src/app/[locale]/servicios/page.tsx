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
      ? "Servicios de automatización con IA para empresas"
      : "AI automation services for businesses",
    description: isEs
      ? "Servicios y productos de automatización con IA: agentes de voz, procesos con n8n, automatización de facturas e informes e implantación de Odoo 18."
      : "AI automation services and products: voice agents, n8n process automation, invoice and report automation, and Odoo 18 implementation.",
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
