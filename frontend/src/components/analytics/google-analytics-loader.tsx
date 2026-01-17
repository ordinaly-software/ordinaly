"use client";

import Script from "next/script";
import { useMemo } from "react";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
const GA_IDS = [GA_MEASUREMENT_ID, GA_TAG_ID].filter(Boolean) as string[];
const PRIMARY_ID = GA_IDS[0];

export default function GoogleAnalyticsLoader() {
  const preferences = useCookiePreferences();
  const analyticsAllowed = useMemo(() => Boolean(preferences?.analytics), [preferences?.analytics]);

  if (!analyticsAllowed || !PRIMARY_ID) {
    return null;
  }

  const configCalls = GA_IDS.map((id) => `gtag('config', '${id}');`).join("\n          ");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${PRIMARY_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configCalls}
        `}
      </Script>
    </>
  );
}
