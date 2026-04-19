import { redirect } from "next/navigation";

export default async function BlogPostRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const prefix = locale === "en" ? "/en" : "";
  redirect(`${prefix}/${slug}`);
}
