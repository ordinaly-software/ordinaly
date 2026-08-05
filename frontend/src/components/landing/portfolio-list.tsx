"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface PortfolioProject {
  key: string;
  name: string;
  description: string;
  image: string;
  href: string;
}

interface PortfolioListProps {
  projects: PortfolioProject[];
  ctaLabel: string;
  className?: string;
}

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function PortfolioList({ projects, ctaLabel, className }: PortfolioListProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-8">
        {projects.map((project, i) => {
          const reversed = i % 2 === 1;
          return (
            <a
              key={project.key}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative w-full rounded-3xl bg-linear-to-br from-ivory-light to-[#F3E2D8] dark:from-neutral-800 dark:to-neutral-900 px-6 pt-10 md:p-12 flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-4 overflow-hidden transition-shadow hover:shadow-xl`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{ backgroundImage: GRAIN_BG }}
              />

              <div className="relative flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-dark dark:text-ivory-light">
                  {project.name}
                </h3>
                <p className="text-sm md:text-base text-slate-medium dark:text-cloud-medium mt-3 max-w-md mx-auto md:mx-0">
                  {project.description}
                </p>
                <span className="inline-flex items-center gap-2 bg-white dark:bg-neutral-700 group-hover:bg-clay group-hover:text-white px-6 py-2.5 rounded-full text-sm font-medium text-slate-dark dark:text-ivory-light mt-6 transition-colors">
                  {ctaLabel}
                  <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>

              <div
                className={`relative shrink-0 -mb-6 md:-mb-12 w-full md:w-[440px] ${reversed ? "md:-ml-12" : "md:-mr-12"}`}
              >
                <Image
                  src={project.image}
                  alt={project.name}
                  width={880}
                  height={492}
                  className={`w-full h-auto ${reversed ? "rounded-bl-3xl" : "rounded-br-3xl"}`}
                />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
