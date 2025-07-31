"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/home/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import Alert from "@/components/ui/alert";
import Image from "next/image";
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
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  X,
  ChevronDown,
  Check
} from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  featured: boolean;
}

const ServicesPage = () => {
  const t = useTranslations("services");
  const tHome = useTranslations("home");
  const [isDark, setIsDark] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
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

  // Service icons mapping
  const serviceIcons: { [key: string]: any } = {
    'Custom Web Development': Code,
    'Mobile App Development': Smartphone,
    'UI/UX Design': Palette,
    'Cloud Migration Services': Cloud,
    'Technical Consulting': Users,
    'DevOps Implementation': Settings,
    'API Development': Database,
    'Database Optimization': Database,
  };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by featured status
    if (filterFeatured === 'featured') {
      filtered = filtered.filter(service => service.featured);
    } else if (filterFeatured === 'standard') {
      filtered = filtered.filter(service => !service.featured);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, filterFeatured]);

  const fetchServices = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/services/`);
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setAlert({type: 'error', message: 'Failed to load services'});
      }
    } catch (error) {
      setAlert({type: 'error', message: 'Network error while loading services'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactService = (service: Service) => {
    setSelectedService(service);
    setContactForm(prev => ({
      ...prev,
      service: service.title
    }));
    setShowContactModal(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setAlert({type: 'error', message: 'Please fill in all required fields'});
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/contact/`, {
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
        setShowContactModal(false);
        setSelectedService(null);
      } else {
        setAlert({type: 'error', message: 'Failed to send message. Please try again.'});
      }
    } catch (error) {
      setAlert({type: 'error', message: 'Network error. Please check your connection.'});
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getServiceIcon = (title: string) => {
    const IconComponent = serviceIcons[title] || Globe;
    return IconComponent;
  };

  const getFilterLabel = (value: 'all' | 'featured' | 'standard') => {
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
  };

  const filterOptions = [
    { value: 'all' as const, label: t("filters.all") },
    { value: 'featured' as const, label: t("filters.featured") },
    { value: 'standard' as const, label: t("filters.standard") }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29BF12]"></div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#29BF12]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#29BF12] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#29BF12] dark:focus:border-[#29BF12]"
                />
              </div>

              {/* Filter */}
              <div className="relative filter-dropdown-container">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#29BF12] dark:focus:border-[#29BF12] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#29BF12]/20"
                  >
                    <span className="truncate">{getFilterLabel(filterFeatured)}</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showFilterDropdown ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {showFilterDropdown && (
                  <div className="absolute top-full left-6 mt-2 w-[200px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterFeatured(option.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 flex items-center justify-between ${
                          filterFeatured === option.value 
                            ? 'bg-[#29BF12]/10 text-[#29BF12] dark:bg-[#29BF12]/20' 
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {filterFeatured === option.value && (
                          <Check className="h-4 w-4 text-[#29BF12]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
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
              {filteredServices.map((service, index) => {
                const IconComponent = getServiceIcon(service.title);
                return (
                  <Card
                    key={service.id}
                    className={`group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#29BF12] transition-all duration-500 hover:shadow-2xl hover:shadow-[#29BF12]/10 transform hover:-translate-y-2 ${
                      service.featured ? 'ring-2 ring-[#29BF12]/20' : ''
                    }`}
                  >
                    {service.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-[#29BF12] to-[#22A010] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
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
                            ? 'bg-gradient-to-br from-[#29BF12] to-[#22A010] text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#29BF12]/20 to-[#623CEA]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      </div>

                      {/* Service Title */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#29BF12] transition-colors duration-300">
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
                              <CheckCircle className="w-4 h-4 text-[#29BF12]" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => handleContactService(service)}
                          className="flex-1 bg-gradient-to-r from-[#29BF12] to-[#22A010] hover:from-[#22A010] hover:to-[#1E8B0C] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t("contactUs")}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#29BF12] text-[#29BF12] hover:bg-[#29BF12] hover:text-white transition-all duration-300 h-12"
                        >
                          {t("learnMore")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>

                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#29BF12]/5 to-[#623CEA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#29BF12] to-[#22A010] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowContactModal(true)}
              className="bg-white text-[#29BF12] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              {t("cta.contact")}
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#29BF12] transition-all duration-300 px-8 py-3 text-lg font-semibold"
            >
              <Phone className="w-5 h-5 mr-2" />
              {t("cta.call")}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedService(null);
          setContactForm({
            name: '',
            email: '',
            phone: '',
            company: '',
            message: '',
            service: ''
          });
        }}
        title={selectedService ? `${t("contact.title")} - ${selectedService.title}` : t("contact.title")}
        showHeader={true}
      >
        <form onSubmit={handleContactSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("contact.name")} *
              </label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                placeholder={t("contact.namePlaceholder")}
                required
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("contact.email")} *
              </label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                placeholder={t("contact.emailPlaceholder")}
                required
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("contact.phone")}
              </label>
              <Input
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                placeholder={t("contact.phonePlaceholder")}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("contact.company")}
              </label>
              <Input
                value={contactForm.company}
                onChange={(e) => setContactForm(prev => ({...prev, company: e.target.value}))}
                placeholder={t("contact.companyPlaceholder")}
                className="h-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("contact.service")}
            </label>
            <Input
              value={contactForm.service}
              onChange={(e) => setContactForm(prev => ({...prev, service: e.target.value}))}
              placeholder={t("contact.servicePlaceholder")}
              className="h-12"
              readOnly={!!selectedService}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("contact.message")} *
            </label>
            <Textarea
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
              placeholder={t("contact.messagePlaceholder")}
              rows={4}
              required
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowContactModal(false)}
              className="px-6"
            >
              {t("contact.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-[#29BF12] hover:bg-[#22A010] text-white px-6"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t("contact.send")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <Footer isDark={isDark} />
    </div>
  );
};

export default ServicesPage;
