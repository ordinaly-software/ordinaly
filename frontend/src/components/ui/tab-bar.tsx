"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TabBarTab {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  external?: boolean;
  href?: string;
  accentColor?: string;
}

interface TabBarProps {
  tabs: TabBarTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  /** Persists the active tab in localStorage under this key and restores it on mount. */
  storageKey?: string;
  /** Pins the bar to the top of the viewport while scrolling. */
  sticky?: boolean;
}

const DEFAULT_ACCENT = "var(--swatch--cobalt)";

/**
 * Shared pill tab bar used by both the admin panel and the user profile pages.
 * Scrolls horizontally with hidden native scrollbars; shows small chevron
 * affordances at either edge when the row overflows its container.
 */
export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  style = {},
  storageKey,
  sticky = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollAffordances = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollAffordances();
    el.addEventListener("scroll", updateScrollAffordances, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollAffordances);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollAffordances);
      resizeObserver.disconnect();
    };
  }, [updateScrollAffordances, tabs.length]);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Scroll the active tab into view on mount and when activeTab changes
  useEffect(() => {
    const idx = tabs.findIndex((tab) => tab.id === activeTab);
    tabButtonRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab, tabs]);

  // Save active tab to localStorage
  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, activeTab);
  }, [activeTab, storageKey]);

  // On mount, restore tab from localStorage if present
  useEffect(() => {
    if (!storageKey) return;
    const savedTab = localStorage.getItem(storageKey);
    if (savedTab && tabs.some((tab) => tab.id === savedTab) && savedTab !== activeTab) {
      onTabChange(savedTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const pillClasses = (isActive: boolean) =>
    `group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
      isActive
        ? "shadow-[0_8px_20px_-8px_rgba(2,85,213,0.35)] border-[color-mix(in_srgb,var(--tab-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--tab-accent)_12%,transparent)] text-[var(--tab-accent)] dark:border-[color-mix(in_srgb,var(--tab-accent-dark)_50%,transparent)] dark:bg-[color-mix(in_srgb,var(--tab-accent-dark)_14%,transparent)] dark:text-[var(--tab-accent-dark)]"
        : "border-[--color-border-subtle] bg-white/60 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.03] dark:text-cloud-medium dark:hover:text-ivory-light"
    }`;

  // Cobalt is too dark to read on the dark surfaces, so it switches to its light variant there.
  const activeStyle = (accent: string) =>
    ({
      "--tab-accent": accent,
      "--tab-accent-dark": accent === "var(--swatch--cobalt)" ? "var(--swatch--cobalt-light)" : accent,
    }) as React.CSSProperties;

  return (
    <div
      className={`${sticky ? "sticky top-[64px] z-30" : ""} relative min-h-[56px] flex items-center ${className}`}
      style={style}
    >
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          onClick={() => scrollBy(-180)}
          className="absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[--color-border-subtle] bg-white/90 text-slate-medium shadow-sm backdrop-blur-sm transition-opacity dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--swatch--slate-dark)_90%,transparent)] dark:text-cloud-medium"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="tab-bar-scroll flex gap-3 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          const accent = tab.accentColor || DEFAULT_ACCENT;

          return tab.external ? (
            <a
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[idx] = el;
              }}
              href={tab.href}
              target="_blank"
              rel="noopener noreferrer"
              className={pillClasses(active)}
              style={active ? activeStyle(accent) : undefined}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.name}
            </a>
          ) : (
            <button
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={pillClasses(active)}
              style={active ? activeStyle(accent) : undefined}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.name}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          onClick={() => scrollBy(180)}
          className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[--color-border-subtle] bg-white/90 text-slate-medium shadow-sm backdrop-blur-sm transition-opacity dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--swatch--slate-dark)_90%,transparent)] dark:text-cloud-medium"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
      <style>{`
        .tab-bar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default TabBar;
