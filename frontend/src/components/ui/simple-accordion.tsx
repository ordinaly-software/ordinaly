"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type SimpleAccordionItem = {
  question: ReactNode;
  answer: ReactNode;
};

function SimpleAccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: SimpleAccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <div className="py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
      >
        <span className="text-base font-semibold text-slate-dark dark:text-ivory-light sm:text-lg">
          {item.question}
        </span>
        <span
          aria-hidden
          className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden text-2xl font-light leading-none text-clay"
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
            <p className="mt-3 pr-2 text-sm leading-relaxed text-slate-medium dark:text-cloud-medium sm:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SimpleAccordion({
  items,
  defaultOpenIndex = 0,
  className,
}: {
  items: SimpleAccordionItem[];
  defaultOpenIndex?: number | null;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  if (!items.length) return null;

  return (
    <div className={cn("divide-y divide-[--color-border-subtle] dark:divide-white/10", className)}>
      {items.map((item, index) => (
        <SimpleAccordionRow
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        />
      ))}
    </div>
  );
}
