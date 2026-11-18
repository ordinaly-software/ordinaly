"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const PHONE = "+34626270806";
const PHONE_DISPLAY = "+34 626 27 08 06";
const EMAIL = "info@ordinaly.ai";

type TriggerState = {
  open: boolean;
  buttonProps: {
    type: "button";
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-controls": string;
  };
};

const PLACEMENTS = {
  /** Above the trigger, horizontally centered (floating CTA, course buttons). */
  top: { className: "w-64 bottom-full left-1/2 mb-3 origin-bottom", x: "-50%", y: 8 },
  /** Below the trigger, aligned to its right edge (navbar). */
  "bottom-end": { className: "w-64 top-full right-0 mt-2 origin-top-right", x: 0, y: -8 },
  /** Docked to the bottom of the trigger's container, inside it (cards with overflow hidden). */
  inset: { className: "inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 origin-bottom", x: 0, y: 8 },
} as const;

/**
 * Contact options menu (WhatsApp, phone, email) opened by a trigger the caller renders.
 * The caller spreads `buttonProps` onto its own button so it keeps its own styling.
 */
export function ContactMenu({
  whatsappHref,
  email,
  placement = "top",
  className,
  children,
}: {
  whatsappHref: string | null;
  /** Pre-filled subject and body for the email option. */
  email?: { subject: string; body: string };
  placement?: keyof typeof PLACEMENTS;
  className?: string;
  children: (state: TriggerState) => ReactNode;
}) {
  const t = useTranslations("common.floatingContact");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const p = PLACEMENTS[placement];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const options = [
    ...(whatsappHref
      ? [{ href: whatsappHref, label: "WhatsApp", detail: t("whatsappDetail"), icon: <IconWhatsApp size={18} />, color: "bg-[#0d6e0c] text-white dark:bg-[#3FBD6F] dark:text-[#0B1B17]", external: true }]
      : []),
    { href: `tel:${PHONE}`, label: t("call"), detail: PHONE_DISPLAY, icon: <Phone className="h-4 w-4" />, color: "bg-[--swatch--slate-dark] text-white dark:bg-[--swatch--slate-medium]" },
    { href: `mailto:${EMAIL}${email ? `?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}` : ""}`, label: t("email"), detail: EMAIL, icon: <Mail className="h-4 w-4" />, color: "bg-cobalt text-white" },
  ];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            initial={{ opacity: 0, y: p.y, scale: 0.97, x: p.x }}
            animate={{ opacity: 1, y: 0, scale: 1, x: p.x }}
            exit={{ opacity: 0, y: p.y, scale: 0.97, x: p.x }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900",
              p.className
            )}
          >
            {options.map((o) => (
              <li key={o.href}>
                <a
                  href={o.href}
                  {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${o.color}`}>
                    {o.icon}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold text-neutral-900 dark:text-white">{o.label}</span>
                    <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{o.detail}</span>
                  </span>
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {children({
        open,
        buttonProps: {
          type: "button",
          onClick: () => setOpen((v) => !v),
          "aria-expanded": open,
          "aria-controls": menuId,
        },
      })}
    </div>
  );
}
