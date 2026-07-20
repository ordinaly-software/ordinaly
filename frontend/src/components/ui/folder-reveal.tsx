"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagesBadge } from "@/components/ui/images-badge";

const DOC_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#fff7ed"/><rect x="14" y="8" width="36" height="48" rx="4" fill="#ffffff" stroke="#d97706" stroke-width="3"/><line x1="20" y1="22" x2="44" y2="22" stroke="#d97706" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="30" x2="44" y2="30" stroke="#d97706" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="38" x2="34" y2="38" stroke="#d97706" stroke-width="3" stroke-linecap="round"/></svg>',
)}`;

const SCAN_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#fff7ed"/><rect x="12" y="16" width="30" height="38" rx="4" fill="#ffffff" stroke="#d97706" stroke-width="3"/><circle cx="40" cy="42" r="12" fill="#fde68a" stroke="#d97706" stroke-width="3"/><line x1="49" y1="51" x2="56" y2="58" stroke="#d97706" stroke-width="4" stroke-linecap="round"/></svg>',
)}`;

const ARCHIVE_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#fff7ed"/><rect x="10" y="24" width="44" height="30" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="3"/><path d="M10 24 L18 12 H46 L54 24" fill="#fde68a" stroke="#d97706" stroke-width="3" stroke-linejoin="round"/><path d="M25 38 L30 43 L40 32" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
)}`;

export interface FolderCardItem {
  title: string;
  icon?: React.ReactNode;
}

function PaperSlip({ item, index }: { item: FolderCardItem; index: number }) {
  const rotation = index % 2 === 0 ? "-1.5deg" : "1.5deg";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ rotate: 0, y: -6, scale: 1.02 }}
      className="relative bg-white dark:bg-neutral-100 text-neutral-900 shadow-lg px-6 py-6 flex items-center gap-4"
      style={{
        clipPath:
          "polygon(0% 0%, 100% 0%, 100% 92%, 96% 100%, 92% 92%, 88% 100%, 84% 92%, 80% 100%, 76% 92%, 72% 100%, 68% 92%, 64% 100%, 60% 92%, 56% 100%, 52% 92%, 48% 100%, 44% 92%, 40% 100%, 36% 92%, 32% 100%, 28% 92%, 24% 100%, 20% 92%, 16% 100%, 12% 92%, 8% 100%, 4% 92%, 0% 100%)",
      }}
    >
      {item.icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d97706]/10 text-[#d97706]">
          {item.icon}
        </div>
      )}
      <p className="font-semibold leading-snug">{item.title}</p>
    </motion.div>
  );
}

export function FolderReveal({
  items,
  badgeText,
  className,
}: {
  items: FolderCardItem[];
  badgeText: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-12", className)}>
      <ImagesBadge
        text={badgeText}
        images={[DOC_ICON, SCAN_ICON, ARCHIVE_ICON]}
        className="scale-150 md:scale-[1.8]"
        folderSize={{ width: 40, height: 30 }}
        teaserImageSize={{ width: 22, height: 22 }}
        hoverImageSize={{ width: 52, height: 52 }}
        hoverTranslateY={-38}
        hoverSpread={26}
        hoverRotation={14}
      />

      {/* Paper slips */}
      <div className="grid sm:grid-cols-2 gap-6 w-full">
        {items.map((item, i) => (
          <PaperSlip key={item.title} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
