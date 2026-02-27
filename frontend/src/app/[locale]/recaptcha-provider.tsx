"use client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useEffect, useRef, type ReactNode } from "react";

type ReCaptchaWrapperProps = {
  children: ReactNode;
  badgeContainerId?: string;
};

export default function ReCaptchaWrapper({ children, badgeContainerId }: ReCaptchaWrapperProps) {
  const raw = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  // Valid reCAPTCHA v3 site keys are ~40 chars starting with "6L"
  const reCaptchaKey = raw.trim().length >= 20 ? raw.trim() : "";
  const movedRef = useRef(false);

  // After the provider loads the script and renders the badge, relocate it
  // into the desired container element. This avoids passing `container` to the
  // provider, which causes "missing sitekey" or "already rendered" errors due
  // to re-render timing issues.
  useEffect(() => {
    if (!badgeContainerId || !reCaptchaKey) return;

    const moveBadge = () => {
      const target = document.getElementById(badgeContainerId);
      const badge = document.querySelector(".grecaptcha-badge");
      if (!target || !badge || movedRef.current) return;
      // Only move if badge is not already inside the target
      if (target.contains(badge)) return;
      target.appendChild(badge);
      movedRef.current = true;
    };

    // The badge may not exist yet — observe the DOM until it appears
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
  }, [badgeContainerId, reCaptchaKey]);

  if (!reCaptchaKey) return <>{children}</>;

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      useRecaptchaNet
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
