"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ServicesShowcaseGrid } from "@/components/services/services-showcase-grid";
import { ToolsShowcase } from "@/components/services/tools-showcase";
import { UseCasesSection } from "@/components/home/use-cases-section";
import { NewsletterSection } from "@/components/ui/newsletter-section";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false });
const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const ServicesPage = () => {
  const t = useTranslations("services");
  const t_home = useTranslations("home");

  return (
    <div className="min-h-screen bg-[--color-bg-primary] dark:bg-[--color-bg-inverted] text-slate-medium dark:text-cloud-medium transition-colors duration-300">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative mb-10 overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-800 aspect-[21/6]">
            <Image
              src="/static/servicios/banner-productos.png"
              alt={t("showcase.bannerAlt")}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <div className="text-center mb-12">
            <p className="text-4xl md:text-5xl font-bold mb-4 text-slate-dark dark:text-ivory-light">
              {t("showcase.title")}
            </p>
            <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-3xl mx-auto">
              {t("showcase.subtitle")}
            </p>
          </div>

          <ServicesShowcaseGrid />
        </div>
      </section>

      <ToolsShowcase eyebrow={t("toolsEyebrow")} title={t("toolsTitle")} />

      <UseCasesSection t={t_home} id="use-cases" />

      <NewsletterSection />
      <WhatsAppBubble />
      <Footer />
    </div>
  );
};

export default ServicesPage;
