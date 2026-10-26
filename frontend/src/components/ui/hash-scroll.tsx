"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

// How long we keep the target anchored while dynamic chunks, skeletons and images settle.
const SETTLE_MS = 3000;
const USER_INPUT_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Scrolls to `#hash` on arrival. The browser does it once, before hydration and before the
 * deferred/dynamic sections reach their final height, so the page ends up at the top or off-target.
 * We re-align until layout settles, and stop as soon as the user takes over.
 */
export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const run = () => {
      cleanup?.();
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      const align = () =>
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });

      align();
      const observer = new ResizeObserver(align);
      observer.observe(document.body);
      const timeout = window.setTimeout(stop, SETTLE_MS);

      function stop() {
        observer.disconnect();
        window.clearTimeout(timeout);
        USER_INPUT_EVENTS.forEach((event) => window.removeEventListener(event, stop));
        cleanup = undefined;
      }
      USER_INPUT_EVENTS.forEach((event) => window.addEventListener(event, stop, { passive: true }));
      cleanup = stop;
    };

    run();
    window.addEventListener("hashchange", run);
    return () => {
      window.removeEventListener("hashchange", run);
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
