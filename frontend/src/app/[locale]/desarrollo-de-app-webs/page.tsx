import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import DesarrolloDeAppWebs from "./page.client"

const slug = "desarrollo-de-app-webs" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Desarrollo de aplicaciones web multiplataforma (PWA)",
    description:
      "Diseñamos y desarrollamos PWA dinámicas, rápidas y escalables: aplicaciones web modernas optimizadas para rendimiento, SEO y experiencia de usuario, instalables sin depender de tiendas de apps.",
    image: "/static/desarrollo-de-app-webs/desarrollo_de_app_webs.webp",
  });
}

export default async function DesarrolloDeAplicacionesWeb() {
  return <DesarrolloDeAppWebs />;
}
