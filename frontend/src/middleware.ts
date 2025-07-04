import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  // Ensure the localePrefix is set to 'always' to enforce locale prefixes in URLs
  localePrefix: 'always',
  // Use the routing configuration from your i18n setup
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

export const config = {
  // Match all pathnames except for:
  // - Paths starting with `/api`, `/trpc`, `/_next`, or `/_vercel`
  // - Paths containing a dot (e.g., `favicon.ico`)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};