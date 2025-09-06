"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Banner from '@/components/ui/banner';
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import { Service, useServices } from "@/hooks/useServices";
import { renderIcon } from "@/components/ui/icon-select";
import { truncateText } from "@/utils/text";
import {
  Search,
  Filter,
  Star,
  ArrowRight,
  Clock,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";

// Dynamic imports for components that might not be immediately needed
const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false });
const ServiceDetailsModal = dynamic(() => import("@/components/services/service-details-modal").then(mod => ({ default: mod.ServiceDetailsModal })), { ssr: false });

const ServicesPage = () => {
  const t = useTranslations("services");
  const { services, isLoading } = useServices();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // Add filter for type: all, product, service, featured
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'service' | 'product'>('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handleMoreInfo = useCallback((service: Service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  }, []);

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

  // Memoized service card component
  const ServiceCard = React.memo(({ service }: { service: Service }) => {
    const getServiceColor = (service: Service) => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      if (service.color === '1A1924' && isDarkMode) {
        return '#efefefbb';
      } else if (service.color === '623CEA' && isDarkMode) {
        return '#8B5FF7';
      }
      return service.color_hex;
    };
    
    const serviceColor = getServiceColor(service);
    
    return (
      <Card
        key={service.id}
        className={`group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 ${
          service.is_featured ? 'ring-2 ring-opacity-20' : ''
        }`}
        style={{
          '--hover-border-color': serviceColor,
          '--hover-shadow-color': `${serviceColor}10`,
          '--ring-color': serviceColor
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = serviceColor;
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${serviceColor}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {service.is_featured && (
          <div className="absolute top-4 right-4 z-10">
            <div 
              className="text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              style={{ backgroundColor: serviceColor }}
            >
              <Star className="w-3 h-3 fill-current" />
              {t("featured")}
            </div>
          </div>
        )}

        <CardContent className="p-8">
          {/* Service Icon */}
          <div className="relative mb-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              style={{ 
                backgroundColor: service.is_featured 
                  ? serviceColor 
                  : `${serviceColor}10`
              }}
            >
              <div style={{ color: service.is_featured ? 'white' : serviceColor }}>
                {service.icon && renderIcon(service.icon, "w-8 h-8")}
              </div>
            </div>
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
              style={{ 
                background: `linear-gradient(to bottom right, ${serviceColor}20, ${serviceColor}20)` 
              }}
            ></div>
          </div>

          {/* Service Title */}
          <h3 
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 group-hover:opacity-90"
            style={{ '--hover-color': service.color_hex } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = serviceColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
            }}
          >
            {service.title}
          </h3>

          {/* Service Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg">
            {truncateText(service.clean_description, 180)}
          </p>

          {/* Service Details */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              {t("details")}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {/* Duration */}
              {service.duration && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="w-4 h-4" style={{ color: serviceColor }} />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">
                      {t("duration")}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {service.duration === 1 ? t("durationDay") : t("durationDays", { count: service.duration })}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <ExternalLink className="w-4 h-4" style={{ color: serviceColor }} />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">
                    {t("price")}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {service.price ? `€${service.price}` : t("contactForQuote") || "Contact for quote"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleWhatsAppContact(service)}
              className="flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 font-semibold"
              style={{
                backgroundColor: service.color_hex,
                borderColor: service.color_hex
              }}
              onMouseEnter={(e) => {
                const darker = service.color_hex + 'dd';
                e.currentTarget.style.backgroundColor = darker;
                e.currentTarget.style.borderColor = darker;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = service.color_hex;
                e.currentTarget.style.borderColor = service.color_hex;
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button
              onClick={() => handleMoreInfo(service)}
              variant="outline"
              className="flex-1 transition-all duration-300 h-12 font-semibold"
              style={{
                borderColor: serviceColor,
                color: serviceColor
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = serviceColor;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = serviceColor;
              }}
            >
              {t("learnMore")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>

        {/* Hover Effect Background */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ 
            background: `linear-gradient(to bottom right, ${serviceColor}05, ${serviceColor}05)` 
          }}
        ></div>
      </Card>
    );
  });

  ServiceCard.displayName = 'ServiceCard';

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
        backgroundVideo={'/static/backgrounds/services_background.mp4'}
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
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-[#623CEA] dark:text-[#8B5FF7]">
                    {t("productsSectionTitle")}
                  </h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {separated.products.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              )}
              {/* Services Section */}
              {separated.services.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-[#22A60D] dark:text-[#22C55E]">
                    {t("servicesSectionTitle")}
                  </h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {separated.services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
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
                window.location.href = `mailto:ordinalysoftware@gmail.com?subject=${subject}&body=${body}`;
              }}
            >
              <Mail className="w-5 h-5 mr-2" />
              {t("cta.contact")}
            </Button>
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedService}
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServicesPage;
