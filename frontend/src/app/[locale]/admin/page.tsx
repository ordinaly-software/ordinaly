import type { Metadata } from "next";
import AdminPage from "./page.client";
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
    path: "/admin",
    title: isEs ? "Panel de administración | Ordinaly" : "Admin dashboard | Ordinaly",
    description: isEs
      ? "Gestiona servicios, cursos, usuarios y contenidos desde el panel de administración de Ordinaly."
      : "Manage services, courses, users, and content from the Ordinaly admin dashboard.",
    image: "/static/backgrounds/api_background.webp",
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
