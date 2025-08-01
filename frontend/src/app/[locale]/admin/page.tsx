"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/home/footer";
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

type TabType = 'overview' | 'services' | 'courses' | 'terms';

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
  const [isDark, setIsDark] = useState(false);
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

  useEffect(() => {
    // Check authentication and admin status
    const checkAdminAccess = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/users/signin');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        console.log('Checking admin access with token:', token);
        console.log('Making request to:', `${apiUrl}/api/users/profile/`);
        
        const response = await fetch(`${apiUrl}/api/users/profile/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profile response status:', response.status);
        console.log('Profile response headers:', response.headers);
        
        if (response.ok) {
          const user: User = await response.json();
          console.log('User data received:', user);
          console.log('User is_staff:', user.is_staff, 'User is_superuser:', user.is_superuser);
          
          if (user.is_staff || user.is_superuser) {
            console.log('✅ User is authorized as admin');
            setIsAuthorized(true);
            await fetchStats(token);
          } else {
            console.log('❌ User is NOT admin - is_staff:', user.is_staff, 'is_superuser:', user.is_superuser);
            setAlert({type: 'error', message: 'Access denied. Admin privileges required.'});
            setTimeout(() => router.push('/'), 3000);
          }
        } else {
          console.log('❌ Profile fetch failed - Status:', response.status);
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          setAlert({type: 'error', message: 'Failed to verify admin status. Please try signing in again.'});
          setTimeout(() => router.push('/users/signin'), 3000);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAlert({type: 'error', message: 'Authentication error. Please sign in again.'});
        setTimeout(() => router.push('/users/signin'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStats = async (token: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const [servicesRes, coursesRes, termsRes] = await Promise.all([
          fetch(`${apiUrl}/api/services/`, {
            headers: { 'Authorization': `Token ${token}` }
          }),
          fetch(`${apiUrl}/api/courses/`, {
            headers: { 'Authorization': `Token ${token}` }
          }),
          fetch(`${apiUrl}/api/terms/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
        ]);

        const [services, courses, terms] = await Promise.all([
          servicesRes.ok ? servicesRes.json() : [],
          coursesRes.ok ? coursesRes.json() : [],
          termsRes.ok ? termsRes.json() : []
        ]);

        setStats({
          totalServices: services.length || 0,
          totalCourses: courses.length || 0,
          totalUsers: 0, // Would need a users endpoint
          totalTerms: terms.length || 0
        });
      } catch (error) {
        console.error('Stats fetch error:', error);
      }
    };

    // Theme detection
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    checkAdminAccess();
  }, [router]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29BF12] mx-auto mb-4"></div>
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
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{t("accessDenied")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("noPermission")}</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, name: t("tabs.overview"), icon: BarChart3 },
    { id: 'services' as TabType, name: t("tabs.services"), icon: Settings },
    { id: 'courses' as TabType, name: t("tabs.courses"), icon: BookOpen },
    { id: 'terms' as TabType, name: t("tabs.terms"), icon: FileText },
  ];

  const renderTabContent = () => {
    const tabVariants = {
      hidden: { 
        opacity: 0, 
        x: 20,
        transition: { duration: 0.2 }
      },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      },
      exit: { 
        opacity: 0, 
        x: -20,
        transition: { duration: 0.2 }
      }
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("stats.totalServices")}
                </CardTitle>
                <Settings className="h-4 w-4 text-[#29BF12]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalServices}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
      default:
        return null;
    }
  };

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
      
      <Navbar isDark={isDark} setIsDark={setIsDark} />

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
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#29BF12] text-[#29BF12]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>

      <Footer isDark={isDark} />
    </div>
  );
}
