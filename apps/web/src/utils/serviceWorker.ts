/**
 * Service Worker Registration and Management
 * T078 - Frontend Performance Optimization
 */

// Service worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  // Only register in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.VITE_ENABLE_SW) {
    console.log('[SW] Service worker disabled in development');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener(_'updatefound',_() => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener(_'statechange',_() => {
          if (
            newWorker.state === 'installed'
            && navigator.serviceWorker.controller
          ) {
            // New service worker available
            showUpdateNotification();
          }
        });
      }
    });

    return registration;
  } catch (_error) {
    console.error('[SW] Service worker registration failed:', error);
    return null;
  }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('[SW] Service worker unregistered:', result);
      return result;
    }
    return false;
  } catch (_error) {
    console.error('[SW] Service worker unregistration failed:', error);
    return false;
  }
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('[SW] Service worker update triggered');
    }
  } catch (_error) {
    console.error('[SW] Service worker update failed:', error);
  }
}

// Skip waiting and activate new service worker
export async function skipWaiting(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Clear all caches
export async function clearCaches(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clear service worker caches
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        const messageChannel = new MessageChannel();

        return new Promise(_resolve => {
          messageChannel.port1.onmessage = () => resolve();
          registration.active!.postMessage({ type: 'CLEAR_CACHE' }, [
            messageChannel.port2,
          ]);
        });
      }
    }

    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW] Browser caches cleared');
    }
  } catch (_error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Preload critical resources
export async function preloadCriticalResources(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      const messageChannel = new MessageChannel();

      return new Promise(_resolve => {
        messageChannel.port1.onmessage = () => resolve();
        registration.active!.postMessage({ type: 'CACHE_URLS', urls }, [
          messageChannel.port2,
        ]);
      });
    }
  } catch (_error) {
    console.error('[SW] Failed to preload resources:', error);
  }
}

// Check if service worker is supported and active
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function isServiceWorkerActive(): boolean {
  return isServiceWorkerSupported() && !!navigator.serviceWorker.controller;
}

// Get service worker status
export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
}> {
  if (!isServiceWorkerSupported()) {
    return {
      supported: false,
      registered: false,
      active: false,
      waiting: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    return {
      supported: true,
      registered: !!registration,
      active: !!registration?.active,
      waiting: !!registration?.waiting,
    };
  } catch (_error) {
    console.error('[SW] Failed to get service worker status:', error);
    return {
      supported: true,
      registered: false,
      active: false,
      waiting: false,
    };
  }
}

// Show update notification to user
function showUpdateNotification(): void {
  // This would typically show a toast or modal to the user
  // For now, we'll just log it
  console.log('[SW] New version available! Please refresh the page.');

  // You can integrate with your notification system here
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('NeonPro Update Available', {
        body: 'A new version of NeonPro is available. Please refresh the page.',
        icon: '/neonpro-favicon.svg',
        tag: 'app-update',
      });
    }
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

// Service worker event listeners
export function setupServiceWorkerListeners(): void {
  if (!isServiceWorkerSupported()) {
    return;
  }

  // Listen for service worker updates
  navigator.serviceWorker.addEventListener(_'controllerchange',_() => {
    console.log('[SW] Controller changed - reloading page');
    window.location.reload();
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('[SW] Message from service worker:', event.data);
  });
}

// Initialize service worker
export async function initializeServiceWorker(): Promise<void> {
  try {
    await registerServiceWorker();
    setupServiceWorkerListeners();
    await requestNotificationPermission();

    // Preload critical resources
    const criticalResources = [
      '/assets/index.css',
      '/assets/index.js',
      '/brand/iconeneonpro.svg',
    ];

    await preloadCriticalResources(criticalResources);

    console.log('[SW] Service worker initialized successfully');
  } catch (_error) {
    console.error('[SW] Service worker initialization failed:', error);
  }
}

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  update: updateServiceWorker,
  skipWaiting,
  clearCaches,
  preloadCriticalResources,
  isSupported: isServiceWorkerSupported,
  isActive: isServiceWorkerActive,
  getStatus: getServiceWorkerStatus,
  initialize: initializeServiceWorker,
};
