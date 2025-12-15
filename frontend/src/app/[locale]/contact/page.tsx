import type { Metadata } from "next";
import ContactPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/contact",
    title: "Contacto",
    description: "Hablemos sobre tus proyectos de automatización e IA. Escríbenos y te responderemos en menos de 24h.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ContactPage />;
}
