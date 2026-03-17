"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Banner from "@/components/ui/banner";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import { Service, useServices } from "@/hooks/useServices";
import { getWhatsAppUrl } from "@/utils/whatsapp";
import { Search, Filter, Mail } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { usePathname, useRouter } from "next/navigation";
import { getApiEndpoint } from "@/lib/api-config";
import { UseCasesSection } from "@/components/home/use-cases-section";
import { ServiceBentoGrid } from "@/components/services/service-bento-grid";

const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false });
const ServiceAppleDetailsModal = dynamic(
  () =>
    import("@/components/services/service-apple-details-modal").then(
      (mod) => mod.ServiceAppleDetailsModal,
    ),
  { ssr: false, loading: () => null },
);
const SeoArticleSectionLazy = dynamic(
  () =>
    import("@/components/home/seo-article-section").then(
      (mod) => mod.SeoArticleSection,
    ),
  {
    loading: () => (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#23272F]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </section>
    ),
  },
);

// ─── Loading skeleton matching the page structure ─────────────────────────────

function ServicesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Products section skeleton */}
          <div>
            <div className="h-9 w-40 mb-6 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <ServiceBentoGrid
              services={[]}
              isLoading
              skeletonCount={6}
              onCardClick={() => {}}
            />
          </div>
          {/* Services section skeleton */}
          <div>
            <div className="h-9 w-40 mb-6 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <ServiceBentoGrid
              services={[]}
              isLoading
              skeletonCount={6}
              onCardClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ServicesPage = ({
  initialServiceSlug,
}: {
  initialServiceSlug?: string;
}) => {
  const t = useTranslations("services");
  const t_home = useTranslations("home");
  const { services, isLoading } = useServices();
  const [deepLinkedService, setDeepLinkedService] = useState<Service | null>(
    null,
  );
  const [deepLinkOpen, setDeepLinkOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "featured" | "service" | "product"
  >("all");
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleWhatsAppChat = useCallback(() => {
    const whatsappUrl = getWhatsAppUrl(t_home("defaultWhatsAppMessage"));
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
  }, [t_home]);

  const filteredServices = useMemo(() => {
    let filtered = services;
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower),
      );
    }
    if (filterType === "featured") {
      filtered = filtered.filter((service) => service.is_featured);
    } else if (filterType === "service") {
      filtered = filtered.filter((service) => service.type === "SERVICE");
    } else if (filterType === "product") {
      filtered = filtered.filter((service) => service.type === "PRODUCT");
    }
    return filtered;
  }, [services, debouncedSearchTerm, filterType]);

  const separated = useMemo(
    () => ({
      services: filteredServices.filter((s) => s.type === "SERVICE"),
      products: filteredServices.filter((s) => s.type === "PRODUCT"),
    }),
    [filteredServices],
  );

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: t("filters.all") },
      { value: "featured" as const, label: t("filters.featured") },
      { value: "service" as const, label: t("filters.service") },
      { value: "product" as const, label: t("filters.product") },
    ],
    [t],
  );

  const handleWhatsAppContact = useCallback((service: Service) => {
    const message = `Hola! Estoy interesado en el servicio "${service.title}". ¿Podrían proporcionarme más información?`;
    const whatsappUrl = getWhatsAppUrl(message);
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
  }, []);

  const getFilterLabel = useCallback(
    (value: "all" | "featured" | "service" | "product") => {
      switch (value) {
        case "all":
          return t("filters.all");
        case "featured":
          return t("filters.featured");
        case "service":
          return t("filters.service");
        case "product":
          return t("filters.product");
        default:
          return t("filters.all");
      }
    },
    [t],
  );

  // ─── URL / deep-link helpers ────────────────────────────────────────────────

  const buildServicesPath = useCallback(
    (slug?: string) => {
      if (slug) return `/${slug}`;
      const parts = pathname.split("/").filter(Boolean);
      const base =
        parts.length >= 2 && parts[1] === "services"
          ? `/${parts[0]}/services`
          : "/services";
      return base;
    },
    [pathname],
  );

  const closeDeepLink = useCallback(() => {
    setDeepLinkOpen(false);
    setDeepLinkedService(null);
    router.replace(buildServicesPath());
  }, [buildServicesPath, router]);

  const updateSlugInHistory = useCallback(
    (service: Service) => {
      if (!service.slug) return;
      window.history.pushState(null, "", buildServicesPath(service.slug));
    },
    [buildServicesPath],
  );

  const resetSlugInHistory = useCallback(() => {
    window.history.replaceState(null, "", buildServicesPath());
  }, [buildServicesPath]);

  // ─── Deep-link on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialServiceSlug) return;
    const match = services.find((s) => s.slug === initialServiceSlug);
    if (match) {
      const updated = services.find((s) => s.id === match.id);
      setDeepLinkedService(updated || match);
      setDeepLinkOpen(true);
      return;
    }
    const fetchOne = async () => {
      try {
        const res = await fetch(
          getApiEndpoint(`/api/services/${initialServiceSlug}/`),
          { headers: { "Content-Type": "application/json" } },
        );
        if (!res.ok) return;
        const data = await res.json();
        setDeepLinkedService(data);
        setDeepLinkOpen(true);
      } catch {
        // ignore
      }
    };
    fetchOne();
  }, [initialServiceSlug, services]);

  // ─── Card click handler (shared for products & services grids) ──────────────

  const handleCardClick = useCallback(
    (service: Service) => {
      const updated = services.find((s) => s.id === service.id);
      setDeepLinkedService(updated || service);
      setDeepLinkOpen(true);
      updateSlugInHistory(service);
    },
    [services, updateSlugInHistory],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <ServicesPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <ServiceAppleDetailsModal
        service={deepLinkedService}
        isOpen={deepLinkOpen}
        onClose={closeDeepLink}
        showContact={true}
        onContact={handleWhatsAppContact}
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === "success" ? 3000 : 5000}
        />
      )}

      {/* Banner with search + filter */}
      <Banner
        title={t("productsAndServicesTitle")}
        subtitle={t("productsAndServicesDescription")}
        backgroundImage={"/static/backgrounds/services_background.webp"}
      >
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative z-10 mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#0255D5] dark:border-[#7DB5FF] dark:focus:border-[#7DB5FF]"
              />
            </div>
            <div className="relative z-50">
              <Dropdown
                options={filterOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                value={filterType}
                onChange={(value) =>
                  setFilterType(
                    value as "all" | "featured" | "service" | "product",
                  )
                }
                icon={Filter}
                minWidth="250px"
                placeholder={getFilterLabel(filterType)}
              />
            </div>
          </div>
        </div>
      </Banner>

      {/* Bento grids */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("noResults.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("noResults.description")}
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {/* Products grid */}
              {separated.products.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-[#623CEA] dark:text-[#8B5FF7]">
                    {t("productsSectionTitle")}
                  </h2>
                  <ServiceBentoGrid
                    services={separated.products}
                    onCardClick={handleCardClick}
                    infiniteScroll
                  />
                </div>
              )}

              {/* Services grid */}
              {separated.services.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-[#0255D5] dark:text-[#7DB5FF]">
                    {t("servicesSectionTitle")}
                  </h2>
                  <ServiceBentoGrid
                    services={separated.services}
                    onCardClick={handleCardClick}
                    infiniteScroll
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0255D5] dark:from-[#7DB5FF] to-[#01388A] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white text-[#0255D5] dark:text-[#7DB5FF] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
              onClick={() => {
                const subject = encodeURIComponent(t("cta.emailSubject"));
                const body = encodeURIComponent(t("cta.emailBody"));
                window.location.href = `mailto:info@ordinaly.ai?subject=${subject}&body=${body}`;
              }}
            >
              <Mail className="w-5 h-5 mr-2" />
              {t("cta.contact")}
            </Button>
          </div>
        </div>
      </section>

      <UseCasesSection t={t_home} />
      <SeoArticleSectionLazy t={t_home} onWhatsApp={handleWhatsAppChat} />
      <Footer />
    </div>
  );
};

export default ServicesPage;
