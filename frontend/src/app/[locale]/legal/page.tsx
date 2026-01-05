import type { Metadata } from "next";
import LegalPage from "./page.client";
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
    path: "/legal",
    title: isEs ? "Legal, privacidad y cookies" : "Legal, privacy, and cookies",
    description: isEs
      ? "Consulta términos de servicio, políticas de privacidad, cookies y licencias de Ordinaly Software."
      : "Review Ordinaly Software terms of service, privacy policy, cookies, and licenses.",
    image: "/static/backgrounds/api_background.webp",
  });
}

export default async function Legal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <LegalPage />;
}
