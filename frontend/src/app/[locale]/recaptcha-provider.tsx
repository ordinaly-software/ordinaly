"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Minimal typing for the global injected by the reCAPTCHA v3 script.
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SCRIPT_ID = "google-recaptcha-v3";
// recaptcha.net is a drop-in mirror for regions where google.com is blocked.
const USE_RECAPTCHA_NET = process.env.NEXT_PUBLIC_RECAPTCHA_USE_NET === "true";
const SCRIPT_HOST = USE_RECAPTCHA_NET ? "https://www.recaptcha.net" : "https://www.google.com";

type ExecuteRecaptcha = ((action: string) => Promise<string>) | null;

type ReCaptchaContextValue = {
  /** Null when no site key is configured — callers should treat this as "not available". */
  executeRecaptcha: ExecuteRecaptcha;
  ready: boolean;
};

const ReCaptchaContext = createContext<ReCaptchaContextValue>({
  executeRecaptcha: null,
  ready: false,
});

export function useReCaptcha(): ReCaptchaContextValue {
  return useContext(ReCaptchaContext);
}

function resolveSiteKey(): string {
  const raw = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const trimmed = raw.trim();
  // Valid reCAPTCHA v3 site keys are ~40 chars starting with "6L".
  return trimmed.length >= 20 ? trimmed : "";
}

type ReCaptchaWrapperProps = {
  children: ReactNode;
  badgeContainerId?: string;
};

export default function ReCaptchaWrapper({ children, badgeContainerId }: ReCaptchaWrapperProps) {
  const siteKey = resolveSiteKey();
  const [ready, setReady] = useState(false);
  const movedRef = useRef(false);
  const warnedRef = useRef(false);

  // The script is injected on demand (first focus inside a form, or at submit
  // time) so Google gets no request from visitors who never use a form.
  // The getElementById guard keeps it to a single script under StrictMode.
  const ensureScript = useCallback((): Promise<void> => {
    if (window.grecaptcha?.ready) return Promise.resolve();
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `${SCRIPT_HOST}/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    return new Promise((resolve, reject) => {
      script.addEventListener("load", () => { setReady(true); resolve(); }, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`failed to load the reCAPTCHA script from ${SCRIPT_HOST}`)),
        { once: true },
      );
    });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) {
      if (!warnedRef.current) {
        console.warn(
          "[recaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set at build time — " +
            "reCAPTCHA is disabled and forms will submit without a token.",
        );
        warnedRef.current = true;
      }
      return;
    }

    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("form")) return;
      document.removeEventListener("focusin", onFocusIn);
      ensureScript().catch((err) => console.error("[recaptcha]", err));
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [siteKey, ensureScript]);

  // Relocate the floating badge into the desired container once it appears.
  useEffect(() => {
    if (!badgeContainerId || !siteKey) return;

    const moveBadge = () => {
      const target = document.getElementById(badgeContainerId);
      const badge = document.querySelector(".grecaptcha-badge");
      if (!target || !badge || movedRef.current) return;
      if (target.contains(badge)) return;
      target.appendChild(badge);
      movedRef.current = true;
    };

    moveBadge();
    if (movedRef.current) return;

    const observer = new MutationObserver(() => {
      moveBadge();
      if (movedRef.current) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [badgeContainerId, siteKey]);

  const executeRecaptcha = useCallback<NonNullable<ExecuteRecaptcha>>(
    async (action: string) => {
      if (!siteKey) {
        throw new Error("reCAPTCHA site key is not configured");
      }
      await ensureScript();
      const grecaptcha = window.grecaptcha!;
      await new Promise<void>((resolve) => grecaptcha.ready(resolve));
      const token = await grecaptcha.execute(siteKey, { action });
      if (!token) {
        throw new Error("reCAPTCHA returned an empty token");
      }
      return token;
    },
    [siteKey, ensureScript],
  );

  return (
    <ReCaptchaContext.Provider
      value={{ executeRecaptcha: siteKey ? executeRecaptcha : null, ready }}
    >
      {children}
    </ReCaptchaContext.Provider>
  );
}
