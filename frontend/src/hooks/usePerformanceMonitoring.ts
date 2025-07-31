import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const metrics: PerformanceMetrics = {};

      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.lcp = entry.startTime;
            break;
          case 'first-input':
            metrics.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.ttfb = navEntry.responseStart - navEntry.fetchStart;
            break;
        }
      });

      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚀 Performance Metrics');
        if (metrics.fcp) console.log(`First Contentful Paint: ${metrics.fcp.toFixed(2)}ms`);
        if (metrics.lcp) console.log(`Largest Contentful Paint: ${metrics.lcp.toFixed(2)}ms`);
        if (metrics.fid) console.log(`First Input Delay: ${metrics.fid.toFixed(2)}ms`);
        if (metrics.cls) console.log(`Cumulative Layout Shift: ${metrics.cls.toFixed(4)}`);
        if (metrics.ttfb) console.log(`Time to First Byte: ${metrics.ttfb.toFixed(2)}ms`);
        console.groupEnd();
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // You can send metrics to your analytics service here
        // Example: analytics.track('performance', metrics);
      }
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (error) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ['paint', 'navigation'] });
    }

    return () => {
      observer.disconnect();
    };
  }, []);
};
