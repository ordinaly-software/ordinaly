"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import Image from 'next/image';
import Link from "next/link";

const Footer = () => {
  const t = useTranslations("home");
  const { isDark } = useTheme();

  return (
    <footer className="border-t border-gray-300 dark:border-gray-700 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src={isDark ? '/logo_2_dark.webp' : '/logo_2.webp'}
                alt={t("footer.logo.alt")}
                width={120}
                height={120}
                className="h-24 w-auto"
              />
            </div>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.legal.title")}</h3>
            <ul className="space-y-2 text-gray-800 dark:text-gray-200">
              <li>
                <Link
                  href="/legal?tab=terms"
                  className="hover:text-black dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?tab=privacy"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?tab=cookies"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.legal.cookies")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal?tab=license"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.legal.license")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t("footer.social.title")}</h3>
            <ul className="space-y-2 text-gray-800 dark:text-gray-200">
              <li>
                <a 
                  href="https://www.linkedin.com/company/ordinalysoftware/"
                  className="hover:text-black dark:hover:text-white hover:underline transition-colors flex items-center gap-2"
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
                   <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
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
              <li>
                <a 
                  href="https://www.youtube.com/@ordinalysoftware"
                  className="hover:text-gray-900 dark:hover:text-white hover:underline transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">
              {t("footer.contact.title")}
            </h3>
            <ul className="space-y-2 text-gray-800 dark:text-gray-200">
              <li className="min-w-0">
                <a
                  href={`mailto:${t("footer.contact.email")}`}
                  className="hover:text-black dark:hover:text-white hover:underline transition-colors break-all block"
                >
                  {t("footer.contact.email")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("footer.contact.phone")}`}
                  className="hover:text-black dark:hover:text-white hover:underline transition-colors"
                >
                  {t("footer.contact.phone")}
                </a>
              </li>
              <li>
                <span className="text-gray-800 dark:text-gray-200">
                  {t("footer.contact.location")}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8 text-center text-gray-800 dark:text-gray-200">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;