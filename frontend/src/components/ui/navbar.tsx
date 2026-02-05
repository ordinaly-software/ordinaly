"use client";

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LogIn, Settings, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LogoutModal from "@/components/ui/logout-modal";
import { DropdownOption } from "@/components/ui/dropdown";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
  ariaLabel,
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
      if (isOpen && !triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
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

  const handleOptionClick = useCallback(
    (value: string) => {
      onChange(value);
      setIsOpen(false);
    },
    [onChange],
  );

  const iconSize = useMemo(() => (size === "desktop" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"), [size]);
  const buttonSize = useMemo(() => (size === "desktop" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-8 w-8"), [size]);

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
          <div
            ref={dropdownRef}
            className="fixed bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden w-auto min-w-[180px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 45,
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
          </div>,
          document.body,
        )}
    </>
  );
};

const MobileSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700/70 bg-gray-50/60 dark:bg-gray-800/60">
    <button className="w-full flex items-center justify-between px-3 py-3 text-left" onClick={onToggle}>
      <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      <ChevronDown
        className={cn("h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform", isOpen && "rotate-180")}
      />
    </button>
    {isOpen && <div className="space-y-2 px-3 pb-3">{children}</div>}
  </div>
);

const Navbar = () => {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<{ is_staff?: boolean; is_superuser?: boolean } | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [activeMegaItem, setActiveMegaItem] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);

  const { services: menuServices } = useServices(6);
  const { courses: menuCourses, isLoading: menuCoursesLoading } = useCourses({ limit: 3, upcoming: true });

  const featuredServices = useMemo(() => menuServices.filter((s) => s.is_featured).slice(0, 4), [menuServices]);

  const handleBookConsultation = useCallback(() => {
    const whatsappUrl = getWhatsAppUrl(t("navigation.ctaConsultationMessage"));
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
  }, [t]);

  const userMenuOptions = useMemo((): DropdownOption[] => {
    const options: DropdownOption[] = [{ value: "profile", label: t("navigation.profile"), icon: User }];

    if (hasEnrolledCourses) {
      options.push({ value: "courses", label: t("navigation.myCourses"), icon: BookOpen });
    }

    if (userData && (userData.is_staff || userData.is_superuser)) {
      options.push({ value: "admin", label: t("navigation.adminDashboard"), icon: Settings });
    }

    options.push({ value: "logout", label: t("navigation.signOut"), icon: LogOut });
    return options;
  }, [hasEnrolledCourses, userData, t]);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      const response = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.warn("Failed to fetch user data:", error);
    }
  }, []);

  const fetchEnrollmentStatus = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      const response = await fetch(`${apiUrl}/api/courses/enrollments/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHasEnrolledCourses(Array.isArray(data) && data.length > 0);
      }
    } catch (error) {
      console.warn("Failed to fetch enrollment data:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const authState = !!token;
    setIsAuthenticated(authState);

    if (token) {
      fetchUserData(token);
      fetchEnrollmentStatus(token);
    }
  }, [fetchUserData, fetchEnrollmentStatus]);

  useEffect(() => {
    setIsMenuOpen(false);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUserMenuOption = useCallback(
    (value: string) => {
      switch (value) {
        case "profile":
          router.push("/profile");
          break;
        case "courses":
          router.push("/profile?tab=courses");
          break;
        case "admin":
          router.push("/admin");
          break;
        case "logout":
          setShowLogoutModal(true);
          break;
      }
    },
    [router],
  );

  const handleSignOut = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
        fetch(`${apiUrl}/api/users/signout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }).catch(() => {});
      }
    } catch (error) {
      console.warn("Signout error:", error);
    }

    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserData(null);
    setHasEnrolledCourses(false);
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    window.location.href = "/";
  }, []);

  const goToSignIn = useCallback(() => {
    router.push("/auth/signin");
    setIsMenuOpen(false);
  }, [router]);

  const goToSignUp = useCallback(() => {
    router.push("/auth/signup");
    setIsMenuOpen(false);
  }, [router]);

  const toggleMobileSection = useCallback((section: string) => {
    setMobileSection((prev) => (prev === section ? null : section));
  }, []);

  const navItems = useMemo(
    () => [
      { id: "services", type: "mega", href: "/services", label: t("navigation.services") },
      { id: "formation", type: "mega", href: "/formation", label: t("navigation.formation") },
      { id: "blog", type: "mega", href: "/blog", label: t("navigation.blog") },
      { id: "contact", type: "link", href: "/contact", label: t("navigation.contact") },
      { id: "about", type: "link", href: "/about", label: t("navigation.us") },
    ],
    [t],
  );

  const showCta = viewportWidth >= 640;
  const showAuthButtons = viewportWidth >= 640;

  const maxVisibleItems = useMemo(() => {
    if (viewportWidth >= 1440) return navItems.length;
    if (viewportWidth >= 1360) return 4;
    if (viewportWidth >= 1280) return 3;
    if (viewportWidth >= 1200) return showCta || showAuthButtons ? 2 : 3;
    // Prioritize CTA/auth and burger from md widths down.
    return 0;
  }, [navItems.length, showAuthButtons, showCta, viewportWidth]);

  const visibleItems = useMemo(
    () => navItems.slice(0, Math.max(0, maxVisibleItems)),
    [navItems, maxVisibleItems],
  );

  const hiddenItems = useMemo(
    () => navItems.slice(Math.max(0, maxVisibleItems)),
    [navItems, maxVisibleItems],
  );

  // showCta/showAuthButtons are computed above to keep buttons visible on mobile if space allows
  const showHamburger = viewportWidth < 1280 || hiddenItems.length > 0;

  useEffect(() => {
    if (!showHamburger && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [showHamburger, isMenuOpen]);

  const isLinkActive = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/" || pathname === "/en" || pathname === "/es";
      }
      return pathname.includes(href);
    },
    [pathname],
  );

  const isBlogSectionActive = pathname.includes("/blog") || pathname.includes("/noticias");
  const shouldLoadServiceImages = activeMegaItem === t("navigation.services");
  const shouldLoadCourseImages = activeMegaItem === t("navigation.formation");

  return (
    <>
      <nav className="fixed top-0 left-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-[#1A1924]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3.5 lg:py-5 min-h-[54px] sm:min-h-[66px] gap-4 lg:gap-6">
            <Link href="/" className="flex items-center flex-shrink-0 min-w-0 group">
              <div className="mr-2 sm:mr-3 flex-shrink-0">
                <Image
                  src="/logo_80.webp"
                  alt=""
                  width={40}
                  height={40}
                  className="h-7 w-7 sm:h-9 sm:w-9 xl:h-10 xl:w-10 transition-transform duration-200 group-hover:rotate-3"
                  priority
                  sizes="(max-width: 640px) 28px, (max-width: 1279px) 36px, 40px"
                  aria-hidden="true"
                />
              </div>
              <div className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-bold text-[#0d6e0c] dark:text-[#3FBD6F] truncate transition-colors duration-200">
                {t("logo.title")}
              </div>
            </Link>

            <div className="hidden md:flex items-center justify-end flex-1 gap-5 min-w-0">
              <HoverMenu setActive={setActiveMegaItem}>
                {visibleItems.map((item) =>
                  item.type === "mega" ? (
                    <MenuItem
                      key={item.id}
                      item={item.label}
                      active={activeMegaItem}
                      setActive={setActiveMegaItem}
                      href={item.href}
                      isActiveLink={
                        item.id === "blog" ? isBlogSectionActive : isLinkActive(item.href)
                      }
                    >
                      {item.id === "services" && (
                        <div className="grid grid-cols-1 gap-3 min-w-[360px]">
                          {featuredServices.length > 0 &&
                            featuredServices.map((service) => (
                              <ProductItem
                                key={service.id}
                                title={service.title}
                                description={service.subtitle || service.description}
                                href={`/services/${service.slug ?? service.id}`}
                                src={service.image || ""}
                                loadOnHover={false}
                                loadEnabled={shouldLoadServiceImages}
                              />
                            ))}
                          <HoveredLink href="/services">{t("navigation.serviceSubmenu")}</HoveredLink>
                        </div>
                      )}
                      {item.id === "formation" && (
                        <div className="grid grid-cols-1 gap-3 min-w-[360px]">
                          {menuCoursesLoading && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">
                              {t("navigation.loading")}
                            </div>
                          )}
                          {!menuCoursesLoading &&
                            menuCourses.length > 0 &&
                            menuCourses.map((course) => (
                              <ProductItem
                                key={course.id}
                                title={course.title}
                                description={course.subtitle || course.description}
                                href={`/formation/${course.slug ?? course.id}`}
                                src={course.image}
                                loadOnHover={false}
                                loadEnabled={shouldLoadCourseImages}
                              />
                            ))}
                          <HoveredLink href="/formation">{t("navigation.formationSubmenu")}</HoveredLink>
                        </div>
                      )}
                      {item.id === "blog" && (
                        <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                          <HoveredLink href="/blog">{t("navigation.blog")}</HoveredLink>
                          <HoveredLink href="/noticias">{t("navigation.news")}</HoveredLink>
                        </div>
                      )}
                    </MenuItem>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "transition-all duration-200 whitespace-nowrap text-sm xl:text-base font-medium relative group",
                        isLinkActive(item.href)
                          ? "text-[#1F8A0D] dark:text-[#3FBD6F]"
                          : "text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F]",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1F8A0D] dark:bg-[#3FBD6F] transition-all duration-300 group-hover:w-full",
                          isLinkActive(item.href) ? "w-full" : "w-0",
                        )}
                      />
                    </Link>
                  ),
                )}
              </HoverMenu>
            </div>

            <div className="flex items-center gap-2">
              {showCta && (
                <Button
                  size="sm"
                  onClick={handleBookConsultation}
                  className="h-8 sm:h-9 bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:hover:bg-[#2EA55E] text-white dark:text-black shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4"
                >
                  {t("navigation.ctaConsultation")}
                </Button>
              )}

              {showAuthButtons ? (
                isAuthenticated ? (
                  <UserMenu
                    options={userMenuOptions}
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
                      className="text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition-all duration-200 flex items-center h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>{t("navigation.signIn")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={goToSignUp}
                      className="bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:hover:bg-[#2EA55E] text-white dark:text-black transition-all duration-200 hover:scale-105 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                    >
                      {t("navigation.signUp")}
                    </Button>
                  </div>
                )
              ) : null}

              {showHamburger && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="text-gray-700 dark:text-gray-300 h-8 w-8 transition-all duration-200"
                  aria-label={isMenuOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={cn(
              "bg-white/95 dark:bg-[#1A1924]/95 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl",
              showHamburger ? "block" : "hidden",
            )}
          >
            <div className="py-4 px-4 sm:px-6">
              <div className="flex flex-col space-y-3">
                <MobileSection
                  title={t("navigation.services")}
                  isOpen={mobileSection === "services"}
                  onToggle={() => toggleMobileSection("services")}
                >
                  {featuredServices.length > 0 &&
                    featuredServices.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug ?? service.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-md px-2 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F]"
                      >
                        {service.title}
                      </Link>
                    ))}
                  <Link
                    href="/services"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm font-semibold text-[#1F8A0D] dark:text-[#3FBD6F] hover:text-[#2EA55E] dark:hover:text-[#2EA55E]"
                  >
                    {t("navigation.serviceSubmenu")}
                  </Link>
                </MobileSection>

                <MobileSection
                  title={t("navigation.formation")}
                  isOpen={mobileSection === "formation"}
                  onToggle={() => toggleMobileSection("formation")}
                >
                  {menuCoursesLoading && (
                    <div className="rounded-md px-2 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-black/20">
                      {t("navigation.loading")}
                    </div>
                  )}
                  {!menuCoursesLoading &&
                    menuCourses.length > 0 &&
                    menuCourses.map((course) => (
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
                    className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-100 dark:hover:bg-gray-800/70"
                  >
                    {t("navigation.formationSubmenu")}
                  </Link>
                </MobileSection>

                <MobileSection
                  title={t("navigation.blog")}
                  isOpen={mobileSection === "blog"}
                  onToggle={() => toggleMobileSection("blog")}
                >
                  <Link
                    href="/blog"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-100 dark:hover:bg-gray-800/70"
                  >
                    {t("navigation.blog")}
                  </Link>
                  <Link
                    href="/noticias"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-100 dark:hover:bg-gray-800/70"
                  >
                    {t("navigation.news")}
                  </Link>
                </MobileSection>

                <div className="grid gap-2">
                  <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-md font-medium",
                      isLinkActive("/contact")
                        ? "text-[#1F8A0D] dark:text-[#3FBD6F] bg-[#1F8A0D]/10 dark:bg-[#3FBD6F]/10"
                        : "text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    {t("navigation.contact")}
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-md font-medium",
                      isLinkActive("/about")
                        ? "text-[#1F8A0D] dark:text-[#3FBD6F] bg-[#1F8A0D]/10 dark:bg-[#3FBD6F]/10"
                        : "text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    {t("navigation.us")}
                  </Link>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
                      >
                        <User className="h-4 w-4 mr-3" />
                        {t("navigation.profile")}
                      </Link>
                      {hasEnrolledCourses && (
                        <Link
                          href="/profile?tab=courses"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
                        >
                          <BookOpen className="h-4 w-4 mr-3" />
                          {t("navigation.myCourses")}
                        </Link>
                      )}
                      {userData && (userData.is_staff || userData.is_superuser) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors py-3 px-2 rounded-md"
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
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToSignIn}
                        aria-label={t("navigation.signIn")}
                        className="justify-start text-gray-700 dark:text-gray-300 hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t("navigation.signIn")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={goToSignUp}
                        className="justify-start bg-[#0d6e0c] hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:hover:bg-[#2EA55E] text-white dark:text-black"
                      >
                        {t("navigation.signUp")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="h-[60px] sm:h-[72px] lg:h-[80px]" aria-hidden="true" />

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleSignOut} />
    </>
  );
};

export default Navbar;
