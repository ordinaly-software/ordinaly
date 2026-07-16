"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";
import { ArrowRight, MessageCircle } from "lucide-react";

const FALLBACK_SITE_URL = "https://ordinaly.es";

function resolveContactUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");
  if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `${baseUrl}/${trimmed.replace(/^\/+/, "")}`;
}

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
  className?: string;
  size?: "default" | "lg";
  onContact?: (service: Service) => void;
  viewDetailsLabel?: string;
  titleTag?: "h3" | "h4";
}

  const COLOR_MAP: Record<string, string> = {
    pizarra: "#1f2937",
    arcilla: "#d97757",
    cobalto: "#2563eb",
    oliva: "#4d7c0f",
    higo: "#a21caf",
    kraft: "#b45309",
  };

export function ServiceCard({ service, onClick, className, size = "default", onContact, viewDetailsLabel = "Más detalles", titleTag = "h3" }: ServiceCardProps) {
  const raw = service.color_hex || COLOR_MAP[service.color] || service.color || "";
  const accent = raw.startsWith("#") ? raw : raw ? `#${raw}` : "var(--swatch--clay)";
  const contactUrl = resolveContactUrl(service.contactButtonUrl);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        "group relative flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl",
        "bg-[var(--swatch--slate-medium)]",
        "border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-clay/20",
        className,
      )}
    >
      {/* ── Background image ──────────────────────────────────────────────── */}
      {service.image ? (
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

      {/* ── Transparent text panel: title, subtitle, "more details" only ──── */}
      <div
        className={cn(
          "relative z-10 mt-auto mx-4 mb-4 flex flex-col gap-1.5 rounded-2xl border border-white/20 bg-black/25 backdrop-blur-md",
          size === "lg" ? "p-6" : "p-5",
        )}
      >
        {titleTag === "h4" ? (
          <h4 className={`font-semibold leading-snug text-white ${size === "lg" ? "text-lg" : "text-base"}`}>
            {service.title}
          </h4>
        ) : (
          <h3 className={`font-semibold leading-snug text-white ${size === "lg" ? "text-lg" : "text-base"}`}>
            {service.title}
          </h3>
        )}
        {service.subtitle && (
          <p className={`leading-relaxed text-white/75 line-clamp-2 ${size === "lg" ? "text-base" : "text-sm"}`}>
            {service.subtitle}
          </p>
        )}
        {onClick && (
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
            {viewDetailsLabel}
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </span>
        )}
      </div>
    </div>
  );
}
