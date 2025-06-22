const CACHE_NAME = "neonpro-v1";
const OFFLINE_URL = "/offline.html";

// Files to cache on install
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/fonts/inter-var.woff2",
];

// Dynamic cache URLs for NeonPro
const DYNAMIC_CACHE_URLS = [
  "/dashboard/agendamentos",
  "/dashboard/clientes",
  "/dashboard/servicos",
  "/dashboard/profissionais",
  "/dashboard/financeiro",
  "/dashboard/relatorios",
  "/dashboard/configuracoes",
  "/dashboard/prontuarios",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline page");
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension requests
  if (request.url.startsWith("chrome-extension://")) return;

  // Parse URL
  const url = new URL(request.url);

  // Handle API requests differently
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // Default to network-first strategy
  event.respondWith(networkFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    });
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return (
      cached ||
      new Response("Network error happened", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-actions") {
    event.waitUntil(syncOfflineActions());
  }
  if (event.tag === "sync-appointments") {
    event.waitUntil(syncAppointments());
  }
  if (event.tag === "sync-clients") {
    event.waitUntil(syncClients());
  }
});

async function syncOfflineActions() {
  console.log("[ServiceWorker] Syncing offline actions");
  // Implement offline action sync for NeonPro
}

async function syncAppointments() {
  console.log("[ServiceWorker] Syncing appointments...");
  try {
    // Sync pending appointment changes
    const pendingChanges = await getStoredData("pending-appointments");
    if (pendingChanges && pendingChanges.length > 0) {
      // Process pending changes when back online
      console.log("[ServiceWorker] Processing pending appointment changes");
    }
  } catch (error) {
    console.error("[ServiceWorker] Error syncing appointments:", error);
  }
}

async function syncClients() {
  console.log("[ServiceWorker] Syncing clients...");
  try {
    // Sync pending client changes
    const pendingChanges = await getStoredData("pending-clients");
    if (pendingChanges && pendingChanges.length > 0) {
      console.log("[ServiceWorker] Processing pending client changes");
    }
  } catch (error) {
    console.error("[ServiceWorker] Error syncing clients:", error);
  }
}

async function getStoredData(key) {
  // Helper function to get data from IndexedDB or localStorage
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[ServiceWorker] Error getting stored data:", error);
    return null;
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/xmark.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"));
  }
});

// Message handling for skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
