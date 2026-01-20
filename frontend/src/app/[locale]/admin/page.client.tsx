"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTabs, AdminTabsTab } from "@/components/admin/admin-tabs";
import Footer from "@/components/ui/footer";
import Alert from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings,
  BarChart3,
  ArrowUpRight,
  Command,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminServicesTab from "@/components/admin/admin-services-tab";
import AdminCoursesTab from "@/components/admin/admin-courses-tab";
import AdminTermsTab from "@/components/admin/admin-terms-tab";
import AdminUsersTab from "@/components/admin/admin-users-tab";
import AdminExternalTab from "@/components/admin/admin-external-tab";

type TabType = 'overview' | 'services' | 'courses' | 'terms' | 'users' | 'blog' | 'odoo' | 'n8n' | 'api';

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
    totalTerms: 0,
    totalPosts: 0, // added
  });
  const tabs: AdminTabsTab[] = [
    { id: 'overview', name: t("tabs.overview"), icon: BarChart3 },
    { id: 'services', name: t("tabs.services"), icon: Settings },
    { id: 'courses', name: t("tabs.courses"), icon: BookOpen },
    { id: 'terms', name: t("tabs.terms"), icon: FileText },
    { id: 'users', name: t("tabs.users"), icon: Users },
    { id: 'blog', name: t("tabs.blog"), icon: ArrowUpRight, accentColor: "#1F8A0D" },
    { id: 'odoo', name: t("tabs.odoo"), icon: () => <BarChart3 className="h-4 w-4" />, accentColor: "#623CEA" },
    { id: 'n8n', name: t("tabs.n8n"), icon: () => <Command className="h-4 w-4" />, accentColor: "#E4572E" },
    { id: 'api', name: t("tabs.api"), icon: () => <Settings className="h-4 w-4" />, accentColor: "#46B1C9" },
  ];

  // Load saved tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab') as TabType;
    if (savedTab && ['overview', 'services', 'courses', 'terms', 'users', 'blog', 'odoo', 'n8n', 'api'].includes(savedTab)) {
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
        
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
            setAlert({type: 'error', message: t("errors.adminOnly")});
            setTimeout(() => router.push('/'), 3000);
          }
        } else {
          setAlert({type: 'error', message: t("errors.verifyFailed")});
          setTimeout(() => router.push('/auth/signin'), 3000);
        }
      } catch {
        setAlert({type: 'error', message: t("errors.authError")});
        setTimeout(() => router.push('/auth/signin'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSanityPostsCount = async (): Promise<number> => {
      try {
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
        if (!projectId || !dataset) return 0;

        // Count all posts (example mirrors blog pages Sanity usage)
        const groq = encodeURIComponent(`count(*[_type == "post"])`);
        const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${groq}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return 0;
        const data = await res.json();
        const count = typeof data?.result === 'number' ? data.result : 0;
        return count;
      } catch {
        return 0;
      }
    };

    const fetchStats = async (token: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
        const [servicesRes, coursesRes, termsRes, usersRes, postsCount] = await Promise.all([
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
          }),
          fetchSanityPostsCount()
        ]);

        const [services, courses, terms, users] = await Promise.all([
          servicesRes.ok ? servicesRes.json() : [],
          coursesRes.ok ? coursesRes.json() : [],
          termsRes.ok ? termsRes.json() : [],
          usersRes.ok ? usersRes.json() : [],
        ]);

        setStats({
          totalServices: Array.isArray(services) ? services.length : 0,
          totalCourses: Array.isArray(courses) ? courses.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalTerms: Array.isArray(terms) ? terms.length : 0,
          totalPosts: typeof postsCount === 'number' ? postsCount : 0,
        });
      } catch {
        setStats({
          totalServices: 0,
          totalCourses: 0,
          totalUsers: 0,
          totalTerms: 0,
          totalPosts: 0,
        });
      }
    };

    checkAdminAccess();
  }, [router, t]);

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
            {/* Services */}
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
                <Settings className="h-4 w-4 text-[#1F8A0D] dark:text-[#3FBD6F]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalServices}
                </div>
              </CardContent>
            </Card>

            {/* Courses */}
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

            {/* Terms */}
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

            {/* Users */}
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

            {/* Blog (posts count + quick access, same size as others) */}
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('blog')}
              tabIndex={0}
              role="button"
              aria-label={t("tabs.blog")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("tabs.blog")}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-[#1F8A0D] dark:text-[#3FBD6F]" />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalPosts}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.totalPosts")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick access: Odoo */}
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('odoo')}
              tabIndex={0}
              role="button"
              aria-label={t("tabs.odoo")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("tabs.odoo")}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-[#623CEA]" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("externalTabs.odoo.description")}
                </div>
              </CardContent>
            </Card>

            {/* Quick access: n8n */}
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('n8n')}
              tabIndex={0}
              role="button"
              aria-label={t("tabs.n8n")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("tabs.n8n")}
                </CardTitle>
                <Command className="h-4 w-4 text-[#E4572E]" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("externalTabs.n8n.description")}
                </div>
              </CardContent>
            </Card>

            {/* Quick access: API */}
            <Card
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTabChange('api')}
              tabIndex={0}
              role="button"
              aria-label={t("tabs.api")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("tabs.api")}
                </CardTitle>
                <Settings className="h-4 w-4 text-[#46B1C9]" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("externalTabs.api.description")}
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
      case 'blog':
        return (
          <motion.div
            key="blog"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminExternalTab
              title={t("blogTab.title")}
              description={t("blogTab.openedMessage")}
              buttonLabel={t("blogTab.openButton")}
              warning={t("blogTab.loginWarning")}
              href="/studio"
            />
          </motion.div>
        );
      case 'odoo':
        return (
          <motion.div
            key="odoo"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminExternalTab
              title={t("externalTabs.odoo.title")}
              description={t("externalTabs.odoo.description")}
              buttonLabel={t("externalTabs.odoo.button")}
              warning={t("externalTabs.odoo.warning")}
              href="https://odoo.ordinaly.ai"
              accentColor="#7a55ffff"
              backgroundImage="/static/backgrounds/odoo_background.webp"
            />
          </motion.div>
        );
      case 'n8n':
        return (
          <motion.div
            key="n8n"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminExternalTab
              title={t("externalTabs.n8n.title")}
              description={t("externalTabs.n8n.description")}
              buttonLabel={t("externalTabs.n8n.button")}
              warning={t("externalTabs.n8n.warning")}
              href="https://n8n.ordinaly.ai"
              accentColor="#E4572E"
              backgroundImage="/static/backgrounds/n8n_background.webp"
            />
          </motion.div>
        );
      case 'api':
        return (
          <motion.div
            key="api"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AdminExternalTab
              title={t("externalTabs.api.title")}
              description={t("externalTabs.api.description")}
              buttonLabel={t("externalTabs.api.button")}
              warning={t("externalTabs.api.warning")}
              href="https://api.ordinaly.ai/admin"
              accentColor="#46B1C9"
              backgroundImage="/static/backgrounds/api_background.webp"
            />
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8A0D] dark:border-[#3FBD6F] mx-auto mb-4"></div>
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
