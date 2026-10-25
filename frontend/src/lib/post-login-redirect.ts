const STORAGE_KEY = "post_login_redirect";

// Pages that make no sense to come back to after signing in.
const EXCLUDED_PREFIXES = [
  "/auth",
  "/reset-password",
  "/verify-email",
  "/change-email",
  "/delete_account",
];

const stripLocale = (path: string) => path.replace(/^\/(en|es)(?=\/|$)/, "") || "/";

const isReturnable = (path: string) => {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const base = stripLocale(path.split(/[?#]/)[0]);
  return !EXCLUDED_PREFIXES.some((prefix) => base === prefix || base.startsWith(`${prefix}/`));
};

/** Remembers the current page so it can be restored after signing in. Call on every navigation. */
export function trackPageForLogin() {
  try {
    const path = window.location.pathname + window.location.search;
    if (isReturnable(path)) sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    // Storage unavailable: the user will land on the home page.
  }
}

/** Returns the page to go back to after signing in (home if none) and forgets it. */
export function consumePostLoginRedirect(): string {
  try {
    const path = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (path && isReturnable(path)) return path;
  } catch {
    // Storage unavailable.
  }
  return "/";
}
