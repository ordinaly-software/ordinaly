import type { Metadata } from "next";
import SignInPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/auth/signin",
    title: "Inicia sesión",
    description: "Accede a tu cuenta para gestionar servicios, cursos y automatizaciones de Ordinaly.",
  });
}

export default async function SignIn({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <SignInPage />;
}
