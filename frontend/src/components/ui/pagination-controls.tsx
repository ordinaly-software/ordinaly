"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";

export interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PaginationControls({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationControlsProps) {
  const t = useTranslations("admin.pagination");

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = clamp(currentPage, 1, totalPages);

  const sizeOptions = useMemo<DropdownOption[]>(
    () =>
      pageSizeOptions.map((size) => ({
        value: String(size),
        label: String(size),
      })),
    [pageSizeOptions]
  );

  if (totalItems <= pageSize && totalItems > 0 && !onPageSizeChange) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className ?? ""}`}>
      {onPageSizeChange && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="whitespace-nowrap">{t("perPage")}:</span>
          <Dropdown
            options={sizeOptions}
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            minWidth="100px"
            width="100px"
            theme="orange"
          />
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            aria-label={t("first")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            aria-label={t("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {t("page")} <strong className="text-gray-900 dark:text-white">{safeCurrentPage}</strong>{" "}
            {t("of")} <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            aria-label={t("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage === totalPages}
            aria-label={t("last")}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

