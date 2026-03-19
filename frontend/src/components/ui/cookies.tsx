"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, BarChart3, Globe, X, Cookie, CookieIcon} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Slider from "@/components/ui/slider";
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
    marketing: false,
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
        setCookiePreferences(prev => ({ ...prev, ...sanitizedPreferences }));
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
  }, [cookiePreferences, isMounted]);

  useEffect(() => {
    const syncPreferencesFromStorage = (event: StorageEvent) => {
      if (event.key === 'cookie-preferences') {
        const storedPreferences = getCookiePreferences();
        if (storedPreferences) {
          const sanitizedPreferences = { ...storedPreferences, functional: true };
          setCookiePreferences(prev => ({ ...prev, ...sanitizedPreferences }));
        }
      }
    };
    window.addEventListener('storage', syncPreferencesFromStorage);
    return () => window.removeEventListener('storage', syncPreferencesFromStorage);
  }, []);

  const handleAcceptAll = () => {
    const preferences = { necessary: true, functional: true, analytics: true, marketing: true };
    setCookiePreferences(preferences);
    try {
      localStorage.setItem('cookie-consent', 'accepted');
      localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    } catch {
      // localStorage not available
    }
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: preferences }));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    const sanitizedPreferences = { ...cookiePreferences, functional: true, necessary: true };
    try {
      localStorage.setItem('cookie-consent', 'customized');
      localStorage.setItem('cookie-preferences', JSON.stringify(sanitizedPreferences));
    } catch {
      // localStorage not available
    }
    setCookiePreferences(sanitizedPreferences);
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: sanitizedPreferences }));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: 'necessary' | 'functional' | 'analytics' | 'marketing') => {
    if (type === 'necessary' || type === 'functional') return;
    setCookiePreferences(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const openPopup = () => setShowPopup(true);
  const closePopup = () => {
    setShowPopup(false);
    setShowSettings(false);
  };

  if (!showBubble && !showPopup) return null;
  if (!isMounted) return null;

  const modalContent = showPopup ? (
    <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-3 pb-3 sm:pb-4 pointer-events-none sm:justify-end sm:pr-5">
      <div className="pointer-events-auto w-full sm:max-w-sm max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden rounded-xl border border-[--color-border-subtle] dark:border-[--color-border-strong] bg-[#f5f5f7] dark:bg-[#111213] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[--color-border-subtle] dark:border-[--color-border-strong]">
          <div className="flex items-center gap-2">
            <CookieIcon className="h-4 w-4" aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-dark dark:text-ivory-light">
              {t('title')}
            </span>
          </div>
          <button
            onClick={closePopup}
            className="rounded-full p-1 text-slate-medium dark:text-cloud-medium hover:text-slate-dark dark:hover:text-ivory-light transition"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!showSettings ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-medium dark:text-cloud-medium leading-relaxed">
                {t('description')}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full rounded-full bg-slate-dark dark:bg-ivory-light text-white dark:text-slate-dark px-4 py-2 text-xs font-medium tracking-wide transition hover:opacity-80"
                >
                  {t('acceptAll')}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full rounded-full border border-[--color-border-subtle] dark:border-[--color-border-strong] px-4 py-2 text-xs font-medium tracking-wide text-slate-medium dark:text-cloud-medium transition hover:text-slate-dark dark:hover:text-ivory-light"
                >
                  {t('customize')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-dark dark:text-ivory-light mb-1">
                  {t('personalizeTitle')}
                </p>
                <p className="text-xs text-slate-medium dark:text-cloud-medium leading-relaxed">
                  {t('personalizeDescription')}
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: 'necessary',
                    icon: <Shield className="h-3.5 w-3.5 text-slate-medium dark:text-cloud-medium" />,
                    enabled: true,
                    toggle: false,
                    note: t('necessaryAlways'),
                  },
                  {
                    key: 'marketing',
                    icon: <Globe className="h-3.5 w-3.5 text-slate-medium dark:text-cloud-medium" />,
                    enabled: cookiePreferences.marketing,
                    toggle: true,
                    note: t('thirdPartyExamples'),
                  },
                  {
                    key: 'analytics',
                    icon: <BarChart3 className="h-3.5 w-3.5 text-slate-medium dark:text-cloud-medium" />,
                    enabled: cookiePreferences.analytics,
                    toggle: true,
                    note: t('analyticsExamples'),
                  },
                ].map(({ key, icon, enabled, toggle, note }) => (
                  <div key={key} className="rounded-lg border border-[--color-border-subtle] dark:border-[--color-border-strong] px-3 py-2.5 bg-white/60 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-xs font-medium text-slate-dark dark:text-ivory-light">{t(`${key}`)}</span>
                      </div>
                      {toggle ? (
                        <Slider
                          checked={enabled}
                          onChange={() => handlePreferenceChange(key as 'necessary' | 'functional' | 'analytics' | 'marketing')}
                        />
                      ) : (
                        <span className="text-[10px] text-slate-medium dark:text-cloud-medium">{note}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-medium dark:text-cloud-medium leading-snug">{t(`${key}Description`)}</p>
                    {toggle && <p className="text-[10px] text-slate-medium/70 dark:text-cloud-medium/70 mt-0.5">{note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showSettings ? (
          <div className="border-t border-[--color-border-subtle] dark:border-[--color-border-strong] px-4 py-3 flex gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 rounded-full border border-[--color-border-subtle] dark:border-[--color-border-strong] px-4 py-2 text-xs font-medium tracking-wide text-slate-medium dark:text-cloud-medium transition hover:text-slate-dark dark:hover:text-ivory-light"
            >
              {t('back')}
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 rounded-full bg-slate-dark dark:bg-ivory-light text-white dark:text-slate-dark px-4 py-2 text-xs font-medium tracking-wide transition hover:opacity-80"
            >
              {t('save')}
            </button>
          </div>
        ) : (
          <div className="border-t border-[--color-border-subtle] dark:border-[--color-border-strong] px-4 py-2.5">
            <p className="text-[10px] text-slate-medium dark:text-cloud-medium text-center leading-relaxed">
              {t('footer')}
              <Link href="/legal?tab=privacy" className="transition hover:text-clay" target="_blank" rel="noopener noreferrer">
                {t('privacy')}
              </Link>
              {' '}y{' '}
              <Link href="/legal?tab=cookies" className="transition hover:text-clay" target="_blank" rel="noopener noreferrer">
                {t('cookies')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Cookie Bubble */}
      {showBubble && !showPopup && (
        <div className="fixed bottom-20 right-5 z-30">
          <button
            onClick={openPopup}
            className="flex items-center justify-center rounded-full border border-[--color-border-subtle] dark:border-[--color-border-strong] bg-[#f5f5f7] dark:bg-[#111213] text-slate-medium dark:text-cloud-medium p-2.5 shadow-md transition hover:text-slate-dark dark:hover:text-ivory-light hover:shadow-lg"
            aria-label={t('openCookieSettings')}
          >
            <Cookie className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default CookieConsent;
