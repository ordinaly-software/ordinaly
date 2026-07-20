import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import ImplantacionOdoo from "./page.client"

const slug = "implantacion-odoo" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Implantación de Odoo 18 para empresas y pymes",
    description:
      "Implantamos y actualizamos Odoo 18: análisis funcional, migración de datos, validación técnica y entrega de un entorno operativo, con opción de configuración base para VeriFactu España.",
    image: "/static/backgrounds/odoo_background.webp",
  });
}

export default async function ImplantacionDeOdoo() {
  return <ImplantacionOdoo />;
}
