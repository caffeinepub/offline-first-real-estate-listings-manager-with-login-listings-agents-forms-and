const CACHE_VERSION = 'v4';
const CACHE_NAME = `real-estate-${CACHE_VERSION}`;

// Core app shell files to precache
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/app-logo.dim_512x512.png',
  '/assets/generated/app-icon.dim_192x192.png',
  '/assets/generated/app-icon.dim_512x512.png'
];

// Install event - precache core app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Precaching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for same-origin assets, network-first for API calls
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except fonts)
  if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache same-origin static assets (JS, CSS, images, fonts)
            if (url.origin === location.origin) {
              const isStaticAsset = 
                request.url.includes('/assets/') ||
                request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/);

              if (isStaticAsset) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
            }

            return response;
          })
          .catch(() => {
            // If network fails and we're requesting a navigation (HTML page),
            // return the cached index.html for SPA routing
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // For other failed requests, return a basic offline response
            return new Response('Offline - content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
