import type { Metadata } from "next";
import FormationRoot from "@/components/formation/formation-root";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/formation",
    title: "Cursos y formación",
    description: "Aprende a usar IA, n8n, y herramientas low-code con las formaciones de Ordinaly.",
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
  return <FormationRoot />;
}
