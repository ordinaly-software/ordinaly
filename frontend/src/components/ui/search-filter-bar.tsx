import { Search, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";

export interface SearchFilterBarFilter {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  minWidth?: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters: SearchFilterBarFilter[];
  className?: string;
  searchInputClassName?: string;
}

const DEFAULT_FILTER_MIN_WIDTH = "clamp(100px, calc(50vw - 48px), 200px)";

/**
 * Search box + dropdown filters shown in the hero banner of listing pages
 * (blog, formación). Below `lg` the search box keeps its own full-width row,
 * but the filters sit in a wrapping flex row together instead of each
 * dropping to its own line — they shrink (and truncate their label) to share
 * the row instead of spilling onto separate ones. From `lg` up, everything
 * (including the search box) reverts to its original natural-width, single-row
 * layout.
 */
export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  className = "",
  searchInputClassName = "focus:border-cobalt dark:focus:border-cobalt-light",
}: SearchFilterBarProps) {
  return (
    <div className={`w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full lg:w-auto lg:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${searchInputClassName}`}
          />
        </div>

        {/* Grouped so the filters always share one row below `lg` (shrinking instead of
            wrapping) rather than each dropping to its own line. From `lg` up this wrapper
            disappears (contents) and each filter reverts to its natural width, unchanged
            from before. */}
        <div className="flex w-full gap-4 lg:contents">
          {filters.map((filter, index) => {
            const minWidth = filter.minWidth ?? DEFAULT_FILTER_MIN_WIDTH;
            return (
              <Dropdown
                key={index}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
                placeholder={filter.placeholder}
                icon={filter.icon}
                minWidth={minWidth}
                className="min-w-0 flex-1 lg:min-w-0 lg:flex-none lg:w-auto"
                containerStyle={{ minWidth }}
                buttonClassName="min-w-0 max-w-full flex-1"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchFilterBar;
