import type { Metadata } from "next";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import { notFound } from "next/navigation";

// Reused by services/[slug]/page.tsx for OG images
type Service = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string | null;
};

const FALLBACK_API_BASE_URL = "https://api.ordinaly.ai";
const FALLBACK_OG_IMAGE = "/og-image.png";

const resolveServiceOgImage = (rawImage?: string | null) => {
  if (!rawImage) return FALLBACK_OG_IMAGE;
  const trimmed = rawImage.trim();
  if (!trimmed) return FALLBACK_OG_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\/api\.ordinaly\.ai/i, "https://api.ordinaly.ai");
  }
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/static/")) return trimmed;
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL).replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

async function fetchService(slug: string): Promise<Service | null> {
  try {
    const res = await fetch(getApiEndpoint(`/api/services/${slug}/`), {
      next: { revalidate: 300 },
    });
    if (res.ok) return res.json();
  } catch {
    // ignore
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

  // Check if it's a service slug
  const service = await fetchService(slug);
  if (service) {
    const fallbackTitle = isEs
      ? "Servicios y productos de automatización con IA"
      : "AI automation services and products";
    const fallbackDescription = isEs
      ? defaultDescription
      : "AI automation services and products for companies looking to scale with intelligent workflows.";
    const title = service.title || fallbackTitle;
    const description = service.subtitle || service.description || fallbackDescription;
    const image = resolveServiceOgImage(service.image);

    return createPageMetadata({ locale, path: `/${slug}`, title, description, image });
  }

  // Unknown slug — return non-indexable fallback
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs ? "Servicios de automatización" : "Automation services",
    description: defaultDescription,
    image: "/static/backgrounds/services_background.webp",
    index: false,
  });
}

// Lazy import ServicesPage only when needed (services are the hot path)
const getServicesPage = () =>
  import("../services/page.client").then((m) => m.default);

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;

  // Service (check API)
  const service = await fetchService(slug);
  if (service) {
    const ServicesPage = await getServicesPage();
    return <ServicesPage initialServiceSlug={slug} />;
  }

  // Nothing found
  notFound();
}
