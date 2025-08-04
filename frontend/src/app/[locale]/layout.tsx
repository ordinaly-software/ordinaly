import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {Locale, routing} from '@/i18n/routing';
import CookieConsent from '@/components/ui/cookies';
import BackToTopButton from '@/components/ui/back-to-top-button';
import PerformanceOptimizer from '@/components/optimizations/PerformanceOptimizer';
// import AnalyticsManager from '@/components/ui/analyticsManager';


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
  twitter: {
    card: "summary_large_image",
    title: "Ordinaly Software - Automatización Empresarial con IA",
    description: "Transformamos empresas con soluciones de automatización inteligente.",
    images: ["/og-image.jpg"],
    creator: "@ordinaly_ai",
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
        color: "#29BF12",
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
    { media: "(prefers-color-scheme: light)", color: "#29BF12" },
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
        {/* DNS prefetch for critical domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//wa.me" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical resource hints - optimized */}
        <link rel="preload" href="/static/girl_resting_transparent.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
        
        {/* Optimized font loading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
                link.media = 'print';
                link.onload = function() { this.media = 'all'; };
                document.head.appendChild(link);
              })();
            `,
          }}
        />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="Ordinaly" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ordinaly" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#29BF12" />
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
                availableLanguage: ["Spanish", "English"],
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
        
        {/* Accessibility Integration - moved to be conditional */}
        {process.env.NEXT_PUBLIC_WCAG_ACCESSIBILITY_TOKEN && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function (d, s, t) { 
                  var f = d.getElementsByTagName(s)[0], 
                      j = d.createElement(s), 
                      a = new Date().getTime(); 
                  j.async = true; 
                  j.src = 'https://wcag.dock.codes/accessibility/' + t + '/start.js?t=' + a; 
                  f.parentNode.insertBefore(j, f); 
                })(document, 'script', '${process.env.NEXT_PUBLIC_WCAG_ACCESSIBILITY_TOKEN}');
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
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                    function(registration) {
                      // Only log in development
                      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.log('Service Worker registration successful with scope: ', registration.scope);
                      }
                    },
                    function(error) {
                      // Only log in development
                      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.log('Service Worker registration failed: ', error);
                      }
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
        <NextIntlClientProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#29BF12] text-black px-4 py-2 rounded-md z-50"
          >
            Saltar / Skip
          </a>
          
          <div id="main-content">{children}</div>
          
          <CookieConsent />
          {/* <AnalyticsManager /> */}
          <BackToTopButton />
          <PerformanceOptimizer />

        </NextIntlClientProvider>
      </body>
    </html>
  )
}