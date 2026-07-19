"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterBanner({ className }: { className?: string }) {
  const t = useTranslations("home.newsletter");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — wire to real backend when newsletter is ready
    setSubmitted(true);
  };

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-gradient-to-br from-clay via-[#c0522a] to-[#8b1a1a] p-6 text-white shadow-[0_20px_80px_-55px_rgba(0,0,0,0.55)] dark:border-white/10 md:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/20 blur-3xl" />
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Mail className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <h3 className="text-xl font-semibold leading-snug tracking-[-0.03em]">
            {t("title")}
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{t("subtitle")}</p>

        <div className="mt-5 flex-1">
          {submitted ? (
            <div className="rounded-[1.25rem] border border-white/25 bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur-sm">
              {t("successMessage")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                name="email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                className="h-11 flex-1 rounded-xl border-white/30 bg-white/15 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-white/60 focus:ring-white/50"
              />
              <Button
                type="submit"
                className="h-11 whitespace-nowrap rounded-xl bg-white px-5 font-semibold text-clay shadow-lg hover:bg-white/90 active:bg-white/80"
              >
                {t("submitLabel")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
