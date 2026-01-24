import type { Metadata } from "next";
import HomePage from "./page.client";
import LoadingPage from "./loading";
import { absoluteUrl, createPageMetadata, metadataBaseUrl } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: "/",
    title: isEs
      ? "Ordinaly Software | Automatización empresarial con IA en Sevilla"
      : "Ordinaly Software | AI business automation in Seville",
    description: isEs
      ? "Consultoría y soluciones de automatización con IA: agentes, chatbots, workflows, Odoo y formación para empresas en Sevilla y Europa."
      : "AI automation consulting: agents, chatbots, workflows, Odoo, and training for companies in Seville and Europe.",
    image: "/og-image.png",
  });
}

export const revalidate = 3600; // ISR: revalidate home every hour

const SITE_URL = metadataBaseUrl;

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

const extractItems = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
};

const getInitialServices = unstable_cache(
  async (): Promise<Service[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/services/"));
    const items = extractItems<Service>(data);
    return items.filter((service) => !service.draft).slice(0, 6);
  },
  ["home-services"],
  { revalidate: 3600 },
);

const getInitialCourses = unstable_cache(
  async (): Promise<Course[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/courses/courses/"));
    const items = extractItems<Course>(data);
    const now = new Date();
    const upcoming = items.filter((course) => {
      if (course.draft) return false;
      const startDate = Date.parse(course.start_date);
      return !Number.isNaN(startDate) && startDate >= now.getTime();
    });
    const getSortTime = (course: Course) => {
      const createdAt = Date.parse(course.created_at);
      if (!Number.isNaN(createdAt)) return createdAt;
      const startAt = Date.parse(course.start_date);
      if (!Number.isNaN(startAt)) return startAt;
      return 0;
    };
    return upcoming.sort((a, b) => getSortTime(b) - getSortTime(a)).slice(0, 3);
  },
  ["home-courses"],
  { revalidate: 3600 },
);

const getServicePath = (service: Service) => `/services/${service.slug || service.id}`;
const getCoursePath = (course: Course) => `/formation/${course.slug || course.id}`;

const buildServiceUrl = (service: Service, locale?: string) =>
  absoluteUrl(getServicePath(service), locale);

const buildCourseUrl = (course: Course, locale?: string) =>
  absoluteUrl(getCoursePath(course), locale);

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const initialServicesPromise = getInitialServices();
  const initialCoursesPromise = getInitialCourses();

  const schemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ordinaly Software - Automatización empresarial con IA en Sevilla",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
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
    image: `${SITE_URL}/static/home/main_home_ilustration.webp`,
    "@id": SITE_URL,
    url: SITE_URL,
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
  const organizationReference = {
    "@type": "Organization",
    name: schemaOrganization.name,
    url: schemaOrganization.url,
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
      <Suspense fallback={<LoadingPage />}>
        <ServiceCourseSchema
          initialServicesPromise={initialServicesPromise}
          initialCoursesPromise={initialCoursesPromise}
          locale={locale}
          organizationReference={organizationReference}
        />
        <HomeContent
          initialServicesPromise={initialServicesPromise}
          initialCoursesPromise={initialCoursesPromise}
        />
      </Suspense>
    </>
  );
}

type HomeContentProps = {
  initialServicesPromise: Promise<Service[]>;
  initialCoursesPromise: Promise<Course[]>;
};

async function HomeContent({
  initialServicesPromise,
  initialCoursesPromise,
}: HomeContentProps) {
  const [initialServices, initialCourses] = await Promise.all([
    initialServicesPromise,
    initialCoursesPromise,
  ]);

  return <HomePage initialServices={initialServices} initialCourses={initialCourses} />;
}

type ServiceCourseSchemaProps = {
  initialServicesPromise: Promise<Service[]>;
  initialCoursesPromise: Promise<Course[]>;
  locale?: string;
  organizationReference: Record<string, unknown>;
};

async function ServiceCourseSchema({
  initialServicesPromise,
  initialCoursesPromise,
  locale,
  organizationReference,
}: ServiceCourseSchemaProps) {
  const [initialServices, initialCourses] = await Promise.all([
    initialServicesPromise,
    initialCoursesPromise,
  ]);

  const serviceSchemaDetails = initialServices
    .filter((service) => Boolean(service.title))
    .map((service) => {
      const serviceUrl = buildServiceUrl(service, locale);
      const description = (service.clean_description ?? service.description ?? "").trim();
      const entry: Record<string, unknown> = {
        "@type": service.type === "PRODUCT" ? "Product" : "Service",
        "@id": serviceUrl,
        name: service.title,
        url: serviceUrl,
        provider: organizationReference,
        serviceType: service.subtitle || service.title,
      };
      if (description) {
        entry.description = description;
      }
      return entry;
    });

  const courseSchemaDetails = initialCourses
    .filter((course) => Boolean(course.title))
    .map((course) => {
      const courseUrl = buildCourseUrl(course, locale);
      const durationHours = Number(course.duration_hours ?? 0);
      const locationLabel = course.location?.trim();
      const normalizedLocation = locationLabel?.toLowerCase() ?? "";
      const isOnline = normalizedLocation.includes("online") || normalizedLocation.includes("virtual");
      const entry: Record<string, unknown> = {
        "@type": "Course",
        "@id": courseUrl,
        name: course.title,
        description: course.description,
        url: courseUrl,
        provider: organizationReference,
      };
      if (course.start_date) {
        entry.startDate = course.start_date;
      }
      if (course.end_date) {
        entry.endDate = course.end_date;
      }
      if (durationHours > 0) {
        entry.timeRequired = `PT${durationHours}H`;
      }
      if (locationLabel) {
        entry.location = {
          "@type": "Place",
          name: locationLabel,
        };
        entry.courseMode = isOnline ? "Online" : "Offline";
      }
      return entry;
    });

  if (courseSchemaDetails.length === 0 && serviceSchemaDetails.length === 0) {
    return null;
  }

  return (
    <>
      {serviceSchemaDetails.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": serviceSchemaDetails,
            }),
          }}
        />
      )}
      {courseSchemaDetails.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": courseSchemaDetails,
            }),
          }}
        />
      )}
    </>
  );
}
