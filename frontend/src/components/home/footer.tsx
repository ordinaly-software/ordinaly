"use client";

import { useTranslations } from "next-intl";
import Image from 'next/image';


const Footer = () => {
  const t = useTranslations("home");

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/logo_2.webp"
                alt={t("footer.logo.alt")}
                width={120}
                height={120}
                className="h-24 w-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.services.title")}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>{t("footer.services.chatbots")}</li>
              <li>{t("footer.services.automation")}</li>
              <li>{t("footer.services.odooIntegration")}</li>
              <li>{t("footer.services.whatsapp")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.contact.title")}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>{t("footer.contact.email")}</li>
              <li>{t("footer.contact.phone")}</li>
              <li>{t("footer.contact.location")}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;