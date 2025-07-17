"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import Image from 'next/image';
import { cn } from "@/lib/utils";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="mr-4 cursor-pointer" onClick={scrollToTop}>
              <Image 
                src="/logo.webp" 
                alt={t("logo.alt")} 
                width={64} 
                height={64} 
                className="h-8 w-auto" 
              />
            </div>
            <div 
              className="text-2xl font-bold text-[#32E875] cursor-pointer" 
              onClick={scrollToTop}
            >
              {t("logo.title")}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Theme Toggle and Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-gray-700 dark:text-gray-300"
              aria-label={isDark ? t("navigation.darkMode") : t("navigation.lightMode")}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <LocaleSwitcher 
              aria-label={t("navigation.localeSwitcher")}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-gray-700 dark:text-gray-300"
              aria-label={isDark? t("navigation.darkMode") : t("navigation.lightMode")}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
              aria-label={isMenuOpen? t("navigation.closeMenu") : t("navigation.openMenu")}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1924] border-t border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <LocaleSwitcher 
                aria-label={t("navigation.localeSwitcher")}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;