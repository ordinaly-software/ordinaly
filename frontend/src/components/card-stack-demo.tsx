"use client";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

type CardStackDemoProps = {
  items: { title: string; badge: string; text?: string }[];
  previousLabel: string;
  nextLabel: string;
};

export default function CardStackDemo({ items, previousLabel, nextLabel }: CardStackDemoProps) {
  const locale = useLocale();
  const isEs = locale.startsWith("es");
  const cards = items.map((item, index) => ({
    id: index,
    name: item.title,
    designation: item.badge,
    content: <p>{buildHighlightedText(item.text, isEs)}</p>,
  }));

  return (
    <div className="flex w-full items-center justify-center py-4">
      <CardStack items={cards} previousLabel={previousLabel} nextLabel={nextLabel} />
    </div>
  );
}

// Highlight utility
export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};

function buildHighlightedText(text: string | undefined, isEs: boolean) {
  if (!text) return "";

  const highlightPhrases = isEs
    ? [
        "85% de las tareas administrativas",
        "30% en productividad",
        "milisegundos",
        "falta de hábitos",
        "mal uso o falta de políticas internas",
      ]
    : [
        "85% of administrative tasks",
        "30% productivity increase",
        "milliseconds",
        "lack of habits",
        "misuse or lack of internal policies",
      ];

  for (const phrase of highlightPhrases) {
    if (text.includes(phrase)) {
      const [before, after] = text.split(phrase);
      return (
        <>
          {before}
          <Highlight>{phrase}</Highlight>
          {after}
        </>
      );
    }
  }

  return text;
}
