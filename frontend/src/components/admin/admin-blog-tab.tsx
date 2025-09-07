import React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";

export default function AdminBlogTab() {
  const t = useTranslations("admin");
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="text-xl font-bold mb-4">{t("blogTab.title")}</h2>
      <p className="mb-4 text-center text-gray-700 dark:text-gray-300">
        {t("blogTab.openedMessage")}
      </p>
      <Button
        variant="default"
        onClick={() => window.open("/studio", "_blank")}
      >
        {t("blogTab.openButton")}
        <ArrowUpRight className="ml-2 h-4 w-4" />
      </Button>
      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
        {t("blogTab.loginWarning")}
      </div>
    </div>
  );
}
