"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  IconInbox,
  IconGitBranch,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconMail,
  IconDatabase,
  IconCircleCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface N8nFlowContent {
  fileName: string;
  liveLabel: string;
  inputLabel: string;
  logicLabel: string;
  nodeWhatsapp: string;
  nodeCalendly: string;
  nodeGmail: string;
  nodeDatabase: string;
  footerPrefix: string;
  footerSuffix: string;
}

const STAGE_COUNT = 4; // input -> logic -> integrations -> done
const STAGE_INTERVAL = 1100;
const LOOP_PAUSE = 1800;

const springSettle = { type: "spring" as const, stiffness: 300, damping: 26 };

function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative h-8 w-px overflow-hidden bg-white/10">
      <motion.div
        className="absolute inset-x-0 top-0 bg-clay"
        initial={{ height: 0 }}
        animate={{ height: active ? "100%" : 0 }}
        transition={springSettle}
      />
    </div>
  );
}

function FlowNode({
  icon: Icon,
  label,
  active,
  emphasis,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  emphasis?: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: active ? 1 : 0.96,
        opacity: active ? 1 : 0.4,
      }}
      transition={springSettle}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl",
        active
          ? emphasis
            ? "border-clay/50 bg-clay/10"
            : "border-white/15 bg-white/[0.06]"
          : "border-white/5 bg-white/[0.02]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
          active ? "bg-clay text-white" : "bg-white/10 text-white/40",
        )}
      >
        <Icon size={18} />
      </span>
      <span className={cn("text-sm font-semibold transition-colors duration-300", active ? "text-white" : "text-white/40")}>
        {label}
      </span>
    </motion.div>
  );
}

function IntegrationChip({
  icon: Icon,
  label,
  active,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0.35,
        y: active ? 0 : 4,
      }}
      transition={{ ...springSettle, delay: active ? delay : 0 }}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2.5",
        active ? "border-white/15 bg-white/[0.06]" : "border-white/5 bg-transparent",
      )}
    >
      <Icon size={16} className={active ? "text-clay" : "text-white/30"} />
      <span className={cn("text-xs font-medium", active ? "text-white/90" : "text-white/30")}>{label}</span>
    </motion.div>
  );
}

/**
 * A refined, brand-colored visualization of a lead moving through an n8n
 * workflow: input -> logic -> a fan-out of integrations -> done. Reveal is
 * spring-driven (critically damped, no gimmicky overshoot) and only runs
 * once the panel has scrolled into view, respecting reduced-motion.
 */
export default function N8nFlow({ content }: { content: N8nFlowContent }) {
  const [stage, setStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion) {
      setStage(STAGE_COUNT - 1);
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const run = (current: number) => {
      if (cancelled) return;
      setStage(current);
      if (current < STAGE_COUNT - 1) {
        timeout = setTimeout(() => run(current + 1), STAGE_INTERVAL);
      } else {
        timeout = setTimeout(() => {
          if (cancelled) return;
          setStage(0);
          timeout = setTimeout(() => run(1), STAGE_INTERVAL);
        }, LOOP_PAUSE);
      }
    };
    run(0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isVisible, prefersReducedMotion]);

  const running = isVisible && !prefersReducedMotion && stage < STAGE_COUNT - 1;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[--swatch--slate-dark]/95 shadow-[0_32px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    >
      {/* Chrome header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="truncate font-mono text-[11px] text-white/30">{content.fileName}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full transition-colors", running ? "bg-clay animate-pulse" : "bg-white/15")} />
          <span className="text-[10px] font-mono text-white/30">{content.liveLabel}</span>
        </div>
      </div>

      {/* Flow */}
      <div className="flex flex-col items-center px-6 py-8">
        <FlowNode icon={IconInbox} label={content.inputLabel} active={stage >= 0} />
        <Connector active={stage >= 1} />
        <FlowNode icon={IconGitBranch} label={content.logicLabel} active={stage >= 1} emphasis />
        <Connector active={stage >= 2} />

        <div className="grid w-full grid-cols-2 gap-2">
          <IntegrationChip icon={IconBrandWhatsapp} label={content.nodeWhatsapp} active={stage >= 2} delay={0} />
          <IntegrationChip icon={IconCalendarEvent} label={content.nodeCalendly} active={stage >= 2} delay={0.06} />
          <IntegrationChip icon={IconMail} label={content.nodeGmail} active={stage >= 2} delay={0.12} />
          <IntegrationChip icon={IconDatabase} label={content.nodeDatabase} active={stage >= 2} delay={0.18} />
        </div>

        <Connector active={stage >= 3} />

        <AnimatePresence mode="wait">
          {stage >= 3 ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springSettle}
              className="flex items-center gap-3 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-white">
                <IconCircleCheck size={18} />
              </span>
              <span className="text-sm font-semibold text-white">{content.footerSuffix}</span>
            </motion.div>
          ) : (
            <FlowNode icon={IconCircleCheck} label={content.footerSuffix} active={false} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
