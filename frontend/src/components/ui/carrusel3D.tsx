"use client";
import { useState } from "react";

export default function Carousel3D() {
  const images = [
    "/assets/1-ordinaly.webp",
    "/assets/2-ordinaly.webp",
    "/assets/3-ordinaly.webp",
    "/assets/4-ordinaly.webp",
    "/assets/5-ordinaly.webp",
    "/assets/6-ordinaly.webp"
  ];

  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full max-w-4xl mx-auto py-16">
      <div className="relative h-72 flex items-center justify-center perspective">
        {images.map((src, i) => {
          const offset = i - index;
          const absOffset = Math.abs(offset);

          return (
            <img
              key={i}
              src={src}
              alt=""
              className={`
                absolute w-56 h-72 object-cover rounded-xl shadow-xl transition-all duration-500
                ${offset === 0 ? "z-20 scale-110" : "z-10 scale-90"}
              `}
              style={{
                transform: `
                  translateX(${offset * 220}px)
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
          onClick={prev}
          className="px-4 py-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition"
        >
          ←
        </button>
        <button
          onClick={next}
          className="px-4 py-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
