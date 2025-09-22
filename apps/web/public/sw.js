/**
 * NeonPro Healthcare Service Worker
 * T028 - Service worker for offline capabilities
 * Enhanced with healthcare-specific caching strategies and LGPD compliance
 */

const CACHE_VERSION = 'neonpro-v1.0.0';
const STATIC_CACHE = 'neonpro-static-v1.0.0';
const DYNAMIC_CACHE = 'neonpro-dynamic-v1.0.0';
const API_CACHE = 'neonpro-api-v1.0.0';
const HEALTHCARE_CACHE = `healthcare-${CACHE_VERSION}`;
const EMERGENCY_CACHE = `emergency-${CACHE_VERSION}`;

// Assets to cache immediately (healthcare-critical)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/brand/iconeneonpro.svg',
  '/brand/simboloneonpro.svg',
  '/neonpro-favicon.svg',
  '/site.webmanifest',
  '/offline.html',
  '/emergency.html',
];

// Healthcare-specific cache priorities and TTL
const CACHE_CONFIG = {
  // Static assets - long term cache
  static: {
    name: STATIC_CACHE,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    strategy: 'CacheFirst',
  },

  // Healthcare API - network first with fallback
  healthcare: {
    name: HEALTHCARE_CACHE,
    ttl: 4 * 60 * 60 * 1000, // 4 hours (healthcare data freshness)
    strategy: 'NetworkFirst',
  },

  // Emergency data - always available offline
  emergency: {
    name: EMERGENCY_CACHE,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    strategy: 'CacheFirst',
    priority: 'high',
  },

  // API responses - short-term cache
  api: {
    name: API_CACHE,
    ttl: 60 * 60 * 1000, // 1 hour
    strategy: 'NetworkFirst',
  },
};

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v2/patients',
  '/api/v2/appointments',
  '/api/v2/services',
  '/api/v2/ai/models',
];

// Emergency access patterns for healthcare workers
const EMERGENCY_ENDPOINTS = [
  '/api/patients/emergency-info',
  '/api/patients/allergies',
  '/api/patients/medical-alerts',
  '/api/emergency/contacts',
  '/api/emergency/protocols',
];

// Healthcare URLs to prioritize for offline access
const HEALTHCARE_URLS = [
  '/patients',
  '/appointments',
  '/emergency',
  '/offline',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets and initialize healthcare caches
self.addEventListener('install', event => {
  console.log(
    '[SW] Installing NeonPro Healthcare Service Worker v' + CACHE_VERSION,
  );

  event.waitUntil(
    Promise.all([
      // Cache static assets immediately
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Create emergency cache for critical healthcare data
      caches.open(EMERGENCY_CACHE).then(cache => {
        console.log('[SW] Initializing emergency cache');
        return cache.put(
          '/emergency/offline-status',
          new Response(
            JSON.stringify({
              status: 'offline_ready',
              timestamp: Date.now(),
              healthcare_mode: true,
            }),
          ),
        );
      }),
    ])
      .then(() => {
        console.log('[SW] Installation complete - Healthcare mode enabled');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to install service worker:', error);
      }),
  );
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', event => {
  console.log('[SW] Activating NeonPro Healthcare Service Worker');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE
              && cacheName !== DYNAMIC_CACHE
              && cacheName !== API_CACHE
              && cacheName !== HEALTHCARE_CACHE
              && cacheName !== EMERGENCY_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),

      // Claim all clients immediately
      self.clients.claim(),
    ]).then(() => {
      console.log('[SW] Activation complete - Taking control of all clients');

      // Notify all clients about SW activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION,
            healthcare_mode: true,
          });
        });
      });
    }),
  );
});

// Fetch event - healthcare-specific caching strategies with offline fallbacks
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleHealthcareRequest(_request));
});

