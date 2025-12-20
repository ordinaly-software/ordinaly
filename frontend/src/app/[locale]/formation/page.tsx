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
    path: "/formation",
    title: isEs
      ? "Cursos de IA y automatización | Ordinaly Software"
      : "AI and automation courses | Ordinaly Software",
    description: isEs
      ? "Aprende IA, n8n y herramientas low-code con formaciones prácticas para empresas y profesionales."
      : "Learn AI, n8n, and low-code tools with practical training for companies and professionals.",
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
