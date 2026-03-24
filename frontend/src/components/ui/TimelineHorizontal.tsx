"use client";

import { motion } from "framer-motion";

export default function TimelineHorizontal({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-12 text-center dark:text-white">
        Cómo trabajamos
      </h2>
      <div className="relative w-full max-w-5xl mt-4 mb-16">

        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-neutral-300 dark:bg-neutral-700 -translate-y-1/2" />

        <div className="relative flex justify-between w-full">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-12 h-12 bg-white dark:bg-neutral-800 border-2 border-neutral-400 dark:border-neutral-600 rounded-full shadow-md text-neutral-700 dark:text-white font-semibold text-lg">
              {index + 1}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 w-full max-w-5xl">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center px-4"
          >
            <h3 className="text-xl font-semibold mb-2 dark:text-white">
              {step.title}
            </h3>

            <p className="text-neutral-600 dark:text-neutral-100 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
