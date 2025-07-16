"use client"
import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Shield, Target, BarChart3 } from 'lucide-react';

const CookieConsent = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    let hasConsented = null;
    try {
      hasConsented = localStorage.getItem('cookie-consent');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    if (!hasConsented) {
      setShowBubble(true);
    }
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
    if (type === 'necessary') return; // Necessary cookies can't be disabled
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
    <>
      {/* Cookie Bubble */}
      {showBubble && !showPopup && (
        <div className="fixed bottom-12 left-12 z-50">
          <button
            onClick={openPopup}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 animate-pulse"
          >
            <Cookie size={24} />
          </button>
        </div>
      )}

      {/* Cookie Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-2">
                  <Cookie className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Configuración de Cookies
                </h2>
              </div>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showSettings ? (
                <>
                  {/* Main Content */}
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">
                      Utilizamos cookies para mejorar tu experiencia en nuestro sitio web, 
                      personalizar el contenido y analizar el tráfico. Puedes elegir qué 
                      tipos de cookies aceptar.
                    </p>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>¿Qué son las cookies?</strong> Las cookies son pequeños archivos 
                        de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
                        Nos ayudan a recordar tus preferencias y mejorar tu experiencia.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Aceptar Todas
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Rechazar Todas
                    </button>
                  </div>

                  <div className="w-full p-[2px] bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Personaliza tus preferencias de cookies
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Puedes activar o desactivar diferentes tipos de cookies según tus preferencias.
                      </p>
                    </div>

                    {/* Cookie Categories */}
                    <div className="space-y-4">
                      {/* Necessary Cookies */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Shield className="text-green-500" size={20} />
                            <h4 className="font-semibold text-gray-800">Cookies Necesarias</h4>
                          </div>
                          <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                        </p>
                        <p className="text-xs text-gray-500">
                          Siempre activas
                        </p>
                      </div>

                      {/* Functional Cookies */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Settings className="text-blue-500" size={20} />
                            <h4 className="font-semibold text-gray-800">Cookies Funcionales</h4>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('functional')}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              cookiePreferences.functional ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              cookiePreferences.functional ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Permiten funcionalidades mejoradas y personalización del sitio.
                        </p>
                        <p className="text-xs text-gray-500">
                          Recordar preferencias de idioma, configuraciones de usuario
                        </p>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="text-purple-500" size={20} />
                            <h4 className="font-semibold text-gray-800">Cookies de Análisis</h4>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('analytics')}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              cookiePreferences.analytics ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              cookiePreferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Nos ayudan a entender cómo los usuarios interactúan con el sitio web.
                        </p>
                        <p className="text-xs text-gray-500">
                          Google Analytics, métricas de rendimiento
                        </p>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Target className="text-orange-500" size={20} />
                            <h4 className="font-semibold text-gray-800">Cookies de Marketing</h4>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('marketing')}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              cookiePreferences.marketing ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              cookiePreferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Se utilizan para mostrar anuncios relevantes y medir la efectividad de las campañas.
                        </p>
                        <p className="text-xs text-gray-500">
                          Facebook Pixel, Google Ads, remarketing
                        </p>
                      </div>
                    </div>

                    {/* Settings Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                      >
                        Volver
                      </button>
                      <button
                        onClick={handleSavePreferences}
                        className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                      >
                        Guardar Preferencias
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                Para más información, consulta nuestra{' '}
                <a href="/politica-privacidad" className="text-blue-500 hover:underline">
                  Política de Privacidad
                </a>{' '}
                y{' '}
                <a href="/politica-cookies" className="text-blue-500 hover:underline">
                  Política de Cookies
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;