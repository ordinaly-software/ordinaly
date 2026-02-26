import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/ui/local-landing";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getLandingMeta } from "../landings";
import { notFound } from "next/navigation";
import esMessages from "../../../../messages/es.json";
import enMessages from "../../../../messages/en.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

  const landingMeta = getLandingMeta(slug);
  if (!landingMeta) {
    return createPageMetadata({
      locale,
      path: `/${slug}`,
      title: isEs ? "Servicios de automatización" : "Automation services",
      description: defaultDescription,
      image: "/static/backgrounds/services_background.webp",
      index: false,
    });
  }

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
  });
}

export default async function LandingSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const landingMeta = getLandingMeta(slug);

  if (!landingMeta) {
    notFound();
  }

  return <LocalLandingPage slug={slug} locale={locale} meta={landingMeta} />;
}
