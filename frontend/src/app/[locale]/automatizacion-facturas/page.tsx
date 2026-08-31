import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import AutomatizacionFacturas from "./page.client"

const slug = "automatizacion-facturas" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs
      ? "Automatización de facturas para empresas"
      : "AI invoice automation for businesses",
    description: isEs
      ? "Automatiza la gestión de facturas en empresas y asesorías: extrae datos de email o WhatsApp, clasifica documentos y sincroniza con tu ERP mediante IA."
      : "Automate invoice processing for businesses and accounting firms: extract data from email or WhatsApp, classify documents and sync with your ERP using AI.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function AutomatizacionDeFacturas({
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
          { name: isEs ? "Servicios" : "Services", path: "/servicios" },
          { name: isEs ? "Automatización de facturas" : "Invoice Automation" },
        ]}
      />
      <AutomatizacionFacturas />
    </>
  );
}
