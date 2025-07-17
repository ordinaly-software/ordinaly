"use client"
import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Slider from "@/components/ui/slider";


const CookieConsent = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkMode);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Check if user has already made a cookie choice
    let hasConsented = null;
    try {
      hasConsented = localStorage.getItem('cookie-consent');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    if (!hasConsented) {
      setShowBubble(true);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleAcceptAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    });
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    }));
    setShowBubble(false);
    setShowPopup(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    });
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    }));
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

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowSettings(false);
  };

  if (!showBubble && !showPopup) return null;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* Cookie Bubble */}
      {showBubble && !showPopup && (
        <div className="fixed bottom-16 left-6 z-50">
          <button
            onClick={openPopup}
            className="bg-[#623CEA] hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <Cookie size={20} />
          </button>
        </div>
      )}

      {/* Cookie Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="bg-[#623CEA] rounded-full p-2">
                  <Cookie className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Configuración de Cookies
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={closePopup}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showSettings ? (
                <>
                  {/* Main Content */}
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-4">
                      Utilizamos cookies para mejorar tu experiencia en nuestro sitio web, 
                      personalizar el contenido y analizar el tráfico. Puedes elegir qué 
                      tipos de cookies aceptar.
                    </p>
                    <div className="bg-gradient-to-r from-[#32E875]/10 to-[#46B1C9]/10 p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">¿Qué son las cookies?</strong> Las cookies son pequeños archivos 
                        de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
                        Nos ayudan a recordar tus preferencias y mejorar tu experiencia.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-[#623CEA] hover:from-[#32E875]/90 hover:to-[#46B1C9]/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Aceptar Todas
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-border"
                    >
                      Rechazar Todas
                    </Button>
                  </div>

                  <div className="w-full p-[2px] bg-[#623CEA] rounded-lg">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full bg-card text-card-foreground font-semibold py-3 px-6 rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Settings size={20} />
                      <span>Personalizar Configuración</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Settings Content */}
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Personaliza tus preferencias de cookies
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Puedes activar o desactivar diferentes tipos de cookies según tus preferencias.
                      </p>
                    </div>

                    {/* Cookie Categories */}
                    <div className="space-y-4">
                      {/* Necessary Cookies */}
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Shield className="text-[#32E875]" size={20} />
                            <h4 className="font-semibold text-foreground">Cookies Necesarias</h4>
                          </div>
                          <div className="bg-[#32E875] rounded-full w-6 h-6 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Siempre activas
                        </p>
                      </div>

                      {/* Functional Cookies */}
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Settings className="text-[#46B1C9]" size={20} />
                            <h4 className="font-semibold text-foreground">Cookies Funcionales</h4>
                          </div>
                          <div className="h-6 flex items-center shrink-0">
                            <Slider
                              checked={cookiePreferences.functional}
                              onChange={() => handlePreferenceChange('functional')}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Permiten funcionalidades mejoradas y personalización del sitio.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recordar preferencias de idioma, configuraciones de usuario
                        </p>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="text-[hsl(var(--color-dark-blue))]" size={20} />
                            <h4 className="font-semibold text-foreground">Cookies de Análisis</h4>
                          </div>
                          <div className="h-6 flex items-center shrink-0">
                            <Slider
                              checked={cookiePreferences.analytics}
                              onChange={() => handlePreferenceChange('analytics')}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Nos ayudan a entender cómo los usuarios interactúan con el sitio web.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Google Analytics, métricas de rendimiento
                        </p>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Target className="text-[#E4572E]" size={20} />
                            <h4 className="font-semibold text-foreground">Cookies de Marketing</h4>
                          </div>
                          <div className="h-6 flex items-center shrink-0">
                            <Slider
                              checked={cookiePreferences.marketing}
                              onChange={() => handlePreferenceChange('marketing')}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Permiten mostrar anuncios más relevantes basados en tus intereses.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Publicidad personalizada, seguimiento de campañas
                        </p>
                      </div>
                    </div>

                    {/* Settings Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-border"
                      >
                        Volver
                      </Button>
                      <Button
                        onClick={handleSavePreferences}
                        className="flex-1 bg-gradient-to-r from-[#32E875] to-[#46B1C9] hover:from-[#32E875]/90 hover:to-[#46B1C9]/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Guardar Preferencias
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-muted/30 p-4 rounded-b-2xl border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Para más información, consulta nuestra{' '}
                <Link href="/politica-privacidad" className="text-[#46B1C9] hover:underline transition-colors">
                  Política de Privacidad
                </Link>{' '}
                y{' '}
                <Link href="/politica-cookies" className="text-[#46B1C9] hover:underline transition-colors">
                  Política de Cookies
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;