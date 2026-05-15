"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function NewsletterSection({ titleTag = "h2" }: { titleTag?: "h2" | "h3" } = {}) {
  const t = useTranslations("home.newsletter");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — wire to real backend when newsletter is ready
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-clay via-[#c0522a] to-[#8b1a1a]" aria-hidden="true" />
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-flame/30 blur-2xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Icon badge */}

        {titleTag === "h3" ? (
          <h3 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">{t("title")}</h3>
        ) : (
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">{t("title")}</h2>
        )}
        <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto">
          {t("subtitle")}
        </p>

        {submitted ? (
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 px-6 py-5 text-white text-lg font-medium">
            {t("successMessage")}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <Input
              name="name"
              required
              placeholder={t("namePlaceholder")}
              className="flex-1 h-12 bg-white/15 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:ring-white/50 focus:border-white/60 rounded-xl"
            />
            <Input
              name="email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              className="flex-1 h-12 bg-white/15 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:ring-white/50 focus:border-white/60 rounded-xl"
            />
            <Button
              type="submit"
              className="h-12 px-7 bg-white text-clay font-bold hover:bg-white/90 active:bg-white/80 rounded-xl whitespace-nowrap shadow-lg"
            >
              {t("submitLabel")}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
