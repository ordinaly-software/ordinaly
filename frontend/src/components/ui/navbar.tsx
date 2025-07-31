"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, User, LogOut, LogIn, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import LogoutModal from "@/components/ui/logout-modal";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<{is_staff?: boolean, is_superuser?: boolean} | null>(null);

  const fetchUserData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
      console.error('Failed to fetch user data:', error);
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

    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const goHome = () => {
    window.location.href = "/";
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      // Call signout API if needed (optional since we're just removing the token)
      const token = localStorage.getItem('authToken');
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
    } catch (error) {
      // Ignore errors, we'll remove the token anyway
    }

    // Remove token and redirect
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setShowUserMenu(false);
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    window.location.href = '/';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowUserMenu(false);
  };

  const goToSignIn = () => {
    window.location.href = '/users/signin';
    setIsMenuOpen(false);
  };

  const goToSignUp = () => {
    window.location.href = '/users/signup';
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/services", label: t("navigation.services") },
    { href: "/formation", label: t("navigation.formation") },
  ];


  return (
    <>
      <nav className={cn(
        "border-b border-gray-300 dark:border-gray-800 bg-[#FFFFFF] dark:bg-[#1A1924]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300",
        isScrolled && "shadow-md"
      )}>
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
                />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#29BF12] truncate">
                {t("logo.title")}
              </div>
            </div>

          {/* Desktop Navigation - Hide earlier to prevent overlap */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8 flex-shrink-0">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors whitespace-nowrap text-sm xl:text-base"
              >
                {link.label}
              </a>
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
              {isDark ? <Sun className="h-4 w-4 xl:h-5 xl:w-5" /> : <Moon className="h-4 w-4 xl:h-5 xl:w-5" />}
            </Button>
            
            {/* Authentication Controls - Desktop */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-gray-700 dark:text-gray-300 h-8 w-8 xl:h-10 xl:w-10"
                  aria-label={t("navigation.userMenu")}
                >
                  <User className="h-4 w-4 xl:h-5 xl:w-5" />
                </Button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="py-1">
                        {/* Profile Link */}
                        <a
                          href="/users/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("navigation.profile")}
                        </a>
                        
                        {/* Admin Link - only show if user is staff or superuser */}
                        {userData && (userData.is_staff || userData.is_superuser) && (
                          <a
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {t("navigation.adminDashboard")}
                          </a>
                        )}
                        
                        <div
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToSignIn}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("navigation.signIn")}
                </Button>
                <Button
                  size="sm"
                  onClick={goToSignUp}
                  className="bg-[#29BF12] hover:bg-[#22A010] text-white"
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
                className="bg-[#29BF12] hover:bg-[#22A010] text-white text-xs px-2 py-1 h-8"
              >
                {t("navigation.signUp")}
              </Button>
            )}
            
            {/* Always show user icon on mobile when authenticated */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-gray-700 dark:text-gray-300 h-8 w-8 relative user-menu-container"
                aria-label={t("navigation.userMenu")}
              >
                <User className="h-4 w-4" />
                
                {/* Mobile User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="py-1">
                        <a
                          href="/users/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("navigation.profile")}
                        </a>
                        
                        <div
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
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
            className="xl:hidden bg-white dark:bg-[#1A1924] border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                
                {/* Authentication Controls - Mobile */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {/* Profile Link - Mobile */}
                      <a
                        href="/users/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors py-2"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t("navigation.profile")}
                      </a>
                      
                      {/* Admin Link - Mobile */}
                      {userData && (userData.is_staff || userData.is_superuser) && (
                        <a
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors py-2"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t("navigation.adminDashboard")}
                        </a>
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
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-[#29BF12] transition-colors py-2 cursor-pointer"
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
