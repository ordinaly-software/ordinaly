import type { Metadata } from "next";
import ProfilePage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/profile",
    title: "Tu perfil y ajustes",
    description: "Gestiona tu perfil, pagos y preferencias dentro de Ordinaly.",
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
