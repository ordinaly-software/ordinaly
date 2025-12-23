export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  thirdParty: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'cookie-preferences';

/* =========================
   Read / Write
========================= */

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

export function setCookiePreferences(prefs: CookiePreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: prefs }));
}

/* =========================
   Guards
========================= */

export function isAnalyticsAllowed(): boolean {
  return Boolean(getCookiePreferences()?.analytics);
}

export function isMarketingAllowed(): boolean {
  return Boolean(getCookiePreferences()?.marketing);
}

export function isFunctionalAllowed(): boolean {
  return Boolean(getCookiePreferences()?.functional);
}

export function isThirdPartyAllowed(): boolean {
  return Boolean(getCookiePreferences()?.thirdParty);
}

/* =========================
   Cleanup helpers
========================= */

export function clearFunctionalStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('theme');
    localStorage.removeItem('preferred-locale');
  } catch {
    // ignore storage errors (e.g., unavailable)
  }
}

/* =========================
   Side effects (light)
========================= */

export function applyConsentMode() {
  if (typeof window === 'undefined') return;

  const prefs = getCookiePreferences();
  if (!prefs) return;

  type Gtag = (...args: unknown[]) => void;
  const w = window as unknown as { gtag?: Gtag };
  const gtag = w.gtag;
  if (typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  } as Record<string, unknown>);
}

export function openCookieSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('openCookieSettings'));
}
