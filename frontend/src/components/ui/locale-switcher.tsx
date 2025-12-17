'use client';

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { getCookiePreferences } from "@/utils/cookieManager";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const localeOptions: DropdownOption[] = [
    { value: 'en', label: 'English', icon: Globe },
    { value: 'es', label: 'Español', icon: Globe },
  ];

  const handleLocaleChange = (value: string) => {
    startTransition(() => {
      router.push(pathname, { locale: value });
    });

    try {
      const preferences = getCookiePreferences();
      const canPersist = Boolean(preferences?.functional);
      if (canPersist) {
        localStorage.setItem('preferred-locale', value);
      } else {
        localStorage.removeItem('preferred-locale');
      }
    } catch {
      // Ignore storage failures
    }
  };

  return (
    <div className="locale-switcher">
      <Dropdown
        options={localeOptions}
        value={currentLocale}
        onChange={handleLocaleChange}
        disabled={isPending}
        minWidth="140px"
        direction="up"
        theme="default"
        buttonClassName="flex h-11 items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 text-sm font-semibold shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/15 dark:bg-[#0b1220]/80 dark:text-white"
        dropdownClassName="rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur dark:bg-[#0b1220]/95 dark:border-white/15"
      />
    </div>
  );
}
