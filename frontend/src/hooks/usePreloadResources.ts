import { useEffect } from 'react';

export const usePreloadResources = () => {
  useEffect(() => {
    // Disabled manual preloading to avoid conflicts with Next.js Image optimizations
    // Next.js Image components with priority prop handle their own preloading
    // Manual preloading was causing "preloaded but not used" warnings
    
    // Only use smart prefetching for below-the-fold content when actually needed
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

    // Use intersection observer for below-the-fold prefetching only
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
                  document.head.appendChild(link);
                }
              });
            };

            if ('requestIdleCallback' in window) {
              requestIdleCallback(prefetchFunction, { timeout: 3000 });
            } else {
              setTimeout(prefetchFunction, 500);
            }
            
            observer?.disconnect();
          }
        });
      }, { 
        rootMargin: '150px 0px', // Conservative margin
        threshold: 0.1
      });

      // Wait for DOM to be ready and sections to be rendered
      setTimeout(() => {
        const sectionsToObserve = document.querySelectorAll('#technologies');
        sectionsToObserve.forEach(section => observer?.observe(section));
      }, 1500);
    }

    // Cleanup function
    return () => {
      observer?.disconnect();
    };
  }, []);
};
