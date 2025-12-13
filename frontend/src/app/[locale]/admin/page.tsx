import type { Metadata } from "next";
import AdminPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/admin",
    title: "Panel de administración",
    description: "Gestiona servicios, cursos, usuarios y contenidos desde el panel de administración de Ordinaly.",
  });
}

export default async function Admin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <AdminPage />;
}
