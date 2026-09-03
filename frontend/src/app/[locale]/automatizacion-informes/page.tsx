import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import AutomatizacionInformes from "./page.client"

const slug = "automatizacion-informes" as const;

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
      ? "Automatización de informes para comunidades"
      : "Report automation for communities",
    description: isEs
      ? "Automatizamos el envío mensual de informes económicos a propietarios y comunidades: datos desde tu CRM, envío masivo por email y archivado con trazabilidad."
      : "We automate monthly financial reports for property owners and communities: data from your CRM, bulk email delivery and fully traceable archiving.",
    image: "/static/automatizacion-informes/automatizacion_informes.webp",
  });
}

export default async function AutomatizacionDeInformes({
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
          { name: isEs ? "Automatización de informes" : "Report Automation" },
        ]}
      />
      <AutomatizacionInformes />
    </>
  );
}
