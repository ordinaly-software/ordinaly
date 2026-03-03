import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { permanentRedirect } from "next/navigation";

// This route permanently redirects /services/[slug] → /[slug].
// Service detail pages now live at /[slug] directly.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Redirecting…",
    index: false,
  });
}

export default async function ServiceSlugRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/${slug}`);
}
