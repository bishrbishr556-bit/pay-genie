// Enhanced service worker for PWA with offline support
const CACHE_NAME = "gpay-clone-v2";
const RUNTIME_CACHE = "gpay-runtime-v2";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/soundbox",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== "GET") return;
  
  // Skip chrome extensions and other protocols
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response for runtime
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                console.log('[SW] Caching runtime asset:', request.url);
                cache.put(request, responseToCache);
              })
              .catch((error) => {
                console.error('[SW] Runtime cache failed:', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // Return offline page or cached response
            return caches.match(request);
          });
      })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('GPay Demo', options)
  );
});

console.log('[SW] Service worker loaded');