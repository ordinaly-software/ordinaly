import { routing } from "@/i18n/routing";
import { NotFoundContent } from "../not-found-content";

type Locale = (typeof routing.locales)[number];

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: requestedLocale = "" } = await params;
  const isValidLocale = routing.locales.includes(requestedLocale as Locale);
  const locale = isValidLocale
    ? (requestedLocale as Locale)
    : (routing.defaultLocale as Locale);

  return <NotFoundContent locale={locale} />;
}
