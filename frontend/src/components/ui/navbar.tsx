"use client";

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LogIn, Settings, ChevronDown, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import LogoutModal from "@/components/ui/logout-modal";
import { DropdownOption } from "@/components/ui/dropdown";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Menu as HoverMenu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { useSiteData } from "@/contexts/site-data-context";
import { getWhatsAppUrl } from "@/utils/whatsapp";
import { ContactMenu } from "@/components/ui/contact-menu";
import { trackPageForLogin } from "@/lib/post-login-redirect";

const AUTH_STATE_CHANGE_EVENT = "auth-state-changed";

// Inline links disappear one by one as the viewport shrinks (the mobile menu always lists all of them).
const NAV_ITEM_VISIBILITY: Record<string, string> = {
  home: "",
  services: "hidden min-[800px]:block",
  formation: "hidden min-[900px]:block",
  contact: "hidden min-[1000px]:block",
  faq: "hidden min-[1100px]:block",
  blog: "hidden min-[1180px]:block",
  nosotros: "hidden xl:block",
};
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
        className={cn("text-slate-medium dark:text-cloud-medium transition-all duration-200", buttonSize)}
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
            className="fixed bg-white dark:bg-slate-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden w-auto min-w-[180px]"
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
                  className="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center gap-3 hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)] text-slate-dark dark:text-ivory-light focus:bg-oat/60 dark:focus:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)] focus:outline-none"
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
  <div className="rounded-xl border border-[--color-border-subtle] dark:border-[--color-border-strong]/70 bg-[color-mix(in_srgb,var(--swatch--ivory-medium)_60%,transparent)] dark:bg-[color-mix(in_srgb,var(--swatch--slate-medium)_60%,transparent)]">
    <button className="w-full flex items-center justify-between px-3 py-3 text-left" onClick={onToggle}>
      <span className="font-semibold text-slate-dark dark:text-ivory-light">{title}</span>
      <ChevronDown
        className={cn("h-4 w-4 text-slate-light dark:text-cloud-medium transition-transform", isOpen && "rotate-180")}
      />
    </button>
    {isOpen && <div className="space-y-2 px-3 pb-3">{children}</div>}
  </div>
);

