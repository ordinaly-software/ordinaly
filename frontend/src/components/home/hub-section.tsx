"use client";

import { HubIllustration } from "@/components/ui/hub-illustration";
import {
  SalesCrmFigure,
  CloudDataFigure,
  FinanceFigure,
  TeamsOpsFigure,
} from "@/components/ui/hub-figures";

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

interface HubSectionProps {
  t: TranslateFn;
}

export function HubSection({ t }: HubSectionProps) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A]">
      <div className="max-w-7xl mx-auto">
        <HubIllustration
          title={t("hubIllustration.title")}
          subtitle={t("hubIllustration.subtitle")}
          hubLabel={t("hubIllustration.hubLabel")}
          hubSublabel={t("hubIllustration.hubSublabel")}
          ariaTitle={t("hubIllustration.ariaTitle")}
          ariaDesc={t("hubIllustration.ariaDesc")}
          bgTheme="indigo"
          platforms={[
            {
              position: "top-left",
              label: t("hubIllustration.platforms.topLeft.label"),
              sublabel: t("hubIllustration.platforms.topLeft.sublabel"),
              colorScheme: "indigo",
              figure: SalesCrmFigure,
            },
            {
              position: "top-right",
              label: t("hubIllustration.platforms.topRight.label"),
              sublabel: t("hubIllustration.platforms.topRight.sublabel"),
              colorScheme: "cyan",
              figure: CloudDataFigure,
            },
            {
              position: "bottom-left",
              label: t("hubIllustration.platforms.bottomLeft.label"),
              sublabel: t("hubIllustration.platforms.bottomLeft.sublabel"),
              colorScheme: "indigo",
              figure: FinanceFigure,
            },
            {
              position: "bottom-right",
              label: t("hubIllustration.platforms.bottomRight.label"),
              sublabel: t("hubIllustration.platforms.bottomRight.sublabel"),
              colorScheme: "cyan",
              figure: TeamsOpsFigure,
            },
          ]}
        />
      </div>
    </section>
  );
}
