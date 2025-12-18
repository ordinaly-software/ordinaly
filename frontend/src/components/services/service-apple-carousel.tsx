"use client";

import React, { useMemo } from "react";
import { Carousel, Card as AppleCard } from "@/components/ui/apple-cards-carousel";
import { Service } from "@/hooks/useServices";
import { ServiceDetailsContent, type ServiceDetailsLabels } from "@/components/services/service-details-content";
import { useTranslations } from "next-intl";

interface ServiceAppleCarouselProps {
  services: Service[];
  labels: ServiceDetailsLabels;
  onSelect?: (service: Service) => void;
  onContact?: (service: Service) => void;
  initialScroll?: number;
  variant?: "default" | "compact";
}

const normalizeHex = (color?: string) => {
  if (!color) return "22A60D";
  const cleaned = color.replace("#", "");
  return cleaned.length === 6 ? cleaned : "22A60D";
};

const buildGradient = (accent: string) => {
  const base = normalizeHex(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23${base}' offset='0'/><stop stop-color='%23${base}d9' offset='0.5'/><stop stop-color='%231a1a1a' offset='1'/></linearGradient></defs><rect width='600' height='900' fill='url(%23g)'/><circle cx='520' cy='140' r='180' fill='%23${base}40'/><circle cx='120' cy='760' r='200' fill='%23${base}30'/><circle cx='180' cy='260' r='140' fill='%23ffffff0f'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const FALLBACK_CARD_IMAGE = "/static/main_service_home_ilustration.webp";

export const ServiceAppleCarousel: React.FC<ServiceAppleCarouselProps> = ({
  services,
  labels,
  onSelect,
  onContact,
  initialScroll = 0,
  variant = "default",
}) => {
  const t = useTranslations("services");
  const spacingClassName = variant === "compact" ? "py-4 md:py-8" : undefined;
  const cards = useMemo(
    () =>
      services.map((service, index) => {
        const accent = service.color_hex || service.color || "#22A60D";
        const background = service.image || FALLBACK_CARD_IMAGE || buildGradient(accent);
        const category = service.type === 'SERVICE' ? t("servicesSectionTitle") : t("productsSectionTitle");

        return (
          <AppleCard
            key={service.id}
            index={index}
            layout
            card={{
              src: background,
              title: service.title,
              category,
              onOpen: onSelect ? () => onSelect(service) : undefined,
              disableModal: Boolean(onSelect),
              content: (
                <ServiceDetailsContent
                  service={service}
                  labels={labels}
                  onContact={onContact}
                  onSelect={onSelect}
                />
              ),
            }}
          />
        );
      }),
    [services, labels, onSelect, onContact, t],
  );

  return <Carousel items={cards} initialScroll={initialScroll} className={spacingClassName} />;
};
