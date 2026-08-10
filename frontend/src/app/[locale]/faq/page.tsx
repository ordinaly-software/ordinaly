import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import ReCaptchaWrapper from "@/app/[locale]/recaptcha-provider";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import { client } from "@/lib/sanity";
import { highlightedPosts } from "@/lib/queries";
import type { BlogPost } from "@/components/blog/types";
import FaqPageClient from "./page.client";
import { faqEntries, localizeFaq } from "./faq-data";

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
      ? "Preguntas frecuentes | Automatización, agentes IA, n8n, facturas, informes y Odoo"
      : "FAQ | Automation, AI agents, n8n, invoicing, reporting and Odoo",
    description: isEs
      ? "Todas las preguntas frecuentes de Ordinaly en un solo sitio: agente de llamadas IA, Automatización con n8n, facturas, informes, implantación de Odoo y formación."
      : "Every Ordinaly FAQ in one place: AI calling agent, n8n automations, invoicing, reporting, Odoo implementation and training.",
    image: "/static/backgrounds/services_background.webp",
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  // The blog is Spanish-only (see /blog/page.tsx), so only fetch highlights for es.
  const highlighted: BlogPost[] = isEs
    ? await client.fetch(highlightedPosts, {}, { next: { tags: ["blog"] } }).catch(() => [])
    : [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: localizeFaq(locale, entry.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: localizeFaq(locale, entry.answer),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: "FAQ" },
        ]}
      />
      <ReCaptchaWrapper badgeContainerId="recaptcha-badge-faq-page">
        <FaqPageClient locale={locale} highlightedPosts={highlighted} />
      </ReCaptchaWrapper>
    </>
  );
}
