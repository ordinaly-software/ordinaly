import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import GraciasPage from "./page.client";

// Thank-you page shared by the campaign landings. `?origen=` tells which campaign converted
// (visible in GA4 page_location and usable as a Google Ads "URL contains" conversion).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") notFound();
  return createPageMetadata({
    locale,
    path: "/gracias",
    title: "Gracias por contactar",
    index: false,
    alternateLocales: ["es"],
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (locale === "en") notFound();
  const { origen } = await searchParams;
  return <GraciasPage origen={typeof origen === "string" ? origen : undefined} />;
}
