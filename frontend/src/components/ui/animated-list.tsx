"use client";

import React, { useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { AnimatePresence, motion, type MotionProps } from "motion/react";
import { cn } from "@/lib/utils";

// Ported from magicuidesign/magicui's AnimatedList (apps/www/registry/magicui/animated-list.tsx).

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations: MotionProps = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, ...props }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

    // Only start (and replay) the reveal once the list has actually
    // scrolled into view, rather than the instant it mounts off-screen.
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible((wasVisible) => {
            if (entry.isIntersecting && !wasVisible) {
              setIndex(0);
              return true;
            }
            if (!entry.isIntersecting && wasVisible) {
              return false;
            }
            return wasVisible;
          });
        },
        { threshold: 0.35 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!isVisible) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        // Show the full list at once instead of looping the staggered reveal.
        setIndex(childrenArray.length - 1);
        return;
      }

      let timeout: ReturnType<typeof setTimeout> | null = null;

      if (index < childrenArray.length - 1) {
        timeout = setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
        }, delay);
      }

      return () => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
      };
    }, [isVisible, index, delay, childrenArray.length]);

    const itemsToShow = useMemo(() => {
      const result = childrenArray.slice(0, index + 1).reverse();
      return result;
    }, [index, childrenArray]);

    return (
      <div ref={containerRef} className={cn(`flex flex-col items-center gap-4`, className)} {...props}>
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as React.ReactElement).key}>{item}</AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = "AnimatedList";
