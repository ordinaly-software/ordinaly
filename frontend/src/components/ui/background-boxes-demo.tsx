"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function BackgroundBoxesDemo() {
  return (
    <div className="h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
      
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <div className="absolute inset-0 -z-10 boxes-optimized" />

      <h1 className={cn("md:text-4xl text-xl text-white relative z-20")}>
        Inteligencia Artificial en Sevilla
      </h1>

      <p className="text-center mt-2 text-neutral-300 relative z-20">
        Automatizamos, optimizamos y escalamos procesos con IA para que tu empresa gane velocidad y precisión
      </p>
    </div>
  );
}
