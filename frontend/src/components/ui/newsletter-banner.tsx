"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Whether the banner shows its wide row layout depends on the space it's
// actually given (e.g. squeezed into a sidebar column), not the viewport —
// so this is measured on the element itself instead of a Tailwind `md:` variant.
const ROW_LAYOUT_MIN_WIDTH = 700;

export function NewsletterBanner({ className }: { className?: string }) {
  const t = useTranslations("home.newsletter");
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — wire to real backend when newsletter is ready
    setSubmitted(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-gradient-to-br from-[--swatch--clay] to-[--swatch--flame-dark] p-8 text-center text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10",
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
            "bg-gradient-to-r from-white to-[--swatch--manilla] bg-clip-text text-2xl font-semibold leading-snug tracking-[-0.03em] text-transparent",
            !isCompact && "text-3xl",
          )}
        >
          {t("title")}
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed text-white/80", !isCompact && "text-base")}>
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
            <Input
              name="email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              className={cn(
                "h-12 w-full min-w-0 flex-1 rounded-full border-white/30 bg-white/15 px-5 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-white/60 focus:ring-white/50",
                !isCompact && "w-72",
              )}
            />
            <Button
              type="submit"
              className={cn(
                "h-12 w-full whitespace-nowrap rounded-full bg-white px-8 font-semibold text-[--swatch--clay] shadow-lg hover:bg-white/90 active:bg-white/80",
                !isCompact && "w-auto",
              )}
            >
              {t("submitLabel")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
