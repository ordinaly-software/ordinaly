import type { Metadata } from "next";
import ResetPasswordPage from "./page.client";
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
    path: "/reset-password",
    title: isEs ? "Restablecer contraseña" : "Reset Password",
    description: isEs
      ? "Restablece la contraseña de tu cuenta de Ordinaly."
      : "Reset your Ordinaly account password.",
    index: false,
  });
}

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ResetPasswordPage />;
}
