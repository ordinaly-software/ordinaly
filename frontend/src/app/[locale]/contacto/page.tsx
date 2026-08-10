import type { Metadata } from "next";
import ContactPage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/contacto",
    title: isEs ? "Contacto | Soporte y automatización IA" : "Contact | Support and AI automation",
    description: isEs
      ? "Habla con Ordinaly sobre agentes IA, automatización, formación y soporte operativo. Respondemos en menos de 24 horas."
      : "Talk with Ordinaly about AI agents, automation systems, training, and operational support. We reply within 24 hours.",
    image: "/static/contacto/contact_pic.png",
  });
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Contacto" : "Contact" },
        ]}
      />
      <ReCaptchaWrapper badgeContainerId="recaptcha-badge-contact-page">
        <ContactPage />
      </ReCaptchaWrapper>
    </>
  );
}
