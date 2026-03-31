"use client";

import { LogoCarousel, type LogoCarouselLogo } from "@/components/ui/logo-carousel";
import { cn } from "@/lib/utils";

export const defaultPartnerLogos: LogoCarouselLogo[] = [
  "/static/logos/logo_aviva_publicidad_small.webp",
  "/static/logos/logo_grupo_addu_small.webp",
  "/static/logos/logo_proinca_consultores_small.webp",
  "/static/logos/logo_guadalquivir_fincas_small.webp",
  "/static/logos/logo_esau.webp",
  "/static/logos/logo_geesol.webp",
].map((src, index) => ({
  name: src,
  id: index + 1,
  img: ({ className }: { className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      src={src}
      alt=""
      className={cn("object-contain invert brightness-0 contrast-100", className)}
    />
  ),
}));

interface PartnerShowcaseProps {
  eyebrow: string;
  title: string;
  logos?: LogoCarouselLogo[];
  className?: string;
  panelClassName?: string;
  columnCount?: number;
  mobileColumnCount?: number;
}

export function PartnerShowcase({
  eyebrow,
  title,
  logos = defaultPartnerLogos,
  className,
  panelClassName,
  columnCount = 3,
  mobileColumnCount = 2,
}: PartnerShowcaseProps) {
  return (
    <section className={cn("w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pb-12", className)}>
      <div
        className={cn(
          "rounded-[2rem] border border-[--color-border-subtle] bg-[--swatch--slate-dark] p-8 md:p-12 dark:border-white/10",
          panelClassName,
        )}
      >
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          <div className="flex-shrink-0 space-y-3 text-white lg:max-w-xs">
            <p className="text-xs uppercase tracking-[0.16em] text-white/50">{eyebrow}</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          </div>
          <div className="flex flex-1 justify-center overflow-hidden">
            <LogoCarousel
              logos={logos}
              columnCount={columnCount}
              mobileColumnCount={mobileColumnCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
