import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";
import FaqPageClient from "./page.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/faq",
    title: isEs
      ? "FAQ | Chatbots, agentes IA, n8n, WhatsApp e integraciones"
      : "FAQ | Chatbots, AI agents, n8n, WhatsApp and integrations",
    description: isEs
      ? "Base de conocimiento de Ordinaly sobre automatización, agentes IA, WhatsApp Business, integraciones CRM/ERP y formación aplicada."
      : "Ordinaly knowledge base covering automation, AI agents, WhatsApp Business, CRM/ERP integrations and applied training.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ReCaptchaWrapper badgeContainerId="recaptcha-badge-faq-page">
      <FaqPageClient locale={locale} />
    </ReCaptchaWrapper>
  );
}
