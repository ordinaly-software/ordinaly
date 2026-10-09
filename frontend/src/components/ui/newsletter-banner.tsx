"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReCaptchaWrapper, { useReCaptcha } from "@/app/[locale]/recaptcha-provider";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Whether the banner shows its wide row layout depends on the space it's
// actually given (e.g. squeezed into a sidebar column), not the viewport —
// so this is measured on the element itself instead of a Tailwind `md:` variant.
const ROW_LAYOUT_MIN_WIDTH = 700;

export function NewsletterBanner(props: { className?: string; padded?: boolean }) {
  // Self-contained so the banner works on pages that don't mount a reCAPTCHA provider themselves.
  return (
    <ReCaptchaWrapper>
      <NewsletterBannerContent {...props} />
    </ReCaptchaWrapper>
  );
}

function NewsletterBannerContent({
  className,
  padded = true,
}: {
  className?: string;
  /** Wrap in the page gutter (px-4 sm:px-6 lg:px-8). Disable when the parent already provides it. */
  padded?: boolean;
}) {
  const t = useTranslations("home.newsletter");
  const { executeRecaptcha } = useReCaptcha();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCompact, setIsCompact] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setIsCompact(width < ROW_LAYOUT_MIN_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        email: String(formData.get("email") ?? ""),
        website: String(formData.get("website") ?? ""),
      };
      if (executeRecaptcha) payload.recaptchaToken = await executeRecaptcha("newsletter_banner");
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error === "invalid_email" ? t("invalidEmail") : t("errorMessage"));
      }
    } catch {
      setError(t("errorMessage"));
    } finally {
      setSending(false);
    }
  };

  const card = (
      <div
        ref={containerRef}
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-gradient-to-br from-[--swatch--clay-fill] to-[--swatch--flame-dark] p-8 text-center text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10",
          !isCompact && "flex-row justify-between p-10 text-left",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-3xl" />
        </div>

        <div className={cn("relative max-w-xl", !isCompact && "max-w-none")}>
          <span
            className={cn(
              "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15",
              !isCompact && "mx-0",
            )}
          >
            <Mail className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <h3
            className={cn(
              "font-serif text-2xl font-normal leading-snug tracking-[-0.01em] text-white",
              !isCompact && "text-3xl",
            )}
          >
            {t("title")}
          </h3>
          <p className={cn("mt-2 text-sm leading-relaxed text-white/90", !isCompact && "text-base")}>
            {t("subtitle")}
          </p>
        </div>

        <div className={cn("relative w-full", !isCompact && "w-auto flex-shrink-0")}>
          {submitted ? (
            <div className="rounded-full border border-white/25 bg-white/15 px-6 py-3 text-center text-sm font-medium backdrop-blur-sm">
              {t("successMessage")}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={cn("flex w-full flex-col gap-3", !isCompact && "flex-row")}
            >
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <Input
                name="email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                className={cn(
                  "h-12 w-full min-w-0 flex-1 rounded-full border-white/30 bg-white/15 px-5 text-white placeholder:text-white/85 backdrop-blur-sm focus:border-white/60 focus:ring-white/50",
                  !isCompact && "w-72",
                )}
              />
              <Button
                type="submit"
                disabled={sending}
                className={cn(
                  "h-12 w-full whitespace-nowrap rounded-full bg-white px-8 font-semibold text-[--swatch--clay] shadow-lg hover:bg-white/90 active:bg-white/80",
                  !isCompact && "w-auto",
                )}
              >
                {t("submitLabel")}
              </Button>
            </form>
          )}
          {!submitted && error && (
            <p role="alert" className="mt-3 text-sm font-medium text-white">
              {error}
            </p>
          )}
          {!submitted && (
            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/80">
              {t.rich("privacyNotice", {
                privacy: (chunks) => (
                  <Link href="/legal?tab=privacy" className="underline hover:text-white">
                    {chunks}
                  </Link>
                ),
                gprivacy: (chunks) => (
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    {chunks}
                  </a>
                ),
                terms: (chunks) => (
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </div>
      </div>
  );

  return padded ? <div className="px-4 sm:px-6 lg:px-8">{card}</div> : card;
}
