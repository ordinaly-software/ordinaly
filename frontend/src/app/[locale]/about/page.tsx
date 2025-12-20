import type { Metadata } from "next";
import UsPage from "./page.client";
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
    path: "/about",
    title: isEs
      ? "Sobre Ordinaly Software | Equipo, misión y visión"
      : "About Ordinaly Software | Team, mission, and vision",
    description: isEs
      ? "Conoce al equipo de Ordinaly, nuestra misión y cómo ayudamos a empresas a automatizar con IA."
      : "Meet the Ordinaly team, our mission, and how we help companies automate with AI.",
    image: "/static/backgrounds/us_background.webp",
  });
}

export default async function Us({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <UsPage />;
}
