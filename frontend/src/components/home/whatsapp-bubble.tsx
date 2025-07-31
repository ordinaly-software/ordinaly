"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

const WhatsAppBubble = () => {
  const t = useTranslations('whatsapp');

  const [showBubble] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasCookieConsent, setHasCookieConsent] = useState(true);

  // Check if cookie consent exists to adjust bubble position
  useEffect(() => {
    const checkConsent = () => {
      let hasConsented = null;
      try {
        hasConsented = localStorage.getItem('cookie-consent');
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      setHasCookieConsent(!!hasConsented);
    };
  
    checkConsent();
    window.addEventListener('storage', checkConsent);

    return () => {
      window.removeEventListener('storage', checkConsent);
    };
  }, []);


  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleWhatsAppChat = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
    const message = encodeURIComponent(t('defaultWhatsAppMessage'));
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    closeModal();
  };

  if (!showBubble) return null;

  return (
    <>
      {/* WhatsApp Bubble */}
      <div 
        className={`fixed ${hasCookieConsent ? 'bottom-24' : 'bottom-36'} left-6 z-40 transition-all duration-300`}
      >
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-[#29BF12] rounded-full animate-ping opacity-30"></div>
          
          <button
            onClick={openModal}
            className="relative bg-[#29BF12] hover:bg-[#20c55a] text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
            aria-label={t('openChat')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {t('tooltip')}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-gray-900 dark:border-l-gray-100 border-y-4 border-y-transparent"></div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-[#29BF12] text-white p-6 relative">
              <ModalCloseButton
                onClick={closeModal}
                variant="default"
                size="md"
                className="absolute top-4 right-4"
              />
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-3">
                  <Bot className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {t('title')}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-[#29BF12]/10 to-[#20c55a]/10 p-4 rounded-lg border border-border mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#29BF12] rounded-full p-2 flex-shrink-0">
                      <MessageCircle className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <Send size={16} />
                    <span>{t('canHelpWith')}</span>
                  </h3>
                  
                  <ul className="space-y-2">
                    {[
                      t('help1'),
                      t('help2'),
                      t('help3'),
                      t('help4'),
                      t('help5')
                    ].map((item, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-[#29BF12] rounded-full flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleWhatsAppChat}
                  className="w-full bg-[#29BF12] hover:bg-[#20c55a] text-white py-3 flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{t('startChat')}</span>
                  <ExternalLink size={16} />
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {t('responseTime')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted/30 p-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-[#29BF12] rounded-full animate-pulse"></div>
                <span>{t('status')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppBubble;