import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  localePrefix: "always",
  localeDetection: true,
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

export const config = {
  matcher: ["/((?!api|studio|trpc|_next|_vercel|.*\\..*).*)"],
};
