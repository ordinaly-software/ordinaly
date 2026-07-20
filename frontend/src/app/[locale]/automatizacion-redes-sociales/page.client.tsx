"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Footer from "@/components/ui/footer";
import ContactForm from "@/components/ui/contact-form.client";
import { ServiceCard } from "@/components/services/service-card";
import type { Service } from "@/hooks/useServices";
import TimelineHorizontal from "@/components/ui/TimelineHorizontal";
import { SecurityRequirements } from "@/components/ui/security-requirements";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

const FAKE_SERVICE_BASE: Pick<
  Service,
  "id" | "type" | "description" | "clean_description" | "is_featured" | "icon" | "color" | "created_at" | "updated_at"
> = {
  id: -1,
  type: "SERVICE",
  description: "",
  clean_description: "",
  is_featured: false,
  icon: "share-2",
  color: "arcilla",
  created_at: "",
  updated_at: "",
};

export default function AutomatizacionRedesSocialesPage() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizacion-redes-sociales"];

  if (!content) throw new Error("Missing content: automatizacion-redes-sociales");

  const contactHref = content.pricing?.ctaHref ?? "#formulario";

  const openContact = () => {
    if (contactHref.startsWith("http")) {
      window.open(contactHref, "_blank", "noopener,noreferrer");
    } else {
      document.querySelector(contactHref)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const metaService: Service = {
    ...FAKE_SERVICE_BASE,
    title: content.cards?.meta?.label ?? "Instagram + Facebook (Meta)",
    image: "/static/mail/meta.png",
    color_hex: "#d97757",
  };

  const linkedinService: Service = {
    ...FAKE_SERVICE_BASE,
    title: content.cards?.linkedin?.label ?? "LinkedIn",
    image: "/static/mail/linkedin.png",
    color_hex: "#0A66C2",
  };

  return (
    <div className="relative bg-white dark:bg-neutral-900">

      {/* HERO */}
      <section className="relative w-full min-h-[36rem] flex items-center justify-center overflow-hidden py-24 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
          style={{ backgroundImage: "url('/static/automatizacion-redes-sociales/automatizacion-redes-sociales.webp')" }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-xl leading-tight">
            {content.title}
          </h1>
          <p className="mt-4 text-neutral-200 text-lg md:text-xl max-w-2xl">
            {content.subtitle}
          </p>
          <p className="mt-6 text-neutral-300 max-w-2xl leading-relaxed">
            {content.heroText}
          </p>

          <a
            href="#formulario"
            className="mt-10 px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: "#d97757" }}
          >
            {content.heroCtaLabel}
          </a>
        </div>
      </section>

      {/* PLATFORM CARDS */}
      <section className="py-20 md:py-24 px-6 bg-white dark:bg-neutral-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
          {content.sectionTitles?.cards}
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <div className="flex flex-col gap-5">
            <ServiceCard
              service={metaService}
              onClick={openContact}
              viewDetailsLabel={content.cards?.meta?.ctaLabel}
              className="min-h-[380px]"
            />
            <ul className="space-y-2">
              {(content.cards?.meta?.bullets ?? []).map((bullet: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#d97757]" />
                  {bullet}
                </li>
              ))}
            </ul>
            {content.cards?.meta?.price && (
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {content.cards.meta.price}
                {content.cards.meta.priceNote && (
                  <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                    {content.cards.meta.priceNote}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <ServiceCard
              service={linkedinService}
              onClick={openContact}
              viewDetailsLabel={content.cards?.linkedin?.ctaLabel}
              className="min-h-[380px]"
            />
            <ul className="space-y-2">
              {(content.cards?.linkedin?.bullets ?? []).map((bullet: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#0A66C2]" />
                  {bullet}
                </li>
              ))}
            </ul>
            {content.cards?.linkedin?.price && (
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {content.cards.linkedin.price}
                {content.cards.linkedin.priceNote && (
                  <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                    {content.cards.linkedin.priceNote}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {content.offer && (
          <div className="mt-12 max-w-2xl mx-auto rounded-2xl border-2 border-dashed border-[#d97757] bg-[#d97757]/5 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d97757] mb-2">
              {content.offer.label}
            </p>
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{content.offer.price}</span>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-sm">{content.offer.note}</p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-24 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
          {content.sectionTitles?.howItWorks}
        </h2>
        <TimelineHorizontal steps={content.steps ?? []} />
      </section>

      {/* SECURITY + REQUIREMENTS */}
      <SecurityRequirements
        trustTitle={content.sectionTitles?.security}
        trustPoints={content.security?.trustPoints ?? []}
        requirementsTitle={content.sectionTitles?.requirements}
        requirements={content.security?.requirements ?? []}
        pricing={content.pricing}
        accentClassName="text-[#d97757]"
      />

      {/* FORM */}
      <section id="formulario" className="py-20 bg-white dark:bg-neutral-900">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-redes-sociales-contact">
          <ContactForm />
        </ReCaptchaWrapper>
      </section>
      

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
