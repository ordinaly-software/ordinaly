"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";
import { ServiceCard } from "./service-card";

const PAGE_SIZE = 9;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
      <div className="aspect-video w-full animate-pulse bg-gradient-to-br from-[var(--swatch--cloud-light)] to-[var(--swatch--cloud-medium)] dark:from-[var(--swatch--slate-medium)] dark:to-[var(--swatch--slate-dark)]" />
      <div className="flex flex-col gap-2.5 p-5">
        <div className="h-4 w-3/4 rounded-lg animate-pulse bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-light)]" />
        <div className="h-3 w-full rounded-lg animate-pulse bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-light)]" />
        <div className="h-3 w-2/3 rounded-lg animate-pulse bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-light)]" />
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export interface ServiceBentoGridProps {
  services: Service[];
  isLoading?: boolean;
  /** Number of skeleton cards shown when isLoading is true */
  skeletonCount?: number;
  onCardClick: (service: Service) => void;
  /** Progressively reveal more items as the user scrolls */
  infiniteScroll?: boolean;
  /** How many items to show initially (defaults to all when infiniteScroll=false) */
  initialVisible?: number;
  className?: string;
  cardSize?: "default" | "lg";
  onCardContact?: (service: Service) => void;
  viewDetailsLabel?: string;
  contactLabel?: string;
  consistentCardWidth?: boolean;
}

export function ServiceBentoGrid({
  services,
  isLoading,
  skeletonCount = 6,
  onCardClick,
  infiniteScroll = false,
  initialVisible,
  className,
  cardSize,
  onCardContact,
  viewDetailsLabel,
  contactLabel,
  consistentCardWidth = false,
}: ServiceBentoGridProps) {
  const effectiveInitial = initialVisible ?? (infiniteScroll ? PAGE_SIZE : services.length);
  const [visibleCount, setVisibleCount] = useState(effectiveInitial);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(initialVisible ?? (infiniteScroll ? PAGE_SIZE : services.length));
  }, [services, initialVisible, infiniteScroll]);

  useEffect(() => {
    if (!infiniteScroll || !sentinelRef.current || visibleCount >= services.length) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, services.length));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [infiniteScroll, services.length, visibleCount]);

  const gridClass = cn(
    "grid gap-5",
    consistentCardWidth
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      : services.length === 1
        ? "grid-cols-1 max-w-sm"
        : services.length === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  );

  if (isLoading) {
    return (
      <div className={cn(gridClass, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (services.length === 0) return null;

  const visible = services.slice(0, visibleCount);

  return (
    <div className={className}>
      <div className={gridClass}>
        {visible.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => onCardClick(service)}
            size={cardSize}
            onContact={onCardContact}
            viewDetailsLabel={viewDetailsLabel}
            contactLabel={contactLabel}
          />
        ))}
      </div>

      {/* Sentinel: loads more on scroll */}
      {infiniteScroll && visibleCount < services.length && (
        <div ref={sentinelRef} className={cn("mt-5", gridClass)}>
          {Array.from({ length: Math.min(3, services.length - visibleCount) }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
