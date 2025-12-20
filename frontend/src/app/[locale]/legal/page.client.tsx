"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
// Slider component not used; removed to fix lint
import { 
  FileText, 
  Download, 
  Calendar,
  Tag,
  ExternalLink,
  Mail,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

interface LegalDocument {
  id: number;
  name: string;
  content: string;
  pdf_content: string | null;
  version: string;
  tag: string;
  author?: {
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

type LegalTab = 'terms' | 'privacy' | 'cookies' | 'license';

interface ContentSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface DocumentContent {
  title: string;
  sections: ContentSection[];
}

const Footer = dynamic(() => import("@/components/ui/footer"), { ssr: false, loading: () => <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1A1924]"><div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-4 gap-8"><div className="col-span-2"><div className="h-24 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div></div></div></div></footer> });

const getTermsContent = (t: (key: string, opts?: Record<string, string | number | Date> | undefined) => string): DocumentContent => ({
  title: t('sections.terms.title'),
  sections: [
    {
      id: 'identification',
      title: t('sections.terms.identification.title'),
      paragraphs: [
        t('sections.terms.identification.p1'),
      ],
      bullets: [
        t('sections.terms.identification.bullet1'),
        t('sections.terms.identification.bullet2'),
        t('sections.terms.identification.bullet3'),
        t('sections.terms.identification.bullet4'),
      ],
    },
    {
      id: 'purpose',
      title: t('sections.terms.purpose.title'),
      paragraphs: [
        t('sections.terms.purpose.p1'),
      ],
    },
    {
      id: 'service-modalities',
      title: t('sections.terms.serviceModalities.title'),
      paragraphs: [
        t('sections.terms.serviceModalities.p1'),
      ],
      bullets: [
        t('sections.terms.serviceModalities.bullet1'),
        t('sections.terms.serviceModalities.bullet2'),
        t('sections.terms.serviceModalities.bullet3'),
      ],
    },
    {
      id: 'economic-conditions',
      title: t('sections.terms.economicConditions.title'),
      paragraphs: [],
      bullets: [
        t('sections.terms.economicConditions.bullet1'),
        t('sections.terms.economicConditions.bullet2'),
        t('sections.terms.economicConditions.bullet3'),
        t('sections.terms.economicConditions.bullet4'),
      ],
    },
    {
      id: 'access-requirements',
      title: t('sections.terms.accessRequirements.title'),
      paragraphs: [
        t('sections.terms.accessRequirements.p1'),
      ],
    },
    {
      id: 'correct-use',
      title: t('sections.terms.correctUse.title'),
      paragraphs: [
        t('sections.terms.correctUse.p1'),
      ],
      bullets: [
        t('sections.terms.correctUse.bullet1'),
        t('sections.terms.correctUse.bullet2'),
        t('sections.terms.correctUse.bullet3'),
      ],
    },
    {
      id: 'intellectual-property',
      title: t('sections.terms.intellectualProperty.title'),
      paragraphs: [
        t('sections.terms.intellectualProperty.p1'),
        t('sections.terms.intellectualProperty.p2'),
        t('sections.terms.intellectualProperty.p3'),
      ],
    },
    {
      id: 'third-party-licenses',
      title: t('sections.terms.thirdPartyLicenses.title'),
      paragraphs: [
        t('sections.terms.thirdPartyLicenses.p1'),
      ],
    },
  ],
});

const getPrivacyContent = (t: (key: string, opts?: Record<string, string | number | Date> | undefined) => string): DocumentContent => ({
  title: t('sections.privacy.title'),
  sections: [
    {
      id: 'data-controller',
      title: t('sections.privacy.dataController.title'),
      paragraphs: [
        t('sections.privacy.dataController.p1'),
        t('sections.privacy.dataController.p2'),
      ],
      bullets: [
        t('sections.privacy.dataController.bullet1'),
        t('sections.privacy.dataController.bullet2'),
      ],
    },
    {
      id: 'personal-data-collected',
      title: t('sections.privacy.personalDataCollected.title'),
      paragraphs: [
        t('sections.privacy.personalDataCollected.p1'),
      ],
      bullets: [
        t('sections.privacy.personalDataCollected.bullet1'),
        t('sections.privacy.personalDataCollected.bullet2'),
        t('sections.privacy.personalDataCollected.bullet3'),
        t('sections.privacy.personalDataCollected.bullet4'),
        t('sections.privacy.personalDataCollected.bullet5'),
      ],
    },
    {
      id: 'processing-purposes',
      title: t('sections.privacy.processingPurposes.title'),
      paragraphs: [
        t('sections.privacy.processingPurposes.p1'),
      ],
      bullets: [
        t('sections.privacy.processingPurposes.bullet1'),
        t('sections.privacy.processingPurposes.bullet2'),
        t('sections.privacy.processingPurposes.bullet3'),
        t('sections.privacy.processingPurposes.bullet4'),
      ],
    },
    {
      id: 'legal-bases',
      title: t('sections.privacy.legalBases.title'),
      paragraphs: [
        t('sections.privacy.legalBases.p1'),
      ],
      bullets: [
        t('sections.privacy.legalBases.bullet1'),
        t('sections.privacy.legalBases.bullet2'),
        t('sections.privacy.legalBases.bullet3'),
      ],
    },
    {
      id: 'recipients',
      title: t('sections.privacy.recipients.title'),
      paragraphs: [
        t('sections.privacy.recipients.p1'),
      ],
      bullets: [
        t('sections.privacy.recipients.bullet1'),
        t('sections.privacy.recipients.bullet2'),
      ],
    },
    {
      id: 'data-retention',
      title: t('sections.privacy.dataRetention.title'),
      paragraphs: [],
      bullets: [
        t('sections.privacy.dataRetention.bullet1'),
        t('sections.privacy.dataRetention.bullet2'),
        t('sections.privacy.dataRetention.bullet3'),
      ],
    },
    {
      id: 'ai-interactions',
      title: t('sections.privacy.aiInteractions.title'),
      paragraphs: [
        t('sections.privacy.aiInteractions.p1'),
      ],
      bullets: [
        t('sections.privacy.aiInteractions.bullet1'),
        t('sections.privacy.aiInteractions.bullet2'),
        t('sections.privacy.aiInteractions.bullet3'),
      ],
    },
    {
      id: 'user-rights',
      title: t('sections.privacy.userRights.title'),
      paragraphs: [
        t('sections.privacy.userRights.p1'),
      ],
      bullets: [
        t('sections.privacy.userRights.bullet1'),
        t('sections.privacy.userRights.bullet2'),
        t('sections.privacy.userRights.bullet3'),
        t('sections.privacy.userRights.bullet4'),
        t('sections.privacy.userRights.bullet5'),
        t('sections.privacy.userRights.bullet6'),
        t('sections.privacy.userRights.bullet7'),
      ],
    },
    {
      id: 'data-security',
      title: t('sections.privacy.dataSecurity.title'),
      paragraphs: [
        t('sections.privacy.dataSecurity.p1'),
      ],
    },
  ],
});

const getCookiesContent = (t: (key: string, opts?: Record<string, string | number | Date> | undefined) => string): DocumentContent => ({
  title: t('sections.cookies.title'),
  sections: [
    {
      id: 'what-are-cookies',
      title: t('sections.cookies.whatAreCookies.title'),
      paragraphs: [
        t('sections.cookies.whatAreCookies.p1'),
      ],
    },
    {
      id: 'types-of-cookies',
      title: t('sections.cookies.typesOfCookies.title'),
      paragraphs: [
        t('sections.cookies.typesOfCookies.p1'),
      ],
      bullets: [
        t('sections.cookies.typesOfCookies.bullet1'),
        t('sections.cookies.typesOfCookies.bullet2'),
      ],
    },
    {
      id: 'cookies-list',
      title: t('sections.cookies.cookiesList.title'),
      paragraphs: [
        t('sections.cookies.cookiesList.p1'),
      ],
      bullets: [
        t('sections.cookies.cookiesList.bullet1'),
        t('sections.cookies.cookiesList.bullet2'),
        t('sections.cookies.cookiesList.bullet3'),
      ],
    },
    {
      id: 'local-storage',
      title: t('sections.cookies.localStorage.title'),
      paragraphs: [
        t('sections.cookies.localStorage.p1'),
        t('sections.cookies.localStorage.p2'),
      ],
      bullets: [
        t('sections.cookies.localStorage.bullet1'),
        t('sections.cookies.localStorage.bullet2'),
        t('sections.cookies.localStorage.bullet3'),
        t('sections.cookies.localStorage.bullet4'),
      ],
    },
    {
      id: 'cookie-management',
      title: t('sections.cookies.cookieManagement.title'),
      paragraphs: [
        t('sections.cookies.cookieManagement.p1'),
      ],
      bullets: [
        t('sections.cookies.cookieManagement.bullet1'),
        t('sections.cookies.cookieManagement.bullet2'),
        t('sections.cookies.cookieManagement.bullet3'),
        t('sections.cookies.cookieManagement.bullet4'),
      ],
    },
    {
      id: 'international-transfer',
      title: t('sections.cookies.internationalTransfer.title'),
      paragraphs: [
        t('sections.cookies.internationalTransfer.p1'),
      ],
    },
    {
      id: 'policy-modification',
      title: t('sections.cookies.policyModification.title'),
      paragraphs: [
        t('sections.cookies.policyModification.p1'),
      ],
    },
  ],
});

const getLicenseContent = (t: (key: string, opts?: Record<string, string | number | Date> | undefined) => string): DocumentContent => ({
  title: t('sections.license.title'),
  sections: [
    {
      id: 'purpose',
      title: t('sections.license.purpose.title'),
      paragraphs: [
        t('sections.license.purpose.p1'),
      ],
      bullets: [
        t('sections.license.purpose.bullet1'),
        t('sections.license.purpose.bullet2'),
        t('sections.license.purpose.bullet3'),
        t('sections.license.purpose.bullet4'),
        t('sections.license.purpose.bullet5'),
      ],
    },
    {
      id: 'scope',
      title: t('sections.license.scope.title'),
      paragraphs: [
        t('sections.license.scope.p1'),
      ],
      bullets: [
        t('sections.license.scope.bullet1'),
        t('sections.license.scope.bullet2'),
      ],
    },
    {
      id: 'validity',
      title: t('sections.license.validity.title'),
      paragraphs: [
        t('sections.license.validity.p1'),
        t('sections.license.validity.p2'),
        t('sections.license.validity.p3'),
      ],
    },
    {
      id: 'restrictions',
      title: t('sections.license.restrictions.title'),
      paragraphs: [
        t('sections.license.restrictions.p1'),
      ],
      bullets: [
        t('sections.license.restrictions.bullet1'),
        t('sections.license.restrictions.bullet2'),
        t('sections.license.restrictions.bullet3'),
      ],
    },
    {
      id: 'third-party-software',
      title: t('sections.license.thirdPartySoftware.title'),
      paragraphs: [
        t('sections.license.thirdPartySoftware.p1'),
      ],
      bullets: [
        t('sections.license.thirdPartySoftware.bullet1'),
        t('sections.license.thirdPartySoftware.bullet2'),
        t('sections.license.thirdPartySoftware.bullet3'),
        t('sections.license.thirdPartySoftware.bullet4'),
        t('sections.license.thirdPartySoftware.bullet5'),
        t('sections.license.thirdPartySoftware.bullet6'),
      ],
    },
    {
      id: 'intellectual-property',
      title: t('sections.license.intellectualProperty.title'),
      paragraphs: [
        t('sections.license.intellectualProperty.p1'),
        t('sections.license.intellectualProperty.p2'),
      ],
    },
    {
      id: 'applicable-law',
      title: t('sections.license.applicableLaw.title'),
      paragraphs: [
        t('sections.license.applicableLaw.p1'),
      ],
    },
  ],
});

const LegalPage = () => {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const [isDark, setIsDark] = useState(false);
  
  const [, setAnalyticsEnabled] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const raw = localStorage.getItem('cookie-preferences');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed.analytics;
    } catch {
      return false;
    }
  });

  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams?.get("tab") as LegalTab | null;
    if (tab && ["terms", "privacy", "cookies", "license"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Listen to cookie preferences changes
  useEffect(() => {
    const onPrefs = (e: Event) => {
      try {
        // @ts-expect-error: event detail may be typed loosely
        const detail = e?.detail;
        if (detail && typeof detail === 'object') {
          setAnalyticsEnabled(!!detail.analytics);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('cookie-preferences-changed', onPrefs as EventListener);
    return () => window.removeEventListener('cookie-preferences-changed', onPrefs as EventListener);
  }, []);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ordinaly.ai';
      const response = await fetch(`${apiUrl}/api/terms/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: t('messages.fetchError')});
      }
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const downloadPDF = (doc: LegalDocument) => {
    if (!doc.pdf_content) {
      setAlert({type: 'warning', message: t('messages.noPdfAvailable')});
      return;
    }
    window.open(doc.pdf_content, '_blank');
  };

  const getDocumentsByTag = (tag: string) => {
    return documents.filter(doc => doc.tag === tag);
  };

  const tabs = useMemo(
    () => [
      { id: 'terms' as LegalTab, label: t('tabs.terms'), icon: FileText },
      { id: 'privacy' as LegalTab, label: t('tabs.privacy'), icon: FileText },
      { id: 'cookies' as LegalTab, label: t('tabs.cookies'), icon: Sparkles },
      { id: 'license' as LegalTab, label: t('tabs.license'), icon: FileText },
    ],
    [t]
  );

  const tabButtonClass = (id: LegalTab) => {
    const base = "group inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all";
    if (activeTab === id) {
      return isDark
        ? `${base} border-[#1F8A0D]/60 bg-[#1F8A0D]/15 text-white shadow-[0_10px_30px_rgba(31,138,13,0.2)]`
        : `${base} border-[#1F8A0D]/60 bg-[#1F8A0D]/15 text-[#1F8A0D] dark:text-[#7CFC00] shadow-[0_8px_20px_rgba(31,138,13,0.12)]`;
    }
    return isDark
      ? `${base} border-white/10 bg-white/5 text-gray-200 hover:border-[#1F8A0D] dark:hover:border-[#7CFC00]/30 hover:bg-[#1F8A0D] dark:hover:bg-[#7CFC00]/10 hover:text-white`
      : `${base} border-gray-200 bg-white text-gray-700 hover:border-[#1F8A0D] dark:hover:border-[#7CFC00]/30 hover:bg-[#1F8A0D] dark:hover:bg-[#7CFC00]/5 hover:text-white dark:hover:text-[#7CFC00] dark:text-[#7CFC00]`;
  };

  const rootClass = isDark
    ? "relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0d2036] to-[#0f2947] text-slate-50"
    : "relative min-h-screen overflow-hidden bg-gray-50 text-slate-900";

  const overlaySet = isDark
    ? (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,138,13,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(31,138,13,0.08),transparent_25%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_35%,transparent_70%)]" />
        </div>
      )
    : null;

  const panelClass = isDark
    ? "rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-10"
    : "rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10";

  const cardClass = (extra = "") =>
    isDark ? `border-white/10 bg-white/5 backdrop-blur-md ${extra}` : `border-gray-200 bg-white ${extra}`;

  const activeDocuments = getDocumentsByTag(activeTab);
  const activeDoc = activeDocuments.length > 0 ? activeDocuments[0] : null;
  
  // Get static content for terms/privacy/cookies/license or use API content for other tabs
  const contentData = activeTab === 'terms' 
    ? getTermsContent(t)
    : activeTab === 'privacy'
    ? getPrivacyContent(t)
    : activeTab === 'cookies'
    ? getCookiesContent(t)
    : activeTab === 'license'
    ? getLicenseContent(t)
    : null;

  if (isLoading) {
    return (
      <div className={rootClass}>
        {overlaySet}
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-24 md:px-6 lg:px-8 lg:pt-28">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F8A0D] dark:border-[#7CFC00]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10 md:px-6 lg:px-8 lg:pt-18">
        {/* Header Panel */}
        <div className={panelClass}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.32em] text-[#1F8A0D] dark:text-[#7CFC00]" : "text-xs font-semibold uppercase tracking-[0.32em] text-[#1F8A0D] dark:text-[#7CFC00]"}>
                Ordinaly Software S.L
              </p>
              <h1 className={isDark ? "text-4xl font-black leading-tight text-white md:text-5xl" : "text-4xl font-black leading-tight text-slate-900 md:text-5xl"}>
                {t('title')}
              </h1>
              <p className={isDark ? "max-w-3xl text-base text-slate-200 md:text-lg" : "max-w-3xl text-base text-slate-700 md:text-lg"}>
                {t('description')}
              </p>
            </div>
            <Link href="/" className="self-start lg:self-center">
              <Button className="bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-black shadow-[0_15px_40px_rgba(31,138,13,0.35)] hover:shadow-[0_20px_50px_rgba(31,138,13,0.4)] hover:bg-[#145C07] normal-case not-italic font-semibold tracking-tight">
                <ExternalLink className="mr-2 h-4 w-4" />
                {tCommon('backToHome')}
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabButtonClass(tab.id)}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Download Card */}
          {activeDoc && activeDoc.pdf_content && (
            <Card className={cardClass("flex flex-col")}>
              <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
                <div className="flex items-center gap-3">
                  <Download className={isDark ? "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]" : "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]"} />
                  <div>
                    <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]"}>
                      {t('downloadPdf')}
                    </p>
                    <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                      {activeDoc.name} v{activeDoc.version}
                    </h3>
                  </div>
                </div>
                <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                  {t('downloadDesc')}
                </p>
                <Button
                  onClick={() => downloadPDF(activeDoc)}
                  className="w-full bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-black shadow-[0_15px_40px_rgba(31,138,13,0.35)] hover:shadow-[0_18px_46px_rgba(31,138,13,0.4)] hover:bg-[#145C07] normal-case not-italic font-semibold tracking-tight mt-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('downloadPdf')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cookie Settings Card */}
          <Card className={cardClass("flex flex-col")}>
            <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
              <div className="flex items-center gap-3">
                  <Sparkles className={isDark ? "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]" : "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]"} />
                  <div>
                  <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]"}>
                      {t('tabs.cookies')}
                  </p>
                  <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                        {t('cookieManage', {})}
                  </h3>
                </div>
              </div>
              <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                {t('cookieDesc', {})}
              </p>
              <Button
                onClick={() => {
                  try {
                    localStorage.removeItem('cookie-consent');
                    window.location.reload();
                  } catch {
                    // ignore
                  }
                }}
                className="w-full bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-black shadow-[0_15px_40px_rgba(31,138,13,0.35)] hover:shadow-[0_18px_46px_rgba(31,138,13,0.4)] hover:bg-[#145C07] normal-case not-italic font-semibold tracking-tight mt-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('openCookieSettings', {})}
              </Button>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className={cardClass("flex flex-col")}>
            <CardContent className={`flex flex-col p-6 md:p-7 ${isDark ? "" : "text-slate-800"}`}>
              <div className="flex items-center gap-3">
                <Mail className={isDark ? "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]" : "h-5 w-5 text-[#1F8A0D] dark:text-[#7CFC00]"} />
                <div>
                  <p className={isDark ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]"}>
                    {t('supportKicker', {})}
                  </p>
                  <h3 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                    {t('supportTitle', {})}
                  </h3>
                </div>
              </div>
              <p className={`${isDark ? "text-slate-100/85 text-sm" : "text-slate-700 text-sm"} mt-4 mb-4 flex-grow`}>
                {t('supportDesc', {})}
              </p>
              <Button
                asChild
                className="w-full bg-[#1F8A0D] dark:bg-[#7CFC00] text-white dark:text-black shadow-[0_15px_40px_rgba(31,138,13,0.35)] hover:shadow-[0_18px_46px_rgba(31,138,13,0.4)] hover:bg-[#145C07] normal-case not-italic font-semibold tracking-tight mt-auto"
              >
                <a href="mailto:compliance@ordinaly.ai">{t('contactCta', {})}</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className={cardClass()}>
          <CardContent className={`space-y-6 p-6 md:p-8 ${isDark ? "" : "text-slate-900"}`}>
            {contentData || activeDoc ? (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className={`${isDark ? "text-2xl font-black text-white md:text-3xl" : "text-2xl font-black text-slate-900 md:text-3xl"}`}>
                      {contentData?.title || activeDoc?.name}
                    </h2>
                  </div>
                  <div className={isDark ? "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200" : "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"}>
                    <Calendar className={isDark ? "h-4 w-4 text-[#1F8A0D] dark:text-[#7CFC00]" : "h-4 w-4 text-[#1F8A0D] dark:text-[#7CFC00]"} />
                    {activeDoc ? new Date(activeDoc.updated_at).toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Content Sections */}
                {contentData ? (
                  <div className="space-y-8">
                    {contentData.sections.map((section) => (
                      <div key={section.id} className={isDark ? "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6" : "space-y-3 rounded-2xl border border-gray-200 bg-white p-6"}>
                        <h3 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
                          {section.title}
                        </h3>
                        <div className={isDark ? "space-y-3 text-slate-100/85" : "space-y-3 text-slate-700"}>
                          {section.paragraphs.map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                          {section.bullets && section.bullets.length > 0 && (
                            <ul className={isDark ? "list-disc space-y-2 pl-5 text-slate-100/80" : "list-disc space-y-2 pl-5 text-slate-700"}>
                              {section.bullets.map((bullet, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className={isDark ? "text-base text-slate-100/90" : "text-base text-slate-700"}>{activeDoc?.content}</p>

                    {/* PDF Preview */}
                    {activeDoc?.pdf_content && (
                      <div className="rounded-2xl overflow-hidden border border-white/10">
                        <object
                          data={activeDoc.pdf_content}
                          type="application/pdf"
                          className="w-full h-80 sm:h-[40rem] md:h-[48rem]"
                        >
                          <p className={isDark ? "text-slate-200 p-4" : "text-slate-700 p-4"}>{t('messages.noPdfAvailable')}</p>
                        </object>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className={isDark ? "w-12 h-12 text-gray-400 mx-auto mb-4" : "w-12 h-12 text-gray-400 mx-auto mb-4"} />
                <p className={isDark ? "text-slate-200" : "text-slate-700"}>
                  {t('sections.' + activeTab + '.noDocuments')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Documents Grid - Optional alternative view */}
        {activeDocuments.length > 1 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeDocuments.map((doc) => (
              <Card key={doc.id} className={cardClass()}>
                <CardContent className={`space-y-3 p-4 md:p-5 ${isDark ? "" : "text-slate-800"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={isDark ? "text-xs uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]" : "text-xs uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00]"}>
                        v{doc.version}
                      </p>
                      <h4 className={isDark ? "font-bold text-white" : "font-bold text-slate-900"}>
                        {doc.name}
                      </h4>
                    </div>
                    <Tag className={isDark ? "h-4 w-4 text-slate-400" : "h-4 w-4 text-slate-400"} />
                  </div>
                  <p className={isDark ? "text-xs text-slate-300" : "text-xs text-slate-600"}>
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                  {doc.pdf_content && (
                    <Button
                      onClick={() => downloadPDF(doc)}
                      size="sm"
                      className="w-full bg-[#1F8A0D] dark:bg-[#7CFC00] text-white hover:bg-[#145C07]"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      {t('downloadPdf')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LegalPage;
