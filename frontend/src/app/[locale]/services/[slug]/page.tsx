import type { Metadata } from "next";
import ServicesPage from "../page.client";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import { getLandingMeta } from "../../landings";
import { permanentRedirect } from "next/navigation";
import esMessages from "../../../../../messages/es.json";
import enMessages from "../../../../../messages/en.json";

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

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/static/")) {
    return trimmed;
  }

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL).replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

  const landingMeta = getLandingMeta(slug);
  if (landingMeta) {
    const messages = isEs ? esMessages : enMessages;
    const landingDict = (messages as { landings?: Record<string, unknown> }).landings;
    const landing = landingDict?.[slug] as Record<string, unknown> | undefined;
    const title = (landing?.title as string) ?? "Ordinaly Services";
    const description =
      (landing?.description as string) ??
      (isEs
        ? defaultDescription
        : "AI automation services and products for companies looking to scale with intelligent workflows.");
    const image = landingMeta.heroImage || "/static/backgrounds/services_background.webp";

    return createPageMetadata({
      locale,
      path: `/${slug}`,
      title,
      description,
      image,
      index: false, // this route will permanently redirect; keep it non-indexable
    });
  }

  let service: Service | null = null;
  try {
    const res = await fetch(getApiEndpoint(`/api/services/${slug}/`), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      service = await res.json();
    }
  } catch {
    // ignore and fall back to defaults
  }

  const fallbackTitle = isEs
    ? "Servicios y productos de automatización con IA"
    : "AI automation services and products";
  const fallbackDescription = isEs
    ? defaultDescription
    : "AI automation services and products for companies looking to scale with intelligent workflows.";
  const title = service?.title ? `${service.title}` : fallbackTitle;
  const description = service?.subtitle || service?.description || fallbackDescription;
  const image = resolveServiceOgImage(service?.image);

  return createPageMetadata({
    locale,
    path: `/services/${slug}`,
    title,
    description,
    image,
  });
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const landingMeta = getLandingMeta(slug);
  if (landingMeta) {
    return permanentRedirect(`/${locale}/${slug}`);
  }
  return <ServicesPage initialServiceSlug={slug} />;
}
