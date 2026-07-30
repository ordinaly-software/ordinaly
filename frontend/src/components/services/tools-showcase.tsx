"use client";

import {
  IconBrandReact,
  IconBrandNextjs,
  IconBrandTypescript,
  IconBrandTailwind,
  IconBrandDjango,
  IconBrandPython,
  IconBrandDocker,
  IconBrandStripe,
  IconDatabase,
} from "@tabler/icons-react";
import { IconN8n, IconOdoo } from "@/components/ui/brand-icons";
import LogoLoop from "@/components/ui/logo-loop";
import { cn } from "@/lib/utils";

const ICON_SIZE = 36;

const toolLogos = [
  { node: <IconBrandReact size={ICON_SIZE} />, title: "React", href: "https://react.dev" },
  { node: <IconBrandNextjs size={ICON_SIZE} />, title: "Next.js", href: "https://nextjs.org" },
  {
    node: <IconBrandTypescript size={ICON_SIZE} />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    node: <IconBrandTailwind size={ICON_SIZE} />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
  { node: <IconBrandDjango size={ICON_SIZE} />, title: "Django", href: "https://www.djangoproject.com" },
  { node: <IconBrandPython size={ICON_SIZE} />, title: "Python", href: "https://www.python.org" },
  { node: <IconDatabase size={ICON_SIZE} />, title: "PostgreSQL", href: "https://www.postgresql.org" },
  { node: <IconBrandDocker size={ICON_SIZE} />, title: "Docker", href: "https://www.docker.com" },
  { node: <IconBrandStripe size={ICON_SIZE} />, title: "Stripe", href: "https://stripe.com" },
  { node: <IconN8n size={ICON_SIZE} />, title: "n8n", href: "https://n8n.io" },
  { node: <IconOdoo size={ICON_SIZE} />, title: "Odoo", href: "https://www.odoo.com" },
];

interface ToolsShowcaseProps {
  eyebrow: string;
  title: string;
  titleTag?: "h2" | "h3";
  className?: string;
}

export function ToolsShowcase({ eyebrow, title, titleTag = "h2", className }: ToolsShowcaseProps) {
  return (
    <section className={cn("w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pb-12", className)}>
      <div className="rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10">
        <div className="mb-8 space-y-3 text-center text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">{eyebrow}</p>
          {titleTag === "h3" ? (
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
          ) : (
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          )}
        </div>
        <div style={{ height: "80px", position: "relative", overflow: "hidden" }}>
          <LogoLoop
            logos={toolLogos}
            speed={80}
            direction="left"
            logoHeight={40}
            gap={56}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="var(--swatch--slate-dark)"
            ariaLabel={eyebrow}
            className="text-white/80"
          />
        </div>
      </div>
    </section>
  );
}
