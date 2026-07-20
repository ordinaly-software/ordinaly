"use client";

import { Mail, FileText, Database, MessageCircle, Cloud, Bell, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NodePosition {
  icon: React.ReactNode;
  top: string;
  left: string;
}

const NODES: NodePosition[] = [
  { icon: <Mail className="w-5 h-5" />, top: "6%", left: "10%" },
  { icon: <FileText className="w-5 h-5" />, top: "6%", left: "82%" },
  { icon: <Database className="w-5 h-5" />, top: "50%", left: "2%" },
  { icon: <Cloud className="w-5 h-5" />, top: "50%", left: "90%" },
  { icon: <MessageCircle className="w-5 h-5" />, top: "92%", left: "14%" },
  { icon: <Bell className="w-5 h-5" />, top: "92%", left: "78%" },
];

export function AutomationFlow({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square w-full max-w-md mx-auto", className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {NODES.map((node, i) => {
          const x2 = parseFloat(node.left) + 4;
          const y2 = parseFloat(node.top) + 4;
          return (
            <g key={i}>
              <line
                x1="50"
                y1="50"
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="0.6"
                className="text-neutral-300 dark:text-neutral-700"
              />
              <motion.circle
                r="1.3"
                fill="#d97757"
                initial={{ cx: x2, cy: y2, opacity: 0 }}
                animate={{ cx: [x2, 50], cy: [y2, 50], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}
      </svg>

      {NODES.map((node, i) => (
        <div
          key={i}
          className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 shadow-md text-neutral-600 dark:text-neutral-300"
          style={{ top: node.top, left: node.left }}
        >
          {node.icon}
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d97757] text-white shadow-xl">
        <Workflow className="w-9 h-9" />
      </div>
    </div>
  );
}
