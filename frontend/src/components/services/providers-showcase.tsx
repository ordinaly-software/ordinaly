import { cn } from "@/lib/utils";

export interface ProviderLogo {
  name: string;
  src: string;
}

const defaultProviderLogos: ProviderLogo[] = [
  { name: "ElevenLabs", src: "/static/logos/providers/elevenlabs.svg" },
  { name: "Google Gemini", src: "/static/logos/providers/gemini.svg" },
  { name: "Retell", src: "/static/logos/providers/retell.svg" },
  { name: "Netelip", src: "/static/logos/providers/netelip.png" },
];

interface ProvidersShowcaseProps {
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  logos?: ProviderLogo[];
  className?: string;
}

/**
 * Adapted from a prebuiltui "trusted by" panel: same rounded dark-panel shell
 * and glow blobs as ToolsShowcase/PartnerShowcase, recolored from the
 * original purple gradient to the site's clay/flame brand tones, with the
 * single hero image replaced by a grid of real provider logos.
 */
export function ProvidersShowcase({
  badge,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  logos = defaultProviderLogos,
  className,
}: ProvidersShowcaseProps) {
  return (
    <section className={cn("w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pb-12", className)}>
      <div className="relative overflow-hidden rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 size-64 rounded-full bg-clay/30 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-10 size-64 rounded-full bg-flame/30 blur-[120px]"
        />

        <div className="relative flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm text-white/80">
              <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-white">IA</span>
              {badge}
            </span>
            <h2 className="mt-5 max-w-xl bg-gradient-to-r from-white to-ivory-light bg-clip-text text-3xl font-semibold text-transparent">
              {title}
            </h2>
            <p className="mt-4 max-w-lg text-base text-white/60">{subtitle}</p>
            <a
              href={ctaHref}
              className="mt-6 inline-flex items-center gap-1 rounded-full border border-white/20 px-6 py-2.5 text-sm text-white transition hover:bg-white/10 active:scale-95"
            >
              {ctaLabel}
            </a>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-4 md:w-auto">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex h-24 w-full items-center justify-center rounded-2xl bg-white/5 p-5 sm:w-36"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-10 w-full object-contain invert brightness-0 contrast-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
