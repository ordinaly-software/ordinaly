"use client";

import { useDeferredValue, useMemo, useState, startTransition } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FileBarChart2,
  GraduationCap,
  Headset,
  type LucideIcon,
  Receipt,
  Search,
  Sparkles,
  Workflow,
  Database,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaqAccordion, type FaqAccordionItem } from "@/components/ui/faq-accordion";
import { HighlightedCarousel } from "@/components/blog/highlighted-carousel";
import { NewsletterBanner } from "@/components/ui/newsletter-banner";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { Link } from "@/i18n/navigation";
import type { BlogPost } from "@/components/blog/types";
import { faqCategories, faqEntries, localizeFaq, type FaqCategoryKey } from "./faq-data";

const cardClass =
  "rounded-[2rem] border border-[--color-border-subtle] bg-white/82 shadow-[0_24px_90px_-60px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]";

const categoryIcons: Record<FaqCategoryKey, LucideIcon> = {
  general: Sparkles,
  company: Building2,
  training: GraduationCap,
  "calling-agent": Headset,
  n8n: Workflow,
  invoices: Receipt,
  reports: FileBarChart2,
  odoo: Database,
};

const categoryOrder = Object.keys(faqCategories) as FaqCategoryKey[];

type LocalizedFaqEntry = {
  id: string;
  category: FaqCategoryKey;
  categoryLabel: string;
  tag?: string;
  question: string;
  answer: string;
};

