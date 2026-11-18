"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { MessageCircle, X } from "lucide-react";
import { ContactMenu } from "@/components/ui/contact-menu";

const SHOW_AFTER_PX = 80;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Bottom-centered contact CTA that slides in once the page is scrolled past the header. */
export function FloatingCta({ href, label }: { href: string; label: string }) {
  const t = useTranslations("common.floatingContact");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 24, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-[calc(50%+2.5rem)] sm:left-1/2 z-50 max-w-[calc(100vw-7rem)] sm:max-w-none"
        >
          <ContactMenu whatsappHref={href}>
            {({ open, buttonProps }) => (
              <motion.button
                {...buttonProps}
                layout
                transition={{ layout: { type: "spring", bounce: 0, duration: 0.45 } }}
                className="flex w-full items-center gap-2 sm:gap-3 overflow-hidden whitespace-nowrap text-sm sm:text-base text-white font-semibold px-4 sm:px-6 py-3 shadow-xl"
                style={{ backgroundColor: "var(--swatch--clay-fill)", borderRadius: 9999 }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={open ? "close" : "label"}
                    layout="position"
                    initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="flex min-w-0 items-center gap-2 sm:gap-3"
                  >
                    {open ? (
                      <X className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
                    ) : (
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">{open ? t("close") : label}</span>
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            )}
          </ContactMenu>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
