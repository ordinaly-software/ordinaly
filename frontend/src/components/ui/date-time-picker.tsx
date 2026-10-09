"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Values use the same formats as the native inputs they replace:
//   date -> "YYYY-MM-DD", time -> "HH:mm", date-time -> "YYYY-MM-DDTHH:mm" (local time).

const pad = (n: number) => String(n).padStart(2, "0");
const toDateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDateValue = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

const TRIGGER_CLASSES = cn(
  "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 text-left text-gray-900",
  "transition-all duration-200 hover:bg-gray-50 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
  "dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:bg-gray-600",
);

const PANEL_CLASSES =
  "rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in duration-200 dark:border-white/15 dark:bg-slate-dark";

/** Trigger button + floating panel rendered in a portal, positioned like the Dropdown menu. */
function Popover({
  trigger,
  panelWidth,
  children,
  disabled,
  required,
  hasValue,
  id,
}: {
  trigger: ReactNode;
  panelWidth: number;
  children: (close: () => void) => ReactNode;
  disabled?: boolean;
  required?: boolean;
  hasValue: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  const place = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const padding = 12;
    const height = panelRef.current?.offsetHeight ?? 360;
    const below = rect.bottom + 8;
    const top = below + height <= window.innerHeight - padding ? below : Math.max(padding, rect.top - height - 8);
    const left = Math.min(Math.max(rect.left, padding), Math.max(padding, window.innerWidth - panelWidth - padding));
    setPos((prev) => (prev.top === top && prev.left === left ? prev : { top, left }));
  }, [panelWidth]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    // Captured so scrolling any ancestor of the trigger repositions the panel, but the
    // panel's own lists (hours, minutes) scrolling must not.
    const onScroll = (event: Event) => {
      if (!panelRef.current?.contains(event.target as Node)) place();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, place]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={TRIGGER_CLASSES}
      >
        {trigger}
      </button>
      {/* Keeps native form validation for required pickers without exposing a native control. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={hasValue ? "1" : ""}
          onChange={() => {}}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        />
      )}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            className={PANEL_CLASSES}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: panelWidth, zIndex: 99999 }}
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </div>
  );
}

interface PickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, id, required, disabled, placeholder, className }: PickerProps) {
  const t = useTranslations("datePicker");
  const locale = useLocale();
  const selected = value ? parseDateValue(value) : null;
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);
  const weekdays = useMemo(() => {
    const monday = new Date(2024, 0, 1); // a Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(monday.getFullYear(), 0, 1 + i)),
    );
  }, [locale]);

  const cells = useMemo(() => {
    const lead = (view.getDay() + 6) % 7; // Monday-first
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - lead);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [view]);

  const todayValue = toDateValue(new Date());
  const label = selected ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(selected) : "";

  return (
    <div className={className}>
      <Popover
        id={id}
        disabled={disabled}
        required={required}
        hasValue={Boolean(value)}
        panelWidth={300}
        trigger={
          <>
            <span className={cn("truncate", !label && "text-gray-400")}>{label || placeholder || t("selectDate")}</span>
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-gray-400" />
          </>
        }
      >
        {(close) => (
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={t("previousMonth")}
                onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
                className="rounded-lg p-2 text-slate-medium hover:bg-orange-50 hover:text-slate-dark dark:text-cloud-medium dark:hover:bg-orange-900/20 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold capitalize text-gray-900 dark:text-white">{monthLabel}</span>
              <button
                type="button"
                aria-label={t("nextMonth")}
                onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
                className="rounded-lg p-2 text-slate-medium hover:bg-orange-50 hover:text-slate-dark dark:text-cloud-medium dark:hover:bg-orange-900/20 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              {weekdays.map((d, i) => (
                <span key={i} className="py-1">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day) => {
                const dayValue = toDateValue(day);
                const inMonth = day.getMonth() === view.getMonth();
                const isSelected = dayValue === value;
                return (
                  <button
                    key={dayValue}
                    type="button"
                    onClick={() => {
                      onChange(dayValue);
                      close();
                    }}
                    className={cn(
                      "h-9 rounded-lg text-sm transition-colors duration-150",
                      isSelected
                        ? "bg-orange-500 font-semibold text-white"
                        : cn(
                            "hover:bg-orange-50 dark:hover:bg-orange-900/20",
                            inMonth ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500",
                            dayValue === todayValue && "ring-1 ring-orange-500/60",
                          ),
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-sm dark:border-white/10">
              {required ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    close();
                  }}
                  className="rounded-lg px-2 py-1 text-slate-medium hover:bg-orange-50 hover:text-slate-dark dark:text-cloud-medium dark:hover:bg-orange-900/20 dark:hover:text-white"
                >
                  {t("clear")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onChange(todayValue);
                  close();
                }}
                className="rounded-lg px-2 py-1 font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
              >
                {t("today")}
              </button>
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTE_STEP = 5;

function TimeColumn({ items, current, onPick }: { items: string[]; current: string; onPick: (item: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  // Runs once, when the panel opens: center the current value inside its own list
  // (without scrolling the page). Later renders must not touch the user's scroll position.
  useLayoutEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[data-active='true']");
    if (list && active) list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
  }, []);

  return (
    <div ref={listRef} className="relative max-h-56 flex-1 overflow-y-auto overscroll-contain p-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          data-active={item === current}
          onClick={() => onPick(item)}
          className={cn(
            "block w-full rounded-lg py-2 text-center text-sm transition-colors duration-150",
            item === current
              ? "bg-orange-500 font-semibold text-white"
              : "text-slate-dark hover:bg-orange-50 dark:text-white dark:hover:bg-orange-900/20",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function TimePicker({ value, onChange, id, required, disabled, placeholder, className }: PickerProps) {
  const t = useTranslations("datePicker");
  const [hour, minute] = value ? value.split(":") : ["", ""];
  const minutes = useMemo(() => {
    const base = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => pad(i * MINUTE_STEP));
    // Keep an existing value that is not on the grid (e.g. 10:07) selectable.
    return minute && !base.includes(minute) ? [...base, minute].sort() : base;
  }, [minute]);

  return (
    <div className={className}>
      <Popover
        id={id}
        disabled={disabled}
        required={required}
        hasValue={Boolean(value)}
        panelWidth={180}
        trigger={
          <>
            <span className={cn("truncate", !value && "text-gray-400")}>{value || placeholder || t("selectTime")}</span>
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          </>
        }
      >
        {() => (
          <div className="flex divide-x divide-gray-100 dark:divide-white/10">
            <TimeColumn items={HOURS} current={hour} onPick={(h) => onChange(`${h}:${minute || "00"}`)} />
            <TimeColumn items={minutes} current={minute} onPick={(m) => onChange(`${hour || "09"}:${m}`)} />
          </div>
        )}
      </Popover>
    </div>
  );
}

/** Date + time as two pickers; the value is empty until a date is chosen (time then defaults to 09:00). */
export function DateTimePicker({ value, onChange, required, disabled, className }: Omit<PickerProps, "id" | "placeholder">) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2", className)}>
      <DatePicker
        value={date}
        required={required}
        disabled={disabled}
        onChange={(d) => onChange(d ? `${d}T${time || "09:00"}` : "")}
      />
      <TimePicker value={time} disabled={disabled || !date} onChange={(tm) => date && onChange(`${date}T${tm}`)} />
    </div>
  );
}
