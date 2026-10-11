import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight text highlighter (CSS only, no runtime JS or extra dependency).
 * `marker` paints a highlighter-pen stripe that draws in on scroll where the
 * browser supports scroll-driven animations; `underline` is a brand-colored
 * underline. Both degrade to a static style elsewhere.
 */
export function Highlight({
  children,
  variant = "marker",
  className,
}: {
  children: ReactNode;
  variant?: "marker" | "underline";
  className?: string;
}) {
  return <span className={cn(variant === "marker" ? "hl-marker" : "hl-underline", className)}>{children}</span>;
}

const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__)/g;

/** Renders `**text**` as a marker highlight and `__text__` as an underline. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Highlight key={i} className={className}>
              {part.slice(2, -2)}
            </Highlight>
          );
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          return (
            <Highlight key={i} variant="underline" className={className}>
              {part.slice(2, -2)}
            </Highlight>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