export default function FaqPageClient({
  locale,
  highlightedPosts,
}: {
  locale: string;
  highlightedPosts: BlogPost[];
}) {
  const isEn = locale.startsWith("en");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeCategory, setActiveCategory] = useState<"all" | FaqCategoryKey>("all");

  const localizedEntries = useMemo<LocalizedFaqEntry[]>(
    () =>
      faqEntries.map((entry) => ({
        id: entry.id,
        category: entry.category,
        categoryLabel: localizeFaq(locale, faqCategories[entry.category].label),
        tag: entry.tag ? localizeFaq(locale, entry.tag) : undefined,
        question: localizeFaq(locale, entry.question),
        answer: localizeFaq(locale, entry.answer),
      })),
    [locale],
  );

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredEntries = useMemo(() => {
    return localizedEntries.filter((entry) => {
      const matchesCategory = activeCategory === "all" || entry.category === activeCategory;
      const haystack = [entry.question, entry.answer, entry.categoryLabel, entry.tag ?? ""]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, localizedEntries, normalizedQuery]);

  const groupedEntries = useMemo(() => {
    return categoryOrder
      .filter((key) => activeCategory === "all" || activeCategory === key)
      .map((key) => ({
        key,
        meta: faqCategories[key],
        entries: localizedEntries.filter((entry) => entry.category === key),
      }))
      .filter((group) => group.entries.length > 0);
  }, [activeCategory, localizedEntries]);

  const ui = {
    title: isEn ? "Ordinaly frequently asked questions" : "Preguntas frecuentes de Ordinaly",
    seoHeadline: isEn ? "FAQs about AI automation" : "FAQ's sobre automatizaciones con IA",
    seoLine: isEn
      ? "We answer your questions about implementing AI."
      : "Resolvemos tus dudas sobre la implementación de IA.",
    subtitle: isEn
      ? "Everything you need to know about our chatbots, AI calling agents, n8n automations, invoice and report automation, Odoo implementation and AI training — all gathered in one place."
      : "Todo lo que necesitas saber sobre chatbots, el agente de llamadas con IA, Automatización con n8n, automatización de facturas e informes, implantación de Odoo y formación en IA ¡reunido en un solo sitio!",
    results: isEn ? "results" : "resultados",
    searchPlaceholder: isEn
      ? "Search by question, product or technology..."
      : "Buscar por pregunta, producto o tecnología...",
    topics: isEn ? "Topics" : "Temas",
    allTopics: isEn ? "All topics" : "Todos los temas",
    emptyTitle: isEn ? "No FAQ matches your search" : "No hay preguntas que coincidan con tu búsqueda",
    emptyText: isEn
      ? "Try another topic or search with fewer words."
      : "Prueba otro tema o busca con menos palabras.",
    clear: isEn ? "Clear search" : "Limpiar búsqueda",
    related: isEn ? "See full page" : "Ver página completa",
    blogCta: isEn ? "See all articles" : "Ver todos los artículos",
  };

  return (
    <div className="relative overflow-hidden bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem]">
            {ui.title}
          </h1>
          <h2 className="label-meta mt-4 text-slate-medium dark:text-cloud-medium">{ui.seoHeadline}</h2>
          <p className="mt-1 text-sm text-slate-medium/80 dark:text-cloud-medium/70">{ui.seoLine}</p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-slate-medium dark:text-cloud-medium">
            {ui.subtitle}
          </p>
        </section>

        <section className={`${cardClass} sticky top-[76px] z-20 mt-10 p-5 md:p-6`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-medium dark:text-cloud-medium" />
            <Input
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                startTransition(() => setQuery(value));
              }}
              placeholder={ui.searchPlaceholder}
              className="h-14 rounded-full border-[--color-border-subtle] bg-white pl-12 pr-12 text-base dark:border-white/10 dark:bg-white/[0.04]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => startTransition(() => setQuery(""))}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-medium transition hover:bg-black/5 hover:text-slate-dark active:scale-90 dark:text-cloud-medium dark:hover:bg-white/10 dark:hover:text-ivory-light"
                aria-label={ui.clear}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.topics}</p>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-medium dark:text-cloud-medium">
              {filteredEntries.length} {ui.results}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startTransition(() => setActiveCategory("all"))}
              className={`rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
                activeCategory === "all"
                  ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                  : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
              }`}
            >
              {ui.allTopics}
            </button>
            {categoryOrder.map((key) => {
              const Icon = categoryIcons[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => startTransition(() => setActiveCategory(key))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
                    activeCategory === key
                      ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                      : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {localizeFaq(locale, faqCategories[key].label)}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {isSearching ? (
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <section className="mt-8">
            {filteredEntries.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredEntries.map((entry) => {
                  const meta = faqCategories[entry.category];
                  return (
                    <article key={entry.id} className={`${cardClass} p-6`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="label-meta rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-3 py-1 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
                          {entry.categoryLabel}
                        </span>
                        {entry.tag ? (
                          <span className="rounded-full border border-[--color-border-subtle] bg-white/70 px-3 py-1 text-xs font-medium text-slate-medium dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium">
                            {entry.tag}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{entry.question}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                        {entry.answer}
                      </p>

                      <div className="mt-6">
                        <Button asChild variant="outline" className="justify-between active:scale-[0.98]">
                          <Link href={meta.relatedPath}>
                            {ui.related}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={`${cardClass} p-8 text-center`}>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">{ui.emptyTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                  {ui.emptyText}
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="cobalt"
                    className="active:scale-[0.98]"
                    onClick={() =>
                      startTransition(() => {
                        setQuery("");
                        setActiveCategory("all");
                      })
                    }
                  >
                    {ui.clear}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-2">
          {groupedEntries.map((group, index) => {
            const Icon = categoryIcons[group.key];
            const items: FaqAccordionItem[] = group.entries.map((entry) => ({
              question: entry.question,
              answer: entry.answer,
              tag: entry.tag,
            }));
            return (
              <section
                key={group.key}
                id={group.key}
                className={`scroll-mt-28 ${index % 2 === 1 ? "bg-white dark:bg-[#1A1924]" : ""}`}
              >
                <FaqAccordion
                  titleTag="h2"
                  eyebrow={
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-clay" />
                      {isEn ? "Frequently asked questions" : "Preguntas frecuentes"}
                    </span>
                  }
                  title={localizeFaq(locale, group.meta.label)}
                  description={localizeFaq(locale, group.meta.description)}
                  items={items}
                  containerClassName="max-w-7xl"
                  footer={
                    <Link
                      href={group.meta.relatedPath}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-clay px-6 py-3 font-semibold text-clay shadow-md transition-all duration-300 active:scale-95 hover:bg-clay hover:text-white hover:shadow-lg hover:shadow-clay/20"
                    >
                      {localizeFaq(locale, group.meta.relatedLabel)}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  }
                />
              </section>
            );
          })}
        </div>
      )}

      {!isSearching && highlightedPosts.length > 0 ? (
        <div>
          <HighlightedCarousel posts={highlightedPosts} translationsNamespace="blog" />
          <div className="bg-white text-center dark:bg-[#1A1924]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 pb-10 text-sm font-semibold text-[#0255D5] transition hover:gap-3 dark:text-[#7DB5FF]"
            >
              {ui.blogCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-12 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
        <NewsletterBanner className="mx-auto w-full max-w-[1600px]" />
      </div>

      <div id="faq-contact">
        <ContactForm recaptchaAction="faq_contact_form" recaptchaBadgeId="recaptcha-badge-faq-page" />
      </div>

      <Footer />
    </div>
  );
}
