const CACHE_NAME = 'ordinaly-cache-v3';
const STATIC_CACHE = 'ordinaly-static-v3';
const DYNAMIC_CACHE = 'ordinaly-dynamic-v3';

// Reduced initial cache to only critical resources
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.webp',
];

// Lazy load static assets - only cache when accessed
const staticAssets = [
  '/static/girl_resting_transparent.webp',
  '/static/hand_shake_transparent.webp',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
];

// Install event - cache only critical resources immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Use addAll for critical resources only
      return cache.addAll(urlsToCache);
    }).catch(error => {
      // Graceful fallback if caching fails
      console.warn('SW install failed:', error);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches efficiently
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch(error => {
      console.warn('SW activation failed:', error);
    })
  );
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - optimized stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests, non-GET requests, and chrome-extension
  if (!url.hostname.includes(self.location.hostname) || 
      request.method !== 'GET' || 
      url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip service worker requests to avoid recursive loops
  if (url.pathname.includes('sw.js')) {
    return;
  }

  // COMPLETELY SKIP navigation requests to avoid Safari redirection issues
  if (request.mode === 'navigate') {
    return;
  }

  // Handle static assets with cache-first strategy (better for images)
  if (url.pathname.startsWith('/static/') || 
      url.pathname.includes('.webp') || 
      url.pathname.includes('.png') || 
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.jpeg') ||
      url.pathname.includes('.svg') ||
      url.pathname.includes('.ico')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then(response => {
            // Only cache successful responses
            if (response.status === 200 && response.type === 'basic') {
              // Clone before caching to avoid consuming the response stream
              const responseClone = response.clone();
              cache.put(request, responseClone).catch(() => {
                // Ignore cache errors to prevent blocking
              });
            }
            return response;
          }).catch(() => {
            // Return a fallback for failed image requests
            return new Response('', { 
              status: 404, 
              statusText: 'Image not found' 
            });
          });
        });
      })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.pathname.includes('api')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone).catch(() => {
                // Ignore cache errors
              });
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response('', { 
              status: 404, 
              statusText: 'API not available offline' 
            });
          });
        })
    );
    return;
  }

    // For all other requests, just try network with cache fallback
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});
