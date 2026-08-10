"use client";

import { Linkedin } from "lucide-react";

interface Instructor {
  name: string;
  role: string;
  description: string;
}

interface InstructorsSectionProps {
  title: string;
  linkedinLabel: string;
  items: Instructor[];
  images: readonly string[];
  linkedinUrls: readonly string[];
}

export function InstructorsSection({ title, linkedinLabel, items, images, linkedinUrls }: InstructorsSectionProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-10 pt-16">
      <h2 className="mb-16 text-center text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
        {title}
      </h2>

      <div className="grid gap-12 md:grid-cols-2">
        {items.map((instructor, i) => (
          <div
            key={instructor.name}
            className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <img
              src={images[i] ?? images[0]}
              alt={instructor.name}
              className="mx-auto mb-6 h-24 w-24 rounded-full object-cover shadow-md"
            />

            <h3 className="text-center text-xl font-bold text-neutral-900 dark:text-white">
              {instructor.name}
            </h3>

            <p className="mt-1 text-center font-semibold text-[#d97757]">{instructor.role}</p>

            <p className="mt-4 text-center leading-relaxed text-neutral-600 dark:text-neutral-400">
              {instructor.description}
            </p>

            <div className="mt-6 flex justify-center">
              <a
                href={linkedinUrls[i] ?? linkedinUrls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#d97757]/20 px-4 py-2 text-sm font-semibold text-[#d97757] transition hover:border-[#d97757]/40 hover:bg-[#d97757]/8"
                aria-label={`${linkedinLabel} de ${instructor.name}`}
              >
                <Linkedin className="h-4 w-4" />
                <span>{linkedinLabel}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
