import { useEffect } from 'react';

export const usePreloadResources = () => {
  useEffect(() => {
    // Only prefetch below-the-fold technology images when needed
    const prefetchImages = [
      '/static/tools/odoo_logo.webp',
      '/static/tools/whatsapp_logo.webp',
      '/static/tools/chatgpt_logo.webp',
      '/static/tools/gemini_logo.webp',
      '/static/tools/looker_studio_logo.webp',
      '/static/tools/meta_logo.webp',
    ];

    let prefetchTriggered = false;
    let observer: IntersectionObserver | null = null;

    // Use intersection observer for smart prefetching only when user scrolls near technologies section
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefetchTriggered) {
            prefetchTriggered = true;
            
            // Use requestIdleCallback for non-blocking prefetch
            const prefetchFunction = () => {
              prefetchImages.forEach((src) => {
                const existingPrefetch = document.querySelector(`link[rel="prefetch"][href="${src}"]`);
                if (!existingPrefetch) {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = src;
                  link.as = 'image';
                  link.type = 'image/webp';
                  document.head.appendChild(link);
                }
              });
            };

            if ('requestIdleCallback' in window) {
              requestIdleCallback(prefetchFunction, { timeout: 2000 });
            } else {
              setTimeout(prefetchFunction, 300);
            }
            
            observer?.disconnect();
          }
        });
      }, { 
        rootMargin: '200px 0px', // Start prefetching when user is 200px away from technologies section
        threshold: 0.1
      });

      // Wait for DOM to be ready and find the technologies section
      const setupObserver = () => {
        const technologiesSection = document.querySelector('#technologies');
        if (technologiesSection) {
          observer?.observe(technologiesSection);
        }
      };

      setTimeout(setupObserver, 1000);
    }

    // Cleanup function
    return () => {
      observer?.disconnect();
    };
  }, []);
};
