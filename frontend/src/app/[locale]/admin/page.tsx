"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTabs, AdminTabsTab } from "@/components/ui/admin-tabs";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminServicesTab from "@/components/admin/admin-services-tab";
import AdminCoursesTab from "@/components/admin/admin-courses-tab";
import AdminTermsTab from "@/components/admin/admin-terms-tab";
import AdminUsersTab from "@/components/admin/admin-users-tab";

type TabType = 'overview' | 'services' | 'courses' | 'terms' | 'users';

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  surname: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalCourses: 0,
    totalUsers: 0,
    totalTerms: 0
  });
  const tabs: AdminTabsTab[] = [
    { id: 'overview', name: t("tabs.overview"), icon: BarChart3 },
    { id: 'services', name: t("tabs.services"), icon: Settings },
    { id: 'courses', name: t("tabs.courses"), icon: BookOpen },
    { id: 'terms', name: t("tabs.terms"), icon: FileText },
    { id: 'users', name: t("tabs.users"), icon: Users },
  ];

  // Load saved tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab') as TabType;
    if (savedTab && ['overview', 'services', 'courses', 'terms', 'users'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    localStorage.setItem('adminActiveTab', tabId);
  };

  useEffect(() => {
    // Check authentication and admin status
    const checkAdminAccess = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
        
        const response = await fetch(`${apiUrl}/api/users/profile/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const user: User = await response.json();
          
          if (user.is_staff || user.is_superuser) {
            setIsAuthorized(true);
            await fetchStats(token);
          } else {
            setAlert({type: 'error', message: 'Access denied. Admin privileges required.'});
            setTimeout(() => router.push('/'), 3000);
          }
        } else {
          setAlert({type: 'error', message: 'Failed to verify admin status. Please try signing in again.'});
          setTimeout(() => router.push('/auth/signin'), 3000);
        }
      } catch {
        setAlert({type: 'error', message: 'Authentication error. Please sign in again.'});
        setTimeout(() => router.push('/auth/signin'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStats = async (token: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
        const [servicesRes, coursesRes, termsRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/api/services/`, {
            headers: { 'Authorization': `Token ${token}` }
          }),
          fetch(`${apiUrl}/api/courses/courses/`, {
            headers: { 'Authorization': `Token ${token}` }
          }),
          fetch(`${apiUrl}/api/terms/`, {
            headers: { 'Authorization': `Token ${token}` }
          }),
          fetch(`${apiUrl}/api/users/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
        ]);

        const [services, courses, terms, users] = await Promise.all([
          servicesRes.ok ? servicesRes.json() : [],
          coursesRes.ok ? coursesRes.json() : [],
          termsRes.ok ? termsRes.json() : [],
          usersRes.ok ? usersRes.json() : []
        ]);

        setStats({
          totalServices: services.length || 0,
          totalCourses: courses.length || 0,
          totalUsers: users.length || 0,
          totalTerms: terms.length || 0
        });
      } catch {
        setStats({
          totalServices: 0,
          totalCourses: 0,
          totalUsers: 0,
          totalTerms: 0
        });
      }
    };

    checkAdminAccess();
  }, [router]);

  // No need for scroll/tab memory logic here, handled by AdminTabs

  const renderTabContent = () => {
    const tabVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('services')}
              tabIndex={0}
              role="button"
              aria-label={t("stats.totalServices")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("stats.totalServices")}
                </CardTitle>
                <Settings className="h-4 w-4 text-[#22A60D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalServices}
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('courses')}
              tabIndex={0}
              role="button"
              aria-label={t("stats.totalCourses")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("stats.totalCourses")}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-[#46B1C9]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCourses}
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('terms')}
              tabIndex={0}
              role="button"
              aria-label={t("stats.totalTerms")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("stats.totalTerms")}
                </CardTitle>
                <FileText className="h-4 w-4 text-[#623CEA]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTerms}
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('users')}
              tabIndex={0}
              role="button"
              aria-label={t("stats.totalUsers")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("stats.totalUsers")}
                </CardTitle>
                <Users className="h-4 w-4 text-[#E4572E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'services':
        return (
          <motion.div
            key="services"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminServicesTab />
          </motion.div>
        );
      case 'courses':
        return (
          <motion.div
            key="courses"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminCoursesTab />
          </motion.div>
        );
      case 'terms':
        return (
          <motion.div
            key="terms"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminTermsTab />
          </motion.div>
        );
      case 'users':
        return (
          <motion.div
            key="users"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminUsersTab />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22A60D] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={5000}
          />
        )}
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{t("accessDenied")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("noPermission")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <AdminTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId: string) => handleTabChange(tabId as TabType)}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
