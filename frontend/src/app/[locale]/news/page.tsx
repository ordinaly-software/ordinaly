import type { Metadata } from "next";
import type { QueryParams } from "@sanity/client";
import { client } from "@/lib/sanity";
import { highlightedNewsPosts, paginatedNewsPosts } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import BreadcrumbSchema from "@/components/seo/breadcrumb-schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasParams = !!resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;

  const base = createPageMetadata({
      locale,
      path: "/news",
      title: isEs ? "Noticias de IA y automatización empresarial" : "AI and business automation news",
      description: isEs
        ? "Actualidad sobre inteligencia artificial, automatización y productividad para empresas, con la lectura del equipo de Ordinaly Software."
        : "News on artificial intelligence, automation and productivity for businesses, with analysis from the Ordinaly Software team.",
      image: "/static/backgrounds/blog_background.webp",
    });

  return hasParams ? { ...base, robots: { index: false, follow: true } } : base;
}

export const revalidate = 300;

export default async function NewsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale?.startsWith("es");
  const pageSize = 12;
  const queryParams = {
    offset: 0,
    end: pageSize,
    q: "",
    tag: null,
    cat: null,
  } as unknown as QueryParams;

  const [{ items, total }, highlighted] = await Promise.all([
    client.fetch(paginatedNewsPosts, queryParams, { next: { tags: ["news"] } }),
    client.fetch(highlightedNewsPosts, {}, { next: { tags: ["news"] } }),
  ]);

  const { default: BlogClient } = await import("@/components/blog/blog-client");
  return (
    <>
    <BreadcrumbSchema
      locale={locale}
      items={[{ name: isEs ? "Inicio" : "Home", path: "/" }, { name: isEs ? "Noticias" : "News" }]}
    />
    <BlogClient
      posts={items}
      total={total}
      pageSize={pageSize}
      highlightedPosts={highlighted}
      basePath="/news"
      translationsNamespace="news"
    />
    </>
  );
}
