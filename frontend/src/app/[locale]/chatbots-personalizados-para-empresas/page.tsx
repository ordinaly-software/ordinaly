import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import ChatbotsPersonalizadosEmpresas from "./page.client";

const slug = "chatbots-personalizados-para-empresas" as const;
const HERO_IMAGE = "/static/chatbots-personalizados-para-empresas/hero-blurred.webp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    locale,
    path: `/${slug}`,
    title: "Chatbots Personalizados para Empresas",
    description:
      "Chatbots personalizados para empresas que buscan automatizar su atención. Mejora la experiencia de tus clientes y ahorra tiempo con agentes de IA a medida",
    image: HERO_IMAGE,
  });
}

export default async function ChatbotsPersonalizadosParaEmpresas() {
  return <ChatbotsPersonalizadosEmpresas />;
}
