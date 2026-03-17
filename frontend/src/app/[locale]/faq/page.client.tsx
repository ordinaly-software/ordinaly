"use client";

import { useDeferredValue, useEffect, useMemo, useState, startTransition } from "react";
import { ArrowRight, Search, Sparkles, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ui/contact-form.client";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Link } from "@/i18n/navigation";
import {
  faqCategories,
  faqEntries,
  faqTagLabels,
  localizeFaq,
  type FaqCategoryKey,
  type FaqTagKey,
} from "./faq-data";

const cardClass =
  "rounded-[2rem] border border-[--color-border-subtle] bg-white/82 shadow-[0_24px_90px_-60px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]";

type LocalizedFaqEntry = {
  id: string;
  category: FaqCategoryKey;
  categoryLabel: string;
  tags: FaqTagKey[];
  tagLabels: string[];
  question: string;
  answer: string;
  relatedPath?: string;
};

export default function FaqPageClient({ locale }: { locale: string }) {
  const isEn = locale.startsWith("en");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeCategory, setActiveCategory] = useState<"all" | FaqCategoryKey>("all");
  const [activeTag, setActiveTag] = useState<"all" | FaqTagKey>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const localizedEntries = useMemo<LocalizedFaqEntry[]>(
    () =>
      faqEntries.map((entry) => ({
        id: entry.id,
        category: entry.category,
        categoryLabel: localizeFaq(locale, faqCategories[entry.category]),
        tags: entry.tags,
        tagLabels: entry.tags.map((tag) => localizeFaq(locale, faqTagLabels[tag])),
        question: localizeFaq(locale, entry.question),
        answer: localizeFaq(locale, entry.answer),
        relatedPath: entry.relatedPath,
      })),
    [locale],
  );

  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    return localizedEntries.filter((entry) => {
      const matchesCategory = activeCategory === "all" || entry.category === activeCategory;
      const matchesTag = activeTag === "all" || entry.tags.includes(activeTag);
      const haystack = [
        entry.question,
        entry.answer,
        entry.categoryLabel,
        ...entry.tagLabels,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesTag && matchesQuery;
    });
  }, [activeCategory, activeTag, localizedEntries, normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [currentPage, filteredEntries]);

  const tagOptions = useMemo(
    () =>
      Object.entries(faqTagLabels).map(([key, value]) => {
        const tag = key as FaqTagKey;
        const count = localizedEntries.filter((entry) => entry.tags.includes(tag)).length;
        return {
          key: tag,
          label: localizeFaq(locale, value),
          count,
        };
      }),
    [localizedEntries, locale],
  );

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: localizedEntries.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    }),
    [localizedEntries],
  );

  const ui = {
    eyebrow: isEn ? "FAQ browser" : "Navegador FAQ",
    title: isEn
      ? "Questions about chatbots, AI agents, n8n, WhatsApp and integrations"
      : "Preguntas sobre chatbots, agentes IA, n8n, WhatsApp e integraciones",
    subtitle: isEn
      ? "A searchable knowledge base built around common technical, operational and deployment questions from companies evaluating automation projects."
      : "Una base de conocimiento filtrable con preguntas técnicas, operativas y de despliegue habituales en proyectos de automatización.",
    address: isEn ? "ordinaly.ai/faq" : "ordinaly.ai/faq",
    results: isEn ? "results" : "resultados",
    searchPlaceholder: isEn ? "Search by question, technology or use case..." : "Buscar por pregunta, tecnología o caso de uso...",
    topics: isEn ? "Topics" : "Temas",
    tags: isEn ? "Tags" : "Etiquetas",
    allTopics: isEn ? "All topics" : "Todos los temas",
    allTags: isEn ? "All tags" : "Todas las etiquetas",
    loading: isEn ? "Updating results..." : "Actualizando resultados...",
    emptyTitle: isEn ? "No FAQ matches your filters" : "No hay FAQs que coincidan con tus filtros",
    emptyText: isEn
      ? "Try another tag, remove a filter or search with fewer words."
      : "Prueba otra etiqueta, elimina un filtro o busca con menos palabras.",
    clear: isEn ? "Clear filters" : "Limpiar filtros",
    related: isEn ? "See related page" : "Ver página relacionada",
    contactEyebrow: isEn ? "Need a direct answer?" : "¿Necesitas una respuesta directa?",
    contactTitle: isEn
      ? "Use the FAQ to frame the problem, then talk with the delivery team"
      : "Usa la FAQ para enmarcar el problema y después habla con el equipo que ejecuta",
    contactText: isEn
      ? "We can review your current stack, pick the right first pilot and define realistic success criteria."
      : "Podemos revisar tu stack actual, elegir el primer piloto correcto y definir criterios de éxito realistas.",
    contactPrimary: isEn ? "Go to contact page" : "Ir a contacto",
    contactSecondary: isEn ? "Open WhatsApp" : "Abrir WhatsApp",
  };

  return (
    <div className="relative overflow-hidden bg-[--color-bg-primary] text-slate-dark dark:bg-[--color-bg-inverted] dark:text-ivory-light">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.14),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(2,85,213,0.2),transparent_62%)]" />
        <div className="absolute left-[10%] top-52 h-40 w-40 rounded-full bg-[#0255D5]/8 blur-3xl dark:bg-[#0255D5]/16" />
        <div className="absolute right-[6%] top-[24rem] h-44 w-44 rounded-full bg-clay/10 blur-3xl" />
      </div>

      <div className="relative u-container pb-24 pt-10 lg:pb-28 lg:pt-12">
        <section className="mx-auto max-w-4xl text-center">
          <span className="label-meta inline-flex items-center gap-2 rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-4 py-2 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
            <Sparkles className="h-3.5 w-3.5" />
            {ui.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem]">
            {ui.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-slate-medium dark:text-cloud-medium">
            {ui.subtitle}
          </p>
        </section>

        <section className={`${cardClass} mt-10 overflow-hidden`}>
          <div className="border-b border-[--color-border-subtle] bg-[--swatch--slate-dark] px-5 py-4 text-white dark:border-white/10 md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#0255D5]" />
                <span className="h-3 w-3 rounded-full bg-clay" />
                <span className="h-3 w-3 rounded-full bg-white/35" />
              </div>
              <div className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85">
                {ui.address}
                {activeCategory !== "all" ? `?topic=${activeCategory}` : ""}
                {activeTag !== "all" ? `${activeCategory !== "all" ? "&" : "?"}tag=${activeTag}` : ""}
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                {filteredEntries.length} {ui.results}
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-medium dark:text-cloud-medium" />
              <Input
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  startTransition(() => {
                    setQuery(value);
                    setCurrentPage(1);
                  });
                }}
                placeholder={ui.searchPlaceholder}
                className="h-14 rounded-full border-[--color-border-subtle] bg-white pl-12 pr-12 text-base dark:border-white/10 dark:bg-white/[0.04]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setQuery("");
                      setCurrentPage(1);
                    })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-medium transition hover:bg-black/5 hover:text-slate-dark dark:text-cloud-medium dark:hover:bg-white/10 dark:hover:text-ivory-light"
                  aria-label={ui.clear}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.topics}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setActiveCategory("all");
                      setCurrentPage(1);
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeCategory === "all"
                      ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                      : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
                  }`}
                >
                  {ui.allTopics}
                </button>
                {Object.entries(faqCategories).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      startTransition(() => {
                        setActiveCategory(key as FaqCategoryKey);
                        setCurrentPage(1);
                      })
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeCategory === key
                        ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                        : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
                    }`}
                  >
                    {localizeFaq(locale, value)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="label-meta inline-flex items-center gap-2 text-[#0255D5] dark:text-[#7DB5FF]">
                <Tag className="h-3.5 w-3.5" />
                {ui.tags}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setActiveTag("all");
                      setCurrentPage(1);
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeTag === "all"
                      ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                      : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
                  }`}
                >
                  {ui.allTags}
                </button>
                {tagOptions.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() =>
                      startTransition(() => {
                        setActiveTag(tag.key);
                        setCurrentPage(1);
                      })
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeTag === tag.key
                        ? "border-[#0255D5]/20 bg-[#0255D5]/10 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]"
                        : "border-[--color-border-subtle] bg-white/70 text-slate-medium hover:text-slate-dark dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium dark:hover:text-ivory-light"
                    }`}
                  >
                    {tag.label} <span className="opacity-60">({tag.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {query !== deferredQuery ? (
            <div className="mb-4 text-sm text-slate-medium dark:text-cloud-medium">{ui.loading}</div>
          ) : null}

          {paginatedEntries.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {paginatedEntries.map((entry) => (
                <article key={entry.id} className={`${cardClass} p-6`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="label-meta rounded-full border border-[#0255D5]/15 bg-[#0255D5]/10 px-3 py-1 text-[#0255D5] dark:border-[#7DB5FF]/20 dark:bg-[#0255D5]/12 dark:text-[#7DB5FF]">
                      {entry.categoryLabel}
                    </span>
                    {entry.tagLabels.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[--color-border-subtle] bg-white/70 px-3 py-1 text-xs font-medium text-slate-medium dark:border-white/10 dark:bg-white/[0.04] dark:text-cloud-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{entry.question}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
                    {entry.answer}
                  </p>

                  {entry.relatedPath ? (
                    <div className="mt-6">
                      <Button asChild variant="outline" className="justify-between">
                        <Link href={entry.relatedPath}>
                          {ui.related}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
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
                  onClick={() =>
                    startTransition(() => {
                      setQuery("");
                      setActiveCategory("all");
                      setActiveTag("all");
                      setCurrentPage(1);
                    })
                  }
                >
                  {ui.clear}
                </Button>
              </div>
            </div>
          )}
        </section>

        {filteredEntries.length > pageSize ? (
          <PaginationControls
            totalItems={filteredEntries.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-8"
          />
        ) : null}

        <section id="faq-contact" className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className={`${cardClass} bg-[linear-gradient(135deg,rgba(2,85,213,0.08),rgba(214,119,63,0.08),rgba(255,255,255,0.94))] p-6 md:p-8 dark:bg-[linear-gradient(135deg,rgba(2,85,213,0.16),rgba(214,119,63,0.12),rgba(255,255,255,0.04))]`}>
            <p className="label-meta text-[#0255D5] dark:text-[#7DB5FF]">{ui.contactEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{ui.contactTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium">
              {ui.contactText}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="cobalt" size="lg">
                <Link href="/contact">{ui.contactPrimary}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://wa.me/34626270806?text=Quiero%20resolver%20una%20duda%20sobre%20automatizaci%C3%B3n%20e%20IA"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ui.contactSecondary}
                </a>
              </Button>
            </div>
          </div>

          <div className={`${cardClass} overflow-hidden`}>
            <ContactForm
              className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0"
              recaptchaAction="faq_contact_form"
              recaptchaBadgeId="recaptcha-badge-faq-page"
            />
          </div>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
