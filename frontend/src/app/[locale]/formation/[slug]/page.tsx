import type { Metadata } from "next";
import FormationPageClient from "../page.client";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";

type Course = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string | null;
};

const FALLBACK_API_BASE_URL = "https://api.ordinaly.ai";
const FALLBACK_OG_IMAGE = "/og-image.png";

const resolveCourseOgImage = (rawImage?: string | null) => {
  if (!rawImage) return FALLBACK_OG_IMAGE;
  const trimmed = rawImage.trim();
  if (!trimmed) return FALLBACK_OG_IMAGE;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\/api\.ordinaly\.ai/i, "https://api.ordinaly.ai");
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/static/")) {
    return trimmed;
  }

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_BASE_URL).replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const isEs = locale?.startsWith("es");
  const looksBroken = !slug || slug.length < 4 || slug.endsWith("-");

  let course: Course | null = null;
  try {
    const res = await fetch(getApiEndpoint(`/api/courses/courses/${slug}/`), {
      // Courses change rarely, so a short revalidate window is enough
      next: { revalidate: 300 },
    });
    if (res.ok) {
      course = await res.json();
    }
  } catch {
    // ignore and fall back to defaults
  }

  const fallbackTitle = isEs ? `Formación: ${slug}` : `Training: ${slug}`;
  const fallbackDescription = isEs
    ? defaultDescription
    : "Professional training in AI, automation, and low-code tools to help teams scale faster.";
  const title = course?.title ? `${course.title}` : fallbackTitle;
  const description = course?.subtitle || course?.description || fallbackDescription;
  const image = resolveCourseOgImage(course?.image);

  return createPageMetadata({
    locale,
    path: `/formation/${slug}`,
    title,
    description,
    image,
    type: "article",
    index: !looksBroken,
  });
}

export default async function FormationSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  // Server component that renders the client FormationRoot with initialCourseSlug
  return <FormationPageClient initialCourseSlug={slug} />;
}
