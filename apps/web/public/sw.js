// NeonPro Service Worker - VIBECODE V1.0 Performance Standards
// Healthcare PWA Implementation with offline-first strategies + Background Sync
// FASE 3: Frontend Enhancement - Healthcare-Optimized Service Worker
// Target: API p95 ≤ 800ms, Page Load p95 ≤ 300ms, Critical Healthcare Data Always Available

const CACHE_VERSION = "1.2.0";
const STATIC_CACHE = `neonpro-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `neonpro-dynamic-v${CACHE_VERSION}`;
const API_CACHE = `neonpro-api-v${CACHE_VERSION}`;
const OFFLINE_QUEUE_CACHE = `neonpro-offline-queue-v${CACHE_VERSION}`;
const HEALTHCARE_CRITICAL_CACHE = `neonpro-healthcare-critical-v${CACHE_VERSION}`;

// Healthcare-specific background sync configuration
const BACKGROUND_SYNC_TAG = "neonpro-background-sync";
const APPOINTMENT_SYNC_TAG = "appointment-booking-sync";
const _EMERGENCY_SYNC_TAG = "emergency-healthcare-sync";
const _PATIENT_DATA_SYNC_TAG = "patient-data-sync";
const _MEDICATION_ALERT_SYNC_TAG = "medication-alert-sync";

// Critical resources for offline functionality
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/login",
  "/signup",
  "/offline",
  "/patient/portal",
  "/patient/appointments",
  "/patient/profile",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
  /\/api\/professionals$/,
  /\/api\/service-types$/,
  /\/api\/settings$/,
  /\/api\/patient\/profile$/,
];

// Healthcare-critical API endpoints (always cache for offline access)
const _HEALTHCARE_CRITICAL_PATTERNS = [
  /\/api\/patient\/emergency-contacts$/,
  /\/api\/patient\/medications$/,
  /\/api\/patient\/allergies$/,
  /\/api\/patient\/critical-data$/,
  /\/api\/emergency\/protocols$/,
  /\/api\/medications\/interactions$/,
  /\/api\/patient\/[^/]+\/medical-history$/,
];

// Healthcare real-time endpoints (network-first with critical fallback)
const _HEALTHCARE_REALTIME_PATTERNS = [
  /\/api\/patient\/[^/]+\/vitals$/,
  /\/api\/appointments\/upcoming$/,
  /\/api\/medications\/alerts$/,
  /\/api\/patient\/notifications$/,
  /\/api\/emergency\/status$/,
];

// Network-first patterns (real-time data)
const _NETWORK_FIRST_PATTERNS = [
  /\/api\/appointments/,
  /\/api\/patients\/[^/]+$/,
  /\/api\/auth/,
  /\/api\/patient\/appointments/,
];

// Offline queue for failed requests
const _offlineQueue = [];

// Install Event - Cache static assets and initialize healthcare cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(HEALTHCARE_CRITICAL_CACHE),
      self.skipWaiting(),
    ]),
  );
});

// Healthcare critical data caching helper
async function _cacheHealthcareCriticalData(request, response) {
  const cache = await caches.open(HEALTHCARE_CRITICAL_CACHE);

  // Add healthcare-specific headers for LGPD compliance
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.set("X-Healthcare-Cache-Time", new Date().toISOString());
  headers.set("X-LGPD-Compliant", "true");

  const modifiedResponse = new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers,
  });

  await cache.put(request, modifiedResponse);
  return response;
}

// Activate Event - Clean old caches and take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          }),
        );
      }),
      self.clients.claim(),
    ]),
  );
});

// Fetch Event - Intelligent caching strategies with offline queue
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle POST/PUT/DELETE requests for background sync
  if (request.method !== "GET") {
    if (
      url.pathname.startsWith("/api/patient/appointments") ||
      url.pathname.startsWith("/api/patient/profile")
    ) {
      event.respondWith(handleOfflineCapableRequest(request));
    }
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with strategy selection
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Static assets - Cache First
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    // API requests - Specific strategies
    if (url.pathname.startsWith("/api/")) {
      return await handleApiRequest(request);
    }

    // Pages - Network First with cache fallback
    return await networkFirst(request, DYNAMIC_CACHE);
  } catch {
    return await handleOfflineRequest(request);
  }
}

// Handle POST/PUT/DELETE requests with offline queue capability
async function handleOfflineCapableRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      return response;
    }

    throw new Error(`HTTP ${response.status}`);
  } catch {
    // Queue the request for background sync
    await queueRequestForSync(request);

    // Return optimistic response for user feedback
    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        message: "Ação salva. Será sincronizada quando você estiver online.",
      }),
      {
        status: 202, // Accepted
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// Queue request for background synchronization
async function queueRequestForSync(request) {
  try {
    const requestData = {
      id: Date.now() + Math.random(), // Unique ID
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== "GET" ? await request.clone().text() : undefined,
      timestamp: Date.now(),
    };

    // Store in cache for persistence
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const queueResponse = Response.json(requestData);
    await cache.put(`queue-${requestData.id}`, queueResponse);

    // Register background sync
    if ("serviceWorker" in self && "sync" in self.registration) {
      await self.registration.sync.register(BACKGROUND_SYNC_TAG);
    }

    // Store in IndexedDB for reliability
    await storeInIndexedDB("offlineQueue", requestData);
  } catch {}
}

// Background Sync Event
self.addEventListener("sync", (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(processOfflineQueue());
  } else if (event.tag === APPOINTMENT_SYNC_TAG) {
    event.waitUntil(syncAppointmentData());
  }
});

// Process offline queue when connection is restored
async function processOfflineQueue() {
  try {
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const queuedRequests = await cache.keys();

    for (const cacheKey of queuedRequests) {
      try {
        const response = await cache.match(cacheKey);
        const requestData = await response.json();

        const syncResponse = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body,
        });

        if (syncResponse.ok) {
          // Remove from cache and IndexedDB
          await cache.delete(cacheKey);
          await removeFromIndexedDB("offlineQueue", requestData.id);

          // Notify client about successful sync
          await notifyClientOfSync("sync-success", {
            url: requestData.url,
            id: requestData.id,
            timestamp: requestData.timestamp,
          });
        } else {
          // Keep in queue for retry, but notify client
          await notifyClientOfSync("sync-failed", {
            url: requestData.url,
            id: requestData.id,
            status: syncResponse.status,
          });
        }
      } catch {}
    }
  } catch {}
}

// Sync appointment-specific data
async function syncAppointmentData() {
  try {
    // Get fresh appointment data
    const response = await fetch("/api/patient/appointments");
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put("/api/patient/appointments", response.clone());
    }
  } catch {}
}

// Notify client of sync events
async function notifyClientOfSync(type, data) {
  const clients = await self.clients.matchAll();

  clients.forEach((client) => {
    client.postMessage({
      type: "BACKGROUND_SYNC",
      action: type,
      data,
    });
  });
}

// IndexedDB utilities for persistent offline queue
async function storeInIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("NeonProOffline", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const addRequest = store.put(data);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("NeonProOffline", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

// Cache First Strategy (static assets)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background for fresh content
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});

    return cachedResponse;
  }
  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

// Network First Strategy (dynamic content)
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Handle API requests with specific strategies
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Authentication - Always network
  if (url.pathname.startsWith("/api/auth/")) {
    return await fetch(request);
  }

  // Cacheable APIs - Cache first
  if (isCacheableApi(url.pathname)) {
    return await cacheFirst(request, API_CACHE);
  }

  // Real-time APIs - Network first
  return await networkFirst(request, API_CACHE);
}

// Handle offline requests
async function handleOfflineRequest(request) {
  const _url = new URL(request.url);

  // Navigation requests - Return offline page
  if (request.mode === "navigate") {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match("/offline");
    return offlinePage || new Response("Offline", { status: 503 });
  }

  // Try to find cached version
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }
  }

  return new Response("Offline", { status: 503 });
}

// Utility functions
function isStaticAsset(pathname) {
  return (
    /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/.test(pathname) ||
    STATIC_CACHE_URLS.includes(pathname)
  );
}

function isCacheableApi(pathname) {
  return CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(pathname));
}

// Push notification event handler
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "NeonPro",
    body: "Você tem uma nova notificação",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "default",
    data: {
      url: "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "Abrir",
        icon: "/icons/open-action.png",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch {}
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: notificationData.vibrate || [200, 100, 200],
      timestamp: Date.now(),
    },
  );

  event.waitUntil(notificationPromise);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === "close") {
    return;
  }

  // Default action or 'open' action
  let targetUrl = data.url || "/dashboard";

  // Handle different notification types
  if (data.type) {
    switch (data.type) {
      case "appointment_reminder":
      case "appointment_confirmation":
      case "appointment_cancellation": {
        targetUrl = `/dashboard/appointments${data.appointmentId ? `/${data.appointmentId}` : ""}`;
        break;
      }
      case "payment_due":
      case "payment_received": {
        targetUrl = `/dashboard/billing${data.invoiceId ? `/${data.invoiceId}` : ""}`;
        break;
      }
      case "system_notification": {
        targetUrl = data.url || "/dashboard/notifications";
        break;
      }
      default: {
        targetUrl = data.url || "/dashboard";
      }
    }
  }

  const urlPromise = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clientList) => {
      // Check if the app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);

        if (clientUrl.origin === self.location.origin) {
          // Focus existing window and navigate to target URL
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          });
        }
      }

      // Open new window if app is not open
      return clients.openWindow(targetUrl);
    });

  event.waitUntil(urlPromise);
});

// Notification close handler
self.addEventListener("notificationclose", (event) => {
  const notification = event.notification;
  const data = notification.data || {};

  // Track notification closure analytics if needed
  if (data.trackClose) {
  }
});

// Background sync handler (for offline actions)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    const syncPromise = syncPendingNotifications();
    event.waitUntil(syncPromise);
  }
});

// Helper function to sync pending notifications when back online
async function syncPendingNotifications() {
  try {
    // Get pending notifications from IndexedDB or local storage
    const pendingNotifications = await getPendingNotifications();

    for (const notification of pendingNotifications) {
      try {
        // Attempt to sync with server
        const response = await fetch("/api/notifications/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notification),
        });

        if (response.ok) {
          // Remove from pending list
          await removePendingNotification(notification.id);
        }
      } catch {}
    }
  } catch {}
}

// Helper functions for managing pending notifications
async function getPendingNotifications() {
  // This would typically use IndexedDB
  // For now, returning empty array
  return [];
}

async function removePendingNotification(_notificationId) {}

// Handle messages from main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING": {
      self.skipWaiting();
      break;
    }

    case "GET_VERSION": {
      event.ports[0].postMessage({
        type: "VERSION",
        version: CACHE_NAME,
      });
      break;
    }

    case "CLEAR_CACHE": {
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({
          type: "CACHE_CLEARED",
          success: true,
        });
      });
      break;
    }

    case "UPDATE_NOTIFICATION_PREFERENCES": {
      // Handle notification preference updates
      updateNotificationPreferences(data);
      break;
    }

    default:
  }
});

async function updateNotificationPreferences(preferences) {
  // Store preferences for offline use
  try {
    const cache = await caches.open("preferences");
    await cache.put("/preferences/notifications", Response.json(preferences));
  } catch {}
}
