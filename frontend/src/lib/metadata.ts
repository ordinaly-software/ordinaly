import type { Metadata } from "next";

const SITE_NAME = "Ordinaly";
const FALLBACK_BASE_URL = "https://ordinaly.ai";
const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL).replace(/\/$/, "");

const brandContextByLocale: Record<string, string> = {
  es: "Automatización empresarial con IA en Sevilla",
  en: "AI business automation in Seville",
  ca: "Automatització empresarial amb IA a Sevilla",
  eu: "IA bidezko negozio-automatizazioa Sevillan",
  gl: "Automatización empresarial con IA en Sevilla",
};

export const getBrandContext = (locale?: string) => {
  if (!locale) return brandContextByLocale.es;
  return brandContextByLocale[locale] ?? brandContextByLocale.es;
};

export const getFullBrandName = (locale?: string) => `${SITE_NAME} — ${getBrandContext(locale)}`;

export const buildSocialTitle = (pageTitle: string, locale?: string) => {
  const fullBrand = getFullBrandName(locale);
  const normalizedTitle = pageTitle?.trim();
  if (!normalizedTitle) return fullBrand;
  return `${normalizedTitle} | ${fullBrand}`;
};

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
  const prefix = locale ? `/${locale}` : "";
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
  const socialTitle = buildSocialTitle(title, locale);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: type as OpenGraphType,
      locale: ogLocale,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}

export { baseUrl as metadataBaseUrl, SITE_NAME as siteName, defaultDescription };
