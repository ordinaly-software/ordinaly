"use client";

import { useEffect, useRef } from "react";
import createGlobe, { COBEOptions } from "cobe";
import { useScroll, useTransform, motion } from "framer-motion";

interface GlobeCanvasProps {
  size: number;
  isDark: boolean;
}

function GlobeCanvas({ size, isDark }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Realistic Earth look: deep blue oceans, bright continents
    const config: COBEOptions = isDark
      ? {
          devicePixelRatio: Math.min(window.devicePixelRatio, 2),
          width: size * 2,
          height: size * 2,
          phi: -0.6,       // angle facing Europe/Africa
          theta: 0.25,     // slight tilt
          dark: 1,
          diffuse: 2.2,
          mapSamples: 24000,
          mapBrightness: 9,
          baseColor: [0.008, 0.333, 0.835],    // cobalt #0255D5 — deep ocean
          markerColor: [0.882, 0.365, 0.192],   // flame #E15D31
          glowColor: [0.039, 0.196, 0.498],     // deep cobalt glow
          markers: [
            { location: [37.39, -5.99], size: 0.09 }, // Sevilla
          ],
          onRender(state) {
            state.phi = -0.6;  // fixed — no rotation
            state.width = width * 2;
            state.height = width * 2;
          },
        }
      : {
          devicePixelRatio: Math.min(window.devicePixelRatio, 2),
          width: size * 2,
          height: size * 2,
          phi: -0.6,
          theta: 0.25,
          dark: 0,
          diffuse: 2.5,
          mapSamples: 24000,
          mapBrightness: 10,
          baseColor: [0.008, 0.333, 0.835],    // cobalt #0255D5 — deep ocean
          markerColor: [0.882, 0.365, 0.192],   // flame #E15D31
          glowColor: [0.6, 0.78, 0.98],         // light blue glow
          markers: [
            { location: [37.39, -5.99], size: 0.09 }, // Sevilla
          ],
          onRender(state) {
            state.phi = -0.6;  // fixed — no rotation
            state.width = width * 2;
            state.height = width * 2;
          },
        };

    const globe = createGlobe(canvasRef.current, config);

    return () => {
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, [isDark, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        aspectRatio: "1",
      }}
    />
  );
}

interface ScrollFadeGlobeProps {
  className?: string;
  size?: number;
  isDark?: boolean;
}

// Apple product page effect: globe moves UP as user scrolls down
export default function ScrollFadeGlobe({
  className,
  size = 560,
  isDark = false,
}: ScrollFadeGlobeProps) {
  const { scrollYProgress } = useScroll();
  // Translate upward 30% of the globe height as user scrolls through the first 50% of the page
  const y = useTransform(scrollYProgress, [0, 0.5], ["0%", "-30%"]);

  return (
    <motion.div
      style={{ y, willChange: "transform" }}
      className={className}
    >
      <GlobeCanvas size={size} isDark={isDark} />
    </motion.div>
  );
}
