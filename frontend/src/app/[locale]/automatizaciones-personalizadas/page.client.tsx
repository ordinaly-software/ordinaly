"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import TimelineHorizontal from "@/components/ui/TimelineHorizontal";
import { SecurityRequirements } from "@/components/ui/security-requirements";
import { AutomationFlow } from "@/components/ui/automation-flow";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

export default function AutomatizacionesPersonalizadas() {
  const messages = useMessages() as any;
  const content = messages.landings?.["automatizaciones-personalizadas"];

  if (!content) {
    throw new Error("Missing landing content: automatizaciones-personalizadas");
  }

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="py-24 px-6 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[#d97757]">
              {content.title}
            </h1>

            <div className="mt-6 space-y-4 max-w-xl">
              {content.heroParagraphs?.map((p: string, i: number) => (
                <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <a
              href="#formulario"
              className="mt-10 inline-flex px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
              style={{ backgroundColor: "#d97757" }}
            >
              {content.heroCtaLabel}
            </a>
          </div>

          <AutomationFlow />
        </div>
      </section>

      {/* TEAM */}
      {content.team && (
        <section className="py-16 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-900 dark:text-white">
              {content.team.title}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {content.team.description}
            </p>
          </div>
        </section>
      )}

      {/* VENTAJAS */}
      <section className="py-20 md:py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
            {content.sectionTitles?.ventajas}
          </h2>
          <TimelineHorizontal steps={content.ventajas ?? []} />
        </div>
      </section>

      {/* SECURITY + PRICING */}
      <SecurityRequirements
        trustTitle={content.sectionTitles?.security}
        trustPoints={content.security?.trustPoints ?? []}
        pricing={content.pricing}
        accentClassName="text-[#d97706]"
      />

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-automatizaciones-personalizadas-contact">
          <ContactForm />
        </ReCaptchaWrapper>
      </section>

      <a
        href="https://wa.me/34626270806"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
        style={{ backgroundColor: "#d97757" }}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.64a12 12 0 0 0 5.74 1.46h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.4ZM12.05 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.74.97 1-3.64-.22-.37a9.28 9.28 0 0 1-1.42-4.9c0-5.14 4.18-9.32 9.33-9.32 2.49 0 4.83.97 6.6 2.73a9.27 9.27 0 0 1 2.73 6.6c0 5.15-4.18 9.33-9.33 9.33Zm5.13-6.96c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.9.14.19 1.96 3 4.75 4.2.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33Z" />
        </svg>
        <span>{content.secondaryCtaLabel}</span>
      </a>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
