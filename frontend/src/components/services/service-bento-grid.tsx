"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";

const PAGE_SIZE = 9;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function BentoSkeletonItem({ isLarge = false }: { isLarge?: boolean }) {
  return (
    <BentoGridItem
      className={cn(
        isLarge && "md:col-span-2",
        "border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)]",
      )}
      header={
        <div className="w-full min-h-[8rem] rounded-xl animate-pulse bg-gradient-to-br from-[var(--swatch--cloud-light)] to-[var(--swatch--cloud-medium)] dark:from-[var(--swatch--slate-medium)] dark:to-[var(--swatch--slate-dark)]" />
      }
      title={
        <div className="h-4 w-3/4 rounded animate-pulse bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-medium)]" />
      }
      description={
        <div className="h-3 w-full rounded animate-pulse bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-medium)]" />
      }
    />
  );
}

function BentoGridSkeleton({
  count,
  gridClass,
}: {
  count: number;
  gridClass?: string;
}) {
  return (
    <BentoGrid className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <BentoSkeletonItem key={i} isLarge={i === 0 || i === 3} />
      ))}
    </BentoGrid>
  );
}

// ─── Card header ─────────────────────────────────────────────────────────────

function ServiceCardImage({ service }: { service: Service }) {
  const raw = service.color_hex || service.color || "";
  const accent = raw.startsWith("#") ? raw : raw ? `#${raw}` : "var(--swatch--clay)";

  return (
    <div className="relative w-full min-h-[8rem] rounded-xl overflow-hidden bg-[var(--swatch--slate-medium)]">
      {service.image ? (
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-300 group-hover/bento:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, ${accent}55, transparent 55%), radial-gradient(circle at 75% 70%, ${accent}33, transparent 50%)`,
          }}
        />
      )}
      {service.is_featured && (
        <span className="absolute top-2 right-2 bg-clay text-white text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight">
          ★ Destacado
        </span>
      )}
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
}

export function ServiceBentoGrid({
  services,
  isLoading,
  skeletonCount = 6,
  onCardClick,
  infiniteScroll = false,
  initialVisible,
  className,
}: ServiceBentoGridProps) {
  const effectiveInitial = initialVisible ?? (infiniteScroll ? PAGE_SIZE : services.length);
  const [visibleCount, setVisibleCount] = useState(effectiveInitial);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when the service list or visibility params change (e.g. filter applied)
  useEffect(() => {
    setVisibleCount(initialVisible ?? (infiniteScroll ? PAGE_SIZE : services.length));
  }, [services, initialVisible, infiniteScroll]);

  // Infinite scroll observer
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

  // Grid cols class based on total count
  const gridColsClass =
    services.length === 1
      ? "md:grid-cols-1"
      : services.length === 2
        ? "md:grid-cols-2"
        : undefined; // default: md:grid-cols-3

  if (isLoading) {
    return <BentoGridSkeleton count={skeletonCount} gridClass={cn(gridColsClass, className)} />;
  }

  if (services.length === 0) return null;

  const visible = services.slice(0, visibleCount);

  // Assign col-span-2 to the first 2 featured items (when grid is 3-col)
  let largeCount = 0;
  const MAX_LARGE = 2;

  return (
    <div className={className}>
      <BentoGrid className={gridColsClass}>
        {visible.map((service) => {
          const raw = service.color_hex || service.color || "";
          const accent = raw.startsWith("#") ? raw : raw ? `#${raw}` : "var(--swatch--clay)";

          const isLarge =
            service.is_featured && services.length >= 3 && largeCount < MAX_LARGE;
          if (isLarge) largeCount++;

          return (
            <BentoGridItem
              key={service.id}
              className={cn(
                isLarge && "md:col-span-2",
                "border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)]",
              )}
              header={<ServiceCardImage service={service} />}
              icon={
                <span
                  className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  {service.type === "PRODUCT" ? "Producto" : "Servicio"}
                </span>
              }
              title={
                <span className="text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)]">
                  {service.title}
                </span>
              }
              description={
                <span className="text-[var(--swatch--cloud-medium)]">
                  {service.subtitle || service.clean_description?.slice(0, 120) || ""}
                </span>
              }
              onClick={() => onCardClick(service)}
            />
          );
        })}
      </BentoGrid>

      {/* Sentinel: shows skeleton rows while more items are waiting */}
      {infiniteScroll && visibleCount < services.length && (
        <div ref={sentinelRef} className="mt-4">
          <BentoGridSkeleton count={Math.min(3, services.length - visibleCount)} />
        </div>
      )}
    </div>
  );
}
