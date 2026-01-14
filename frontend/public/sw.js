const CACHE_NAME = 'ordinaly-cache-v4';
const STATIC_CACHE = 'ordinaly-static-v4';
const DYNAMIC_CACHE = 'ordinaly-dynamic-v4';

const THIRD_PARTY_HOSTS = [
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'connect.facebook.net',
  'js.stripe.com'
];

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.webp',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // ⛔️ Nunca tocar terceros
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    THIRD_PARTY_HOSTS.includes(url.hostname) ||
    url.pathname.endsWith('sw.js')
  ) {
    return;
  }

  // Static assets: cache-first
  if (/\.(png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached =>
          cached ||
          fetch(request).then(response => {
            if (response.ok && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
        )
      )
    );
    return;
  }

  // Default: passthrough total
  event.respondWith(fetch(request));
});
