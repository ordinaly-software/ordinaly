import type { Metadata } from "next";
import ContactPage from "./page.client";
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
    path: "/contact",
    title: isEs ? "Contacto | Ordinaly Software" : "Contact | Ordinaly Software",
    description: isEs
      ? "Hablemos sobre tus proyectos de automatización e IA. Escríbenos y te responderemos en menos de 24h."
      : "Let's talk about your automation and AI projects. Write to us and we’ll reply within 24 hours.",
    image: "/static/contact/contact_pic.webp",
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
