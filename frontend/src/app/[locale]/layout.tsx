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
import { ThemeProvider } from "@/contexts/theme-context";
import { NextIntlClientProvider } from "next-intl";
import AnalyticsManager from "@/utils/analyticsManager";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ordinaly - Automatización Empresarial con IA",
    template: "%s | Ordinaly",
  },
  description:
    "Transformamos empresas con soluciones de automatización inteligente. Chatbots, workflows y integración con Odoo, n8n y WhatsApp Business para liderar la innovación en España y Europa.",
  metadataBase: new URL("https://ordinaly.ai"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ordinaly.ai",
    siteName: "Ordinaly",
    title: "Ordinaly Software - Automatización Empresarial con IA",
    description:
      "Transformamos empresas con soluciones de automatización inteligente para liderar la innovación en Andalucía, España y Europa.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Ordinaly" }],
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "en-US": "/en",
      "ca-ES": "/ca",
      "eu-ES": "/eu",
      "gl-ES": "/gl",
    },
  },
};

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

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect útiles */}
        <link rel="dns-prefetch" href="//wa.me" />
        <link rel="preconnect" href="https://ordinaly.duckdns.org" crossOrigin="anonymous" />

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

        {/* Preload: mejor solo en home real, pero lo mantengo como lo tienes */}
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/static/main_home_ilustration.webp" as="image" type="image/webp" />
      </head>

      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        {/* ===== Google Tag (siempre en prod), Consent por defecto DENIED ===== */}
        {process.env.NODE_ENV === "production" && GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                // Consent default (RGPD): todo denegado salvo security
                gtag('consent', 'default', {
                  analytics_storage: 'denied',
                  ad_storage: 'denied',
                  functionality_storage: 'denied',
                  security_storage: 'granted',
                  wait_for_update: 500
                });

                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}

        {/* Cliente: actualiza consentimiento + pageviews SPA */}
        <AnalyticsManager />

        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#217093] text-white px-4 py-2 rounded-md z-50"
            >
              Saltar / Skip
            </a>

            <NavbarWrapper />
            <div id="main-content">{children}</div>
            <CookieConsent />
            <BackToTopButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}