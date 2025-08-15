"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Calendar,
  Tag,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

const LegalPage = () => {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState("terms");
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab && ["terms", "privacy", "cookies", "license"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchDocuments = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ordinaly.duckdns.org';
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

  const DocumentCard = ({ document }: { document: LegalDocument }) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#22A60D]" />
              <span>{document.name}</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  v{document.version}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(document.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {document.pdf_content && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPDF(document)}
              className="sm:ml-4 border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('downloadPdf')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert mb-6" />
        {document.pdf_content && (
          <div className="my-4">
            <object
              data={document.pdf_content}
              type="application/pdf"
              className="w-full h-64 sm:h-96 border rounded-lg shadow"
            >
              <p>{t('messages.noPdfAvailable')}</p>
            </object>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'terms', label: t('tabs.terms'), icon: FileText },
    { id: 'privacy', label: t('tabs.privacy'), icon: FileText },
    { id: 'cookies', label: t('tabs.cookies'), icon: FileText },
    { id: 'license', label: t('tabs.license'), icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A60D]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={5000}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>

        {/* Custom Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav
              className="-mb-px flex flex-nowrap space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide px-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'border-[#22A60D] text-[#22A60D] bg-[#22a60d0d] dark:bg-[#22a60d1a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  style={{ minWidth: 140 }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'terms' && (
            <div>
              {getDocumentsByTag('terms').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('sections.terms.noDocuments')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getDocumentsByTag('terms').map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('sections.privacy.title')}
              </h2>
              {getDocumentsByTag('privacy').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('sections.privacy.noDocuments')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getDocumentsByTag('privacy').map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              )}
            </div>
          )}

          {activeTab === 'cookies' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('sections.cookies.title')}
              </h2>
              {getDocumentsByTag('cookies').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('sections.cookies.noDocuments')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getDocumentsByTag('cookies').map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              )}
            </div>
          )}

          {activeTab === 'license' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('sections.license.title')}
              </h2>
              {getDocumentsByTag('license').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('sections.license.noDocuments')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getDocumentsByTag('license').map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Back to Home - fixed at bottom foreground */}
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300"
        >
          <Link href="/">
            <Button variant="outline" className="border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white shadow-lg px-6 py-3 text-base">
              <ExternalLink className="w-4 h-4 mr-2" />
              {tCommon('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
