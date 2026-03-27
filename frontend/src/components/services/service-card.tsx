"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";
import { ArrowRight } from "lucide-react";

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
  contactLabel?: string;
}

export function ServiceCard({ service, onClick, className, size = "default", onContact, viewDetailsLabel = "Ver detalles", contactLabel }: ServiceCardProps) {
  const raw = service.color_hex || service.color || "";
  const accent = raw.startsWith("#") ? raw : raw ? `#${raw}` : "var(--swatch--clay)";
  const contactUrl = resolveContactUrl(service.contactButtonUrl);
  const showContact = Boolean(contactUrl || onContact);
  const ctaLabel = service.contactButtonText || contactLabel || "Contactar";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
        "bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-medium)]",
        "border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-clay/10 hover:border-clay/40 dark:hover:border-clay/40",
        className,
      )}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--swatch--slate-medium)]">
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
        {/* Subtle bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border"
            style={{
              backgroundColor: `${accent}22`,
              color: accent,
              borderColor: `${accent}44`,
            }}
          >
            {service.type === "PRODUCT" ? "Producto" : "Servicio"}
          </span>
        </div>

        {/* Featured badge */}
        {service.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-clay text-white">
              ★ Destacado
            </span>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className={`flex flex-col gap-1.5 ${size === "lg" ? "p-6" : "p-5"} flex-1`}>
        <h3 className={`font-semibold leading-snug text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)] group-hover:text-clay transition-colors duration-200 ${size === "lg" ? "text-lg" : "text-base"}`}>
          {service.title}
        </h3>
        {service.subtitle && (
          <p className={`leading-relaxed text-[var(--swatch--slate-light)] dark:text-[var(--swatch--cloud-medium)] line-clamp-2 ${size === "lg" ? "text-base" : "text-sm"}`}>
            {service.subtitle}
          </p>
        )}

        {/* ── Buttons ──────────────────────────────────────────────────────── */}
        {(onClick || showContact) && (
          <div className="flex gap-2 mt-auto pt-3">
            {showContact && (
              contactUrl ? (
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`flex-1 text-center text-sm font-semibold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-85 ${size === "lg" ? "py-2.5" : "py-2"}`}
                  style={{ backgroundColor: accent }}
                >
                  {ctaLabel}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onContact?.(service); }}
                  className={`flex-1 text-sm font-semibold px-3 rounded-xl text-white transition-opacity hover:opacity-85 ${size === "lg" ? "py-2.5" : "py-2"}`}
                  style={{ backgroundColor: accent }}
                >
                  {ctaLabel}
                </button>
              )
            )}
            {onClick && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`${showContact ? "" : "flex-1"} flex items-center justify-center gap-1 text-sm font-medium px-3 rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] text-[var(--swatch--slate-medium)] dark:text-[var(--swatch--cloud-medium)] hover:border-clay/50 hover:text-clay transition-colors ${size === "lg" ? "py-2.5" : "py-2"}`}
              >
                {viewDetailsLabel}
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
