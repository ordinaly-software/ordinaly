import type { Metadata } from "next";
import FormationPageClient from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

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
      ? "Cursos de IA y automatización"
      : "AI and automation courses",
    description: isEs
      ? "Aprende IA, n8n y herramientas low-code con formación práctica para empresas y profesionales. Cursos orientados a aplicar automatización real y mejorar la productividad del equipo."
      : "Learn AI, n8n, and low-code tools through practical training for companies and professionals. Courses focused on real automation use cases and measurable team productivity.",
    image: "/static/backgrounds/formation_background.webp",
  });
}

export default async function FormationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  // Server component: render the client root without initial slug
  return <FormationPageClient />;
}
