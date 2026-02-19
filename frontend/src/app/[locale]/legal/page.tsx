import type { Metadata } from "next";
import LegalPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasParams = !!resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;

  const base = createPageMetadata({
      locale,
      path: "/legal",
      title: isEs ? "Legal, privacidad y cookies" : "Legal, privacy, and cookies",
      description: isEs
        ? "Consulta términos de servicio, políticas de privacidad, cookies y licencias de Ordinaly Software."
        : "Review Ordinaly Software terms of service, privacy policy, cookies, and licenses.",
      image: "/static/backgrounds/api_background.webp",
    });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function Legal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <LegalPage />;
}
