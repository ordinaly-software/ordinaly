import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import AutomatizacionInformes from "./page.client"

const slug = "automatizacion-informes" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Automatización mensual de informes para comunidades",
    description:
      "Automatizamos el envío mensual de informes económicos a propietarios y comunidades: recogida de datos desde tu CRM o nube, envío masivo por correo electrónico y archivado con trazabilidad completa.",
    image: "/static/automatizacion-informes/automatizacion_informes.webp",
  });
}

export default async function AutomatizacionDeInformes() {
  return <AutomatizacionInformes />;
}
