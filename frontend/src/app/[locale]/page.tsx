import type { Metadata } from "next";
import HomePage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/",
    title: "Ordinaly - Automatización Empresarial con IA",
    description:
      "Transformamos empresas con soluciones de automatización inteligente en Sevilla, España y Europa.",
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <HomePage />;
}
