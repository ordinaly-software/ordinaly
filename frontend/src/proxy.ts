import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  localePrefix: "as-needed",
  localeDetection: true,
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

const blogMiddleware = createMiddleware({
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

const LOCALIZED_BLOG_PATH_PATTERN = /^\/(?:en|es)\/blog(?:\/|$)/;
const CANONICAL_BLOG_PATH_PATTERN = /^\/blog(?:\/|$)/;

const stripLocaleFromBlogPath = (pathname: string) =>
  pathname.replace(/^\/(?:en|es)(?=\/blog(?:\/|$))/, "") || "/";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (LOCALIZED_BLOG_PATH_PATTERN.test(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = stripLocaleFromBlogPath(pathname);
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (CANONICAL_BLOG_PATH_PATTERN.test(pathname)) {
    return blogMiddleware(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|studio|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
