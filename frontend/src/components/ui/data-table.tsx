"use client";

import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "@/components/ui/pagination-controls";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  /** Value to compare when sorting by this column. Defaults to `row[key]`. */
  sortValue?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableSelection<T> {
  selectedIds: Array<string | number>;
  onToggleRow: (id: string | number) => void;
  /** Called with the ids currently visible (on the current page) when the header checkbox is toggled. */
  onToggleAll: (visibleIds: Array<string | number>) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
  initialSortKey?: string;
  initialSortAsc?: boolean;
  selection?: DataTableSelection<T>;
  /** Enables pagination with this initial page size. Omit to render every row. */
  pageSize?: number;
}

const TH_CLASSES = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider select-none";
const TD_CLASSES = "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white";

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  emptyMessage,
  initialSortKey,
  initialSortAsc = true,
  selection,
  pageSize,
}: DataTableProps<T>) {
  const paginated = pageSize !== undefined;
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [sortAsc, setSortAsc] = useState(initialSortAsc);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize ?? 0);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    const getValue = column?.sortValue ?? ((row: T) => (row as Record<string, unknown>)[sortKey] as string | number);
    return [...rows].sort((a, b) => {
      const aVal = getValue(a) ?? "";
      const bVal = getValue(b) ?? "";
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rows, columns, sortKey, sortAsc]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / (currentPageSize || sortedRows.length || 1)));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleRows = paginated
    ? sortedRows.slice((safeCurrentPage - 1) * currentPageSize, safeCurrentPage * currentPageSize)
    : sortedRows;

  const handleHeaderClick = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) setSortAsc((asc) => !asc);
    else {
      setSortKey(column.key);
      setSortAsc(true);
    }
  };

  if (rows.length === 0) {
    return emptyMessage ? <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p> : null;
  }

  const allVisibleSelected =
    !!selection && visibleRows.length > 0 && visibleRows.every((row) => selection.selectedIds.includes(getRowId(row)));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {selection && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={() => selection.onToggleAll(visibleRows.map(getRowId))}
                    className="rounded border-gray-300 text-[var(--swatch--clay)] focus:ring-[var(--swatch--clay)]"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${TH_CLASSES} ${column.sortable ? "cursor-pointer hover:underline" : ""} ${column.headerClassName ?? ""}`}
                  onClick={() => handleHeaderClick(column)}
                >
                  {column.label}
                  {sortKey === column.key && <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {visibleRows.map((row) => {
              const id = getRowId(row);
              return (
                <tr key={id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  {selection && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selection.selectedIds.includes(id)}
                        onChange={() => selection.onToggleRow(id)}
                        className="rounded border-gray-300 text-[var(--swatch--clay)] focus:ring-[var(--swatch--clay)]"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={`${TD_CLASSES} ${column.cellClassName ?? ""}`}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paginated && (
        <PaginationControls
          totalItems={sortedRows.length}
          currentPage={safeCurrentPage}
          pageSize={currentPageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setCurrentPageSize(size);
            setCurrentPage(1);
          }}
          className="mt-4"
        />
      )}
    </div>
  );
}

export default DataTable;
