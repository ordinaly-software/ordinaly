"use client";
import React, { useState } from 'react';
import { MessageCircle, Send, Briefcase, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { getWhatsAppUrl } from "@/utils/whatsapp";

const WhatsAppBubble = () => {
  const t = useTranslations('whatsapp');

  const [showBubble] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleWhatsAppChat = () => {
    const whatsappUrl = getWhatsAppUrl(t('defaultWhatsAppMessage'));
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank');
    closeModal();
  };

  if (!showBubble) return null;

  return (
    <>
      {/* WhatsApp Bubble */}
      <div 
        className={`fixed bottom-6 left-6 z-40 transition-all duration-300`}
      >
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-[#1F8A0D] dark:bg-[#3FBD6F] animate-ping opacity-30"></div>
          
          <button
            onClick={openModal}
            className="group relative rounded-full bg-[#0d6e0c] p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0A4D08] dark:bg-[#3FBD6F] dark:text-[#0B1B17] dark:hover:bg-[#2EA55E]"
            aria-label={t('openLine')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>

          {/* Tooltip */}
          <div className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#1F8A0D]/30 bg-[#0A4D08] px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:border-[#3FBD6F]/35 dark:bg-[#0F2E1E]">
            {t('tooltip')}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0A4D08] dark:border-l-[#0F2E1E]"></div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="max-w-md w-full overflow-hidden rounded-2xl border border-[#1F8A0D]/20 bg-white text-gray-900 shadow-2xl dark:border-[#3FBD6F]/15 dark:bg-[#23272F] dark:text-white"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0d6e0c] to-[#1F8A0D] p-6 text-white dark:from-[#0F2E1E] dark:to-[#3FBD6F]">
              <ModalCloseButton
                onClick={closeModal}
                variant="default"
                size="md"
                className="absolute top-4 right-4 text-white dark:text-white"
              />
              
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-white/18 p-3">
                  <Briefcase className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('title')}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 rounded-lg border border-[#1F8A0D]/20 bg-[#1F8A0D]/8 p-4 dark:border-[#3FBD6F]/18 dark:bg-[#3FBD6F]/10">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 rounded-full bg-[#0d6e0c] p-2 dark:bg-[#3FBD6F]">
                      <MessageCircle className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {t('description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
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
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1F8A0D] dark:bg-[#3FBD6F]"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="whatsapp"
                  onClick={handleWhatsAppChat}
                  className="flex w-full items-center justify-center space-x-2 py-3 shadow-[0_16px_40px_rgba(13,110,12,0.28)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(13,110,12,0.32)] dark:shadow-[0_16px_40px_rgba(63,189,111,0.18)] dark:hover:shadow-[0_20px_48px_rgba(63,189,111,0.24)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{t('requestAssistance')}</span>
                  <ExternalLink size={16} />
                </Button>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppBubble;
