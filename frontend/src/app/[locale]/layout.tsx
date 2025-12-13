import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import {notFound} from 'next/navigation';
import {Locale, routing} from '@/i18n/routing';
import NavbarWrapper from '@/components/ui/navbar-wrapper';
import CookieConsent from '@/components/ui/cookies';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { ThemeProvider } from '@/contexts/theme-context';
import { NextIntlClientProvider } from 'next-intl';
import AnalyticsBootstrap from '@/components/analytics/AnalyticsBootstrap';
import GoogleAnalyticsPageViews from '@/components/analytics/GoogleAnalyticsPageViews';


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Ordinaly - Automatización Empresarial con IA",
    template: "%s | Ordinaly",
  },
  description:
    "Transformamos empresas con soluciones de automatización inteligente. Chatbots, workflows y integración con Odoo, n8n y WhatsApp Business para liderar la innovación en España y Europa.",
  keywords: [
    "automatización empresarial",
    "inteligencia artificial",
    "chatbots",
    "workflows",
    "Odoo",
    "Slack",
    "WhatsApp Business",
    "Andalucía",
    "España",
    "transformación digital",
    "IA empresarial",
  ],
  authors: [{ name: "Ordinaly" }],
  creator: "Ordinaly",
  publisher: "Ordinaly",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ordinaly.ai",
    siteName: "Ordinaly",
    title: "Ordinaly Software - Automatización Empresarial con IA",
    description:
      "Transformamos empresas con soluciones de automatización inteligente para liderar la innovación en Andalucía, España y Europa.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ordinaly Software - Automatización Empresarial con IA",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#22A60D",
      },
    ],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://ordinaly.ai"),
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "technology",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22A60D" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1924" },
  ],
  viewportFit: "cover",
}

export default async function RootLayout({ children, params } : 
  { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Open Graph & Twitter Card for link previews */}
        <meta property="og:title" content="Ordinaly - Automatiza tu negocio con IA" />
        <meta property="og:description" content="Transformamos empresas con soluciones de automatización inteligente. Chatbots, workflows y más para liderar la innovación en España y Europa." />
        <meta property="og:image" content="https://ordinaly.ai/og-image.jpg" />
        <meta property="og:url" content="https://ordinaly.ai/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ordinaly - Automatiza tu negocio con IA" />
        <meta name="twitter:description" content="Transformamos empresas con soluciones de automatización inteligente. Chatbots, workflows y más para liderar la innovación en España y Europa." />
        <meta name="twitter:image" content="https://ordinaly.ai/og-image.jpg" />
        {/* DNS prefetch and preconnect for critical domains */}
        <link rel="dns-prefetch" href="//wa.me" />
        <link rel="preconnect" href="https://ordinaly.duckdns.org" crossOrigin="anonymous" />
        
        {/* Theme initialization script to prevent flash */}
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
                  } catch {
                    return false;
                  }
                }

                function getInitialTheme() {
                  const allowPersistence = canPersistTheme();
                  if (allowPersistence) {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || savedTheme === 'light') {
                      return savedTheme;
                    }
                  } else {
                    localStorage.removeItem('theme');
                  }
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  return prefersDark ? 'dark' : 'light';
                }
                
                const theme = getInitialTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        
        
        {/* Preload only the logo and hero image for home */}
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/static/main_home_ilustration.webp" as="image" type="image/webp" />
              
        {/* PWA meta tags */}
        <meta name="application-name" content="Ordinaly" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ordinaly" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#22A60D" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ordinaly Software",
              description:
                "Empresa de automatización empresarial con inteligencia artificial especializada en transformación digital de empresas andaluzas",
              url: "https://ordinaly.ai",
              logo: "https://ordinaly.ai/logo.webp",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+34-XXX-XXX-XXX",
                contactType: "customer service",
                availableLanguage: ["Spanish", "English", "Catalan", "Basque", "Galician"],
              },
              address: {
                "@type": "PostalAddress",
                addressRegion: "Andalucía",
                addressCountry: "ES",
              },
              serviceArea: {
                "@type": "Place",
                name: "España",
              },
              areaServed: "ES",
              knowsAbout: [
                "Automatización empresarial",
                "Inteligencia artificial",
                "Chatbots",
                "Workflows",
                "Integración Odoo",
                "WhatsApp Business",
              ],
            }),
          }}
        />
        
        {/* Accessibility Integration - defer to after window load */}
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_WCAG_ACCESSIBILITY_TOKEN && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function() {
                  (function (d, s, t) { 
                    var f = d.getElementsByTagName(s)[0], 
                        j = d.createElement(s), 
                        a = new Date().getTime(); 
                    j.async = true; 
                    j.src = 'https://wcag.dock.codes/accessibility/' + t + '/start.js?t=' + a; 
                    f.parentNode.insertBefore(j, f); 
                  })(document, 'script', '${process.env.NEXT_PUBLIC_WCAG_ACCESSIBILITY_TOKEN}');
                });
              `,
            }}
          />
        )}
        
        {/* Optimized Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { 
                    scope: '/',
                    updateViaCache: 'none'
                  }).then(
                    function(registration) {
                      // Check for updates periodically
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New version available, could show update prompt
                            }
                          });
                        }
                      });
                    },
                    function(error) {
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >

        {process.env.NODE_ENV === 'production' && (
          <>
            <AnalyticsBootstrap />
            <GoogleAnalyticsPageViews />
          </>
        )}

        <NextIntlClientProvider>
          <ThemeProvider>
            {/* Skip to main content for accessibility */}
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
  )
}
