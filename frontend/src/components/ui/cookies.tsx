"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cookie, Settings, Shield, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import Slider from "@/components/ui/slider";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

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
    marketing: false
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let hasConsented = null;
    try {
      hasConsented = localStorage.getItem('cookie-consent');
    } catch {
      // localStorage not available - handle silently
    }
    if (!hasConsented && !showBubble) {
      setShowPopup(true);
      setShowBubble(true);
    }
  }, [showBubble]);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      // Store original values
      const originalStyle = window.getComputedStyle(document.body);
      const originalOverflow = originalStyle.overflow;
      const originalPosition = originalStyle.position;
      
      // Apply scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      document.documentElement.style.overflow = 'hidden';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.documentElement.style.overflow = 'auto';
      };
    }
  }, [showPopup]);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setCookiePreferences(preferences);
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const preferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setCookiePreferences(preferences);
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', 'customized');
    localStorage.setItem('cookie-preferences', JSON.stringify(cookiePreferences));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: 'necessary' | 'functional' | 'analytics' | 'marketing') => {
    if (type === 'necessary') return;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-[95vw] max-w-2xl min-h-[200px] max-h-[85vh] overflow-y-auto border border-border transform transition-all duration-300 scale-100 opacity-100 mx-auto my-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="bg-[#623CEA] rounded-full p-2">
              <Cookie className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
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
        <div className="p-6">
          {!showSettings ? (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground mb-4">
                  {t('description')}
                </p>
                <div className="bg-gradient-to-r from-[#22A60D]/10 to-[#46B1C9]/10 p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{t('whatAre')}</strong>{' '}
                    {t('whatAreDescription')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-[#623CEA] text-white"
                >
                  {t('acceptAll')}
                </Button>
                <Button
                  onClick={handleRejectAll}
                  className="flex-1 bg-secondary text-secondary-foreground border border-border"
                >
                  {t('rejectAll')}
                </Button>
              </div>

              <div className="w-full p-[2px] bg-[#623CEA] rounded-lg">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full bg-card text-card-foreground font-semibold py-3 px-6 rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Settings size={20} />
                  <span>{t('customize')}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
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
                      icon: <Shield className="text-[#22A60D]" size={20} />,
                      enabled: true,
                      toggle: false,
                      note: t('necessaryAlways')
                    },
                    {
                      key: 'functional',
                      icon: <Settings className="text-[#46B1C9]" size={20} />,
                      enabled: cookiePreferences.functional,
                      toggle: true,
                      note: t('functionalExamples')
                    },
                    {
                      key: 'analytics',
                      icon: <BarChart3 className="text-[hsl(var(--color-dark-blue))]" size={20} />,
                      enabled: cookiePreferences.analytics,
                      toggle: true,
                      note: t('analyticsExamples')
                    },
                    {
                      key: 'marketing',
                      icon: <Target className="text-[#E4572E]" size={20} />,
                      enabled: cookiePreferences.marketing,
                      toggle: true,
                      note: t('marketingExamples')
                    }
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
                            onChange={() => handlePreferenceChange(key as 'necessary' | 'functional' | 'analytics' | 'marketing')}
                          />
                        ) : (
                          <div className="bg-[#22A60D] rounded-full w-6 h-6 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{t(`${key}Description`)}</p>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-secondary text-secondary-foreground"
                  >
                    {t('back')}
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-[#623CEA] text-white"
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-muted/30 p-4 rounded-b-2xl border-t border-border">
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
