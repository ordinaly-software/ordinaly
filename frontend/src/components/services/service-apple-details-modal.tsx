"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Service } from "@/hooks/useServices";
import { AppleModal } from "@/components/ui/apple-modal";
import { ServiceDetailsContent, type ServiceDetailsLabels } from "@/components/services/service-details-content";

export const ServiceAppleDetailsModal = ({
  service,
  isOpen,
  onClose,
  showContact = false,
  onContact,
}: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  showContact?: boolean;
  onContact?: (service: Service) => void;
}) => {
  const t = useTranslations("services");
  const tHome = useTranslations("home");

  const labels = useMemo<ServiceDetailsLabels>(
    () => ({
      featured: t("featured"),
      contactForQuote: t("contactForQuote"),
      viewDetails: t("details"),
      contactNow: t("cta.contact"),
      productType: t("productsSectionTitle"),
      serviceType: t("servicesSectionTitle"),
      price: t("price"),
      duration: t("duration"),
      durationDay: t("durationDay"),
      durationDays: t("durationDays"),
      requisites: t("requisites"),
      none: t("contactForQuote"),
      video: tHome("services.video"),
      playVideo: tHome("services.playVideo"),
    }),
    [t, tHome],
  );

  if (!service) return null;

  const category = service.type === 'SERVICE' ? t("servicesSectionTitle") : t("productsSectionTitle");
  const accent = service.color_hex || service.color || "#22A60D";
  const accentHex = accent.startsWith("#") ? accent : `#${accent}`;

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      category={
        <span className="font-semibold" style={{ color: accentHex }}>
          {category}
        </span>
      }
      title={
        <span className="font-semibold" style={{ color: accentHex }}>
          {service.title}
        </span>
      }
    >
      <div className="pt-6">
        <ServiceDetailsContent
          service={service}
          labels={labels}
          onContact={onContact}
          showContact={showContact}
          showViewDetails={false}
        />
      </div>
    </AppleModal>
  );
};
