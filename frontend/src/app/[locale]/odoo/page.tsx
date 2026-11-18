import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import OdooCampaign from "./page.client";

// Ad campaign landing: Spanish only and kept out of search results.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") notFound();
  return createPageMetadata({
    locale,
    path: "/odoo",
    title: "Implantación de Odoo 20 para empresas y pymes",
    description:
      "Implantamos Odoo 20 Community en tu servidor: pago único, sin licencias por usuario y con VeriFactu opcional. Lista en 10 días.",
    image: "/og/implantacion-odoo.webp",
    index: false,
    alternateLocales: ["es"],
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale === "en") notFound();
  return <OdooCampaign />;
}
