import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { Locale, routing } from "@/i18n/routing";
import NavbarWrapper from "@/components/ui/navbar-wrapper";
import CookieConsent from "@/components/ui/cookies";
import BackToTopButton from "@/components/ui/back-to-top-button";
import { absoluteUrl, getFullBrandName, localeHrefLangs, metadataBaseUrl, siteName } from "@/lib/metadata";
import { ThemeProvider } from "@/contexts/theme-context";
import { NextIntlClientProvider } from "next-intl";
import AnalyticsManager from "@/utils/analyticsManager";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: false,
});

const baseDescription =
  "Transformamos empresas con soluciones de automatización inteligente en Sevilla, España y Europa.";

const ogDescription =
  "Transformamos empresas con soluciones de automatización inteligente para liderar la innovación en Andalucía, España y Europa.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const fullBrandName = getFullBrandName(locale);
  const canonical = absoluteUrl("/", locale);
  const alternateLanguages = Object.fromEntries(
    routing.locales.map((loc) => [localeHrefLangs[loc], absoluteUrl("/", loc)])
  );
  const ogLocale = localeHrefLangs[locale] ?? localeHrefLangs.es;

  return {
    title: {
      default: fullBrandName,
      template: `%s | ${fullBrandName}`,
    },
    description: baseDescription,
    metadataBase: new URL(metadataBaseUrl),
    alternates: {
      canonical,
      languages: alternateLanguages,
    },
    openGraph: {
      type: "website",
      siteName,
      title: fullBrandName,
      description: ogDescription,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: fullBrandName }],
      url: canonical,
      locale: ogLocale,
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) notFound();

  // GA4 measurement ID (e.g. G-XXXXXXXXXX)
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Theme init (tu script) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function canPersistTheme() {
                  try {
                    const rawPreferences = localStorage.getItem('cookie-preferences');
                    if (!rawPreferences) return false;
                    const parsed = JSON.parse(rawPreferences);
                    return Boolean(parsed.functional);
                  } catch { return false; }
                }

                function getInitialTheme() {
                  const allowPersistence = canPersistTheme();
                  if (allowPersistence) {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
                  } else {
                    localStorage.removeItem('theme');
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                const theme = getInitialTheme();
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
      </head>

      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg dark:focus:bg-neutral-900 dark:focus:text-white"
        >
          Skip to content
        </a>
        {process.env.NODE_ENV === "production" && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                // Consent por defecto (RGPD)
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  analytics_storage: 'denied',
                  functionality_storage: 'denied',
                  security_storage: 'granted',
                  wait_for_update: 500
                });

                gtag('js', new Date());

                // Inicializa el Google tag base (GA4)
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}

        <AnalyticsManager />

        <NextIntlClientProvider>
          <ThemeProvider>
            {/* tu body tal cual */}
            <NavbarWrapper />
            <main id="main-content">{children}</main>
            <CookieConsent />
            <BackToTopButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
