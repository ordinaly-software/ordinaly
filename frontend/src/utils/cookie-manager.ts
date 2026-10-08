export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  /** Embedded third-party content (YouTube, Google Maps). Falls back to `marketing` for consents saved before this existed. */
  thirdParty?: boolean;
  /** ISO date the choice was made; consent expires after CONSENT_MAX_AGE_MS. */
  savedAt?: string;
}

const STORAGE_KEY = 'cookie-preferences';
const CONSENT_KEY = 'cookie-consent';
// AEPD recommends renewing consent at most every 24 months.
const CONSENT_MAX_AGE_MS = 24 * 30 * 24 * 60 * 60 * 1000;

export const allowsThirdParty = (prefs: CookiePreferences | null | undefined) =>
  Boolean(prefs?.thirdParty ?? prefs?.marketing);

/* =========================
   Read / Write
========================= */

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const prefs = JSON.parse(raw) as CookiePreferences;
    if (prefs.savedAt && Date.now() - new Date(prefs.savedAt).getTime() > CONSENT_MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return prefs;
  } catch {
    return null;
  }
}

export function setCookiePreferences(prefs: CookiePreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  try {
    // Legacy event for backwards compatibility
    window.dispatchEvent(new Event('cookieConsentChange'));
  } catch {
    // ignore
  }
  try {
    // Modern, detailed event consumers can use
    window.dispatchEvent(new CustomEvent('cookie-preferences-changed', { detail: prefs }));
  } catch {
    // ignore
  }
}

export function openCookieSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('openCookieSettings'));
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

export function isThirdPartyAllowed(): boolean {
  return allowsThirdParty(getCookiePreferences());
}

export function isFunctionalAllowed(): boolean {
  const preferences = getCookiePreferences();
  if (!preferences) return true;
  return preferences.functional !== false;
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
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  } as Record<string, unknown>);
}
