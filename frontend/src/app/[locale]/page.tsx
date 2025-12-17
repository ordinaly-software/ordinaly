import type { Metadata } from "next";
import HomePage from "./page.client";
import { createPageMetadata } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: "/",
    title: "Automatización empresarial con IA en Sevilla",
    description:
      "Transformamos empresas con soluciones de automatización inteligente en Sevilla, España y Europa.",
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const fetchJson = async <T,>(url: string): Promise<T | null> => {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const getInitialServices = async (): Promise<Service[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/services/"));
    const items = Array.isArray(data) ? data : (data as any)?.results;
    if (!Array.isArray(items)) return [];
    return (items as Service[]).filter((service) => !service.draft).slice(0, 6);
  };

  const getInitialCourses = async (): Promise<Course[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/courses/courses/?limit=3"));
    const items = Array.isArray(data) ? data : (data as any)?.results;
    if (!Array.isArray(items)) return [];
    return (items as Course[]).filter((course) => !(course as any).draft).slice(0, 3);
  };

  const [initialServices, initialCourses] = await Promise.all([
    getInitialServices(),
    getInitialCourses(),
  ]);

  const schemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ordinaly",
    url: "https://ordinaly.ai",
    logo: "https://ordinaly.ai/logo.png",
    description:
      "Agentes de IA y automatización empresarial en Sevilla. Transformamos negocios con inteligencia artificial: chatbots, CRMs, workflows y formación para empresas.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plaza del Duque 1",
      addressLocality: "Sevilla",
      addressRegion: "Andalucía",
      postalCode: "41002",
      addressCountry: "ES",
    },
    telephone: "+34626270806",
    email: "info@ordinaly.ai",
    areaServed: ["Sevilla", "Andalucía", "España"],
    sameAs: [
      "https://www.linkedin.com/company/ordinaly",
      "https://www.instagram.com/ordinaly",
      "https://www.tiktok.com/@ordinaly",
      "https://www.youtube.com/@ordinaly",
    ],
  };

  const schemaLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Ordinaly — Automatización empresarial con IA en Sevilla",
    image: "https://ordinaly.ai/static/main_home_ilustration.webp",
    "@id": "https://ordinaly.ai",
    url: "https://ordinaly.ai",
    telephone: "+34626270806",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plaza del Duque 1",
      addressLocality: "Sevilla",
      addressRegion: "Andalucía",
      postalCode: "41002",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.3890924,
      longitude: -5.9844589,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  };

  const schemaService = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Automatización Empresarial con IA",
    provider: {
      "@type": "Organization",
      name: "Ordinaly",
    },
    areaServed: {
      "@type": "City",
      name: "Sevilla",
    },
    description:
      "Servicios de agentes de IA, automatización de procesos, chatbots inteligentes, CRM/ERP con Odoo y formación en inteligencia artificial para empresas en Sevilla",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }}
      />
      <HomePage initialServices={initialServices} initialCourses={initialCourses} />
    </>
  );
}
