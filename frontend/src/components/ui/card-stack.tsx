"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
  previousLabel = "Previous",
  nextLabel = "Next",
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  previousLabel?: string;
  nextLabel?: string;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      moveNext();
    }, 5000);
  };

  const movePrevious = () => {
    setCards((prevCards: Card[]) => {
      const newArray = [...prevCards];
      newArray.push(newArray.shift()!);
      return newArray;
    });
    startFlipping();
  };

  const moveNext = () => {
    setCards((prevCards: Card[]) => {
      const newArray = [...prevCards];
      newArray.unshift(newArray.pop()!);
      return newArray;
    });
    startFlipping();
  };

  return (
    <div className="w-full">
      <div className="relative mx-auto h-72 w-[18rem] sm:h-80 sm:w-[22rem] md:h-80 md:w-[28rem]">
        {cards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              className="absolute flex h-72 w-[18rem] flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/[0.1] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05] sm:h-80 sm:w-[22rem] sm:p-6 md:w-[28rem]"
              style={{
                transformOrigin: "top center",
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: cards.length - index,
              }}
            >
              <div className="text-base font-normal leading-relaxed text-neutral-700 dark:text-neutral-200">
                {card.content}
              </div>
              <div>
                <p className="font-medium text-neutral-500 dark:text-white">
                  {card.name}
                </p>
                <p className="font-normal text-neutral-400 dark:text-neutral-200">
                  {card.designation}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-6 px-1">
        <button
          type="button"
          aria-label={previousLabel}
          onClick={movePrevious}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
        >
          <IconArrowNarrowLeft className="h-6 w-6 text-clay dark:text-clay" />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={moveNext}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
        >
          <IconArrowNarrowRight className="h-6 w-6 text-clay dark:text-clay" />
        </button>
      </div>
    </div>
  );
};
