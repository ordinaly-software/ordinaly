"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";
import { renderIcon } from "@/components/ui/icon-select";
import { BentoGrid, BentoGridItem } from "@/components/services/bento-grid";

const COLOR_MAP: Record<string, string> = {
  pizarra: "#1f2937",
  arcilla: "#d97757",
  cobalto: "#2563eb",
  oliva: "#4d7c0f",
  higo: "#a21caf",
  kraft: "#b45309",
};

function resolveAccent(service: Service) {
  const raw = service.color_hex || COLOR_MAP[service.color] || service.color || "";
  return raw.startsWith("#") ? raw : raw ? `#${raw}` : "var(--swatch--clay)";
}

function ServiceHeader({ service }: { service: Service }) {
  const accent = resolveAccent(service);
  return (
    <div className="relative h-full min-h-[8rem] w-full flex-1 overflow-hidden rounded-xl">
      {service.image ? (
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover/bento:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, ${accent}55, transparent 55%), radial-gradient(circle at 75% 70%, ${accent}33, transparent 50%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
    </div>
  );
}

function BentoSkeletonHeader() {
  return (
    <div className="h-full min-h-[8rem] w-full flex-1 animate-pulse rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800" />
  );
}

// Every 6th item (starting at index 0 and 3) spans two columns to create the bento rhythm
function spanClassName(index: number) {
  const pos = index % 6;
  return pos === 0 || pos === 3 ? "md:col-span-2" : "";
}

export interface ServicesBentoGridProps {
  services: Service[];
  isLoading?: boolean;
  skeletonCount?: number;
  onCardClick: (service: Service) => void;
  viewDetailsLabel?: string;
  className?: string;
}

export function ServicesBentoGrid({
  services,
  isLoading,
  skeletonCount = 6,
  onCardClick,
  viewDetailsLabel,
  className,
}: ServicesBentoGridProps) {
  if (isLoading) {
    return (
      <BentoGrid className={cn("max-w-none", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BentoGridItem key={i} header={<BentoSkeletonHeader />} className={spanClassName(i)} />
        ))}
      </BentoGrid>
    );
  }

  if (services.length === 0) return null;

  return (
    <BentoGrid className={cn("max-w-none", className)}>
      {services.map((service, i) => (
        <BentoGridItem
          key={service.id}
          title={service.title}
          description={service.subtitle || service.clean_description}
          header={<ServiceHeader service={service} />}
          icon={renderIcon(service.icon, "h-4 w-4 text-[var(--swatch--clay)]")}
          onClick={() => onCardClick(service)}
          viewDetailsLabel={viewDetailsLabel}
          className={cn(
            spanClassName(i),
            service.is_featured && "ring-1 ring-[var(--swatch--clay)]/40",
          )}
        />
      ))}
    </BentoGrid>
  );
}
