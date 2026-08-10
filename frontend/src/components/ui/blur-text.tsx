"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Ported from reactbits.dev's BlurText (react-bits registry): word-by-word
// blur/opacity reveal, triggered once via IntersectionObserver. Adapted to
// render as a configurable tag (so it can stand in for an h2) and to fall
// back to a quick opacity fade under prefers-reduced-motion.

type MotionSnapshot = Record<string, string | number>;

interface BlurTextProps {
  text: string;
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div";
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: MotionSnapshot;
  animationTo?: MotionSnapshot[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

function buildKeyframes(from: MotionSnapshot, steps: MotionSnapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
}

export function BlurText({
  text,
  as: Tag = "p",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom: MotionSnapshot = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo: MotionSnapshot[] = useMemo(
    () => [
      { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  // Reduced motion: a quick opacity fade, no blur or vertical drift.
  const fromSnapshot: MotionSnapshot = prefersReducedMotion
    ? { opacity: 0 }
    : animationFrom ?? defaultFrom;
  const toSnapshots: MotionSnapshot[] = prefersReducedMotion
    ? [{ opacity: 1 }]
    : animationTo ?? defaultTo;
  const perWordDelay = prefersReducedMotion ? 0 : delay;
  const duration = prefersReducedMotion ? 0.2 : stepDuration;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = duration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

  return (
    <Tag ref={ref as React.Ref<never>} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {elements.map((segment, index) => (
        <motion.span
          className="inline-block will-change-[transform,filter,opacity]"
          key={index}
          initial={fromSnapshot}
          animate={inView ? animateKeyframes : fromSnapshot}
          transition={{
            duration: totalDuration,
            times,
            delay: (index * perWordDelay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === " " ? " " : segment}
          {animateBy === "words" && index < elements.length - 1 && " "}
        </motion.span>
      ))}
    </Tag>
  );
}
