"use client";
import { useState } from "react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

export default function Carousel3D({ images }: { images: readonly string[] }) {

  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full max-w-6xl mx-auto py-8">
      <div className="relative h-[26rem] flex items-center justify-center perspective">
        {images.map((src, i) => {
          const offset = i - index;
          const absOffset = Math.abs(offset);

          return (
            <img
              key={i}
              src={src}
              alt=""
              className={`
                absolute w-72 h-[23rem] object-cover rounded-xl shadow-xl transition-all duration-500
                ${offset === 0 ? "z-20 scale-110" : "z-10 scale-90"}
              `}
              style={{
                transform: `
                  translateX(${offset * 270}px)
                  rotateY(${offset * -35}deg)
                  translateZ(${absOffset === 0 ? "80px" : "0px"})
                `,
                opacity: absOffset > 2 ? 0 : 1,
              }}
            />
          );
        })}
      </div>

      <div className="flex justify-center gap-6 mt-10">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
        >
          <IconArrowNarrowLeft className="h-6 w-6 text-clay dark:text-clay" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-oat dark:bg-[--swatch--slate-medium] disabled:opacity-50"
        >
          <IconArrowNarrowRight className="h-6 w-6 text-clay dark:text-clay" />
        </button>
      </div>
    </div>
  );
}
