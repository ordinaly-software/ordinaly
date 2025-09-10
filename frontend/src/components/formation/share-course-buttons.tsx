"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  title: string;
  subtitle?: string;
  slug?: string;
  theme?: 'default' | 'white';
}

const encode = (s?: string) => encodeURIComponent(s || "");

const WhatsAppIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="50" height="50" viewBox="0 0 55 55" className={className}>
    <path d="M40,0H10C4.486,0,0,4.486,0,10v30c0,5.514,4.486,10,10,10h30c5.514,0,10-4.486,10-10V10C50,4.486,45.514,0,40,0z M39,17h-3 c-2.145,0-3,0.504-3,2v3h6l-1,6h-5v20h-7V28h-3v-6h3v-3c0-4.677,1.581-8,7-8c2.902,0,6,1,6,1V17z"></path>
  </svg>
);

const LinkedInIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 25 25" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export const ShareCourseButtons: React.FC<Props> = ({ title, subtitle, slug, theme = 'default' }) => {
  const t = useTranslations("formation.courseDetails.share");
  const locale = useLocale() || 'es';
  const siteTag = "@OrdinalySoftware";

  // Use locale JSON translations (key: formation.courseDetails.share.shareMessage)
  // fallback to English phrase if missing in messages
  const textBase = t('shareMessage', {
    title,
    subtitle: subtitle || '',
    siteTag,
    default: `Join the new training from ${siteTag}: "${title}"${subtitle ? ' - ' + subtitle : ''}`,
  });

  let pageUrl = '';
  if (typeof window !== 'undefined') {
    const cleanSlug = slug ? slug.replace(/^\/+/, '') : '';
    if (cleanSlug) {
      // build canonical url: /[locale]/formation/[slug]
      const localePart = locale ? locale : 'es';
      pageUrl = `${window.location.origin}/${localePart}/formation/${cleanSlug}`;
    } else {
      pageUrl = window.location.href;
    }
  }

  const whatsappShare = () => {
    const message = `${textBase} ${pageUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  };

  const openShareUrl = (url: string) => {
    // Try window.open with recommended features first
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) return newWindow;

    // Fallback: create an anchor and click it (more reliable when popups are blocked)
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // last resort: navigate current window
      window.location.href = url;
    }
    return null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        // You can add a toast notification here if desired
        console.log('Message copied to clipboard');
      }
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        console.log('Message copied to clipboard (fallback)');
      } catch {
        console.log('Failed to copy to clipboard');
      }
    }
  };

  const facebookShare = () => {
    // Facebook doesn't support pre-filled text anymore due to policy changes
    // We'll copy the message to clipboard and open the share dialog
    const message = `${textBase} ${pageUrl}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encode(pageUrl)}`;
    
    // Copy message to clipboard first
    copyToClipboard(message);
    
    // Then open Facebook share dialog
    openShareUrl(url);
  };

  const linkedinShare = () => {
    const message = `${textBase} ${pageUrl}`;
    
    // Copy the full message to clipboard and show alert
    copyToClipboard(message);

    // Use the most reliable LinkedIn sharing method
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encode(pageUrl)}`;
    
    // Open LinkedIn sharing in new window
    const newWindow = window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      // If popup was blocked, try different approach
      try {
        const a = document.createElement('a');
        a.href = linkedinUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      } catch {
        window.location.href = linkedinUrl;
      }
    }
  };

  const isWhite = theme === 'white';

  const labelClass = isWhite ? 'text-sm font-medium text-white' : 'text-sm font-medium text-gray-700 dark:text-gray-200';

  // Inline styles guarantee precedence over Button component styles
  const commonWhiteStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    transition: 'background-color 150ms ease, color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
  };

  const waStyle = isWhite ? { ...commonWhiteStyle, color: '#25D366' } : undefined;
  const fbStyle = isWhite ? { ...commonWhiteStyle, color: '#1877F2' } : undefined;
  const liStyle = isWhite ? { ...commonWhiteStyle, color: '#0A66C2' } : undefined;

  const baseButtonClass = 'p-3 rounded-md';
  // When not using the white theme, force colored icons in light mode and white icons in dark mode
  const waClass = isWhite ? baseButtonClass : `${baseButtonClass} text-[#25D366] dark:text-white`;
  const fbClass = isWhite ? baseButtonClass : `${baseButtonClass} text-[#1877F2] dark:text-white`;
  const liClass = isWhite ? baseButtonClass : `${baseButtonClass} text-[#0A66C2] dark:text-white`;

  return (
    <div className="flex items-center gap-2">
      <span className={labelClass}>{t('label', { default: 'Share' })}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={whatsappShare}
          aria-label={t('whatsapp', { default: 'WhatsApp' })}
          className={waClass}
          style={waStyle}
        >
          <WhatsAppIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={facebookShare}
          aria-label={t('facebook', { default: 'Facebook' })}
          className={fbClass}
          style={fbStyle}
        >
          <FacebookIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={linkedinShare}
          aria-label={t('linkedin', { default: 'LinkedIn' })}
          className={liClass}
          style={liStyle}
        >
          <LinkedInIcon />
        </Button>
      </div>
    </div>
  );
};

export default ShareCourseButtons;