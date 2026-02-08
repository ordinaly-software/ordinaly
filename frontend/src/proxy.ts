import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;
const PATH_PREFIX_EXCEPTIONS = ["/api", "/_next", "/studio", "/trpc"];

// Canonical locale for unprefixed URLs: always Spanish (es) to avoid geo-dependent indexing.
const detectLocale = (): string => routing.defaultLocale;

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
  const locale = detectLocale();
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  // Permanent redirect for SEO canonicalization.
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*|api|studio|trpc).*)"],
};
