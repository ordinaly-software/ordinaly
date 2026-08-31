import type { Metadata } from "next";
import FormationPageClient from "./page.client";
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
    path: "/formacion",
    title: isEs
      ? "Cursos de IA y automatización para empresas"
      : "AI and automation courses for businesses",
    description: isEs
      ? "Formación práctica en IA, n8n y herramientas low-code para empresas y profesionales. Cursos aplicados para automatizar procesos reales y ganar productividad."
      : "Hands-on training in AI, n8n and low-code tools for companies and professionals. Applied courses to automate real processes and boost productivity.",
    image: "/static/backgrounds/formation_background.webp",
  });
}

export default async function FormationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  // Server component: render the client root without initial slug
  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Formación" : "Training" },
        ]}
      />
      <FormationPageClient />
    </>
  );
}
