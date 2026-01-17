"use client";

export default function WhatsAppBubbleSkeleton() {
  return (
    <div className="fixed bottom-24 left-6 z-40">
      <div
        className="h-12 w-12 rounded-full bg-[#0d6e0c] dark:bg-[#7CFC00] animate-pulse shadow-lg"
        aria-hidden="true"
      >
        <span className="sr-only">Loading WhatsApp assistance</span>
      </div>
    </div>
  );
}
