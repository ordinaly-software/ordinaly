"use client";

import { useMessages } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { InfoCardCarousel, type InfoCardItem } from "@/components/landing/info-card-carousel";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { RichText } from "@/components/ui/highlight";
import { Carousel } from "@/components/ui/carousel";
import { IconOdoo } from "@/components/ui/brand-icons";
import ReCaptchaWrapper from "../recaptcha-provider";
import WhatsAppBubbleSkeleton from "@/components/home/whatsapp-bubble-skeleton";
import { HeroVideoDialog } from "@/components/home/hero-video-dialog";

const WhatsAppBubble = dynamic(() => import("@/components/home/whatsapp-bubble"), {
  loading: () => <WhatsAppBubbleSkeleton />,
});

export default function ImplantacionOdoo() {
  const messages = useMessages() as any;
  const content = messages.landings?.["implantacion-odoo"];

  if (!content) {
    throw new Error("Missing landing content: implantacion-odoo");
  }

  const pricingTable = content.pricing;

  const infoCardTexts = (content.infocards?.cards ?? []) as { name: string; description?: string }[];

  // Defined one by one (rather than mechanically mapped) so each card's
  // size can be chosen deliberately.
  const infocards: InfoCardItem[] = [
    { key: "erp", size: "xl", title: infoCardTexts[0]?.name, description: infoCardTexts[0]?.description, image: "/static/implantacion-odoo/erp.webp" },
    { key: "modules", size: "xl", title: infoCardTexts[1]?.name, description: infoCardTexts[1]?.description, image: "/static/implantacion-odoo/modules.webp" },
    { key: "automation", size: "md", title: infoCardTexts[2]?.name, description: infoCardTexts[2]?.description, image: "/static/servicios/software.webp" },
    { key: "verifactu", size: "md", title: infoCardTexts[3]?.name, description: infoCardTexts[3]?.description, image: "/static/implantacion-odoo/verifactu.webp" },
    { key: "vps", size: "sm", title: infoCardTexts[4]?.name, description: infoCardTexts[4]?.description, image: "/static/servicios/vps.webp" },
    { key: "software", size: "sm", title: infoCardTexts[5]?.name, description: infoCardTexts[5]?.description},
    { key: "sensitive-data", size: "sm", title: infoCardTexts[6]?.name, description: infoCardTexts[6]?.description, image: "/static/servicios/sensitive_data.webp" },
  ];

  const comparisonRowsPresentation = [
    { key: "salesforce", rowClass: "bg-white", textClass: "text-black", logoSrc: "/static/icons/salesforce.webp", logoAlt: "Salesforce" },
    { key: "hubspot", rowClass: "bg-[#fff0df]", textClass: "text-black", logoSrc: "/static/icons/hubspot.webp", logoAlt: "HubSpot" },
    { key: "odoo-enterprise", rowClass: "bg-white", textClass: "text-[#C2410C]", logoSrc: "/static/icons/odoo.webp", logoAlt: "Odoo Enterprise" },
    { key: "odoo-community", rowClass: "bg-[#f8e2d1]", textClass: "text-black", logoSrc: "/static/icons/odoo_community.webp", logoAlt: "Odoo Community" },
  ];

  const comparisonRowsContent = (content.whyOdooCommunity?.comparisonTable?.rows ?? []) as {
    tool: string;
    cost: string;
    notes: string;
  }[];

  const comparisonTableHeaders = (content.whyOdooCommunity?.comparisonTable?.headers ?? []) as string[];
  const comparisonTableNote1 = content.whyOdooCommunity?.tableNote1;
  const comparisonTableNote2 = content.whyOdooCommunity?.tableNote2;

  const communityComparisonRows = comparisonRowsPresentation.map((presentation, i) => ({
    ...presentation,
    tool: comparisonRowsContent[i]?.tool,
    cost: comparisonRowsContent[i]?.cost,
    notes: comparisonRowsContent[i]?.notes,
  }));

  return (
    <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

      {/* HERO */}
      <section className="relative w-full overflow-x-clip pt-20 pb-14 md:pt-24 md:pb-16 px-6 bg-white dark:bg-neutral-900 transition-colors">
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

          <p className="mt-6 text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
            {content.heroText}
          </p>

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
        <div className="relative mx-auto max-w-5xl aspect-[1760/980] overflow-hidden rounded-2xl">
          <Image
            src="/static/implantacion-odoo/implantacion_odoo.webp"
            alt={content.title}
            width={1760}
            height={998}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="size-full object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* WHAT IS ODOO */}
      <section className="py-14 md:py-16 px-6 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[0.7fr_1.3fr] gap-16 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-700 text-[#714B67]">
              <IconOdoo size={80} />
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
              {content.sectionTitles?.whatIsOdoo}
            </h2>
            {content.whatIsOdoo?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                <RichText text={p} className="hl-yellow" />
              </p>
            ))}
            {content.whatIsOdoo?.linkHref && (
              <p className="text-neutral-700 dark:text-neutral-300">
                {content.whatIsOdoo.linkPrefix}{" "}
                <a
                  href={content.whatIsOdoo.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-clay hover:underline"
                >
                  👉 {content.whatIsOdoo.linkLabel}
                </a>
              </p>
            )}
          </div>
        </div>

        <Carousel
          className="max-w-6xl mx-auto mt-12"
          items={[
            {
              key: "what-is-odoo",
              videoUrl: "https://youtu.be/YFJfF81_O2k?si=_r2Zg9AcZz0YjEFr",
              thumbnailSrc: "/static/implantacion-odoo/what_is_odoo_thumbnail.webp",
              thumbnailAlt: content.sectionTitles?.whatIsOdoo,
              caption: content.videos?.whatIsOdooCaption,
            },
            {
              key: "meet-odoo-20",
              videoUrl: "https://www.youtube.com/watch?v=YlmN5QcAdLs",
              thumbnailSrc: "/static/implantacion-odoo/meet_odoo_20_thumbnail.webp",
              thumbnailAlt: content.videos?.odoo20Alt,
              caption: content.videos?.odoo20Caption,
            },
          ]}
          getKey={(video) => video.key}
          slideClassName="shrink-0 grow-0 basis-[88%] md:basis-[66%] pl-4"
          options={{ dragFree: false }}
          renderItem={(video) => (
            <div>
              <HeroVideoDialog
                className="w-full"
                animationStyle="from-center"
                videoUrl={video.videoUrl}
                thumbnailSrc={video.thumbnailSrc}
                thumbnailAlt={video.thumbnailAlt}
              />
              <p className="mt-4 text-center text-sm text-slate-medium dark:text-cloud-medium">
                {video.caption}
              </p>
            </div>
          )}
        />
      </section>

      {/* INFO CARDS */}
      <section className="py-14 md:py-16 px-4 md:px-8 xl:px-12 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-white">
          {content.sectionTitles?.infocardsTitle}
        </h2>

        <InfoCardCarousel items={infocards} className="max-w-[1600px] mx-auto" />

      </section>


      {/* WHY ODOO */}
      <section className="pb-14 md:pb-16 bg-white dark:bg-neutral-900 transition-colors">
        <div className="bg-[#e4e0ea] dark:bg-[#2a2733]">
          <Image
            src="/static/implantacion-odoo/why_odoo.webp"
            alt={content.sectionTitles?.whyOdoo ?? ""}
            width={1580}
            height={585}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="mx-auto h-auto w-full max-w-5xl [-webkit-mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-14 md:pt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
            {content.sectionTitles?.whyOdoo}
          </h2>
          {content.whyOdoo?.paragraphs?.map((p: string, i: number) => (
            <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <RichText text={p} className="hl-yellow" />
            </p>
          ))}
        </div>
      </section>

      {/* WHY ODOO COMMUNITY */}
      <section className="py-14 md:py-16 px-6 bg-neutral-50 dark:bg-neutral-800 transition-colors">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="order-1 md:order-1 overflow-hidden border border-[#d6d1ca] bg-white shadow-none self-start">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-clay-fill dark:bg-clay-fill text-white dark:text-white">
                  <th className="w-[40%] border-r border-white/40 px-2 py-3 text-center text-[10px] font-bold md:text-sm">
                    {comparisonTableHeaders[0]}
                  </th>
                  <th className="w-[27%] border-r border-white/40 px-2 py-3 text-center text-[10px] font-bold md:text-sm">
                    {comparisonTableHeaders[1]}
                  </th>
                  <th className="w-[33%] px-2 py-3 text-center text-[10px] font-bold md:text-sm">
                    {comparisonTableHeaders[2]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {communityComparisonRows.map((row) => (
                  <tr key={row.key} className={row.rowClass}>
                    <td className={`border-r border-[#ddd6cf] px-2 py-2 align-middle ${row.textClass}`}>
                      <div className="flex items-center gap-2 md:gap-3">
                        <Image
                          src={row.logoSrc}
                          alt={row.logoAlt}
                          width={64}
                          height={64}
                          className="h-9 w-9 shrink-0 object-contain md:h-11 md:w-11"
                        />
                        <span className="min-w-0 text-[10px] leading-tight font-bold md:text-xs">{row.tool}</span>
                      </div>
                    </td>
                    <td className={`border-r border-[#ddd6cf] px-2 py-2 text-center align-middle text-[10px] md:text-xs font-bold ${row.textClass}`}>
                      {row.cost}
                    </td>
                    <td className={`px-2 py-2 align-middle text-[10px] md:text-xs leading-snug ${row.textClass}`}>
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-2 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
              {content.sectionTitles?.whyOdooCommunity}
            </h2>
            {content.whyOdooCommunity?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                <RichText text={p} className="hl-yellow" />
              </p>
            ))}
          </div>
        </div>

        {(comparisonTableNote1 || comparisonTableNote2) && (
          <figure className="mx-auto mt-6 max-w-4xl text-center text-[10px] leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-xs">
            {comparisonTableNote1 && <p>{comparisonTableNote1}</p>}
            {comparisonTableNote2 && <p className={comparisonTableNote1 ? "mt-1" : undefined}>{comparisonTableNote2}</p>}
          </figure>
        )}
      </section>

      {/* VERIFACTU + PRICING */}
      {content.verifactu && (
        <section className="py-14 md:py-16 px-6 bg-white dark:bg-neutral-900 transition-colors">
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
                <a
                  href="#formulario"
                  className="px-8 py-4 rounded-xl font-semibold border border-neutral-300 text-neutral-900 transition hover:scale-105 dark:border-neutral-600 dark:text-white"
                >
                  {content.verifactu.ctaLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TECHNOLOGY FAQS */}
      {content.technologyFaqs?.length > 0 && (
        <FaqAccordion
          className="bg-neutral-50 dark:bg-neutral-800 transition-colors"
          title={content.sectionTitles?.technologyFaqs}
          description={content.sectionTitles?.technologyFaqsSubtitle}
          items={content.technologyFaqs.map(
            (faq: { tag: string; question: string; answer: string; answerEmphasis?: string; links?: { label: string; href: string }[] }) => ({
              question: faq.question,
              tag: faq.tag,
              answer: faq.answerEmphasis ? (
                <>
                  {faq.answer}
                  <strong>{faq.answerEmphasis}</strong>
                </>
              ) : faq.links?.length ? (
                <>
                  {faq.answer}
                  <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {faq.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-clay hover:underline"
                      >
                        👉 {link.label}
                      </a>
                    ))}
                  </span>
                </>
              ) : (
                faq.answer
              ),
            }),
          )}
        />
      )}

      {/* FORM */}
      <section id="formulario">
        <ReCaptchaWrapper badgeContainerId="recaptcha-badge-odoo-contact">
          <ContactForm />
        </ReCaptchaWrapper>
      </section>

      <a
        href="https://wa.me/34626270806"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
        style={{ backgroundColor: "var(--swatch--clay-fill)" }}
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
