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
    { value: 'ca', label: 'Català', icon: Globe },
    { value: 'eu', label: 'Euskera', icon: Globe },
    { value: 'gl', label: 'Galego', icon: Globe }
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
        position="right"
        buttonClassName="h-12 px-6 py-3 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200"
      />
    </div>
  );
}
