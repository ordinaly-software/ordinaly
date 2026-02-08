import { unstable_cache } from "next/cache";
import { absoluteAssetUrl, absoluteUrl, metadataBaseUrl } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import type { Service } from "@/hooks/useServices";
import type { Course } from "@/hooks/useCourses";

const SITE_URL = metadataBaseUrl;
const REVALIDATE_SECONDS = 3600;
const DEFAULT_COUNTRY = "ES";
const DEFAULT_CURRENCY = "EUR";
const PRICE_VALIDITY_DAYS = 365;

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
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

const getServices = unstable_cache(
  async (): Promise<Service[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/services/"));
    const items = extractItems<Service>(data);
    return items.filter((service) => !service.draft);
  },
  ["schema-services"],
  { revalidate: REVALIDATE_SECONDS },
);

const getCourses = unstable_cache(
  async (): Promise<Course[]> => {
    const data = await fetchJson<unknown>(getApiEndpoint("/api/courses/courses/"));
    const items = extractItems<Course>(data);
    return items.filter((course) => !course.draft);
  },
  ["schema-courses"],
  { revalidate: REVALIDATE_SECONDS },
);

const parsePrice = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const buildImageUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  return absoluteAssetUrl(value);
};

const toDateOnly = (value: Date) => value.toISOString().split("T")[0];

const isValidDateString = (value?: string | null) => {
  if (!value) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime());
};

const resolvePriceValidUntil = (preferredDate?: string | null) => {
  const today = new Date();

  if (preferredDate && isValidDateString(preferredDate)) {
    const parsed = new Date(preferredDate);
    const hasTimeComponent = /[T ]/.test(preferredDate);

    if (hasTimeComponent) {
      // Datetime string: preserve original millisecond-precision comparison.
      if (parsed.getTime() >= today.getTime()) return preferredDate;
    } else {
      // Date-only string: compare at calendar-day granularity.
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const parsedMidnight = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
      if (parsedMidnight.getTime() >= todayMidnight.getTime()) return preferredDate;
    }
  }
  const fallback = new Date(today.getTime() + PRICE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  return toDateOnly(fallback);
};

const resolveEnvNumber = (value?: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildMerchantReturnPolicy = (locale?: string) => {
  const policy: Record<string, unknown> = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: process.env.SCHEMA_COUNTRY ?? DEFAULT_COUNTRY,
    returnPolicyCategory:
      process.env.SCHEMA_RETURN_POLICY_CATEGORY ?? "https://schema.org/MerchantReturnUnspecified",
    returnPolicyUrl: absoluteUrl("/legal", locale),
  };

  const returnDays = resolveEnvNumber(process.env.SCHEMA_RETURN_DAYS);
  if (returnDays !== null) policy.merchantReturnDays = returnDays;

  if (process.env.SCHEMA_RETURN_METHOD) policy.returnMethod = process.env.SCHEMA_RETURN_METHOD;
  if (process.env.SCHEMA_RETURN_FEES) policy.returnFees = process.env.SCHEMA_RETURN_FEES;

  return policy;
};

const buildShippingDetails = () => {
  const currency = process.env.SCHEMA_CURRENCY ?? DEFAULT_CURRENCY;
  const country = process.env.SCHEMA_COUNTRY ?? DEFAULT_COUNTRY;
  const rate = resolveEnvNumber(process.env.SCHEMA_SHIPPING_RATE) ?? 0;
  const handlingMin = resolveEnvNumber(process.env.SCHEMA_SHIPPING_HANDLING_MIN) ?? 0;
  const handlingMax = resolveEnvNumber(process.env.SCHEMA_SHIPPING_HANDLING_MAX) ?? 1;
  const transitMin = resolveEnvNumber(process.env.SCHEMA_SHIPPING_TRANSIT_MIN) ?? 0;
  const transitMax = resolveEnvNumber(process.env.SCHEMA_SHIPPING_TRANSIT_MAX) ?? 3;

  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      currency,
      value: rate,
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: country,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: handlingMin,
        maxValue: handlingMax,
        unitCode: "d",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: transitMin,
        maxValue: transitMax,
        unitCode: "d",
      },
    },
  };
};

const getServicePath = (service: Service) => `/services/${service.slug || service.id}`;
const getCoursePath = (course: Course) => `/formation/${course.slug || course.id}`;

type CommerceSchemaProps = {
  locale?: string;
};

