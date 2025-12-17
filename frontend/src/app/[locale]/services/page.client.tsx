"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Banner from '@/components/ui/banner';
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import { Service, useServices } from "@/hooks/useServices";
import {
  Search,
  Filter,
  Mail,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { SeoArticleSection } from "@/components/home/home-sections";
import { ServiceAppleCarousel } from "@/components/services/service-apple-carousel";
import { ServiceAppleDetailsModal } from "@/components/services/service-apple-details-modal";
import { usePathname, useRouter } from "next/navigation";
import { getApiEndpoint } from "@/lib/api-config";

// Dynamic imports for components that might not be immediately needed
const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false });

const ServicesPage = ({ initialServiceSlug }: { initialServiceSlug?: string }) => {
  const t = useTranslations("services");
  const t_home = useTranslations("home");
  const { services, isLoading } = useServices();
  const [deepLinkedService, setDeepLinkedService] = useState<Service | null>(null);
  const [deepLinkOpen, setDeepLinkOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // Add filter for type: all, product, service, featured
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'service' | 'product'>('all');
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleWhatsAppChat = useCallback(() => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
    const message = encodeURIComponent(t_home('defaultWhatsAppMessage'));
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }, [t_home]);

  // Memoized filtered services
  // Filter and separate products/services
  const filteredServices = useMemo(() => {
    let filtered = services;
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }
    if (filterType === 'featured') {
      filtered = filtered.filter(service => service.is_featured);
    } else if (filterType === 'service') {
      filtered = filtered.filter(service => service.type === 'SERVICE');
    } else if (filterType === 'product') {
      filtered = filtered.filter(service => service.type === 'PRODUCT');
    }
    return filtered;
  }, [services, debouncedSearchTerm, filterType]);

  // Separate into products and services for display
  const separated = useMemo(() => {
    return {
      services: filteredServices.filter(s => s.type === 'SERVICE'),
      products: filteredServices.filter(s => s.type === 'PRODUCT'),
    };
  }, [filteredServices]);

  // Memoized filter options
  // New filter options for type
  const filterOptions = useMemo(() => [
    { value: 'all' as const, label: t("filters.all") },
    { value: 'featured' as const, label: t("filters.featured") },
    { value: 'service' as const, label: t("filters.service") },
    { value: 'product' as const, label: t("filters.product") },
  ], [t]);

  const handleWhatsAppContact = useCallback((service: Service) => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en el servicio "${service.title}". ¿Podrían proporcionarme más información?`
    );
    // Spanish phone number format: +34 followed by 9 digits
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${message}`;
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  }, []);

  const getFilterLabel = useCallback((value: 'all' | 'featured' | 'service' | 'product') => {
    switch (value) {
      case 'all':
        return t("filters.all");
      case 'featured':
        return t("filters.featured");
      case 'service':
        return t("filters.service");
      case 'product':
        return t("filters.product");
      default:
        return t("filters.all");
    }
  }, [t]);

  const carouselLabels = useMemo(
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
      video: t_home("services.video"),
      playVideo: t_home("services.playVideo"),
    }),
    [t, t_home],
  );

  useEffect(() => {
    if (!initialServiceSlug) return;
    const match = services.find((s) => s.slug === initialServiceSlug);
    if (match) {
      setDeepLinkedService(match);
      setDeepLinkOpen(true);
      return;
    }
    const fetchOne = async () => {
      try {
        const res = await fetch(getApiEndpoint(`/api/services/${initialServiceSlug}/`), {
          headers: { "Content-Type": "application/json" },
        });
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

  const buildServicesPath = useCallback(
    (slug?: string) => {
      const parts = pathname.split("/").filter(Boolean);
      const base =
        parts.length >= 2 && parts[1] === "services" ? `/${parts[0]}/services` : "/services";
      return slug ? `${base}/${slug}` : base;
    },
    [pathname],
  );

  const handleServiceSelect = useCallback(
    (service: Service) => {
      if (!service.slug) return;
      router.push(buildServicesPath(service.slug));
    },
    [buildServicesPath, router],
  );

  const closeDeepLink = useCallback(() => {
    setDeepLinkOpen(false);
    setDeepLinkedService(null);
    router.replace(buildServicesPath());
  }, [buildServicesPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22A60D]"></div>
        </div>
      </div>
    );
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
      {/* Alert Component */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === 'success' ? 3000 : 5000}
        />
      )}

      {/* Banner Section (generalized) */}
      <Banner
        title={t('productsAndServicesTitle')}
        subtitle={t('productsAndServicesDescription')}
        backgroundImage={'/static/backgrounds/services_background.webp'}
      >
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative z-10 mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center relative">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
              />
            </div>

            {/* Filter */}
            <div className="relative z-50">
              <Dropdown
                options={filterOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                value={filterType}
                onChange={(value) => setFilterType(value as 'all' | 'featured' | 'service' | 'product')}
                icon={Filter}
                minWidth="250px"
                placeholder={getFilterLabel(filterType)}
              />
            </div>
          </div>
        </div>
      </Banner>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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
            <>
              {/* Products Section */}
              {separated.products.length > 0 && (
                <div className="mb-12 space-y-6">
                  <h2 className="text-3xl font-bold mb-6 text-[#623CEA] dark:text-[#8B5FF7]">
                    {t("productsSectionTitle")}
                  </h2>
                  <ServiceAppleCarousel
                    services={separated.products}
                    labels={carouselLabels}
                    onSelect={handleServiceSelect}
                    onContact={handleWhatsAppContact}
                  />
                </div>
              )}
              {/* Services Section */}
              {separated.services.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold mb-6 text-[#22A60D] dark:text-[#22C55E]">
                    {t("servicesSectionTitle")}
                  </h2>
                  <ServiceAppleCarousel
                    services={separated.services}
                    labels={carouselLabels}
                    onSelect={handleServiceSelect}
                    onContact={handleWhatsAppContact}
                    initialScroll={separated.products.length > 0 ? 150 : 0}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#22A60D] to-[#22A010] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white text-[#22A60D] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
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

      {/* SEO Article Section */}
      <SeoArticleSection t={t_home} onWhatsApp={handleWhatsAppChat} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServicesPage;
