"use client";
import React from "react";
// Removed motion import as it's no longer needed for dynamic colors

// Removed COLORS constant as it's no longer needed

export default function ColourfulText({ text }: { text: string }) {

  // Removed useState and useEffect hooks related to color changes

  return (
    <span
      className="inline-block whitespace-pre font-beckman tracking-tight"
      style={{
        background: 'linear-gradient(to right, #32E875, #46B1C9, #623CEA)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {text}
    </span>
  );
}
