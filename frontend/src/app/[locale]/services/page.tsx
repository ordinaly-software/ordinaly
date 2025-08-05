"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Alert from "@/components/ui/alert";
import { getApiEndpoint, API_ENDPOINTS } from "@/lib/api-config";
import {
  Search,
  Filter,
  Star,
  Code,
  Smartphone,
  Palette,
  Cloud,
  Users,
  Settings,
  Database,
  Globe,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";

// Dynamic imports for components that might not be immediately needed
const Navbar = dynamic(() => import("@/components/ui/navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/home/footer"), { ssr: false });
const Modal = dynamic(() => import("@/components/ui/modal").then(mod => ({ default: mod.Modal })), { ssr: false });
const Textarea = dynamic(() => import("@/components/ui/textarea").then(mod => ({ default: mod.Textarea })), { ssr: false });
const ServiceDetailsModal = dynamic(() => import("@/components/home/service-details-modal").then(mod => ({ default: mod.ServiceDetailsModal })), { ssr: false });

interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  duration?: number;
  requisites?: string;
  price?: string | null;
  is_featured: boolean;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
}

const ServicesPage = () => {
  const t = useTranslations("services");
  const [isDark, setIsDark] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service: ''
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized service icons mapping
  const serviceIcons = useMemo<{ [key: string]: React.ComponentType<{ className?: string }> }>(() => ({
    'Custom Web Development': Code,
    'Mobile App Development': Smartphone,
    'UI/UX Design': Palette,
    'Cloud Migration Services': Cloud,
    'Technical Consulting': Users,
    'DevOps Implementation': Settings,
    'API Development': Database,
    'Database Optimization': Database,
  }), []);

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by featured status
    if (filterFeatured === 'featured') {
      filtered = filtered.filter(service => service.featured);
    } else if (filterFeatured === 'standard') {
      filtered = filtered.filter(service => !service.featured);
    }

    return filtered;
  }, [services, debouncedSearchTerm, filterFeatured]);

  // Memoized filter options
  const filterOptions = useMemo(() => [
    { value: 'all' as const, label: t("filters.all") },
    { value: 'featured' as const, label: t("filters.featured") },
    { value: 'standard' as const, label: t("filters.standard") }
  ], [t]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    fetchServices();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const fetchServices = useCallback(async () => {
    try {
      console.log('Fetching services from:', getApiEndpoint(API_ENDPOINTS.services));
      const response = await fetch(getApiEndpoint(API_ENDPOINTS.services));
      
      if (response.ok) {
        const data = await response.json();
        // Transform data to ensure compatibility
        const transformedData = data.map((service: Service) => ({
          ...service,
          featured: service.is_featured || service.featured || false
        }));
        setServices(transformedData);
      } else {
        setAlert({type: 'error', message: 'Failed to load services'});
      }
    } catch (err) {
      console.error('Network error:', err);
      
      // Check if it's a configuration error
      if (err instanceof Error && err.message.includes('NEXT_PUBLIC_API_URL')) {
        setAlert({type: 'error', message: 'Configuration error. Please contact support.'});
      } else {
        setAlert({type: 'error', message: 'Network error while loading services'});
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMoreInfo = useCallback((service: Service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  }, []);

  const handleWhatsAppContact = useCallback((service: Service) => {
    const message = encodeURIComponent(
      `Hola! Estoy interesado en el servicio "${service.title}". ¿Podrían proporcionarme más información?`
    );
    // Spanish phone number format: +34 followed by 9 digits
    const whatsappUrl = `https://wa.me/34655777777?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }, []);

  const handleContactSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setAlert({type: 'error', message: 'Please fill in all required fields'});
      return;
    }

    try {
      const response = await fetch(getApiEndpoint(API_ENDPOINTS.contact), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setAlert({type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.'});
        setContactForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          service: ''
        });
        setSelectedService(null);
      } else {
        setAlert({type: 'error', message: 'Failed to send message. Please try again.'});
      }
    } catch (err) {
      console.error('Network error:', err);
      setAlert({type: 'error', message: 'Network error. Please check your connection.'});
    }
  }, [contactForm]);

  const getServiceIcon = useCallback((title: string) => {
    const IconComponent = serviceIcons[title] || Globe;
    return IconComponent;
  }, [serviceIcons]);

  const getFilterLabel = useCallback((value: 'all' | 'featured' | 'standard') => {
    switch (value) {
      case 'all':
        return t("filters.all");
      case 'featured':
        return t("filters.featured");
      case 'standard':
        return t("filters.standard");
      default:
        return t("filters.all");
    }
  }, [t]);

  // Memoized service card component
  const ServiceCard = useMemo(() => ({ service }: { service: Service }) => {
    const IconComponent = getServiceIcon(service.title);
    return (
      <Card
        key={service.id}
        className={`group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-500 hover:shadow-2xl hover:shadow-[#22A60D]/10 transform hover:-translate-y-2 ${
          service.featured ? 'ring-2 ring-[#22A60D]/20' : ''
        }`}
      >
        {service.featured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-[#22A60D] to-[#22A010] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {t("featured")}
            </div>
          </div>
        )}

        <CardContent className="p-8">
          {/* Service Icon */}
          <div className="relative mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
              service.featured 
                ? 'bg-gradient-to-br from-[#22A60D] to-[#22A010] text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/20 to-[#9333EA]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </div>

          {/* Service Title */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#22A60D] transition-colors duration-300">
            {service.title}
          </h3>

          {/* Service Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg">
            {service.description}
          </p>

          {/* Features List */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              {t("includes")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                t("features.consultation"),
                t("features.development"),
                t("features.testing"),
                t("features.support")
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#22A60D]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleWhatsAppContact(service)}
              className="flex-1 bg-[#22A60D] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 border border-[#25D366] hover:border-[#20BA5A] font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button
              onClick={() => handleMoreInfo(service)}
              variant="outline"
              className="flex-1 border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white transition-all duration-300 h-12 font-semibold"
            >
              {t("learnMore")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>

        {/* Hover Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/5 to-[#9333EA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </Card>
    );
  }, [t, getServiceIcon, handleWhatsAppContact, handleMoreInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <Navbar isDark={isDark} setIsDark={setIsDark} />
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

      {/* Navigation */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E8F5E8] via-[#E6F7E6] to-[#F3E8FF] dark:from-[#22C55E]/5 dark:via-[#10B981]/5 dark:to-[#9333EA]/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <video
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/static/backgrounds/services_background.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/20 via-[#10B981]/20 to-[#9333EA]/20 blur-3xl transform scale-150"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-[#22C55E] dark:from-white dark:to-[#22C55E] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative z-10">
            <div className="flex flex-col md:flex-row gap-4 items-center relative">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
                />
              </div>

              {/* Filter */}
              <div className="relative z-50">
                <Dropdown
                  options={filterOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                  value={filterFeatured}
                  onChange={(value) => setFilterFeatured(value as 'all' | 'featured' | 'standard')}
                  icon={Filter}
                  minWidth="250px"
                  placeholder={getFilterLabel(filterFeatured)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
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
        onContact={() => {
          setShowServiceModal(false);
          if (selectedService) {
            handleWhatsAppContact(selectedService);
          }
        }}
      />

      {/* Footer */}
      <Footer isDark={isDark} />
    </div>
  );
};

export default ServicesPage;
