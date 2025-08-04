'use client';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker registered with scope:', registration.scope);
          }
        })
        .catch((error) => {
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.error('Service Worker registration failed:', error);
          }
        });
    });
  }
}