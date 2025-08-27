"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, User, LogOut, LogIn, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import LogoutModal from "@/components/ui/logout-modal";
import { DropdownOption } from "@/components/ui/dropdown";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { createPortal } from "react-dom";

// Custom User Menu Component
const UserMenu = ({ 
  options, 
  onChange, 
  size = "desktop",
  ariaLabel 
}: {
  options: DropdownOption[];
  onChange: (value: string) => void;
  size?: "desktop" | "mobile";
  ariaLabel?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 180; // min-w-[180px]
      
      // Position to the left of the trigger button to ensure it's fully visible
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - dropdownWidth,
      });
    }
  }, [isOpen]);

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-gray-700 dark:text-gray-300",
          size === "desktop" ? "h-8 w-8 xl:h-10 xl:w-10" : "h-8 w-8"
        )}
        aria-label={ariaLabel}
      >
        <User className={size === "desktop" ? "h-4 w-4 xl:h-5 xl:w-5" : "h-4 w-4"} />
      </Button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 w-auto min-w-[180px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 99999,
            }}
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                >
                  {OptionIcon && <OptionIcon className="h-4 w-4" />}
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

const Navbar = () => {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, setIsDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<{is_staff?: boolean, is_superuser?: boolean} | null>(null);

  // User menu options
  const getUserMenuOptions = (): DropdownOption[] => {
    const options: DropdownOption[] = [
      { value: 'profile', label: t("navigation.profile"), icon: User }
    ];
    
    if (userData && (userData.is_staff || userData.is_superuser)) {
      options.push({ value: 'admin', label: t("navigation.adminDashboard"), icon: Settings });
    }
    
    options.push({ value: 'logout', label: t("navigation.signOut"), icon: LogOut });
    return options;
  };

  const fetchUserData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
      const response = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch {
    }
  };

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // Fetch user data if authenticated
    if (token) {
      fetchUserData(token);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goHome = () => {
    router.push("/");
    setIsMenuOpen(false);
  };

    const handleUserMenuOption = (value: string) => {
    switch (value) {
      case 'profile':
        router.push('/profile');
        break;
      case 'admin':
        router.push('/admin');
        break;
      case 'logout':
        setShowLogoutModal(true);
        break;
    }
  };

  const handleSignOut = () => {
    try {
      // Call signout API if needed (optional since we're just removing the token)
      const token = localStorage.getItem('authToken');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
        fetch(`${apiUrl}/api/users/signout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore errors, we'll remove the token anyway
        });
      }
    } catch {
      // Ignore errors, we'll remove the token anyway
    }

    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    window.location.href = '/';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const goToSignIn = () => {
    router.push("/auth/signin");
    setIsMenuOpen(false);
  };

  const goToSignUp = () => {
    router.push("/auth/signup");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/services", label: t("navigation.services") },
    { href: "/formation", label: t("navigation.formation") },
  ];

  // Helper function to check if link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/en" || pathname === "/es";
    }
    return pathname.includes(href);
  };


  return (
    <>
      <nav
        className={cn(
          "border-b border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-[#1A1924]/80 backdrop-blur-md w-full transition-all duration-300",
          isScrolled
            ? "fixed top-0 left-0 z-50 shadow-md navbar-animate-in"
            : "relative navbar-animate-out"
        )}
        style={{
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform: isScrolled ? 'translateY(0)' : 'translateY(-5px)',
          opacity: isScrolled ? 1 : 0.98,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-4">
          <div className="flex justify-between items-center py-4 md:py-6 min-h-[60px]">
            {/* Logo and Title */}
            <div className="flex items-center flex-shrink-0 min-w-0 cursor-pointer" onClick={goHome}>
              <div className="mr-2 sm:mr-4 flex-shrink-0">
                <Image 
                  src="/logo.webp" 
                  alt={t("logo.alt")} 
                  width={64} 
                  height={64}
                  className="h-6 sm:h-8 w-auto"
                  priority
                  sizes="49px"
                />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green truncate">
                {t("logo.title")}
              </div>
            </div>

          {/* Desktop Navigation - Hide earlier to prevent overlap */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8 flex-shrink-0">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`transition-colors whitespace-nowrap text-sm xl:text-base ${
                  isLinkActive(link.href)
                    ? 'text-green font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Theme Toggle, Auth, and Language Switcher - Desktop */}
          <div className="hidden xl:flex items-center space-x-2 2xl:space-x-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-gray-700 dark:text-gray-300 h-8 w-8 xl:h-10 xl:w-10"
              aria-label={isDark ? t("navigation.darkMode") : t("navigation.lightMode")}
            >
              {isDark ? <Moon className="h-4 w-4 xl:h-5 xl:w-5" /> : <Sun className="h-4 w-4 xl:h-5 xl:w-5" />}
            </Button>
            
            {/* Authentication Controls - Desktop */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <UserMenu
                  options={getUserMenuOptions()}
                  onChange={handleUserMenuOption}
                  size="desktop"
                  ariaLabel={t("navigation.userMenu")}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToSignIn}
                  className="text-gray-700 dark:text-gray-300 hover:text-green transition-colors flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("navigation.signIn")}
                </Button>
                <Button
                  size="sm"
                  onClick={goToSignUp}
                  className="bg-green hover:bg-green-600 text-white"
                >
                  {t("navigation.signUp")}
                </Button>
              </div>
            )}
            
            <div className="flex-shrink-0">
              <LocaleSwitcher 
                aria-label={t("navigation.localeSwitcher")}
              />
            </div>
          </div>

          {/* Mobile Controls - Always show Sign Up button when not authenticated */}
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
            
            {/* Always show Sign Up button when not authenticated */}
            {!isAuthenticated && (
              <Button
                size="sm"
                onClick={goToSignUp}
                className="bg-green hover:bg-green-600 text-white text-xs px-2 py-1 h-8"
              >
                {t("navigation.signUp")}
              </Button>
            )}
            
            {/* Always show user icon on mobile when authenticated */}
            {isAuthenticated && (
              <div className="relative user-menu-container">
                <UserMenu
                  options={getUserMenuOptions()}
                  onChange={handleUserMenuOption}
                  size="mobile"
                  ariaLabel={t("navigation.userMenu")}
                />
              </div>
            )}
            
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
            className="xl:hidden bg-white/80 dark:bg-[#1A1924] border-t border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-md"
          >
            <div className="py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className={`transition-colors py-2 block ${
                      isLinkActive(link.href)
                        ? 'text-green font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:text-green'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Authentication Controls - Mobile */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {/* Profile Link - Mobile */}
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-green transition-colors py-2"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t("navigation.profile")}
                      </Link>
                      
                      {/* Admin Link - Mobile */}
                      {userData && (userData.is_staff || userData.is_superuser) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-green transition-colors py-2"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t("navigation.adminDashboard")}
                        </Link>
                      )}
                      
                      <div
                        onClick={handleLogoutClick}
                        className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors py-2 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLogoutClick();
                          }
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("navigation.signOut")}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={goToSignIn}
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green transition-colors py-2 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goToSignIn();
                        }
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {t("navigation.signIn")}
                    </div>
                  )}
                </div>
                
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
      
      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
};

export default Navbar;
