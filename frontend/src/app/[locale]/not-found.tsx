import Link from "next/link";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

type NotFoundStrings = {
  title: string;
  description: string;
  backHome: string;
};

async function loadNotFoundMessages(locale: Locale): Promise<NotFoundStrings> {
  switch (locale) {
    case "es": {
      const module = await import("../../../messages/es.json");
      return module.default.notFound;
    }
    default: {
      const module = await import("../../../messages/en.json");
      return module.default.notFound;
    }
  }
}

export default async function NotFoundPage({
  params,
}: {
  params: { locale?: string };
}) {
  const requestedLocale = params.locale ?? "";
  const isValidLocale = routing.locales.includes(requestedLocale as Locale);
  const locale = (isValidLocale
    ? (requestedLocale as Locale)
    : (routing.defaultLocale as Locale));
  const t = await loadNotFoundMessages(locale);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#11101a]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <p className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-6xl">404</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {t.description}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}
