import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";
import DesarrolloDeAppWebs from "./page.client"

const slug = "desarrollo-de-app-webs" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: isEs
      ? "Desarrollo de aplicaciones web y PWA a medida"
      : "Custom web app and PWA development",
    description: isEs
      ? "Diseñamos y desarrollamos aplicaciones web y PWA rápidas y escalables, optimizadas para rendimiento, SEO y experiencia de usuario, sin depender de tiendas de apps."
      : "We design and build fast, scalable web apps and PWAs, optimized for performance, SEO and UX, and installable without app stores.",
    image: "/static/desarrollo-de-app-webs/desarrollo_de_app_webs.webp",
  });
}

export default async function DesarrolloDeAplicacionesWeb({
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
          { name: isEs ? "Desarrollo de apps web" : "Web App Development" },
        ]}
      />
      <DesarrolloDeAppWebs />
    </>
  );
}
