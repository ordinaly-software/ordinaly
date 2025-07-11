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
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.social.title")}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <a 
                  href="https://www.linkedin.com/company/ordinalysoftware/"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a 
                  href="https://www.tiktok.com/@ordinalysoftware"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.17-2.39V12.1a6.32 6.32 0 00-1-.05A6.34 6.34 0 006 20.21a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.61a4.85 4.85 0 01-2-.43z"/>
                  </svg>
                  TikTok
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/ordinalysoftware/"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.contact.title")}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <a 
                  href={`mailto:${t("footer.contact.email")}`}
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.contact.email")}
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${t("footer.contact.phone")}`}
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.contact.phone")}
                </a>
              </li>
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