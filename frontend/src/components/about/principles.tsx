"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

const ITEM_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
const MANIFESTO_KEYS = ["l1", "l2", "l3"] as const;

// Apple-ish reveal: fade + short rise, no overshoot, settles from where it is.
// Disabled entirely under prefers-reduced-motion.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function PrinciplesSection({ id }: { id?: string }) {
  const t = useTranslations("usPage.principles");
  const reduce = useReducedMotion();

  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, ease: EASE_OUT, delay },
        };

  return (
    <section id={id} className="px-4 py-14 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-3xl">
          <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-clay dark:text-clay md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-medium dark:text-cloud-medium md:text-lg">
            {t("intro")}
          </p>
        </div>

        {/* Principles grid */}
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 md:gap-5">
          {ITEM_KEYS.map((key, index) => (
            <motion.li
              key={key}
              {...reveal(Math.min(index, 6) * 0.06)}
              className="group rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-gray-800 dark:bg-gray-900/60 md:p-7"
            >
              <span
                aria-hidden="true"
                className="block bg-gradient-to-br from-clay to-cobalt bg-clip-text text-3xl font-bold leading-none tracking-[-0.03em] tabular-nums text-transparent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.01em] text-balance text-slate-dark dark:text-ivory-light">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-medium dark:text-cloud-medium md:text-base">
                {t(`items.${key}.body`)}
              </p>
            </motion.li>
          ))}
        </ol>

        {/* Manifesto */}
        <div className="mt-14 text-center md:mt-20">
          <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-1.5">
            {MANIFESTO_KEYS.map((key, index) => (
              <motion.p
                key={key}
                {...reveal(index * 0.1)}
                className="text-2xl font-bold leading-[1.12] tracking-[-0.02em] text-slate-dark dark:text-ivory-light sm:text-3xl md:text-4xl"
              >
                {t(`manifesto.${key}`)}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