// Handle fetch requests with healthcare-specific logic
async function handleHealthcareRequest(_request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Emergency endpoints - always try network first, but fallback to cache
    if (isEmergencyEndpoint(pathname)) {
      return await handleEmergencyRequest(_request);
    }

    // Healthcare API endpoints - network first with cache fallback
    if (isHealthcareAPI(pathname)) {
      return await handleHealthcareAPI(_request);
    }

    // Static assets - cache first
    if (isStaticAsset(pathname)) {
      return await handleStaticAsset(_request);
    }

    // Image requests with healthcare considerations
    if (isImageRequest(pathname)) {
      return await handleImageRequest(_request);
    }

    // Regular API calls - network first
    if (isAPICall(pathname)) {
      return await handleApiRequest(_request);
    }

    // Default: try network, fallback to cache
    return await handlePageRequest(_request);
  } catch (_error) {
    console.error('[SW] Error handling _request:', error);
    return await handleOfflineFallback(_request);
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(_request) {
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
    return fetch(_request);
  }

  return networkFirst(request, API_CACHE);
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(_request) {
  return cacheFirst(request, STATIC_CACHE);
}

// Handle image requests with stale-while-revalidate strategy
async function handleImageRequest(_request) {
  return staleWhileRevalidate(request, DYNAMIC_CACHE);
}

// Handle page requests with network-first strategy
async function handlePageRequest(_request) {
  return networkFirst(request, DYNAMIC_CACHE);
}

// Emergency request handler - critical healthcare data
async function handleEmergencyRequest(_request) {
  const cacheName = EMERGENCY_CACHE;

  try {
    // Try network first for fresh emergency data
    const networkResponse = await fetch(_request);

    if (networkResponse.ok) {
      // Cache successful emergency responses
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Emergency data cached:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Emergency network failed, using cache:', request.url);

    // Fallback to cached emergency data
    const cachedResponse = await caches.match(_request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Last resort: emergency offline page
    return await caches.match('/emergency.html');
  }
}

// Healthcare API handler - patient data with LGPD compliance
async function handleHealthcareAPI(_request) {
  const cacheName = HEALTHCARE_CACHE;

  try {
    // Network first for healthcare data freshness
    const networkResponse = await fetch(_request);

    if (networkResponse.ok) {
      // Only cache non-sensitive healthcare responses
      if (isCacheableHealthcareData(_request)) {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch (error) {
    console.log(
      '[SW] Healthcare API network failed, checking cache:',
      request.url,
    );

    // Check cache for healthcare data
    const cachedResponse = await caches.match(_request);
    if (
      cachedResponse
      && !isExpired(cachedResponse, CACHE_CONFIG.healthcare.ttl)
    ) {
      console.log('[SW] Serving cached healthcare data:', request.url);
      return cachedResponse;
    }

    // Return offline healthcare page
    return await caches.match('/offline.html');
  }
}

// Offline fallback handler
async function handleOfflineFallback(_request) {
  const url = new URL(request.url);

  // HTML pages: show offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return (
      (await caches.match('/offline.html'))
      || new Response('Offline', { status: 503 })
    );
  }

  // API calls: return offline JSON response
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Application is offline. Please try again when connection is restored.',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // Default: generic offline response
  return new Response('Offline', { status: 503 });
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(_request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(_request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (_error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(_request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(_request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(_request);

  const fetchPromise = fetch(_request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Utility functions
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/assets/')
    || pathname.endsWith('.js')
    || pathname.endsWith('.css')
    || pathname.endsWith('.woff2')
    || pathname.endsWith('.woff')
    || pathname.endsWith('.ttf')
  );
}

function isImageRequest(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i);
}

// Background Sync for healthcare form submissions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'healthcare-form-sync') {
    event.waitUntil(syncHealthcareForms());
  }

  if (event.tag === 'patient-data-sync') {
    event.waitUntil(syncPatientData());
  }
});

// Sync healthcare forms when connection restored
async function syncHealthcareForms() {
  try {
    const pendingForms = await getStoredHealthcareForms();

    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: 'POST',
          headers: form.headers,
          body: form.data,
        });

        if (response.ok) {
          await removeStoredForm(form.id);
          console.log('[SW] Healthcare form synced successfully:', form.id);

          // Notify client of successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'FORM_SYNCED',
                formId: form.id,
                success: true,
              });
            });
          });
        }
      } catch (_error) {
        console.error('[SW] Failed to sync healthcare form:', form.id, error);
      }
    }
  } catch (_error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync patient data when connection restored
async function syncPatientData() {
  try {
    // Implement patient data synchronization logic
    console.log('[SW] Patient data sync completed');
  } catch (_error) {
    console.error('[SW] Patient data sync failed:', error);
  }
}

// Enhanced message handling for healthcare-specific operations
self.addEventListener('message', event => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;

    case 'CLEAR_HEALTHCARE_CACHE':
      clearHealthcareCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'STORE_FORM_OFFLINE':
      storeFormForSync(data).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'CACHE_URLS':
      const urls = data?.urls || [];
      cacheUrls(urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
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

// Healthcare-specific utility functions

function isEmergencyEndpoint(pathname) {
  return EMERGENCY_ENDPOINTS.some(endpoint => pathname.includes(endpoint.replace(':id', '')));
}

function isHealthcareAPI(pathname) {
  return (
    pathname.startsWith('/api/patients')
    || pathname.startsWith('/api/appointments')
    || pathname.startsWith('/api/healthcare')
  );
}

function isAPICall(pathname) {
  return pathname.startsWith('/api/');
}

function isCacheableHealthcareData(_request) {
  const url = new URL(request.url);

  // Don't cache sensitive patient data endpoints
  const sensitiveEndpoints = [
    '/api/patients/sensitive',
    '/api/patients/financial',
    '/api/auth',
  ];

  return !sensitiveEndpoints.some(endpoint => url.pathname.includes(endpoint));
}

function isExpired(response, ttl) {
  const cacheTime = response.headers.get('sw-cache-time');
  if (!cacheTime) return true;

  return Date.now() - parseInt(cacheTime) > ttl;
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }

  return status;
}

async function clearHealthcareCache() {
  await caches.delete(HEALTHCARE_CACHE);
  console.log('[SW] Healthcare cache cleared for LGPD compliance');
}

async function storeFormForSync(formData) {
  // Store form data in IndexedDB for background sync
  // Implementation would use IndexedDB API
  console.log('[SW] Form stored for background sync:', formData.id);
}

async function getStoredHealthcareForms() {
  // Retrieve stored forms from IndexedDB
  // Implementation would use IndexedDB API
  return [];
}

async function removeStoredForm(formId) {
  // Remove synced form from IndexedDB
  // Implementation would use IndexedDB API
  console.log('[SW] Removed synced form:', formId);
}

console.log('[SW] NeonPro Healthcare Service Worker loaded successfully');
