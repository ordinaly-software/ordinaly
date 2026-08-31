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
    title: isEs ? "Contacto: habla con nuestro equipo" : "Contact: talk to our team",
    description: isEs
      ? "Cuéntanos tu proyecto de automatización con IA. Te respondemos en menos de 24 horas con una propuesta y un plan de trabajo claro."
      : "Tell us about your AI automation project. We reply within 24 hours with a proposal and a clear delivery plan.",
    image: "/static/contacto/office_03.webp",
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
