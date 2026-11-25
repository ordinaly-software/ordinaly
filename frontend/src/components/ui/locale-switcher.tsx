'use client';

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { SegmentedControl } from "glisse";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { isFunctionalAllowed } from "@/utils/cookie-manager";

interface LocaleSwitcherProps {
  variant?: "pill";
  label?: string;
}

const LOCALES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

export default function LocaleSwitcher({ variant, label }: LocaleSwitcherProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const handleLocaleChange = (value: string) => {
    startTransition(() => {
      router.push(pathname, { locale: value });
    });
    try {
      const canPersist = isFunctionalAllowed();
      if (canPersist) {
        localStorage.setItem("preferred-locale", value);
      } else {
        localStorage.removeItem("preferred-locale");
      }
    } catch {
      // Ignore storage failures
    }
  };

  if (variant === "pill") {
    return (
      <div className="inline-flex self-start items-center gap-3">
        {label && (
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-light dark:text-cloud-medium">
            {label}
          </span>
        )}
        <SegmentedControl
          aria-label={label ?? "Language"}
          items={LOCALES}
          value={currentLocale}
          onValueChange={handleLocaleChange}
        />
      </div>
    );
  }

  const localeOptions: DropdownOption[] = [
    { value: "en", label: "English", icon: Globe },
    { value: "es", label: "Español", icon: Globe },
  ];

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
        buttonClassName="flex h-11 items-center gap-2 rounded-full border border-cobalt/60 bg-white/90 px-4 text-sm font-semibold text-[var(--swatch--slate-dark)] shadow-[0_16px_40px_rgba(2,85,213,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:border-cobalt hover:shadow-[0_20px_48px_rgba(2,85,213,0.18)] dark:border-cobalt-light/35 dark:bg-slate-dark/85 dark:text-white dark:shadow-[0_18px_44px_rgba(2,85,213,0.2)]"
        dropdownClassName="rounded-[28px] border border-cobalt/12 bg-white/98 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-cobalt-light/18 dark:bg-slate-dark/96"
      />
    </div>
  );
}
