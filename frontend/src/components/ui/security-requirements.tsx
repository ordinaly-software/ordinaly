import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SecurityRequirementsPricing {
  individualPrice: string;
  individualLabel: string;
  comboPrice?: string;
  comboLabel?: string;
  comboNote?: string;
  implementationTime?: string;
  implementationLabel?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface SecurityRequirementsProps {
  trustTitle?: string;
  trustPoints?: string[];
  requirementsTitle?: string;
  requirements?: string[];
  pricing: SecurityRequirementsPricing;
  accentClassName?: string;
  className?: string;
}

export function SecurityRequirements({
  trustTitle,
  trustPoints,
  requirementsTitle,
  requirements,
  pricing,
  accentClassName = "text-[#d97757]",
  className,
}: SecurityRequirementsProps) {
  const hasRequirements = requirements && requirements.length > 0;
  return (
    <section className={cn("py-20 md:py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors", className)}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Trust */}
        {trustPoints && trustPoints.length > 0 && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mb-8">
              {trustTitle}
            </h2>
            <ul className="space-y-4 text-left">
              {trustPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ShieldCheck className={cn("mt-0.5 w-5 h-5 shrink-0", accentClassName)} />
                  <span className="text-neutral-700 dark:text-neutral-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={cn("grid gap-8 items-start", hasRequirements ? "md:grid-cols-2" : "max-w-xl mx-auto")}>
          {/* Pricing */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 shadow-sm">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-neutral-900 dark:text-white">{pricing.individualPrice}</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{pricing.individualLabel}</p>

            {pricing.comboPrice && (
              <div className={cn("rounded-xl p-5 mb-6", accentClassName.replace("text-", "bg-") + "/10")}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">
                  {pricing.comboLabel}
                </p>
                <span className={cn("text-2xl font-bold", accentClassName)}>{pricing.comboPrice}</span>
                {pricing.comboNote && (
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{pricing.comboNote}</p>
                )}
              </div>
            )}

            {pricing.implementationTime && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                <span className="font-semibold text-neutral-900 dark:text-white">{pricing.implementationLabel}</span>{" "}
                {pricing.implementationTime}
              </p>
            )}

            <a
              href={pricing.ctaHref}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02]",
                accentClassName.replace("text-", "bg-"),
              )}
            >
              {pricing.ctaLabel}
            </a>
          </div>

          {/* Requirements */}
          {hasRequirements && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">{requirementsTitle}</h3>
              <ul className="space-y-4">
                {requirements!.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300 text-sm">
                    <span className={cn("mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full", accentClassName.replace("text-", "bg-"))} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
