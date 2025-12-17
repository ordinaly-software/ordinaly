import type { Metadata } from "next";
import SignUpPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/auth/signup",
    title: "Crear cuenta",
    description: "Regístrate para acceder a cursos, servicios y automatizaciones impulsadas por IA en Ordinaly.",
  });
}

export default async function SignUp({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <SignUpPage />;
}
