import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const SITE_NAME = "Ordinaly";
const FALLBACK_BASE_URL = "https://ordinaly.ai";
const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "");

const ogLocales: Record<string, string> = {
  es: "es_ES",
  en: "en_US",
  ca: "ca_ES",
  eu: "eu_ES",
  gl: "gl_ES",
};

const defaultDescription =
  "Transformamos empresas con soluciones de automatización inteligente en Sevilla, España y Europa.";

type OpenGraphType =
  | "website"
  | "article"
  | "book"
  | "profile"
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "video.movie"
  | "video.episode"
  | "video.tv_show"
  | "video.other";
const defaultOpenGraphType: OpenGraphType = "website";

type MetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  locale?: string;
  image?: string;
  type?: OpenGraphType;
};

const normalizePath = (path?: string) => {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
};

export const absoluteUrl = (path?: string, locale?: string) => {
  const prefix = locale && locale !== routing.defaultLocale ? `/${locale}` : "";
  const pathname = normalizePath(path);
  return `${baseUrl}${prefix}${pathname}`;
};

export function createPageMetadata({
  title,
  description = defaultDescription,
  path,
  locale,
  image = "/og-image.jpg",
  type = defaultOpenGraphType,
}: MetadataOptions): Metadata {
  const url = absoluteUrl(path, locale);
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${normalizePath(image)}`;
  const ogLocale = locale ? ogLocales[locale] ?? locale : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: type as OpenGraphType,
      locale: ogLocale,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export { baseUrl as metadataBaseUrl, SITE_NAME as siteName, defaultDescription };
