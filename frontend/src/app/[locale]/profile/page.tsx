import type { Metadata } from "next";
import ProfilePage from "./page.client";
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
    path: "/profile",
    title: isEs ? "Tu perfil y ajustes | Ordinaly" : "Your profile and settings | Ordinaly",
    description: isEs
      ? "Gestiona tu perfil, pagos y preferencias dentro de Ordinaly."
      : "Manage your profile, payments, and preferences in Ordinaly.",
    image: "/static/backgrounds/api_background.webp",
  });
}

export default async function Profile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ProfilePage />;
}
