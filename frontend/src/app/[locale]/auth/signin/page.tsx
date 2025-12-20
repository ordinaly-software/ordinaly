import type { Metadata } from "next";
import SignInPage from "./page.client";
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
    path: "/auth/signin",
    title: isEs ? "Inicia sesión | Ordinaly Software" : "Sign in | Ordinaly Software",
    description: isEs
      ? "Accede a tu cuenta para gestionar servicios, cursos y automatizaciones de Ordinaly."
      : "Access your account to manage Ordinaly services, courses, and automations.",
    image: "/static/signup_illustration.webp",
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
