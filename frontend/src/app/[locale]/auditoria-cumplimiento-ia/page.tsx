import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import AuditoriaCumplimientoIa from "./page.client";

const slug = "auditoria-cumplimiento-ia" as const;
// TODO: swap for /static/backgrounds/auditoria_ia_background.webp (1200x630) once the asset exists.
const OG_IMAGE = "/static/backgrounds/services_background.webp";

type LandingMetadataContent = {
  metaTitle: string;
  description: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const landing = (messages as { landings?: Record<string, LandingMetadataContent> }).landings?.[slug];

  if (!landing) {
    throw new Error(`Missing landing content: ${slug}`);
  }

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: landing.metaTitle,
    description: landing.description,
    image: OG_IMAGE,
  });
}

export default async function AuditoriaCumplimientoIaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: isEs ? "Inicio" : "Home", path: "/" },
          { name: isEs ? "Servicios" : "Services", path: "/servicios" },
          { name: isEs ? "Auditoría de cumplimiento IA" : "AI compliance audit" },
        ]}
      />
      <AuditoriaCumplimientoIa />
    </>
  );
}
