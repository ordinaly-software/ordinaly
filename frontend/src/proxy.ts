import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;
const PATH_PREFIX_EXCEPTIONS = ["/api", "/_next", "/studio", "/trpc"];

const getCountry = (request: NextRequest) => {
  const headers = request.headers;
  const directCountry =
    headers.get("x-vercel-ip-country") ||
    headers.get("x-nf-geo-country") ||
    headers.get("x-country");

  if (directCountry) return directCountry.toUpperCase();

  const nfGeo = headers.get("x-nf-geo");
  if (nfGeo) {
    try {
      const parsed = JSON.parse(nfGeo);
      if (parsed?.country) return String(parsed.country).toUpperCase();
    } catch {
      // ignore parsing errors
    }
  }

  return "";
};

const detectLocale = (request: NextRequest): string => {
  const country = getCountry(request);
  if (country === "ES") return "es";

  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLanguage.includes("es")) return "es";
  if (acceptLanguage.includes("en")) return "en";

  return routing.defaultLocale;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API/studio routes
  if (
    PATH_PREFIX_EXCEPTIONS.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const matchedLocale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // Respect the locale already present in the URL (no auto-redirect)
  if (matchedLocale) {
    return NextResponse.next();
  }

  // Only redirect when there is no locale prefix
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*|api|studio|trpc).*)"],
};
