import type { Metadata } from "next";
import ContactPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";

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
    title: isEs ? "Contacto | Soporte y automatización IA" : "Contact | Support and AI automation",
    description: isEs
      ? "Habla con Ordinaly sobre agentes IA, automatización, formación y soporte operativo. Respondemos en menos de 24 horas."
      : "Talk with Ordinaly about AI agents, automation systems, training, and operational support. We reply within 24 hours.",
    image: "/static/contact/contact_pic.png",
  });
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return (
    <ReCaptchaWrapper badgeContainerId="recaptcha-badge-contact-page">
      <ContactPage />
    </ReCaptchaWrapper>
  );
}
