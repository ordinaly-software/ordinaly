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
      : "AI Invoice Automation for Businesses",
    description: isEs
      ? "Automatización de facturas para empresas y asesorías. Extrae datos desde email o WhatsApp, clasifica documentos y sincroniza con tu ERP mediante IA para ahorrar horas de trabajo manual."
      : "Automate invoice processing for businesses and accounting firms. Extract data from email or WhatsApp, classify documents, and sync with your ERP using AI to save hours of manual work.",
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