export default async function CommerceSchema({ locale }: CommerceSchemaProps) {
  const [services, courses] = await Promise.all([getServices(), getCourses()]);
  const merchantReturnPolicy = buildMerchantReturnPolicy(locale);
  const shippingDetails = buildShippingDetails();

  const organizationId = `${SITE_URL}#organization`;
  const localBusinessId = `${SITE_URL}#localbusiness`;
  const catalogId = `${SITE_URL}#offer-catalog`;

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": organizationId,
    name: "Ordinaly Software - Automatización empresarial con IA en Sevilla",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    description:
      "Agentes de IA y automatización empresarial en Sevilla. Transformamos negocios con inteligencia artificial: chatbots, CRMs, workflows y formación para empresas.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plaza del Duque 1",
      addressLocality: "Sevilla",
      addressRegion: "Andalucía",
      postalCode: "41002",
      addressCountry: "ES",
      // Registered tax address: Bormujos (Sevilla), used only for official notices.
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

  const localBusiness: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": localBusinessId,
    name: "Ordinaly — Automatización empresarial con IA en Sevilla",
    image: `${SITE_URL}/static/home/main_home_ilustration.webp`,
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
    parentOrganization: { "@id": organizationId },
  };

  const organizationReference = { "@id": organizationId };

  const serviceOffers = services
    .filter((service) => Boolean(service.title))
    .map((service) => {
      const url = absoluteUrl(getServicePath(service), locale);
      const description = (service.clean_description ?? service.description ?? "").trim();
      const price = parsePrice(service.price ?? null);
      const isProduct = service.type === "PRODUCT";
      const item: Record<string, unknown> = {
        "@type": isProduct ? "Product" : "Service",
        "@id": url,
        name: service.title,
        url,
        provider: organizationReference,
      };
      if (service.subtitle) item.category = service.subtitle;
      if (description) item.description = description;
      const imageUrl = buildImageUrl(service.image ?? undefined);
      if (imageUrl) item.image = imageUrl;

      const offer: Record<string, unknown> = {
        "@type": "Offer",
        url,
        itemOffered: item,
      };
      if (price !== null) {
        offer.priceCurrency = DEFAULT_CURRENCY;
        offer.price = price;
        offer.availability = "https://schema.org/InStock";
        offer.priceValidUntil = resolvePriceValidUntil();
        offer.hasMerchantReturnPolicy = merchantReturnPolicy;
        offer.shippingDetails = shippingDetails;
      }
      return offer;
    });

  const courseOffers = courses
    .filter((course) => Boolean(course.title))
    .map((course) => {
      const url = absoluteUrl(getCoursePath(course), locale);
      const item: Record<string, unknown> = {
        "@type": "Course",
        "@id": url,
        name: course.title,
        description: course.description,
        url,
        provider: organizationReference,
      };
      if (course.start_date) item.startDate = course.start_date;
      if (course.end_date) item.endDate = course.end_date;
      if (typeof course.duration_hours === "number" && course.duration_hours > 0) {
        item.timeRequired = `PT${course.duration_hours}H`;
      }
      if (course.location) {
        const label = course.location.trim();
        if (label) {
          item.location = { "@type": "Place", name: label };
          const normalized = label.toLowerCase();
          item.courseMode = normalized.includes("online") || normalized.includes("virtual") ? "Online" : "Offline";
        }
      }
      const imageUrl = buildImageUrl(course.image ?? undefined);
      if (imageUrl) item.image = imageUrl;

      const price = parsePrice((course as { price?: number | string | null }).price ?? null);
      const offer: Record<string, unknown> = {
        "@type": "Offer",
        url,
        itemOffered: item,
      };
      if (price !== null) {
        offer.priceCurrency = DEFAULT_CURRENCY;
        offer.price = price;
        offer.availability = "https://schema.org/InStock";
        offer.priceValidUntil = resolvePriceValidUntil(course.end_date);
        offer.hasMerchantReturnPolicy = merchantReturnPolicy;
        offer.shippingDetails = shippingDetails;
      }
      return offer;
    });

  const offers = [...serviceOffers, ...courseOffers];
  const graph: Record<string, unknown>[] = [organization, localBusiness];

  if (offers.length > 0) {
    const offerCatalog = {
      "@type": "OfferCatalog",
      "@id": catalogId,
      name: "Servicios, productos y formación",
      itemListElement: offers,
    };
    organization.hasOfferCatalog = { "@id": catalogId };
    localBusiness.hasOfferCatalog = { "@id": catalogId };
    graph.push(offerCatalog);
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
