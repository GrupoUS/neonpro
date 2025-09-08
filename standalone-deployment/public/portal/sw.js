// ===============================================
// Patient Portal Service Worker
// Story 4.3: Patient Portal & Self-Service
// ===============================================

const CACHE_NAME = "neonpro-portal-v1.0";
const OFFLINE_URL = "/portal/offline";

// Resources to cache on install
const STATIC_RESOURCES = [
  "/portal/",
  "/portal/login",
  "/portal/offline",
  "/portal/manifest.json",
  "/portal/icons/icon-192x192.png",
  "/portal/icons/icon-512x512.png",
  // Core CSS and JS will be added automatically by Next.js
];

// API routes that should be cached
const API_CACHE_PATTERNS = [
  "/api/portal/auth/validate",
  "/api/portal/dashboard/stats",
  "/api/portal/notifications",
];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        // Force the new service worker to activate immediately
        return self.skipWaiting();
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          }),
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests for our domain
  if (url.origin !== location.origin) {
    return;
  }

  // Handle portal routes
  if (url.pathname.startsWith("/portal/")) {
    event.respondWith(handlePortalRequest(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/portal/")) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
});

// Handle portal page requests
async function handlePortalRequest(request) {
  try {
    // Try network first for HTML pages
    if (request.mode === "navigate") {
      const networkResponse = await fetch(request);

      // Cache successful responses
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    }

    // For other resources, try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a navigation request and we can't serve it, show offline page
    if (request.mode === "navigate") {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Return a basic offline response
    return new Response("Offline - Portal não disponível", {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

// Handle API requests with caching strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cacheKey = `api-${url.pathname}`;

  try {
    // For GET requests to cacheable endpoints
    if (request.method === "GET" && shouldCacheAPI(url.pathname)) {
      // Try cache first for faster response
      const cachedResponse = await caches.match(cacheKey);

      // Always fetch from network for fresh data
      const networkPromise = fetch(request).then((response) => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(cacheKey, response.clone()));
        }
        return response;
      });

      // Return cached response immediately if available, otherwise wait for network
      if (cachedResponse) {
        // Update cache in background
        networkPromise.catch(() => {}); // Ignore network errors when we have cache;
        return cachedResponse;
      }
      return networkPromise;
    }

    // For POST/PUT/DELETE requests, always go to network
    return fetch(request);
  } catch {
    // For GET requests, try to serve from cache
    if (request.method === "GET") {
      const cachedResponse = await caches.match(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return offline error response
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "OFFLINE_ERROR",
          message: "Sem conexão com o servidor",
        },
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// Check if API endpoint should be cached
function shouldCacheAPI(pathname) {
  return API_CACHE_PATTERNS.some((pattern) => pathname.includes(pattern));
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "portal-sync") {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    // In a real implementation, this would:
    // 1. Get offline actions from IndexedDB
    // 2. Send them to the server
    // 3. Remove successful actions from storage
    // 4. Notify the client about sync status

    // For now, just send a message to all clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      const targetOrigin = new URL(client.url).origin;
      client.postMessage(
        {
          type: "SYNC_COMPLETE",
          data: { success: true },
        },
        targetOrigin,
      );
    });
  } catch (error) {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage(
        {
          type: "SYNC_FAILED",
          data: { error: error.message },
        },
        client.location?.origin || self.location.origin,
      );
    });
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || "Nova notificação do portal",
      icon: "/portal/icons/icon-192x192.png",
      badge: "/portal/icons/icon-72x72.png",
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || "portal-notification",
      requireInteraction: data.requireInteraction,
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "Portal NeonPro",
        options,
      ),
    );
  } catch {}
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = "/portal/";

  // Handle different notification types
  if (data.type === "appointment") {
    targetUrl = "/portal/appointments";
  } else if (data.type === "message") {
    targetUrl = "/portal/messages";
  } else if (data.url) {
    targetUrl = data.url;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if portal is already open
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname.startsWith("/portal/") && "focus" in client) {
            client.focus();
            client.postMessage(
              {
                type: "NOTIFICATION_CLICK",
                data: { url: targetUrl },
              },
              new URL(client.url).origin,
            );
            return;
          }
        }

        // Open new window if portal not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

// Message handling from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
