import type { Metadata } from "next";
import LegalPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/legal",
    title: "Información legal, privacidad y cookies",
    description: "Consulta términos de servicio, políticas de privacidad, cookies y licencias de Ordinaly.",
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
