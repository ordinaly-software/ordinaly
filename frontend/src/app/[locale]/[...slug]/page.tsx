import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEs = locale?.startsWith("es");

  return createPageMetadata({
    locale,
    path: `/${slug.join("/")}`,
    title: isEs ? "Página no encontrada" : "Page not found",
    description: defaultDescription,
    image: "/og-image.png",
    index: false,
  });
}

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  await params;
  notFound();
}
