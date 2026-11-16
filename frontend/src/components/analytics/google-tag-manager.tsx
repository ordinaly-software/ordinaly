"use client";

import Script from "next/script";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

const GTM_ID = "GTM-WGZK6DWL";

/**
 * Google Tag Manager for the ad campaign pages. Like GA, it only loads after the visitor accepts
 * analytics or marketing cookies, and passes those choices to Google tags through Consent Mode.
 */
export default function GoogleTagManager() {
  const preferences = useCookiePreferences();
  const analytics = preferences?.analytics ? "granted" : "denied";
  const ads = preferences?.marketing ? "granted" : "denied";

  if (!preferences?.analytics && !preferences?.marketing) return null;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: '${analytics}',
            ad_storage: '${ads}',
            ad_user_data: '${ads}',
            ad_personalization: '${ads}',
          });
          dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} strategy="afterInteractive" />
    </>
  );
}
