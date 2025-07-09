import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {Locale, routing} from '@/i18n/routing';

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
    url: "https://ordinaly.com",
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
        color: "#32E875",
      },
    ],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://ordinaly.com"),
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
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#32E875" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1924" },
  ],
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
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#32E875" />
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
              url: "https://ordinaly.com",
              logo: "https://ordinaly.com/logo.webp",
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
              // sameAs: ["https://linkedin.com/company/ordinaly-ai", "https://twitter.com/ordinaly_ai"],
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
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#32E875] text-black px-4 py-2 rounded-md z-50"
          >
            Saltar al contenido principal
          </a>
          
          {/* Main content wrapper */}
          <div id="main-content">{children}</div>
          
          {/* Analytics scripts */}
          {/* {process.env.NODE_ENV === "production" && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                  `,
                }}
              />
            </>
          )} */}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
