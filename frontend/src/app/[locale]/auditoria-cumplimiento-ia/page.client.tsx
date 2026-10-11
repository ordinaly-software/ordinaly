"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  FileImage,
  MessageSquareText,
  PhoneCall,
  ScanFace,
  type LucideIcon,
} from "lucide-react";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { RichText } from "@/components/ui/highlight";
import { cn } from "@/lib/utils";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

// TODO: swap for a dedicated banner (/static/backgrounds/auditoria_ia_background.webp) once the asset exists.
const HERO_IMAGE = "/static/servicios/engineers.webp";

// One icon per use case, in the same order as `article50.useCases`.
const USE_CASE_ICONS: LucideIcon[] = [MessageSquareText, PhoneCall, FileImage, ScanFace, Fingerprint];

const cardClass =
  "rounded-[2rem] border border-[--color-border-subtle] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]";

type UseCase = { name: string; description: string };

function UseCaseCard({ useCase, Icon = MessageSquareText, wide }: { useCase: UseCase; Icon?: LucideIcon; wide?: boolean }) {
  return (
    <li className={cn(cardClass, wide && "lg:flex lg:items-start lg:gap-6")}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B84A28]/10 text-clay dark:bg-[#B84A28]/25">
        <Icon className="h-5 w-5" />
      </span>
      <div className={wide ? "mt-4 lg:mt-0" : "mt-4"}>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{useCase.name}</h3>
        <p className="mt-2 leading-relaxed text-neutral-700 dark:text-neutral-300">
          <RichText text={useCase.description} />
        </p>
      </div>
    </li>
  );
}

export default function AuditoriaCumplimientoIa() {
  const messages = useMessages() as any;
  const content = messages.landings?.["auditoria-cumplimiento-ia"];

  if (!content) {
    throw new Error("Missing landing content: auditoria-cumplimiento-ia");
  }

  const cards = (content.infocards?.cards ?? []) as { name: string; description?: string }[];
  const pricing = content.pricing;
  const training = content.infocards.training;
  const useCases = content.article50.useCases as UseCase[];

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
      key: "training",
      size: "lg",
      media: (
        <Image
          src="/static/servicios/formacion_equipo.jpg"
          alt=""
          fill
          sizes="560px"
          className="scale-105 object-cover blur-[3px]"
        />
      ),
      title: training.name,
      description: training.description,
      ctaLabel: training.ctaLabel,
      ctaIcons: [<ArrowRight key="arrow" className="h-4 w-4 shrink-0" />],
      href: training.href,
    },
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
      href: pricing.ctaHref,
    },
  ];

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">
      {/* HERO */}
      <section className="px-4 pt-4 md:px-8 xl:px-12">
        <div className="on-dark relative mx-auto flex min-h-[560px] max-w-[1600px] items-end overflow-hidden rounded-[2rem] bg-neutral-900 md:min-h-[620px]">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-4/5 backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_top,black_55%,transparent)] [mask-image:linear-gradient(to_top,black_55%,transparent)] md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-3/5 md:[-webkit-mask-image:linear-gradient(to_left,black_60%,transparent)] md:[mask-image:linear-gradient(to_left,black_60%,transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 md:bg-gradient-to-r md:from-black/15 md:via-black/50 md:to-black/85" />
          <div className="relative z-10 grid w-full items-end gap-8 p-6 sm:p-10 md:grid-cols-2 md:gap-12 md:p-14">
            <div className="text-white md:col-start-2">
              <h1 className="font-serif text-4xl font-normal leading-[1.1] md:text-5xl">{content.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90">
                {content.heroText}
              </p>
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

      {/* ARTICLE 50 */}
      <section className="py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
              {content.sectionTitles.article50}
            </h2>
            {content.article50.paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                <RichText text={p} />
              </p>
            ))}
            <p className="mt-8 text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              {content.article50.sourcesTitle}
            </p>
            <ul className="list-disc pl-6 text-sm text-neutral-700 dark:text-neutral-300">
              {content.article50.sources.map((src: { label: string; href: string }) => (
                <li key={src.href}>
                  <a href={src.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-clay">
                    {src.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {content.article50.useCasesTitle}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {useCases.slice(0, -1).map((u, i) => (
                <UseCaseCard key={u.name} useCase={u} Icon={USE_CASE_ICONS[i]} />
              ))}
            </ul>
          </div>
          {/* The last use case spans the full width of the section, below both columns. */}
          <ul className="lg:col-span-2">
            <UseCaseCard
              useCase={useCases[useCases.length - 1]}
              Icon={USE_CASE_ICONS[useCases.length - 1]}
              wide
            />
          </ul>
        </div>
      </section>

      {/* WHY AN ENGINEER */}
      <section className="py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
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

      {/* INFO CARDS + PRICING */}
      <section className="py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles.infocardsTitle}
        </h2>
        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />
      </section>

      {/* PROCESS */}
      <section className="py-16 md:py-20 px-4 md:px-8 xl:px-12 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-900 dark:text-white">
            {content.sectionTitles.process}
          </h2>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {content.process.steps.map((step: { name: string; description: string }, i: number) => (
              <li key={step.name} className={cardClass}>
                <span className="font-serif text-5xl leading-none text-clay">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{step.name}</h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300 leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQS */}
      <FaqAccordion
        className="bg-neutral-50 dark:bg-neutral-800 transition-colors"
        title={content.sectionTitles.technologyFaqs}
        description={content.sectionTitles.technologyFaqsSubtitle}
        items={content.technologyFaqs.map((faq: { tag: string; question: string; answer: string }) => ({
          question: faq.question,
          tag: faq.tag,
          answer: faq.answer,
        }))}
      />

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-ai-audit-contact">
          <ContactForm />
        </ReCaptchaWrapper>
      </section>

      <WhatsAppBubble />
      <Footer />
    </div>
  );
}
