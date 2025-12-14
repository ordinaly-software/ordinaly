import type { Metadata } from "next";
import UsPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/us",
    title: "Us | Ordinaly",
    description: "Conoce más sobre el equipo y la visión de Ordinaly.",
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
