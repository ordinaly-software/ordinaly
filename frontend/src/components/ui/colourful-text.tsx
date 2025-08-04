"use client";
import React from "react";

export default function ColourfulText({ text }: { text: string }) {
  return (
    <span
      className="inline-block whitespace-pre font-beckman tracking-tight"
      style={{
        background: 'linear-gradient(to right, #29BF12, #46B1C9, #623CEA)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {text}
    </span>
  );
}
