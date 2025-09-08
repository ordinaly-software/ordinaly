"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position with viewport awareness
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 180;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = rect.right - dropdownWidth;
      let top = rect.bottom + 8;
      
      // Ensure dropdown stays within viewport
      if (left < 8) left = 8;
      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }
      if (top + 200 > viewportHeight) {
        top = rect.top - 200 - 8;
      }
      
      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  const handleOptionClick = useCallback((value: string) => {
    onChange(value);
    setIsOpen(false);
  }, [onChange]);

  const iconSize = useMemo(() => size === "desktop" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4", [size]);
  const buttonSize = useMemo(() => size === "desktop" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-8 w-8", [size]);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("text-gray-700 dark:text-gray-300 transition-all duration-200", buttonSize)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <User className={iconSize} />
      </Button>

      {isOpen &&
        createPortal(
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden w-auto min-w-[180px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 99999,
            }}
            role="menu"
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white focus:bg-gray-50 dark:focus:bg-gray-700/50 focus:outline-none"
                  role="menuitem"
                >
                  {OptionIcon && <OptionIcon className="h-4 w-4 flex-shrink-0" />}
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              );
            })}
          </motion.div>,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollY = window.scrollY;
      const shouldBeScrolled = scrollY > 20;
      
      if (shouldBeScrolled !== isScrolled) {
        setIsScrolled(shouldBeScrolled);
      }
    }, 10);
  }, [isScrolled]);

  // Memoized user menu options
  const getUserMenuOptions = useCallback((): DropdownOption[] => {
    const options: DropdownOption[] = [
      { value: 'profile', label: t("navigation.profile"), icon: User }
    ];
    
    if (userData && (userData.is_staff || userData.is_superuser)) {
      options.push({ value: 'admin', label: t("navigation.adminDashboard"), icon: Settings });
    }
    
    options.push({ value: 'logout', label: t("navigation.signOut"), icon: LogOut });
    return options;
  }, [userData, t]);

  const fetchUserData = useCallback(async (token: string) => {
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
    } catch (error) {
      console.warn('Failed to fetch user data:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize authentication state
    const token = localStorage.getItem('authToken');
    const authState = !!token;
    setIsAuthenticated(authState);

    // Fetch user data if authenticated
    if (token) {
      fetchUserData(token);
    }

    // Set up scroll listener with passive option for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Set initial scroll state
    setIsScrolled(window.scrollY > 20);
    setIsInitialized(true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Memoized navigation functions
  const goHome = useCallback(() => {
    router.push("/");
    setIsMenuOpen(false);
  }, [router]);

  const handleUserMenuOption = useCallback((value: string) => {
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
  }, [router]);

  const handleSignOut = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
        // Fire and forget API call
        fetch(`${apiUrl}/api/users/signout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch (error) {
      console.warn('Signout error:', error);
    }

    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserData(null);
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    window.location.href = '/';
  }, []);

  const goToSignIn = useCallback(() => {
    router.push("/auth/signin");
    setIsMenuOpen(false);
  }, [router]);

  const goToSignUp = useCallback(() => {
    router.push("/auth/signup");
    setIsMenuOpen(false);
  }, [router]);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark, setIsDark]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  // Memoized nav links
  const navLinks = useMemo(() => [
    { href: "/services", label: t("navigation.services") },
    { href: "/formation", label: t("navigation.formation") },
    { href: "/blog", label: t("navigation.blog") },
  ], [t]);

  // Helper function to check if link is active
  const isLinkActive = useCallback((href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/en" || pathname === "/es";
    }
    return pathname.includes(href);
  }, [pathname]);

  // Early return during hydration to prevent flash
  if (!isInitialized) {
    return (
      <nav className="border-b border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6 min-h-[60px] sm:min-h-[72px]">
            <div className="flex items-center">
              <div className="mr-3 sm:mr-4">
                <div className="h-8 sm:h-10 w-8 sm:w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={cn(
          "border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-[#1A1924]/90 backdrop-blur-xl w-full transition-all duration-500 ease-out",
          isScrolled
            ? "fixed top-0 left-0 z-40 shadow-lg shadow-black/5 dark:shadow-black/20"
            : "relative"
        )}
        style={{
          transform: isScrolled ? 'translateY(0)' : 'translateY(0)',
          willChange: isScrolled ? 'transform' : 'auto',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6 min-h-[60px] sm:min-h-[72px]">
            {/* Logo and Title */}
            <div 
              className="flex items-center flex-shrink-0 min-w-0 cursor-pointer group transition-transform duration-200 hover:scale-[1.02]" 
              onClick={goHome}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goHome();
                }
              }}
            >
              <div className="mr-3 sm:mr-4 flex-shrink-0">
                <Image 
                  src="/logo.webp" 
                  alt={t("logo.alt")} 
                  width={40} 
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-200 group-hover:rotate-3"
                  priority
                  sizes="(max-width: 640px) 32px, 40px"
                />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green truncate transition-colors duration-200">
                {t("logo.title")}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-shrink-0">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-all duration-200 whitespace-nowrap text-sm xl:text-base font-medium relative group",
                    isLinkActive(link.href)
                      ? 'text-green'
                      : 'text-gray-700 dark:text-gray-300 hover:text-green'
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-green transition-all duration-300 group-hover:w-full",
                    isLinkActive(link.href) ? "w-full" : "w-0"
                  )} />
                </Link>
              ))}
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={isDark ? t("navigation.lightMode") : t("navigation.darkMode")}
              >
                {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              
              {/* Authentication Controls - Desktop */}
              {isAuthenticated ? (
                <UserMenu
                  options={getUserMenuOptions()}
                  onChange={handleUserMenuOption}
                  size="desktop"
                  ariaLabel={t("navigation.userMenu")}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToSignIn}
                    className="text-gray-700 dark:text-gray-300 hover:text-green transition-all duration-200 flex items-center h-9"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="hidden xl:inline">{t("navigation.signIn")}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={goToSignUp}
                    className="bg-green hover:bg-green-600 text-white transition-all duration-200 hover:scale-105 h-9"
                  >
                    {t("navigation.signUp")}
                  </Button>
                </div>
              )}
              
              <div className="flex-shrink-0">
                <LocaleSwitcher aria-label={t("navigation.localeSwitcher")} />
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 h-8 w-8 transition-all duration-200"
                aria-label={isDark ? t("navigation.lightMode") : t("navigation.darkMode")}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {!isAuthenticated && (
                <Button
                  size="sm"
                  onClick={goToSignUp}
                  className="bg-green hover:bg-green-600 text-white text-xs px-3 py-2 h-8 transition-all duration-200"
                >
                  {t("navigation.signUp")}
                </Button>
              )}
              
              {isAuthenticated && (
                <UserMenu
                  options={getUserMenuOptions()}
                  onChange={handleUserMenuOption}
                  size="mobile"
                  ariaLabel={t("navigation.userMenu")}
                />
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-gray-700 dark:text-gray-300 h-8 w-8 transition-all duration-200"
                aria-label={isMenuOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
                aria-expanded={isMenuOpen}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </motion.div>
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
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden bg-white/95 dark:bg-[#1A1924]/95 border-t border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl"
            >
              <div className="py-4 px-4 sm:px-6">
                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors py-3 px-2 block rounded-md font-medium",
                        isLinkActive(link.href)
                          ? 'text-green bg-green/10'
                          : 'text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Authentication Controls - Mobile */}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
                        >
                          <User className="h-4 w-4 mr-3" />
                          {t("navigation.profile")}
                        </Link>
                        
                        {userData && (userData.is_staff || userData.is_superuser) && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            {t("navigation.adminDashboard")}
                          </Link>
                        )}
                        
                        <button
                          onClick={() => setShowLogoutModal(true)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors py-3 px-2 rounded-md text-left"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("navigation.signOut")}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={goToSignIn}
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md w-full text-left"
                      >
                        <LogIn className="h-4 w-4 mr-3" />
                        {t("navigation.signIn")}
                      </button>
                    )}
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <LocaleSwitcher aria-label={t("navigation.localeSwitcher")} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer for fixed navbar */}
      {isScrolled && (
        <div className="h-[60px] sm:h-[72px]" aria-hidden="true" />
      )}
      
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