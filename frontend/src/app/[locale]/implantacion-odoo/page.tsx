import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import ImplantacionOdoo from "./page.client"

const slug = "implantacion-odoo" as const;

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
      ? "Implantación de Odoo 20 para empresas y pymes"
      : "Odoo 20 implementation for businesses & SMEs",
    description: isEs
      ? "Implantamos y actualizamos Odoo 20: análisis funcional, migración de datos, validación técnica y entrega de un entorno operativo, con base VeriFactu España."
      : "We implement and upgrade Odoo 20: functional analysis, data migration, technical validation and delivery of a live environment, with VeriFactu base setup.",
    image: "/og/implantacion-odoo.webp",
  });
}

export default async function ImplantacionDeOdoo({
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
          { name: isEs ? "Implantación de Odoo" : "Odoo Implementation" },
        ]}
      />
      <ImplantacionOdoo />
    </>
  );
}
