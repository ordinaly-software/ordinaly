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
      ? "Preguntas frecuentes sobre automatización con IA"
      : "Frequently asked questions about AI automation",
    description: isEs
      ? "Respuestas a las dudas más habituales sobre agentes de IA, automatización con n8n, facturas, informes, Odoo 18 y formación para empresas."
      : "Answers to the most common questions about AI agents, n8n automation, invoicing, reporting, Odoo 18 and training for businesses.",
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