const Navbar = () => {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<{ is_staff?: boolean; is_superuser?: boolean } | null>(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [activeMegaItem, setActiveMegaItem] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const serviceLinks = useMemo(
    () => [
      {
        id: "callbot-inbound",
        href: "/agente-de-llamadas-ia",
        title: tServices("showcase.chatbotRecepcionista"),
        description: tServices("showcase.chatbotRecepcionistaNote"),
        image: "/static/servicios/chatbot_recepcionista.webp",
      },
      {
        id: "automation",
        href: "/automatizaciones-personalizadas-empresas-n8n",
        title: tServices("showcase.personalizadas"),
        description: tServices("showcase.automationNote"),
        image: "/static/servicios/automatizaciones_personalizadas.webp",
      },
      {
        id: "odoo",
        href: "/implantacion-odoo",
        title: tServices("showcase.odoo"),
        description: tServices("showcase.odooNote"),
        image: "/static/servicios/implantacion_odoo.webp",
      },
      {
        id: "pwa",
        href: "/desarrollo-de-app-webs",
        title: tServices("showcase.pwa"),
        description: undefined as string | undefined,
        image: "/static/servicios/desarrollo_de_app_webs.webp",
      },
    ],
    [tServices],
  );

  const { courses: allMenuCourses } = useSiteData();

  // Courses: show at least 1 (even if past/no date), hide menu if none at all
  const menuCourses = useMemo(() => {
    if (!allMenuCourses || allMenuCourses.length === 0) return [];
    const now = new Date();
    // Upcoming courses first
    const upcoming = allMenuCourses.filter((c) => new Date(c.start_date) >= now);
    if (upcoming.length > 0) return upcoming.slice(0, 3);
    // Fallback: show at least 1 course even if passed
    return allMenuCourses.slice(0, 1);
  }, [allMenuCourses]);

  const consultationWhatsAppUrl = getWhatsAppUrl(t("navigation.ctaConsultationMessage"));

  const getStoredAuthToken = useCallback(() => localStorage.getItem("auth_token"), []);

  const clearClientAuth = useCallback((shouldBroadcast: boolean = false) => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setUserData(null);
    setHasEnrolledCourses(false);
    setIsMenuOpen(false);
    setShowLogoutModal(false);

    if (shouldBroadcast) {
      window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
    }
  }, []);

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

      if (response.status === 401) {
        clearClientAuth(true);
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return true;
      }
    } catch {

    }
    return false;
  }, [clearClientAuth]);

  const fetchEnrollmentStatus = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
      const response = await fetch(`${apiUrl}/api/courses/enrollments/?mine=true`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        clearClientAuth(true);
        return false;
      }
      if (response.ok) {
        const data = await response.json();
        setHasEnrolledCourses(Array.isArray(data) && data.length > 0);
        return true;
      }
    } catch {

    }
    return false;
  }, [clearClientAuth]);

  const syncAuthState = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setUserData(null);
      setHasEnrolledCourses(false);
      return;
    }

    setIsAuthenticated(true);
    const isProfileValid = await fetchUserData(token);
    if (!isProfileValid) {
      return;
    }

    await fetchEnrollmentStatus(token);
  }, [fetchEnrollmentStatus, fetchUserData, getStoredAuthToken]);

  useEffect(() => {
    void syncAuthState();

    const handleAuthStateChange = () => {
      void syncAuthState();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "auth_token") {
        void syncAuthState();
      }
    };

    const handleWindowFocus = () => {
      void syncAuthState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncAuthState();
      }
    };

    const authRefreshInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void syncAuthState();
      }
    }, 60_000);

    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(authRefreshInterval);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncAuthState]);

  useEffect(() => {
    setIsMenuOpen(false);
    setMobileSection(null);
    trackPageForLogin();
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
      const token = getStoredAuthToken();
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
        fetch(`${apiUrl}/api/users/signout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }).catch(() => { });
      }
    } catch {

    }

    clearClientAuth(true);
    window.location.href = "/";
  }, [clearClientAuth, getStoredAuthToken]);

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
      { id: "home", type: "link", href: "/", label: t("navigation.home") },
      { id: "services", type: "mega", href: "/servicios", label: t("navigation.services") },
      ...(menuCourses.length > 0 ? [{ id: "formation", type: "mega", href: "/formacion", label: t("navigation.formation") }] : []),
      ...(locale !== "en" ? [{ id: "blog", type: "mega", href: "/blog", label: t("navigation.blog") }] : []),
      { id: "faq", type: "link", href: "/faq", label: t("navigation.faq") },
      { id: "nosotros", type: "link", href: "/nosotros", label: t("navigation.us") },
      { id: "contact", type: "link", href: "/contacto", label: t("navigation.contact") },
    ],
    [t, locale, menuCourses.length],
  );

  const isLinkActive = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/" || pathname === "/en";
      }
      return pathname.includes(href);
    },
    [pathname],
  );

  const isBlogSectionActive = pathname.includes("/blog") || pathname.includes("/news");
  const shouldLoadCourseImages = activeMegaItem === t("navigation.formation");
  const shouldLoadServiceImages = activeMegaItem === t("navigation.services");

  return (
    <>
      <nav
        ref={navRef}
        aria-label={tCommon("mainNavigation")}
        className="fixed top-0 left-0 z-[45] w-full border-b border-[--color-border-subtle] shadow-[0_18px_45px_-40px_rgba(15,23,42,0.5)] dark:border-[--color-border-strong] dark:shadow-[0_18px_45px_-36px_rgba(0,0,0,0.7)] glass-strong !border-x-0 !border-t-0 !rounded-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1.5 sm:py-2 lg:py-2.5 min-h-[44px] sm:min-h-[52px] gap-4 lg:gap-6">
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
              <div className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-bold text-slate-dark dark:text-ivory-light truncate transition-colors duration-200">
                {t("logo.title")}
              </div>
            </Link>

            <div className="hidden md:flex items-center justify-center flex-1 gap-2 min-w-0">
              <HoverMenu setActive={setActiveMegaItem}>
                {navItems.map((item) => (
                  <div key={item.id} className={NAV_ITEM_VISIBILITY[item.id]}>
                  {item.type === "mega" ? (
                    <MenuItem
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
                          {serviceLinks.map((service) => (
                            <ProductItem
                              key={service.id}
                              title={service.title}
                              description={service.description}
                              href={service.href}
                              src={service.image}
                              loadOnHover={false}
                              loadEnabled={shouldLoadServiceImages}
                            />
                          ))}
                          <HoveredLink href="/servicios" className="text-clay dark:text-clay">{t("navigation.serviceSubmenu")}</HoveredLink>
                        </div>
                      )}
                      {item.id === "formation" && (
                        <div className="grid grid-cols-1 gap-3 min-w-[360px]">
                          {menuCourses.length > 0 &&
                            menuCourses.map((course) => (
                              <ProductItem
                                key={course.id}
                                title={course.title}
                                description={course.subtitle || course.description}
                                href={`/formacion/${course.slug ?? course.id}`}
                                src={course.image}
                                loadOnHover={false}
                                loadEnabled={shouldLoadCourseImages}
                              />
                            ))}
                          <HoveredLink href="/formacion" className="text-clay dark:text-clay">{t("navigation.formationSubmenu")}</HoveredLink>
                        </div>
                      )}
                      {item.id === "blog" && (
                        <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                          <HoveredLink href="/blog">{t("navigation.articles")}</HoveredLink>
                          <HoveredLink href="/news">{t("navigation.news")}</HoveredLink>
                        </div>
                      )}
                    </MenuItem>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "transition-all duration-200 whitespace-nowrap text-sm font-medium relative group",
                        isLinkActive(item.href)
                          ? "text-clay dark:text-clay"
                          : "text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute -bottom-1 left-0 w-0 h-0.5 bg-clay dark:bg-clay transition-all duration-300 group-hover:w-full",
                          isLinkActive(item.href) ? "w-full" : "w-0",
                        )}
                      />
                    </Link>
                  )}
                  </div>
                ))}
              </HoverMenu>
            </div>

            <div className="flex items-center gap-2">
              <ContactMenu whatsappHref={consultationWhatsAppUrl} placement="bottom-end">
                {({ buttonProps }) => (
                  <Button
                    variant="whatsapp"
                    size="sm"
                    {...buttonProps}
                    className="h-8 sm:h-9 shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2.5 sm:px-4 flex items-center gap-1.5 sm:gap-2"
                  >
                    <MessageCircle className="h-4 w-4 flex-shrink-0" aria-hidden />
                    <span className="hidden sm:inline">{t("navigation.ctaConsultation")}</span>
                    <span className="sm:hidden">{t("navigation.ctaShort")}</span>
                  </Button>
                )}
              </ContactMenu>

              <div className="hidden xl:flex items-center">
                {isAuthenticated ? (
                  <UserMenu
                    options={userMenuOptions}
                    onChange={handleUserMenuOption}
                    size="desktop"
                    ariaLabel={t("navigation.userMenu")}
                  />
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={goToSignUp}
                    className="transition-all duration-200 hover:scale-105 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                  >
                    {t("navigation.signUp")}
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="xl:hidden text-slate-medium dark:text-cloud-medium h-10 w-10 sm:h-11 sm:w-11 transition-all duration-200"
                aria-label={isMenuOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="xl:hidden bg-[color-mix(in_srgb,#f5f5f7_97%,transparent)] dark:bg-[color-mix(in_srgb,#0f1012_97%,transparent)] border-t border-[--color-border-subtle] dark:border-[--color-border-strong] backdrop-blur-xl">
            <div className="py-4 px-4 sm:px-6">
              <div className="flex flex-col space-y-3">
                <MobileSection
                  title={t("navigation.services")}
                  isOpen={mobileSection === "services"}
                  onToggle={() => toggleMobileSection("services")}
                >
                  {serviceLinks.map((service) => (
                    <Link
                      key={service.id}
                      href={service.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 bg-white/60 dark:bg-black/20 hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium] transition-colors"
                    >
                      <div className="text-sm font-semibold text-slate-dark dark:text-ivory-light line-clamp-2">
                        {service.title}
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/servicios"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-medium text-clay dark:text-clay hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium]"
                  >
                    {t("navigation.serviceSubmenu")}
                  </Link>
                </MobileSection>

                {menuCourses.length > 0 && (
                  <MobileSection
                    title={t("navigation.formation")}
                    isOpen={mobileSection === "formation"}
                    onToggle={() => toggleMobileSection("formation")}
                  >
                    {menuCourses.length > 0 &&
                      menuCourses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/formacion/${course.slug ?? course.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 bg-white/60 dark:bg-black/20 hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium] transition-colors"
                        >
                          <div className="text-sm font-semibold text-slate-dark dark:text-ivory-light line-clamp-2">
                            {course.title}
                          </div>
                        </Link>
                      ))}
                    <Link
                      href="/formacion"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-medium text-clay dark:text-clay hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium]"
                    >
                      {t("navigation.formationSubmenu")}
                    </Link>
                  </MobileSection>
                )}

                {locale !== "en" && (
                  <MobileSection
                    title={t("navigation.blog")}
                    isOpen={mobileSection === "blog"}
                    onToggle={() => toggleMobileSection("blog")}
                  >
                    <Link
                      href="/blog"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium]"
                    >
                      {t("navigation.articles")}
                    </Link>

                    <Link
                      href="/news"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-[--swatch--ivory-medium] dark:hover:bg-[--swatch--slate-medium]"
                    >
                      {t("navigation.news")}
                    </Link>
                  </MobileSection>
                )}


                <div className="grid gap-2">
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-lg font-medium",
                      isLinkActive("/")
                        ? "text-clay dark:text-clay bg-clay/10 dark:bg-clay/10"
                        : "text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)]",
                    )}
                  >
                    {t("navigation.home")}
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-lg font-medium",
                      isLinkActive("/faq")
                        ? "text-clay dark:text-clay bg-clay/10 dark:bg-clay/10"
                        : "text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)]",
                    )}
                  >
                    {t("navigation.faq")}
                  </Link>
                  <Link
                    href="/nosotros"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-lg font-medium",
                      isLinkActive("/nosotros")
                        ? "text-clay dark:text-clay bg-clay/10 dark:bg-clay/10"
                        : "text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)]",
                    )}
                  >
                    {t("navigation.us")}
                  </Link>
                  <Link
                    href="/contacto"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "transition-colors py-3 px-2 block rounded-lg font-medium",
                      isLinkActive("/contacto")
                        ? "text-clay dark:text-clay bg-clay/10 dark:bg-clay/10"
                        : "text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)]",
                    )}
                  >
                    {t("navigation.contact")}
                  </Link>
                </div>

                <div className="pt-3 mt-2 border-t border-[--color-border-subtle] dark:border-[--color-border-strong]">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)] transition-colors py-3 px-2 rounded-lg"
                      >
                        <User className="h-4 w-4 mr-3" />
                        {t("navigation.profile")}
                      </Link>
                      {hasEnrolledCourses && (
                        <Link
                          href="/profile?tab=courses"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)] transition-colors py-3 px-2 rounded-lg"
                        >
                          <BookOpen className="h-4 w-4 mr-3" />
                          {t("navigation.myCourses")}
                        </Link>
                      )}
                      {userData && (userData.is_staff || userData.is_superuser) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay hover:bg-oat/60 dark:hover:bg-[color-mix(in_srgb,var(--swatch--slate-light)_30%,transparent)] transition-colors py-3 px-2 rounded-lg"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          {t("navigation.adminDashboard")}
                        </Link>
                      )}
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center w-full text-slate-medium dark:text-cloud-medium hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors py-3 px-2 rounded-lg text-left"
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
                        className="justify-start text-slate-medium dark:text-cloud-medium hover:text-clay dark:hover:text-clay transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t("navigation.signIn")}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={goToSignUp}
                        className="justify-start"
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

      {/* Matches the fixed nav's height (min-h + vertical padding + 1px border) so no body background peeks through. */}
      <div className="h-[57px] sm:h-[69px] lg:h-[73px]" aria-hidden="true" />

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleSignOut} />
    </>
  );
};

export default Navbar;
