import type { Metadata } from "next";
import SignUpPage from "./page.client";
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
    path: "/auth/signup",
    title: isEs ? "Crear una cuenta de Ordinaly" : "Create an Ordinaly account",
    description: isEs
      ? "Regístrate para acceder a cursos, servicios y automatizaciones impulsadas por IA en Ordinaly."
      : "Sign up to access AI-powered courses, services, and automations from Ordinaly.",
    image: "/static/signup_illustration.webp",
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
