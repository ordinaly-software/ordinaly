"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cookie, Shield, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import Slider from "@/components/ui/slider";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { getCookiePreferences } from '@/utils/cookieManager';

const CookieConsent = () => {
  const t = useTranslations('cookie');

  const [showBubble, setShowBubble] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    thirdParty: false,
  });

  useEffect(() => {
    setIsMounted(true);

    let hasConsented = null;
    try {
      hasConsented = localStorage.getItem('cookie-consent');
      const storedPreferences = getCookiePreferences();
      if (storedPreferences) {
        const sanitizedPreferences = {
          ...storedPreferences,
          functional: true,
        };
        setCookiePreferences(prev => ({
          ...prev,
          ...sanitizedPreferences,
        }));
        try {
          localStorage.setItem('cookie-preferences', JSON.stringify(sanitizedPreferences));
        } catch {
          // ignore storage errors
        }
      }
    } catch {
      // localStorage not available - handle silently
    }
    if (!hasConsented) {
      setShowPopup(true);
      setShowBubble(true);
    }
  }, []);

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowPopup(true);
      setShowSettings(true);
      setShowBubble(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings as EventListener);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings as EventListener);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // Analytics loading is handled by AnalyticsManager via events
    // Functional cleanup intentionally omitted to avoid removing required app state
  }, [cookiePreferences, isMounted]);

  useEffect(() => {
    const syncPreferencesFromStorage = (event: StorageEvent) => {
      if (event.key === 'cookie-preferences') {
        const storedPreferences = getCookiePreferences();
        if (storedPreferences) {
          const sanitizedPreferences = {
            ...storedPreferences,
            functional: true,
          };
          setCookiePreferences(prev => ({
            ...prev,
            ...sanitizedPreferences,
          }));
        }
      }
    };

    window.addEventListener('storage', syncPreferencesFromStorage);
    return () => window.removeEventListener('storage', syncPreferencesFromStorage);
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      functional: true,
      analytics: true,
      thirdParty: true,
    };
    setCookiePreferences(preferences);
    try {
      localStorage.setItem('cookie-consent', 'accepted');
      localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    } catch {
      // localStorage not available - handle silently
    }
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: preferences }));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    const sanitizedPreferences = {
      ...cookiePreferences,
      functional: true,
      necessary: true,
    };
    try {
      localStorage.setItem('cookie-consent', 'customized');
      localStorage.setItem('cookie-preferences', JSON.stringify(sanitizedPreferences));
    } catch {
      // localStorage not available - handle silently
    }
    setCookiePreferences(sanitizedPreferences);
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: sanitizedPreferences }));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: 'necessary' | 'functional' | 'analytics' | 'thirdParty') => {
    if (type === 'necessary' || type === 'functional') return;
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const openPopup = () => setShowPopup(true);
  const closePopup = () => {
    setShowPopup(false);
    setShowSettings(false);
  };

  if (!showBubble && !showPopup) return null;
  if (!isMounted) return null;

  const modalContent = showPopup ? (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center px-2 pb-4 sm:pb-6 pointer-events-none lg:justify-end lg:pr-5">
      <div className="pointer-events-auto w-full max-w-[min(320px,calc(100vw-2.25rem))] max-h-[calc(100vh-2rem)] bg-card text-card-foreground rounded-[22px] shadow-2xl border border-border flex flex-col overflow-hidden lg:mr-4">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#623CEA] rounded-full p-2">
              <Cookie className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t('title')}
            </h2>
          </div>
          <ModalCloseButton
            onClick={closePopup}
            variant="light"
            size="md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {!showSettings ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {t('description')}
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-[#623CEA] text-white h-auto py-2.5 px-3 text-sm sm:text-base whitespace-normal text-center leading-snug"
                >
                  {t('acceptAll')}
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 bg-secondary text-secondary-foreground border border-border h-auto py-2.5 px-3 text-sm sm:text-base whitespace-normal text-center leading-snug"
                >
                  {t('customize')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('personalizeTitle')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('personalizeDescription')}
                </p>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-4">
                {[
                  {
                    key: 'necessary',
                    icon: <Shield className="text-[#1F8A0D] dark:text-[#3FBD6F]" size={20} />,
                    enabled: true,
                    toggle: false,
                    note: t('necessaryAlways')
                  },
                {
                  key: 'thirdParty',
                  icon: <Globe className="text-[#1F8A0D] dark:text-[#3FBD6F]" size={20} />,
                    enabled: cookiePreferences.thirdParty,
                    toggle: true,
                    note: t('thirdPartyExamples')
                  },
                  {
                    key: 'analytics',
                    icon: <BarChart3 className="text-[hsl(var(--color-dark-blue))]" size={20} />,
                    enabled: cookiePreferences.analytics,
                    toggle: true,
                    note: t('analyticsExamples')
                  },
                ].map(({ key, icon, enabled, toggle, note }) => (
                  <div key={key} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {icon}
                        <h4 className="font-semibold text-foreground">{t(`${key}`)}</h4>
                      </div>
                      {toggle ? (
                        <Slider
                          checked={enabled}
                          onChange={() => handlePreferenceChange(key as 'necessary' | 'functional' | 'analytics' | 'thirdParty')}
                        />
                      ) : (
                        <div className="bg-[#1F8A0D] dark:bg-[#3FBD6F] rounded-full w-6 h-6 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t(`${key}Description`)}</p>
                    <p className="text-xs text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showSettings && (
          <div className="border-t border-border bg-card/95 backdrop-blur-sm px-4 py-2.5">
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-secondary text-secondary-foreground h-auto py-2.5 px-3 text-sm sm:text-base whitespace-normal text-center leading-snug"
              >
                {t('back')}
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="flex-1 bg-[#623CEA] text-white h-auto py-2.5 px-3 text-sm sm:text-base whitespace-normal text-center leading-snug"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-10 border-t border-border bg-muted/60 backdrop-blur-sm px-4 py-2.5">
          <p className="text-xs text-muted-foreground text-center">
            {t('footer')}
            <Link href="/legal?tab=privacy" className="text-[#46B1C9] hover:underline" target="_blank" rel="noopener noreferrer">
              {t('privacy')}
            </Link>{' '}
            y{' '}
            <Link href="/legal?tab=cookies" className="text-[#46B1C9] hover:underline" target="_blank" rel="noopener noreferrer">
              {t('cookies')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Cookie Bubble */}
      {showBubble && !showPopup && (
        <div className="fixed bottom-6 left-6 z-[9998]">
          <button
            onClick={openPopup}
            className="bg-[#623CEA] hover:bg-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-[#623CEA]/20"
            aria-label={t('openCookieSettings')}
          >
            <Cookie size={24} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Cookie Popup - Rendered in portal */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default CookieConsent;
