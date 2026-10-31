"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; text: string; level: number };

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (items.length === 0) return;
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A heading is "current" while it sits in the upper band of the viewport.
      { rootMargin: "-96px 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);
  return active;
}

const indent = (level: number) => (level >= 4 ? "pl-6" : level === 3 ? "pl-3" : "pl-0");

/** Sticky outline on large screens; collapses into a disclosure above the article on small ones. */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const t = useTranslations("blog.toc");
  const active = useActiveHeading(items);
  if (items.length === 0) return null;

  const list = (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id} className={indent(item.level)}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block rounded-lg px-3 py-1.5 leading-snug transition-colors duration-150",
              active === item.id
                ? "bg-clay/10 font-medium text-clay"
                : "text-slate-light hover:bg-ivory-medium hover:text-slate-dark dark:text-cloud-medium dark:hover:bg-white/5 dark:hover:text-ivory-light",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <details className="group mb-8 rounded-2xl border border-ivory-dark bg-white/70 p-1 dark:border-white/10 dark:bg-white/5 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-dark dark:text-ivory-light [&::-webkit-details-marker]:hidden">
          {t("mobile")}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <nav aria-label={t("label")} className="px-1 pb-2">{list}</nav>
      </details>

      <nav aria-label={t("label")} className="hidden lg:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay">{t("title")}</p>
        {list}
      </nav>
    </>
  );
}
