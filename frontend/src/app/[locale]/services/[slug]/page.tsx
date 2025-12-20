import type { Metadata } from "next";
import ServicesPage from "../page.client";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import { absoluteUrl } from "@/lib/metadata";

type Service = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

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
  const title = service?.title ? `${service.title} | Ordinaly` : fallbackTitle;
  const description = service?.subtitle || service?.description || fallbackDescription;
  const rawImage = service?.image || undefined;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const image = rawImage
    ? /^https?:\/\//i.test(rawImage)
      ? rawImage
      : apiBaseUrl
        ? `${apiBaseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
        : absoluteUrl(rawImage)
    : "/static/backgrounds/services_background.webp";

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
  const { slug } = await params;
  return <ServicesPage initialServiceSlug={slug} />;
}
