/**
 * Service Worker for Performance Optimization
 * T078 - Frontend Performance Optimization
 */

const CACHE_NAME = 'neonpro-v1.0.0';
const STATIC_CACHE = 'neonpro-static-v1.0.0';
const DYNAMIC_CACHE = 'neonpro-dynamic-v1.0.0';
const API_CACHE = 'neonpro-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/brand/iconeneonpro.svg',
  '/brand/simboloneonpro.svg',
  '/neonpro-favicon.svg',
  '/site.webmanifest',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v2/patients',
  '/api/v2/appointments',
  '/api/v2/services',
  '/api/v2/ai/models',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE
              && cacheName !== DYNAMIC_CACHE
              && cacheName !== API_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      }),
  );
});

// Fetch event - handle requests with appropriate cache strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImageRequest(url.pathname)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Use network-first for critical API endpoints
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    return networkFirst(request, API_CACHE);
  }

  // Use network-only for mutations and real-time data
  if (
    request.method !== 'GET'
    || url.pathname.includes('/realtime')
    || url.pathname.includes('/websocket')
  ) {
    return fetch(request);
  }

  return networkFirst(request, API_CACHE);
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  return cacheFirst(request, STATIC_CACHE);
}

// Handle image requests with stale-while-revalidate strategy
async function handleImageRequest(request) {
  return staleWhileRevalidate(request, DYNAMIC_CACHE);
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  return networkFirst(request, DYNAMIC_CACHE);
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Utility functions
function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/')
    || pathname.endsWith('.js')
    || pathname.endsWith('.css')
    || pathname.endsWith('.woff2')
    || pathname.endsWith('.woff')
    || pathname.endsWith('.ttf');
}

function isImageRequest(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i);
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    cacheUrls(urls).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
  console.log('[SW] URLs cached:', urls);
}
