"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import ContactForm from "@/components/ui/contact-form.client";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { RichText } from "@/components/ui/highlight";
import { CampaignFooter, CampaignNavbar } from "@/components/campaign/campaign-navbar-footer";
import GoogleTagManager from "@/components/analytics/google-tag-manager";
import { FloatingCta } from "@/components/landing/floating-cta";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import ReCaptchaWrapper from "../recaptcha-provider";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

// Ad campaign version of /implantacion-odoo: same copy and components,
// trimmed down so the only way forward is the form.

// Short FAQ: only the questions that matter before asking for a quote (by position in technologyFaqs).
const FAQ_INDEXES = [0, 1, 5, 7];
export default function OdooCampaign() {
  const messages = useMessages() as any;
  const content = messages.landings?.["implantacion-odoo"];

  if (!content) {
    throw new Error("Missing landing content: implantacion-odoo");
  }

  const pricingTable = content.pricing;
  const infoCardTexts = (content.infocards?.cards ?? []) as { name: string; description?: string }[];

  const infocards: InfoCardItem[] = [
    { key: "erp", size: "xl", title: infoCardTexts[0]?.name, description: infoCardTexts[0]?.description, image: "/static/implantacion-odoo/erp.webp" },
    { key: "modules", size: "xl", title: infoCardTexts[1]?.name, description: infoCardTexts[1]?.description, image: "/static/implantacion-odoo/modules.webp" },
    { key: "automation", size: "md", title: infoCardTexts[2]?.name, description: infoCardTexts[2]?.description, image: "/static/servicios/software.webp" },
    { key: "verifactu", size: "md", title: infoCardTexts[3]?.name, description: infoCardTexts[3]?.description, image: "/static/implantacion-odoo/verifactu.webp" },
    { key: "vps", size: "sm", title: infoCardTexts[4]?.name, description: infoCardTexts[4]?.description, image: "/static/servicios/vps.webp" },
    { key: "software", size: "sm", title: infoCardTexts[5]?.name, description: infoCardTexts[5]?.description },
    { key: "sensitive-data", size: "sm", title: infoCardTexts[6]?.name, description: infoCardTexts[6]?.description, image: "/static/servicios/sensitive_data.webp" },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">
      <GoogleTagManager />
      <CampaignNavbar />

      {/* HERO */}
      <section id="inicio" className="scroll-mt-24 relative w-full overflow-x-clip pt-20 pb-14 md:pt-24 md:pb-20 px-6 bg-white dark:bg-neutral-900 transition-colors">
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 md:gap-8">
            <h1 className="text-balance text-neutral-900 dark:text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <RichText text={content.heroTitle ?? content.title} className="hl-hero" />
            </h1>
            <Image
              src="/static/implantacion-odoo/odoo_badge.webp"
              alt={content.heroBadgeAlt}
              width={144}
              height={144}
              className="h-20 w-20 shrink-0 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain"
            />
          </div>

          <p className="mt-6 text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">{content.heroText}</p>

          <a
            href="#formulario"
            className="mt-10 px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: "var(--swatch--clay-fill)" }}
          >
            {content.heroCtaLabel}
          </a>
        </div>
      </section>

      {/* HERO IMAGE */}
      <section className="px-6 pt-10 pb-0 md:pt-14 md:pb-0 bg-neutral-100 dark:bg-neutral-800 transition-colors">
        <div className="relative mx-auto max-w-5xl aspect-[1760/705] overflow-hidden rounded-2xl">
          <Image
            src="/static/implantacion-odoo/implantacion_odoo_sin_texto.webp"
            alt={content.title}
            width={1760}
            height={705}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="size-full object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* INFO CARDS */}
      <section id="beneficios" className="scroll-mt-24 py-20 md:py-28 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* VERIFACTU + PRICING */}
      {content.verifactu && (
        <section id="precios" className="scroll-mt-24 py-20 md:py-28 px-6 bg-white dark:bg-neutral-900 transition-colors">
          <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                {content.verifactu.title}
              </h2>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                <RichText text={content.verifactu.paragraphs[0]} className="hl-yellow" />
              </p>
              <ul className="mb-4 list-disc pl-6 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {content.verifactu.deadlines.map((d: string) => (
                  <li key={d}><RichText text={d} className="hl-yellow" /></li>
                ))}
              </ul>
              {content.verifactu.paragraphs.slice(1).map((p: string, i: number) => (
                <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                  <RichText text={p} className="hl-yellow" />
                </p>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                {content.verifactu.startTitle}
              </h3>
              <div className="overflow-hidden border border-[#d6d1ca] bg-white">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-clay-fill text-white">
                      <th className="w-[46%] border-r border-white/40 px-3 py-4 text-center text-sm font-bold md:text-base">
                        {pricingTable.headers[0]}
                      </th>
                      <th className="w-[28%] border-r border-white/40 px-3 py-4 text-center text-sm font-bold md:text-base">
                        {pricingTable.headers[1]}
                      </th>
                      <th className="w-[26%] px-3 py-4 text-center text-sm font-bold md:text-base">
                        {pricingTable.headers[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTable.rows.map((row: string[], i: number) => (
                      <tr key={row[0]} className={i % 2 ? "bg-[#f8e2d1]" : "bg-white"}>
                        <td className="border-r border-[#ddd6cf] px-3 py-5 text-sm font-bold text-black md:text-base">{row[0]}</td>
                        <td className="border-r border-[#ddd6cf] px-3 py-5 text-center text-sm font-bold text-black md:text-base">{row[1]}</td>
                        <td className="px-3 py-5 text-center text-sm text-black md:text-base">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#formulario"
                  className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition hover:scale-105"
                  style={{ backgroundColor: "var(--swatch--clay-fill)" }}
                >
                  {pricingTable.ctaLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQS — without the links to external sites */}
      {content.technologyFaqs?.length > 0 && (
        <div id="preguntas-frecuentes" className="scroll-mt-24">
          <FaqAccordion
            className="bg-neutral-50 dark:bg-neutral-800 transition-colors"
            title={content.sectionTitles?.technologyFaqs}
            description={content.sectionTitles?.technologyFaqsSubtitle}
            items={FAQ_INDEXES.map((i) => content.technologyFaqs[i]).filter(Boolean).map(
              (faq: { tag: string; question: string; answer: string; answerEmphasis?: string }) => ({
                question: faq.question,
                tag: faq.tag,
                answer: faq.answerEmphasis ? (
                  <>
                    {faq.answer}
                    <strong>{faq.answerEmphasis}</strong>
                  </>
                ) : (
                  faq.answer
                ),
              }),
            )}
          />
        </div>
      )}

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-odoo-campaign">
          <ContactForm
            recaptchaAction="campaign_form"
            recaptchaBadgeId="recaptcha-badge-odoo-campaign"
            redirectTo="/gracias?origen=odoo"
          />
        </ReCaptchaWrapper>
      </section>

      <CampaignFooter />
      <FloatingCta href="https://wa.me/34626270806" label={content.secondaryCtaLabel} />
      <WhatsAppBubble />
    </div>
  );
}
