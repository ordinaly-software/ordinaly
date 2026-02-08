import type { Metadata } from "next";
import ServicesPage from "../page.client";
import { absoluteAssetUrl, createPageMetadata, defaultDescription } from "@/lib/metadata";
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
    const landingDict = (messages as { landings?: Record<string, any> }).landings;
    const landing = landingDict?.[slug] as Record<string, any> | undefined;
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
  const rawImage = service?.image || undefined;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const image = rawImage
    ? /^https?:\/\//i.test(rawImage)
      ? rawImage
      : apiBaseUrl
        ? `${apiBaseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
        : absoluteAssetUrl(rawImage)
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
  const { slug, locale } = await params;
  const landingMeta = getLandingMeta(slug);
  if (landingMeta) {
    return permanentRedirect(`/${locale}/${slug}`);
  }
  return <ServicesPage initialServiceSlug={slug} />;
}
