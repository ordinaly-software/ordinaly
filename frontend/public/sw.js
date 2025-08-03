const CACHE_NAME = 'ordinaly-cache-v2';
const STATIC_CACHE = 'ordinaly-static-v2';
const DYNAMIC_CACHE = 'ordinaly-dynamic-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.webp',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
];

const staticAssets = [
  '/static/girl_resting_transparent.webp',
  '/static/hand_shake_transparent.webp',
  '/static/tools/odoo_logo.webp',
  '/static/tools/whatsapp_logo.webp',
  '/static/tools/chatgpt_logo.webp',
  '/static/tools/gemini_logo.webp',
  '/static/tools/looker_studio_logo.webp',
  '/static/tools/meta_logo.webp'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
      caches.open(STATIC_CACHE).then(cache => cache.addAll(staticAssets))
    ])
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
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
    })
  );
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Handle static assets with cache-first strategy
  if (url.pathname.startsWith('/static/') || url.pathname.includes('.webp') || url.pathname.includes('.png') || url.pathname.includes('.jpg')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then(response => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
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
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Stale-while-revalidate for other resources
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});