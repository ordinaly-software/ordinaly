"use client";

import { useMessages } from "next-intl";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { RichText } from "@/components/ui/highlight";
import { CampaignFooter, CampaignHeader } from "@/components/campaign/campaign-chrome";
import ReCaptchaWrapper from "../recaptcha-provider";

// Ad campaign version of /auditoria-cumplimiento-ia: same copy and components,
// trimmed down so the only way forward is the form.
const HERO_IMAGE = "/static/servicios/engineers.webp";

// Short FAQ: price, timing, deliverable and fixes (by position in technologyFaqs).
const FAQ_INDEXES = [0, 2, 3, 4];

export default function AuditoriaCampaign() {
  const messages = useMessages() as any;
  const content = messages.landings?.["auditoria-cumplimiento-ia"];

  if (!content) {
    throw new Error("Missing landing content: auditoria-cumplimiento-ia");
  }

  const cards = (content.infocards?.cards ?? []) as { name: string; description?: string }[];
  const pricing = content.pricing;

  // Order and sizes alternate on purpose so the strip doesn't read as a uniform row.
  const cardLayout: { size: InfoCardItem["size"]; image?: string }[] = [
    { size: "xl", image: "/static/servicios/chatbot_recepcionista.webp" },
    { size: "md" },
    { size: "md", image: "/static/servicios/sensitive_data.webp" },
    { size: "lg" },
  ];
  const infocards: InfoCardItem[] = [
    ...cards.map((card, i) => ({
      key: `card-${i}`,
      size: cardLayout[i]?.size ?? "md",
      image: cardLayout[i]?.image,
      title: card.name,
      description: card.description,
    })),
    {
      key: "pricing",
      size: "md",
      title: pricing.price,
      description: (
        <span className="not-italic mt-4 block text-sm">
          <span className="block">{pricing.detail}</span>
          <span className="mt-2 block">
            <span className="font-semibold">{pricing.deliveryLabel}</span> {pricing.delivery}
          </span>
          <span className="mt-1 block">{pricing.extra}</span>
        </span>
      ),
      ctaLabel: pricing.ctaLabel,
      ctaIcons: [<ArrowRight key="arrow" className="h-4 w-4 shrink-0" />],
      href: "#formulario",
    },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">
      <CampaignHeader />

      {/* HERO */}
      <section id="inicio" className="scroll-mt-24 px-4 pt-4 md:px-8 xl:px-12">
        <div className="on-dark relative mx-auto flex min-h-[560px] max-w-[1600px] items-end overflow-hidden rounded-3xl bg-neutral-900 md:min-h-[620px]">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-4/5 backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_top,black_55%,transparent)] [mask-image:linear-gradient(to_top,black_55%,transparent)] md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-3/5 md:[-webkit-mask-image:linear-gradient(to_left,black_60%,transparent)] md:[mask-image:linear-gradient(to_left,black_60%,transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 md:bg-gradient-to-r md:from-black/15 md:via-black/50 md:to-black/85" />
          <div className="relative z-10 grid w-full items-end gap-8 p-6 sm:p-10 md:grid-cols-2 md:gap-12 md:p-14">
            <div className="text-white md:col-start-2">
              <h1 className="font-serif text-4xl font-normal leading-[1.1] md:text-5xl">{content.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90">{content.heroText}</p>
              <a
                href="#formulario"
                className="group mt-8 inline-flex items-center gap-4 rounded-full bg-white py-2 pl-7 pr-2 text-sm font-semibold uppercase tracking-widest text-neutral-900 shadow-lg transition hover:scale-[1.03]"
              >
                {content.heroCtaLabel}
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white transition group-hover:bg-[--swatch--clay-fill]">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INFO CARDS + PRICING */}
      <section id="beneficios" className="scroll-mt-24 py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-white dark:bg-neutral-900 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* WHY AN ENGINEER */}
      <section id="por-que-auditar" className="scroll-mt-24 py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/static/servicios/support.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
              {content.sectionTitles.why}
            </h2>
            {content.why.paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                <RichText text={p} />
              </p>
            ))}
            <a
              href="#formulario"
              className="group mt-4 inline-flex items-center gap-4 rounded-full bg-neutral-900 py-2 pl-7 pr-2 text-sm font-semibold uppercase tracking-widest text-white transition hover:scale-[1.03] dark:bg-white dark:text-neutral-900"
            >
              {content.heroCtaLabel}
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B84A28] text-white">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <div id="preguntas-frecuentes" className="scroll-mt-24">
        <FaqAccordion
          className="bg-white dark:bg-neutral-900 transition-colors"
          title={content.sectionTitles.technologyFaqs}
          description={content.sectionTitles.technologyFaqsSubtitle}
          items={FAQ_INDEXES.map((i) => content.technologyFaqs[i]).filter(Boolean).map((faq: { tag: string; question: string; answer: string }) => ({
            question: faq.question,
            tag: faq.tag,
            answer: faq.answer,
          }))}
        />
      </div>

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-auditoria-campaign">
          <ContactForm
            recaptchaAction="campaign_form"
            recaptchaBadgeId="recaptcha-badge-auditoria-campaign"
            redirectTo="/gracias?origen=auditoria"
          />
        </ReCaptchaWrapper>
      </section>

      <CampaignFooter />
    </div>
  );
}
