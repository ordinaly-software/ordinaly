import type { Metadata } from "next";
import FormationRoot from "@/components/formation/formation-root";
import { createPageMetadata, defaultDescription } from "@/lib/metadata";
import { getApiEndpoint } from "@/lib/api-config";
import { absoluteUrl } from "@/lib/metadata";

type Course = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;

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

  const title = course?.title ? `${course.title} | Ordinaly` : `Formación: ${slug}`;
  const description = course?.subtitle || course?.description || defaultDescription;
  const rawImage = course?.image;
  const image =
    rawImage && rawImage.startsWith("http")
      ? rawImage
      : rawImage
        ? absoluteUrl(rawImage)
        : "/static/backgrounds/formation_background.webp";

  return createPageMetadata({
    locale,
    path: `/formation/${slug}`,
    title,
    description,
    image,
    type: "article",
  });
}

export default async function FormationSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  // Server component that renders the client FormationRoot with initialCourseSlug
  return <FormationRoot initialCourseSlug={slug} />;
}
