import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { renderIcon } from "@/components/ui/icon-select";
import { truncateText } from "@/utils/text";

import type { Service } from "@/hooks/useServices";

export interface ServiceShowcaseProps {
  services: Service[];
  isLoading: boolean;
  isOnVacation: boolean;
  error: string | null;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  refetch: () => void;
  onServiceClick: (service: Service) => void;
}

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({
  services,
  isLoading,
  isOnVacation,
  error,
  t,
  refetch,
  onServiceClick,
}) => {
  // Helper for color
  const getServiceColor = (service: Service) => {
    const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    if (service.color === '1A1924' && isDarkMode) {
      return '#efefefbb';
    } else if (service.color === '623CEA' && isDarkMode) {
      return '#8B5FF7';
    }
    return service.color_hex;
  };

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#22A60D] dark:text-[#7CFC00]">{t("services.title")}</h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto">
            {t("services.description")}
          </p>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : isOnVacation ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white dark:bg-[#23272F] rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#22A60D]/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22A60D]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('services.vacationTitle')}
              </h3>
              <p className="text-gray-800 dark:text-gray-200 mb-6">
                {t('services.vacationMessage')}
              </p>
              <Button
                variant="outline"
                onClick={refetch}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {t('services.retryButton')}
              </Button>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white dark:bg-[#23272F] rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Error Loading Services
              </h3>
              <p className="text-gray-800 dark:text-gray-200 mb-6">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={refetch}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Try Again
              </Button>
            </div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const serviceColor = getServiceColor(service) ?? "#22A60D";
              return (
                <Card 
                  key={service.id} 
                  className={`bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer opacity-100`}
                  onClick={() => onServiceClick(service)}
                  style={{
                    '--hover-border-color': serviceColor,
                    '--hover-shadow-color': `${serviceColor}10`
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = serviceColor ?? "#22A60D";
                    e.currentTarget.style.boxShadow = `0 25px 50px -12px ${(serviceColor ?? "#22A60D")}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <CardHeader>
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${serviceColor ?? "#22A60D"}10` }}
                    >
                      <div style={{ color: serviceColor ?? "#22A60D" }}>
                        {service.icon && renderIcon(service.icon, `h-8 w-8`)}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{service.title}</CardTitle>
                    {service.subtitle && (
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{service.subtitle}</p>
                    )}
                    <CardDescription className="text-gray-800 dark:text-gray-200">
                      {truncateText(service.clean_description ?? "", 120)}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col">
                        {service.price && !isNaN(Number(service.price)) ? (
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">€{Math.round(Number(service.price))}</span>
                        ) : (
                          <span className="text-sm text-gray-800 dark:text-gray-200 italic">{t("services.contactForQuote")}</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          onServiceClick(service);
                        }}
                        className="transition-colors border-gray-300 text-gray-600 hover:text-white"
                        style={{
                          borderColor: serviceColor ?? "#22A60D",
                          color: serviceColor ?? "#22A60D"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = serviceColor ?? "#22A60D";
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = serviceColor ?? "#22A60D";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.color = serviceColor ?? "#22A60D";
                          e.currentTarget.style.borderColor = serviceColor ?? "#22A60D";
                        }}
                      >
                        {t("services.viewDetails")}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-700 dark:text-gray-200">
            {t("services.noServices")}
          </div>
        )}
        {/* View All Services Button */}
        <div className="text-center mt-12 scroll-animate fade-in-up">
          <Link href="/services">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#22A60D]/20"
            >
              {t("services.viewAllServices")}
              <svg
                aria-hidden="true"
                viewBox="0 0 10 10"
                height="16"
                width="16"
                fill="none"
                className="ml-2 stroke-current stroke-2"
              >
                <path
                  d="M0 5h7"
                  className="transition opacity-0 group-hover:opacity-100"
                />
                <path
                  d="M1 1l4 4-4 4"
                  className="transition group-hover:translate-x-[3px]"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
