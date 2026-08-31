import type { Metadata } from "next";
import UsPage from "./page.client";
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
    path: "/nosotros",
    title: isEs
      ? "Sobre nosotros: equipo, misión y visión"
      : "About us: team, mission and vision",
    description: isEs
      ? "Somos Ordinaly Software, consultora de automatización con IA en Sevilla. Conoce al equipo de ingeniería, nuestra misión y cómo trabajamos con PYMES."
      : "We are Ordinaly Software, an AI automation consultancy in Seville. Meet the engineering team, our mission and how we work with SMEs.",
    image: "/static/backgrounds/us_background.webp",
  });
}

export default async function Us({
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
          { name: isEs ? "Nosotros" : "About us" },
        ]}
      />
      <UsPage />
    </>
  );
}
