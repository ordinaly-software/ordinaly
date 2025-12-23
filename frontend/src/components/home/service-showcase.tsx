"use client";

import { Button } from "@/components/ui/button";
import ErrorCard from "@/components/ui/error-card";
import { Card, CardHeader } from "@/components/ui/card";
import { ServiceAppleCarousel } from "@/components/services/service-apple-carousel";
import React from "react";

import type { Service } from "@/hooks/useServices";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export interface ServiceShowcaseProps {
  services: Service[];
  isLoading: boolean;
  isOnVacation: boolean;
  error: string | null;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  refetch: () => void;
  onContact?: (service: Service) => void;
}

const ServiceShowcase: React.FC<ServiceShowcaseProps> = (props) => {
  const router = useRouter();
  // --- RETURN COMPONENT JSX ---
  return (
    <>
      {(() => {
        const { isLoading, isOnVacation, error, t, refetch, services, onContact } = props;
        if (isLoading) {
          return (
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
          );
        } else if (isOnVacation) {
          return (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto bg-white dark:bg-[#23272F] rounded-xl shadow-lg p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#1F8A0D]/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1F8A0D] dark:text-[#7CFC00]">
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
          );
        } else if (error) {
          return (
            <ErrorCard
              title={t('services.errorTitle')}
              message={t('services.errorMessage')}
              buttonText={t('services.retryButton')}
              onRetry={refetch}
            />
          );
        } else if (services.length > 0) {
          return (
            <ServiceAppleCarousel
              services={services}
              labels={{
                featured: t("services.featured"),
                contactForQuote: t("services.contactForQuote"),
                viewDetails: t("services.viewDetails"),
                price: t("services.price"),
                duration: t("services.duration"),
                durationDay: t("services.durationDay"),
                durationDays: t("services.durationDays"),
                requisites: t("services.requisites"),
                none: t("services.contactForQuote"),
                video: t("services.video"),
                playVideo: t("services.playVideo"),
              }}
              onContact={onContact}
              variant="compact"
            />
          );
        } else {
          return (
            <div className="text-center py-8 text-gray-700 dark:text-gray-200">
              {t("services.noServices")}
            </div>
          );
        }
      })()}
      {/* View All Services Button */}
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/services')}
          className="bg-transparent border-2 border-[#1F8A0D] text-[#1F8A0D] hover:bg-[#0d6e0c] hover:text-white dark:border-[#7CFC00] dark:text-[#7CFC00] dark:hover:bg-[#7CFC00] dark:hover:text-black transition-all duration-300 px-6 py-3 text-base font-semibold rounded-full shadow-md hover:shadow-lg hover:shadow-[#1F8A0D]/20 group"
        >
          {props.t("services.viewAllServicesAndProducts")}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </>
  );
};

export default ServiceShowcase;
