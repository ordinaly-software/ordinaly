// utils/cookieManager.ts
export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_ID_REGEX = /^(UA-\d{4,9}-\d{1,4}|G-[A-Z0-9]{10})$/;

export const getCookiePreferences = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  
  const preferences = localStorage.getItem('cookie-preferences');
  if (!preferences) return null;
  
  try {
    return JSON.parse(preferences);
  } catch {
    return null;
  }
};

export const hasUserConsented = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookie-consent') !== null;
};

export const isFunctionalAllowed = (): boolean => {
  const preferences = getCookiePreferences();
  return Boolean(preferences?.functional);
};

export const isAnalyticsAllowed = (): boolean => {
  const preferences = getCookiePreferences();
  return Boolean(preferences?.analytics);
};

export const clearFunctionalStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('theme');
  localStorage.removeItem('preferred-locale');
};

const updateGaConsentFlag = (analyticsAllowed: boolean) => {
  if (typeof window === 'undefined' || !GA_ID || !GA_ID_REGEX.test(GA_ID)) return;
  
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = !analyticsAllowed;
  
  if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
      analytics_storage: analyticsAllowed ? 'granted' : 'denied',
    });
  }
};

export const initializeAnalytics = (preferencesOverride?: Partial<CookiePreferences>) => {
  const preferences = preferencesOverride ?? getCookiePreferences();
  
  if (preferences?.analytics && process.env.NODE_ENV === "production") {
    if (!GA_ID || !GA_ID_REGEX.test(GA_ID)) {
      console.warn("Google Analytics ID is missing or invalid. Analytics will not be initialized.");
      return;
    }

    updateGaConsentFlag(true);
    
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"]`);
    if (existingScript) return;
    
    // Initialize Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(configScript);
  } else {
    updateGaConsentFlag(false);
  }
};

export const initializeMarketing = () => {
  const preferences = getCookiePreferences();
  
  if (preferences?.marketing && process.env.NODE_ENV === "production") {
    // Initialize Facebook Pixel
    if (process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }
};
