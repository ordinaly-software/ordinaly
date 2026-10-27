"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, X } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "newsletter-prompt-dismissed";
const SUBSCRIBED_KEY = "newsletter-subscribed";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const isSnoozed = () => {
  const dismissedAt = Number(readStorage(DISMISSED_KEY));
  return Boolean(dismissedAt) && Date.now() - dismissedAt < SNOOZE_MS;
};

// The first section of every page is its hero/header; show once it has scrolled out of view.
const isHeroPassed = () => {
  const hero = document.querySelector("main section");
  const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
  return heroBottom <= 0 && window.scrollY >= window.innerHeight * 0.5;
};

const isCardInView = (card: HTMLElement) => {
  const rect = card.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

/**
 * Quiet, dismissible nudge toward the page's #newsletter card. It only exists on pages that render
 * that card, waits for the cookie dialog to be closed (answered or not) so two prompts never stack, and steps aside while the card
 * itself is on screen.
 */
export default function NewsletterPrompt() {
  const t = useTranslations("home.newsletter.prompt");
  const pathname = usePathname();
  const [hasCard, setHasCard] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const card = document.getElementById("newsletter");
      const blocked = Boolean(readStorage(SUBSCRIBED_KEY)) || isSnoozed();
      setHasCard(Boolean(card) && !blocked);
      if (!card || blocked || document.querySelector("[data-cookie-popup]")) {
        setOpen(false);
        return;
      }
      setOpen(isHeroPassed() && !isCardInView(card));
    };

    evaluate();
    const interval = window.setInterval(evaluate, 1500);
    window.addEventListener("scroll", evaluate, { passive: true });
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", evaluate);
    };
  }, [pathname]);

  const snooze = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // localStorage not available
    }
    setOpen(false);
  };

  if (!hasCard) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 lg:bottom-6">
      <aside
        aria-label={t("title")}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "flex w-full max-w-md items-center gap-3 rounded-2xl border p-2 pl-4 sm:w-auto",
          "border-white/50 bg-white/70 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-dark/60",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]",
          "[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none dark:[@media(prefers-reduced-transparency:reduce)]:bg-slate-dark",
          // Enters from the bottom edge and leaves the same way; reduced motion cross-fades in place.
          "transition-[transform,opacity,visibility] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity",
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100 duration-[450ms]"
            : "invisible translate-y-6 opacity-0 duration-300 motion-reduce:translate-y-0",
        )}
      >
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-fill text-white sm:flex">
          <Mail className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug tracking-[-0.01em] text-slate-dark dark:text-ivory-light">
          {t("title")}
        </p>
        <a
          href="#newsletter"
          onClick={snooze}
          className="shrink-0 rounded-full bg-clay-fill px-4 py-2 text-sm font-semibold text-white transition-transform duration-100 ease-out hover:bg-flame-dark active:scale-[0.97]"
        >
          {t("cta")}
        </a>
        <button
          type="button"
          onClick={snooze}
          aria-label={t("dismiss")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-medium transition-transform duration-100 ease-out hover:bg-black/5 active:scale-[0.92] dark:text-cloud-medium dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </aside>
    </div>
  );
}
