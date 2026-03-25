"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export default function SparklesPreview() {
  return (
    <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">

      <div className="w-full h-40 relative px-0">
        {/* Gradients */}
        <div className="absolute left-0 right-0 top-20 bg-gradient-to-r from-transparent via-orange-400 to-transparent h-[10px] w-full blur-xl" />
        <div className="absolute left-0 right-0 top-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent h-[3px] w-full" />
        <div className="absolute left-[10%] right-[10%] top-0 bg-gradient-to-r from-transparent via-sky-400 to-transparent h-[6px] w-[80%] blur-md" />
        <div className="absolute left-[10%] right-[10%] top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[2px] w-[80%]" />


        {/* Core component */}
        <div className="absolute inset-0 pt-20">
          <SparklesCore
            background="transparent"
            minSize={1.5}
            maxSize={1.8}
            particleDensity={800}
            className="w-full h-full"
            particleColor="#d97757"
          />
        </div>


        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(900px_500px_at_top,transparent_10%,white)]"></div>
      </div>
    </div>
  );
}
