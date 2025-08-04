'use client';

import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Optimize long tasks by yielding to the main thread
    const scheduler = (fn: () => void) => {
      if ('scheduler' in window && 'postTask' in (window as typeof window & { scheduler: { postTask: (fn: () => void, options: { priority: string }) => void } }).scheduler) {
        (window as typeof window & { scheduler: { postTask: (fn: () => void, options: { priority: string }) => void } }).scheduler.postTask(fn, { priority: 'background' });
      } else if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 5000 });
      } else {
        setTimeout(fn, 0);
      }
    };

    // Defer non-critical JavaScript execution
    scheduler(() => {
      // Optimize images that are not in viewport
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach((img) => {
        if (!img.hasAttribute('data-optimized')) {
          img.setAttribute('data-optimized', 'true');
          // Additional image optimizations can go here
        }
      });
    });

    // Optimize third-party scripts
    scheduler(() => {
      // Mark third-party resources for defer loading
      const thirdPartyElements = document.querySelectorAll('script[src*="googleapis.com"], script[src*="gstatic.com"]');
      thirdPartyElements.forEach((element) => {
        if (!element.hasAttribute('data-deferred')) {
          element.setAttribute('data-deferred', 'true');
        }
      });
    });

    // Cleanup heavy event listeners on unmount
    return () => {
      // Cleanup any performance monitoring observers if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;
