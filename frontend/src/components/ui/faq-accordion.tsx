"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type FaqAccordionItem = {
  question: ReactNode;
  answer: ReactNode;
  tag?: ReactNode;
};

export interface FaqAccordionProps {
  /** Big bold title rendered in the left column. */
  title: ReactNode;
  /** Small uppercase label rendered above the title. */
  eyebrow?: ReactNode;
  /** Regular paragraph rendered below the title. */
  description?: ReactNode;
  items: FaqAccordionItem[];
  titleTag?: "h2" | "h3" | "h4";
  /** CSS color for the +/- glyph and tag labels. Defaults to the brand clay/orange. */
  accentColor?: string;
  /** Index of the item expanded by default, or null to start fully collapsed. */
  defaultOpenIndex?: number | null;
  /** Rendered centered below the Q&A list (e.g. a "view all" link or CTA). */
  footer?: ReactNode;
  /** Extra classes for the outer <section>, e.g. to set a background color. */
  className?: string;
  /** Extra classes for the max-width wrapper. */
  containerClassName?: string;
}

function FaqRow({
  item,
  isOpen,
  onToggle,
  accentColor,
}: {
  item: FaqAccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  accentColor?: string;
}) {
  const panelId = useId();
  const accentStyle = accentColor ? { color: accentColor } : undefined;

  return (
    <div className="py-5 sm:py-6">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
      >
        <span className="text-base font-semibold text-slate-dark dark:text-ivory-light sm:text-lg">
          {item.tag && (
            <span className={cn("mr-2 font-semibold", !accentColor && "text-clay")} style={accentStyle}>
              {item.tag}
            </span>
          )}
          {item.question}
        </span>
        <span
          aria-hidden
          className={cn(
            "relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden text-2xl font-light leading-none",
            !accentColor && "text-clay",
          )}
          style={accentStyle}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "minus" : "plus"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {isOpen ? "−" : "+"}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="mt-3 pr-2 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium sm:pr-10 sm:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqAccordion({
  title,
  eyebrow,
  description,
  items,
  titleTag = "h2",
  accentColor,
  defaultOpenIndex = null,
  footer,
  className,
  containerClassName,
}: FaqAccordionProps) {
  const TitleTag = titleTag;
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  if (!items.length) return null;

  return (
    <section className={cn("px-4 py-16 sm:px-6 sm:py-20 lg:px-8", className)}>
      <div className={cn("mx-auto max-w-6xl", containerClassName)}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-medium dark:text-cloud-medium">
                {eyebrow}
              </p>
            )}
            <TitleTag className="text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-dark dark:text-ivory-light sm:text-5xl">
              {title}
            </TitleTag>
            {description && (
              <p className="mt-4 text-base leading-relaxed text-slate-medium dark:text-cloud-medium">
                {description}
              </p>
            )}
          </div>

          <div className="divide-y divide-[--color-border-subtle] dark:divide-white/10">
            {items.map((item, index) => (
              <FaqRow
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>

        {footer && <div className="mt-10 text-center">{footer}</div>}
      </div>
    </section>
  );
}
