'use client';

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";


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
      <div className="locale-switcher relative">
        <select 
          id="locale-select" 
          defaultValue={currentLocale}
          onChange={handleLocaleChange}
          disabled={isPending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-12 px-4 pr-10 cursor-pointer appearance-none bg-transparent dark:hover:bg-gray-800"
        >
          <option value="en">
              English
          </option>
          <option value="es">
              Español
          </option>
        </select>
        
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
}