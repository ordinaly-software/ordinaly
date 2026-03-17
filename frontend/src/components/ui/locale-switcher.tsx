'use client';

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
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
        position="center"
        theme="default"
        buttonClassName="flex h-11 items-center gap-2 rounded-full border border-[var(--swatch--cobalt)]/60 bg-white/90 px-4 text-sm font-semibold text-[var(--swatch--slate-dark)] shadow-[0_16px_40px_rgba(2,85,213,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--swatch--cobalt)] hover:shadow-[0_20px_48px_rgba(2,85,213,0.18)] dark:border-[#7DB5FF]/35 dark:bg-[#0b1220]/85 dark:text-white dark:shadow-[0_18px_44px_rgba(2,85,213,0.2)]"
        dropdownClassName="rounded-[28px] border border-[var(--swatch--cobalt)]/12 bg-white/98 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-[#7DB5FF]/18 dark:bg-[#0b1220]/96"
      />
    </div>
  );
}
