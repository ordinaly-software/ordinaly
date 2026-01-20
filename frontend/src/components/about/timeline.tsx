"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  media?: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}

export const Timeline = ({ data, eyebrow, title, description, className }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const updateHeight = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setHeight(rect.height);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [data.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={cn("w-full bg-transparent dark:bg-transparent font-sans md:px-10", className)}
      ref={containerRef}
    >
      {(eyebrow || title || description) && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.18em] text-[#1F8A0D] dark:text-[#3FBD6F] font-semibold mb-3">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-xl md:text-4xl mb-4 text-black dark:text-white max-w-4xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div ref={ref} className="relative max-w-7xl mx-auto pb-16 md:pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-12 md:pt-24 md:gap-10"
          >
            <div className="md:sticky flex flex-col md:flex-row z-40 items-start md:items-center md:top-28 self-start max-w-xs lg:max-w-sm md:w-full pr-4 md:pr-6">
              <div className="h-8 md:h-10 absolute left-2 md:left-3 w-8 md:w-10 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-sm ring-1 ring-neutral-200/60 dark:ring-neutral-800/60">
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl lg:text-4xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100 text-balance">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-12 pr-3 md:pl-4 w-full">
              <h3 className="md:hidden block text-xl mb-4 text-left font-semibold text-neutral-800 dark:text-neutral-100">
                {item.title}
              </h3>
              <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 md:p-7 shadow-sm overflow-visible">
                {item.media ? (
                  <>
                    <div className="lg:hidden relative w-full h-48 sm:h-56 overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 mb-4">
                      {item.media}
                    </div>
                    <div className="hidden lg:block absolute -left-16 -top-16 w-72 h-72 xl:w-80 xl:h-80 overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
                      {item.media}
                    </div>
                  </>
                ) : null}
                <div
                  className={cn(
                    "text-base text-gray-700 dark:text-gray-200 leading-relaxed",
                    item.media ? "pt-0 lg:pt-8 lg:pl-80 xl:pl-[22rem]" : "",
                  )}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-[17px] top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-800 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-[#1F8A0D] dark:from-[#3FBD6F] via-[#3FB89D] to-[#623CEA] from-[0%] via-[35%] to-[90%] rounded-full shadow-[0_0_10px_rgba(31,138,13,0.35)]"
          />
        </div>
      </div>
    </div>
  );
};
