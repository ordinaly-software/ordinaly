"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Boxes = () => {
  const rows = 40;
  const cols = 40;

  const colors = [
    "#93c5fd",
    "#f9a8d4",
    "#86efac",
    "#fde047",
    "#fca5a5",
    "#d8b4fe",
    "#a5b4fc",
    "#c4b5fd",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 pointer-events-auto"
        // ❌ Quitamos skew, rotate, scale
      )}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 40px)`,
        gridTemplateRows: `repeat(${rows}, 40px)`,
      }}
    >
      {Array.from({ length: rows }).map((_, i) =>
        Array.from({ length: cols }).map((_, j) => (
          <motion.div
            key={`${i}-${j}`}
            className="relative border border-slate-700 bg-slate-900"
            whileHover={{
              backgroundColor: getRandomColor(),
              transition: { duration: 0 },
            }}
          >
            {i % 4 === 0 && j % 4 === 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="pointer-events-none absolute -top-3 -left-3 h-4 w-4 text-slate-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};
