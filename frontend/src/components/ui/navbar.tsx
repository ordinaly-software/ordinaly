"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LogIn, Settings, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LogoutModal from "@/components/ui/logout-modal";
import { DropdownOption } from "@/components/ui/dropdown";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Menu as HoverMenu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { useServices } from "@/hooks/useServices";
import { useCourses } from "@/hooks/useCourses";
import { getWhatsAppUrl } from "@/utils/whatsapp";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<{is_staff?: boolean, is_superuser?: boolean} | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [activeMegaItem, setActiveMegaItem] = useState<string | null>(null);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileFormationOpen, setIsMobileFormationOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { services: menuServices } = useServices(6);
  const { courses: menuCourses, isLoading: menuCoursesLoading } = useCourses({ limit: 3, upcoming: true });

  const handleBookConsultation = useCallback(() => {
    const whatsappUrl = getWhatsAppUrl(t("navigation.ctaConsultationMessage"));
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
  }, [t]);

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

    if (hasEnrolledCourses) {
      options.push({ value: 'courses', label: t("navigation.myCourses"), icon: BookOpen });
    }
    
    if (userData && (userData.is_staff || userData.is_superuser)) {
      options.push({ value: 'admin', label: t("navigation.adminDashboard"), icon: Settings });
    }
    
    options.push({ value: 'logout', label: t("navigation.signOut"), icon: LogOut });
    return options;
  }, [hasEnrolledCourses, userData, t]);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
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

  const fetchEnrollmentStatus = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const response = await fetch(`${apiUrl}/api/courses/enrollments/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHasEnrolledCourses(Array.isArray(data) && data.length > 0);
      }
    } catch (error) {
      console.warn('Failed to fetch enrollment data:', error);
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
      fetchEnrollmentStatus(token);
    }

    // Set up scroll listener with passive option for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Set initial scroll state
    setIsScrolled(window.scrollY > 20);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [fetchUserData, fetchEnrollmentStatus, handleScroll]);

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsMobileServicesOpen(false);
      setIsMobileFormationOpen(false);
    }
  }, [isMenuOpen]);


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
      case 'courses':
        router.push('/profile?tab=courses');
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
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
    setHasEnrolledCourses(false);
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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  // Memoized nav links
  const navItems = useMemo(
    () => [
      { id: "services", type: "mega", href: "/services", label: t("navigation.services") },
      { id: "formation", type: "mega", href: "/formation", label: t("navigation.formation") },
      { id: "blog", type: "link", href: "/blog", label: t("navigation.blog") },
      { id: "contact", type: "link", href: "/contact", label: t("navigation.contact") },
      { id: "about", type: "link", href: "/about", label: t("navigation.us") },
    ],
    [t]
  );

  const maxVisibleItems = useMemo(() => {
    if (viewportWidth >= 1280) return navItems.length;
    if (viewportWidth >= 1160) return 4;
    if (viewportWidth >= 1024) return 3;
    if (viewportWidth >= 900) return 2;
    if (viewportWidth >= 760) return 1;
    return 0;
  }, [navItems.length, viewportWidth]);

  const visibleItems = useMemo(
    () => navItems.slice(0, Math.max(0, maxVisibleItems)),
    [navItems, maxVisibleItems]
  );

  const hiddenItems = useMemo(
    () => navItems.slice(Math.max(0, maxVisibleItems)),
    [navItems, maxVisibleItems]
  );

  const showCta = viewportWidth >= 520;
  const compactAuth = viewportWidth > 0 && viewportWidth < 520;
  const hasHiddenServices = hiddenItems.some((item) => item.id === "services");
  const hasHiddenFormation = hiddenItems.some((item) => item.id === "formation");
  const hiddenLinks = hiddenItems.filter((item) => item.type === "link");

  useEffect(() => {
    if (hiddenItems.length === 0 && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [hiddenItems.length, isMenuOpen]);

  const featuredServices = useMemo(
    () => menuServices.filter((s) => s.is_featured).slice(0, 4),
    [menuServices]
  );

  // Helper function to check if link is active
  const isLinkActive = useCallback((href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/en" || pathname === "/es";
    }
    return pathname.includes(href);
  }, [pathname]);


  return (
    <>
      <nav
        className={cn(
          "border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-[#1A1924]/90 backdrop-blur-xl w-full transition-all duration-500 ease-out overflow-visible z-[40]",
          isScrolled
            ? "fixed top-0 left-0 z-[50] shadow-lg shadow-black/5 dark:shadow-black/20"
            : "relative"
        )}
        style={{
          transform: isScrolled ? 'translateY(0)' : 'translateY(0)',
          willChange: isScrolled ? 'transform' : 'auto',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2.5 sm:py-3.5 lg:py-5 min-h-[54px] sm:min-h-[66px] gap-4 lg:gap-6">
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
              <div className="mr-2 sm:mr-3 flex-shrink-0">
                <Image 
                  src="/logo.webp" 
                  alt="" 
                  width={40} 
                  height={40}
                  className="h-7 w-7 sm:h-9 sm:w-9 xl:h-10 xl:w-10 transition-transform duration-200 group-hover:rotate-3"
                  priority
                  sizes="(max-width: 640px) 28px, (max-width: 1279px) 36px, 40px"
                  aria-hidden="true"
                />
              </div>
              <div className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-bold text-[#0B5A0A] dark:text-[#7CFC00] truncate transition-colors duration-200">
                {t("logo.title")}
              </div>
            </div>

            {/* Unified Navigation + Controls */}
            <div className="flex items-center justify-end flex-1 min-w-0 gap-4">
              <div className="flex items-center justify-end gap-6 flex-1 min-w-0">
                <HoverMenu setActive={setActiveMegaItem}>
                  {visibleItems
                    .filter((item) => item.type === "mega")
                    .map((item) => {
                      if (item.id === "services") {
                        return (
                          <MenuItem
                            key={item.id}
                            item={item.label}
                            active={activeMegaItem}
                            setActive={setActiveMegaItem}
                            href={item.href}
                            isActiveLink={isLinkActive(item.href)}
                          >
                            <div className="grid grid-cols-1 gap-2 min-w-[240px]">
                              <>
                                {featuredServices.length === 0 ? (
                                  <></>
                                ) : (
                                  featuredServices.map((service) => (
                                    <HoveredLink
                                      key={service.id}
                                      href={`/services/${service.slug ?? service.id}`}
                                    >
                                      {service.title}
                                    </HoveredLink>
                                  ))
                                )}
                                <HoveredLink href="/services">{t("navigation.serviceSubmenu")}</HoveredLink>
                              </>
                            </div>
                          </MenuItem>
                        );
                      }
                      return (
                        <MenuItem
                          key={item.id}
                          item={item.label}
                          active={activeMegaItem}
                          setActive={setActiveMegaItem}
                          href={item.href}
                          isActiveLink={isLinkActive(item.href)}
                        >
                          <div className="grid grid-cols-1 gap-3 min-w-[360px]">
                            {menuCoursesLoading && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">{t("navigation.loading")}</div>
                            )}
                            <>
                              {!menuCoursesLoading && menuCourses.length === 0 ? (
                                <></>
                              ) : (
                                menuCourses.map((course) => (
                                  <ProductItem
                                    key={course.id}
                                    title={course.title}
                                    description={course.subtitle || course.description}
                                    href={`/formation/${course.slug ?? course.id}`}
                                    src={course.image}
                                  />
                                ))
                              )}
                              <HoveredLink href="/formation">{t("navigation.formationSubmenu")}</HoveredLink>
                            </>
                          </div>
                        </MenuItem>
                      );
                    })}
                </HoverMenu>
                {visibleItems
                  .filter((item) => item.type === "link")
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      scroll={true}
                      className={cn(
                        "transition-all duration-200 whitespace-nowrap text-sm xl:text-base font-medium relative group",
                        isLinkActive(item.href)
                          ? "text-green"
                          : "text-gray-700 dark:text-gray-300 hover:text-green"
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute -bottom-1 left-0 w-0 h-0.5 bg-green transition-all duration-300 group-hover:w-full",
                          isLinkActive(item.href) ? "w-full" : "w-0"
                        )}
                      />
                    </Link>
                  ))}
              </div>

              <div className="flex items-center flex-shrink-0 gap-2">
                {showCta && (
                  <Button
                    size="sm"
                    onClick={handleBookConsultation}
                    className="h-9 bg-[#0B5A0A] text-white shadow-md hover:bg-[#0A4D08] hover:shadow-lg transition-all duration-200 text-sm px-4"
                  >
                    {t("navigation.ctaConsultation")}
                  </Button>
                )}
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
                      aria-label={t("navigation.signIn")}
                      className="text-gray-700 dark:text-gray-300 hover:text-green transition-all duration-200 flex items-center h-9"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {!compactAuth && <span>{t("navigation.signIn")}</span>}
                      {compactAuth && <span className="sr-only">{t("navigation.signIn")}</span>}
                    </Button>
                    {!compactAuth && (
                      <Button
                        size="sm"
                        onClick={goToSignUp}
                        className="bg-green hover:bg-green-600 text-white transition-all duration-200 hover:scale-105 h-8 px-3 text-sm"
                      >
                        {t("navigation.signUp")}
                      </Button>
                    )}
                  </div>
                )}
                {hiddenItems.length > 0 && (
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
                )}
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && hiddenItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white/95 dark:bg-[#1A1924]/95 border-t border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl"
            >
              <div className="py-4 px-4 sm:px-6">
                <div className="flex flex-col space-y-1">
                  {(hasHiddenServices || hasHiddenFormation) && (
                    <div className="space-y-3 pt-2">
                      {hasHiddenServices && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700/70 bg-gray-50/60 dark:bg-gray-800/60">
                          <button
                            className="w-full flex items-center justify-between px-3 py-3 text-left"
                            onClick={() => setIsMobileServicesOpen((prev) => !prev)}
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{t("navigation.services")}</p>
                            </div>
                            <motion.div animate={{ rotate: isMobileServicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {isMobileServicesOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-2 px-3 pb-3"
                              >
                                {featuredServices.length === 0 ? (
                                  <Link
                                    href="/services"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green hover:bg-gray-100 dark:hover:bg-gray-800/70"
                                  >
                                    {t("navigation.serviceSubmenu")}
                                  </Link>
                                ) : (
                                  featuredServices.map((service) => (
                                    <Link
                                      key={service.id}
                                      href={`/services/${service.slug ?? service.id}`}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="block rounded-md px-2 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-green"
                                    >
                                      {service.title}
                                    </Link>
                                  ))
                                )}
                                <Link
                                  href="/services"
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block rounded-md px-2 py-2 text-sm font-semibold text-green hover:text-green-600"
                                >
                                  {t("navigation.serviceSubmenu")}
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {hasHiddenFormation && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700/70 bg-gray-50/60 dark:bg-gray-800/60">
                          <button
                            className="w-full flex items-center justify-between px-3 py-3 text-left"
                            onClick={() => setIsMobileFormationOpen((prev) => !prev)}
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{t("navigation.formation")}</p>
                            </div>
                            <motion.div animate={{ rotate: isMobileFormationOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {isMobileFormationOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-2 px-3 pb-3"
                              >
                                {menuCoursesLoading && (
                                  <div className="rounded-md px-2 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-black/20">
                                    {t("navigation.loading")}
                                  </div>
                                )}
                                {!menuCoursesLoading && menuCourses.length === 0 ? (
                                  <Link
                                    href="/formation"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green hover:bg-gray-100 dark:hover:bg-gray-800/70"
                                  >
                                    {t("navigation.formationSubmenu")}
                                  </Link>
                                ) : (
                                  <>
                                    {menuCourses.map((course) => (
                                      <Link
                                        key={course.id}
                                        href={`/formation/${course.slug ?? course.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block rounded-md px-3 py-2 bg-white/60 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                                      >
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                          {course.title}
                                        </div>
                                        {(course.subtitle || course.description) && (
                                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {course.subtitle || course.description}
                                          </div>
                                        )}
                                      </Link>
                                    ))}
                                    <Link
                                      href="/formation"
                                      onClick={() => setIsMenuOpen(false)}
                                      className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green hover:bg-gray-100 dark:hover:bg-gray-800/70"
                                    >
                                      {t("navigation.formationSubmenu")}
                                    </Link>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                  {hiddenLinks.map((item) => (
                    <Link 
                      key={item.id}
                      href={item.href}
                      scroll={true}
                      className={cn(
                        "transition-colors py-3 px-2 block rounded-md font-medium",
                        isLinkActive(item.href)
                          ? "text-green bg-green/10"
                          : "text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
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
                        {hasEnrolledCourses && (
                          <Link
                            href="/profile?tab=courses"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-green hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
                          >
                            <BookOpen className="h-4 w-4 mr-3" />
                            {t("navigation.myCourses")}
                          </Link>
                        )}
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
