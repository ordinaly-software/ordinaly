"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface NavbarProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const Navbar = ({ isDark, setIsDark }: NavbarProps) => {
  const t = useTranslations("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "#services", label: t("navigation.services") },
    { href: "#about", label: t("navigation.about") },
    { href: "#contact", label: t("navigation.contact") },
  ];

  return (
    <nav className={cn(
      "border-b border-gray-300 dark:border-gray-800 bg-[#FFFFFF] dark:bg-[#1A1924]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300",
      isScrolled && "shadow-md"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-4">
        <div className="flex justify-between items-center py-4 md:py-6 min-h-[60px]">
          {/* Logo and Title */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <div className="mr-2 sm:mr-4 cursor-pointer flex-shrink-0" onClick={scrollToTop}>
              <Image 
                src="/logo.webp" 
                alt={t("logo.alt")} 
                width={64} 
                height={64} 
                className="h-6 sm:h-8 w-auto" 
              />
            </div>
            <div 
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#29BF12] cursor-pointer truncate" 
              onClick={scrollToTop}
            >
              {t("logo.title")}
            </div>
          </div>

          {/* Desktop Navigation - Hide earlier to prevent overlap */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8 flex-shrink-0">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors whitespace-nowrap text-sm xl:text-base"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Theme Toggle and Language Switcher - Desktop */}
          <div className="hidden xl:flex items-center space-x-2 2xl:space-x-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-gray-700 dark:text-gray-300 h-8 w-8 xl:h-10 xl:w-10"
              aria-label={isDark ? t("navigation.darkMode") : t("navigation.lightMode")}
            >
              {isDark ? <Sun className="h-4 w-4 xl:h-5 xl:w-5" /> : <Moon className="h-4 w-4 xl:h-5 xl:w-5" />}
            </Button>
            <div className="flex-shrink-0">
              <LocaleSwitcher 
                aria-label={t("navigation.localeSwitcher")}
              />
            </div>
          </div>

          {/* Mobile Menu Button - Show earlier when nav links are hidden */}
          <div className="flex xl:hidden items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-gray-700 dark:text-gray-300 h-8 w-8"
              aria-label={isDark ? t("navigation.darkMode") : t("navigation.lightMode")}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 h-8 w-8"
              aria-label={isMenuOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="xl:hidden bg-white dark:bg-[#1A1924] border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <LocaleSwitcher 
                    aria-label={t("navigation.localeSwitcher")}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;