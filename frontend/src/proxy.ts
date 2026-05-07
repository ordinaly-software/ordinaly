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

const LOCALIZED_BLOG_PATH_PATTERN = /^\/es\/blog(?:\/|$)/;
const CANONICAL_BLOG_POST_PATTERN = /^\/blog\/(.+)$/;
const CANONICAL_BLOG_PATH_PATTERN = /^\/blog(?:\/|$)/;
const EN_BLOG_POST_PATTERN = /^\/en\/blog\/(.+)$/;
const FORMATION_PATH_PATTERN = /^(?:\/en|\/es)?\/formation(?:\/|$)/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /es/blog/[slug] → /[slug], /es/blog → /blog
  if (LOCALIZED_BLOG_PATH_PATTERN.test(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    const esSlugMatch = pathname.match(/^\/es\/blog\/(.+)$/);
    redirectUrl.pathname = esSlugMatch ? `/${esSlugMatch[1]}` : pathname.replace(/^\/es(?=\/blog)/, "");
    return NextResponse.redirect(redirectUrl, 308);
  }

  // /blog/[slug] → /[slug] (dedup: both /blog/x and /x were indexed)
  const blogPostMatch = pathname.match(CANONICAL_BLOG_POST_PATTERN);
  if (blogPostMatch) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${blogPostMatch[1]}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // /blog or /blog/ → blog index via blogMiddleware
  if (CANONICAL_BLOG_PATH_PATTERN.test(pathname)) {
    return blogMiddleware(request);
  }

  // /en/blog/[slug] → /[slug] (blog is Spanish-only)
  const enBlogPostMatch = pathname.match(EN_BLOG_POST_PATTERN);
  if (enBlogPostMatch) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${enBlogPostMatch[1]}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // /formation/ and /es/formation/ → /formacion/ (canonical Spanish path)
  if (FORMATION_PATH_PATTERN.test(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^(?:\/en|\/es)?\/formation/, (match) =>
      match.startsWith("/en") ? "/en/formacion" : "/formacion"
    );
    return NextResponse.redirect(redirectUrl, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|studio|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
