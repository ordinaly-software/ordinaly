"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Home,
  TrendingUp,
  ShoppingBag,
  HardHat,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface SectionProps {
  t: TranslateFn;
}

interface UseCaseItem {
  titleKey: string;
  bulletKey: string;
  bullets: string[];
  Icon: LucideIcon;
  /** Accent colour from the design-system palette */
  accent: string;
  /** Soft background tint (20 % of accent) */
  accentSoft: string;
  href: string;
}

const useCases: UseCaseItem[] = [
  {
    titleKey: "useCases.items.4.title",
    bulletKey: "useCases.items.4",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: Briefcase,
    accent: "var(--swatch--clay)",
    accentSoft: "var(--swatch--clay)/12",
    href: "/services",
  },
  {
    titleKey: "useCases.items.0.title",
    bulletKey: "useCases.items.0",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: Building2,
    accent: "var(--swatch--cobalt)",
    accentSoft: "var(--swatch--cobalt)/12",
    href: "/services",
  },
  {
    titleKey: "useCases.items.1.title",
    bulletKey: "useCases.items.1",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: Home,
    accent: "var(--swatch--olive)",
    accentSoft: "var(--swatch--olive)/12",
    href: "/services",
  },
  {
    titleKey: "useCases.items.2.title",
    bulletKey: "useCases.items.2",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: TrendingUp,
    accent: "var(--swatch--sky)",
    accentSoft: "var(--swatch--sky)/12",
    href: "/services",
  },
  {
    titleKey: "useCases.items.3.title",
    bulletKey: "useCases.items.3",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: ShoppingBag,
    accent: "var(--swatch--flame)",
    accentSoft: "var(--swatch--flame)/12",
    href: "/services",
  },
  {
    titleKey: "useCases.items.5.title",
    bulletKey: "useCases.items.5",
    bullets: ["bullets.0", "bullets.1", "bullets.2"],
    Icon: HardHat,
    accent: "var(--swatch--slate-light)",
    accentSoft: "var(--swatch--slate-light)/12",
    href: "/services",
  },
];

// ─── Single card ──────────────────────────────────────────────────────────────

function UseCaseCard({ item, t, index }: { item: UseCaseItem; t: TranslateFn; index: number }) {
  const { Icon, accent, href } = item;

  return (
    <Link
      href={href}
      className="group scroll-animate fade-in-up relative flex flex-col items-start rounded-[1.875rem] border-2 border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)] px-8 pt-14 pb-12 text-left no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* ── Icon circle — overflows the top edge ───────────────────────── */}
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--swatch--ivory-light)] dark:border-[var(--swatch--slate-medium)] transition-colors duration-300"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      >
        <Icon
          className="h-6 w-6 transition-colors duration-300"
          style={{ color: accent }}
          strokeWidth={1.5}
        />
      </div>

      {/* ── Title ──────────────────────────────────────────────────────── */}
      <h3
        className="mb-3 w-full text-center text-[1.35rem] font-semibold leading-snug text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)] transition-colors duration-300"
      >
        {t(item.titleKey)}
      </h3>

      {/* ── Bullets ────────────────────────────────────────────────────── */}
      <ul className="w-full space-y-1.5 text-center text-sm leading-relaxed text-[var(--swatch--slate-light)] dark:text-[var(--swatch--cloud-medium)] transition-colors duration-300">
        {item.bullets.map((_, idx) => (
          <li key={idx}>
            {t(`${item.bulletKey}.bullets.${idx}`)}
          </li>
        ))}
      </ul>

      {/* ── Arrow button — overflows the bottom edge ───────────────────── */}
      <div
        className="absolute -bottom-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)] shadow-sm transition-all duration-300 group-hover:shadow-md"
        style={{ borderColor: accent }}
      >
        <ArrowRight
          className="h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5"
          style={{ color: accent }}
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function UseCasesSection({ t }: SectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(".scroll-animate"));
    if (items.length === 0) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("animate-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-dark]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-dark dark:text-ivory-light">
            {t("useCases.title")}
          </h2>
          <p className="text-xl text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
            {t("useCases.subtitle")}
          </p>
        </div>

        {/* Cards — extra vertical padding to show overflow circles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {useCases.map((item, index) => (
            <UseCaseCard key={item.titleKey} item={item} t={t} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
