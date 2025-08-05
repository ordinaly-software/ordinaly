'use client';

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";

export default function LocaleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const localeOptions: DropdownOption[] = [
    { value: 'en', label: 'English', icon: Globe },
    { value: 'es', label: 'Español', icon: Globe }
  ];

  const handleLocaleChange = (value: string) => {
    startTransition(() => {
      router.push(`/${value}`);
    });
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