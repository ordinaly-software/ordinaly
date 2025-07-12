'use client';

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const handleLocaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.push(`/${nextLocale}`);
    });
  };

  return (
    <div className="locale-switcher relative inline-flex">
      <select 
        id="locale-select" 
        defaultValue={currentLocale}
        onChange={handleLocaleChange}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold",
          "ring-offset-background transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30", 
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", 
          "disabled:pointer-events-none disabled:opacity-50 h-12 px-8 py-3 pr-10",
          "cursor-pointer appearance-none bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        <option value="en">
          English
        </option>
        <option value="es">
          Español
        </option>
      </select>
      
      {/* Dropdown arrow using Lucide icon for consistency */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-foreground">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}