/**
 * Enhanced Service Worker Registration with Healthcare Compliance
 * T078 - Frontend Performance Optimization
 *
 * Features:
 * - Healthcare-specific caching strategies
 * - Offline functionality for medical data
 * - Compliance with data privacy regulations
 * - Real-time synchronization
 */

// Healthcare-specific cache strategies
export enum HealthcareCacheStrategy {
  PATIENT_DATA = 'patient-data',
  MEDICAL_RECORDS = 'medical-records',
  APPOINTMENTS = 'appointments',
  STATIC_ASSETS = 'static-assets',
  HEALTHCARE_API = 'healthcare-api',
  EMERGENCY_RESOURCES = 'emergency-resources',
}

// Cache configuration interface
export interface HealthcareCacheConfig {
  version: string;
  strategies: {
    [key in HealthcareCacheStrategy]: {
      maxAge: number; // in seconds
      maxSize: number; // in MB
      networkTimeout: number; // in ms
      backgroundSync: boolean;
      priority: 'high' | 'medium' | 'low';
    };
  };
  offlineEnabled: boolean;
  backgroundSyncEnabled: boolean;
  emergencyModeEnabled: boolean;
}

// Default healthcare cache configuration
const DEFAULT_HEALTHCARE_CACHE_CONFIG: HealthcareCacheConfig = {
  version: 'neonpro-healthcare-v1.0.0',
  strategies: {
    [HealthcareCacheStrategy.PATIENT_DATA]: {
      maxAge: 300, // 5 minutes for fresh patient data
      maxSize: 50,
      networkTimeout: 5000,
      backgroundSync: true,
      priority: 'high',
    },
    [HealthcareCacheStrategy.MEDICAL_RECORDS]: {
      maxAge: 900, // 15 minutes for medical records
      maxSize: 100,
      networkTimeout: 10000,
      backgroundSync: true,
      priority: 'high',
    },
    [HealthcareCacheStrategy.APPOINTMENTS]: {
      maxAge: 300, // 5 minutes for appointment data
      maxSize: 20,
      networkTimeout: 3000,
      backgroundSync: true,
      priority: 'high',
    },
    [HealthcareCacheStrategy.STATIC_ASSETS]: {
      maxAge: 86400, // 24 hours for static assets
      maxSize: 200,
      networkTimeout: 2000,
      backgroundSync: false,
      priority: 'medium',
    },
    [HealthcareCacheStrategy.HEALTHCARE_API]: {
      maxAge: 0, // No caching for API responses
      maxSize: 10,
      networkTimeout: 8000,
      backgroundSync: false,
      priority: 'low',
    },
    [HealthcareCacheStrategy.EMERGENCY_RESOURCES]: {
      maxAge: 0, // Always fresh emergency resources
      maxSize: 5,
      networkTimeout: 2000,
      backgroundSync: false,
      priority: 'high',
    },
  },
  offlineEnabled: true,
  backgroundSyncEnabled: true,
  emergencyModeEnabled: true,
};

// Service worker registration state
interface ServiceWorkerRegistrationState {
  isRegistered: boolean;
  isActive: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  config: HealthcareCacheConfig;
  registration?: ServiceWorkerRegistration;
}

let registrationState: ServiceWorkerRegistrationState = {
  isRegistered: false,
  isActive: false,
  isInstalling: false,
  isWaiting: false,
  config: DEFAULT_HEALTHCARE_CACHE_CONFIG,
};

/**
 * Healthcare-specific cache management
 */
class HealthcareCacheManager {
  private config: HealthcareCacheConfig;

  constructor(config: HealthcareCacheConfig) {
    this.config = config;
  }

  /**
   * Clear healthcare-specific caches with compliance
   */
  async clearHealthcareCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      
      // Clear only healthcare-related caches
      const healthcareCaches = cacheNames.filter(name => 
        name.startsWith('neonpro-healthcare-') ||
        name.includes('patient-') ||
        name.includes('medical-') ||
        name.includes('appointment-')
      );

      await Promise.all(healthcareCaches.map(name => caches.delete(name)));
      
      console.log('[Healthcare Cache] Cleared healthcare-specific caches:', healthcareCaches);
    } catch (_error) {
      console.error('[Healthcare Cache] Failed to clear healthcare caches:', error);
    }
  }

  /**
   * Cache healthcare data with privacy compliance
   */
  async cacheHealthcareData(
    url: string,
    data: any,
    strategy: HealthcareCacheStrategy
  ): Promise<void> {
    try {
      const cacheName = `neonpro-healthcare-${strategy}`;
      const cache = await caches.open(cacheName);
      
      // Create response with healthcare headers
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Healthcare-Cache': strategy,
          'X-Cache-Timestamp': Date.now().toString(),
          'X-Privacy-Compliance': 'LGPD',
        },
      });

      await cache.put(url, response);
      
      console.log(`[Healthcare Cache] Cached ${strategy} data for:`, url);
    } catch (_error) {
      console.error('[Healthcare Cache] Failed to cache healthcare data:', error);
    }
  }

  /**
   * Get cached healthcare data
   */
  async getCachedHealthcareData(
    url: string,
    strategy: HealthcareCacheStrategy
  ): Promise<any | null> {
    try {
      const cacheName = `neonpro-healthcare-${strategy}`;
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      
      if (!response) {
        return null;
      }

      // Check cache age
      const cacheTimestamp = response.headers.get('X-Cache-Timestamp');
      if (cacheTimestamp) {
        const age = (Date.now() - parseInt(cacheTimestamp)) / 1000;
        const maxAge = this.config.strategies[strategy].maxAge;
        
        if (age > maxAge) {
          // Cache expired
          await cache.delete(url);
          return null;
        }
      }

      const data = await response.json();
      return data;
    } catch (_error) {
      console.error('[Healthcare Cache] Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Setup background sync for healthcare data
   */
  async setupBackgroundSync(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
        console.log('[Healthcare Cache] Background sync not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Register sync tags for healthcare data
      await registration.sync.register('sync-patient-data');
      await registration.sync.register('sync-medical-records');
      await registration.sync.register('sync-appointments');
      
      console.log('[Healthcare Cache] Background sync registered for healthcare data');
    } catch (_error) {
      console.error('[Healthcare Cache] Failed to setup background sync:', error);
    }
  }

  /**
   * Handle emergency mode activation
   */
  async activateEmergencyMode(): Promise<void> {
    try {
      console.log('[Healthcare Cache] Activating emergency mode...');
      
      // Cache critical emergency resources
      const emergencyResources = [
        '/emergency-contact',
        '/emergency-procedures',
        '/offline-emergency-guide',
        '/critical-patient-info',
      ];

      const emergencyCache = await caches.open('neonpro-emergency-resources');
      
      // Pre-cache emergency resources
      const promises = emergencyResources.map(url =>
        fetch(url).then(response => {
          if (response.ok) {
            return emergencyCache.put(url, response.clone());
          }
        })
      );

      await Promise.all(promises);
      
      console.log('[Healthcare Cache] Emergency mode activated - critical resources cached');
    } catch (_error) {
      console.error('[Healthcare Cache] Failed to activate emergency mode:', error);
    }
  }
}

/**
 * Enhanced service worker registration with healthcare features
 */
export async function registerHealthcareServiceWorker(
  config?: Partial<HealthcareCacheConfig>
): Promise<ServiceWorkerRegistrationState> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[Healthcare SW] Service workers not supported');
    return registrationState;
  }

  try {
    // Merge configuration
    registrationState.config = {
      ...DEFAULT_HEALTHCARE_CACHE_CONFIG,
      ...config,
    };

    console.log('[Healthcare SW] Registering healthcare service worker...');

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registrationState.registration = registration;

    // Setup event listeners
    setupHealthcareServiceWorkerListeners(registration);

    // Initialize healthcare cache manager
    const cacheManager = new HealthcareCacheManager(registrationState.config);

    // Setup background sync if enabled
    if (registrationState.config.backgroundSyncEnabled) {
      await cacheManager.setupBackgroundSync();
    }

    // Activate emergency mode if enabled
    if (registrationState.config.emergencyModeEnabled) {
      await cacheManager.activateEmergencyMode();
    }

    // Update registration state
    updateRegistrationState(registration);

    console.log('[Healthcare SW] ✅ Healthcare service worker registered successfully');
    
    return registrationState;
  } catch (_error) {
    console.error('[Healthcare SW] ❌ Registration failed:', error);
    throw error;
  }
}

/**
 * Setup healthcare-specific service worker event listeners
 */
function setupHealthcareServiceWorkerListeners(registration: ServiceWorkerRegistration): void {
  // Handle service worker updates
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    if (newWorker) {
      registrationState.isInstalling = true;
      
      newWorker.addEventListener('statechange', () => {
        updateRegistrationState(registration);
        
        if (
          newWorker.state === 'installed' &&
          registration.active &&
          navigator.serviceWorker.controller
        ) {
          // New service worker available
          showHealthcareUpdateNotification();
        }
      });
    }
  });

  // Listen for controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[Healthcare SW] Controller changed - page reload may be required');
    
    // For healthcare applications, we might want to prevent automatic reload
    // and let the user decide when to update
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'HEALTHCARE_DATA_SYNC':
        console.log('[Healthcare SW] Healthcare data synced:', data);
        break;
        
      case 'EMERGENCY_MODE_ACTIVATED':
        console.log('[Healthcare SW] Emergency mode activated');
        break;
        
      case 'CACHE_UPDATED':
        console.log('[Healthcare SW] Cache updated:', data);
        break;
        
      case 'PRIVACY_COMPLIANCE':
        console.log('[Healthcare SW] Privacy compliance check:', data);
        break;
        
      default:
        console.log('[Healthcare SW] Message from service worker:', event.data);
    }
  });
}

/**
 * Update registration state
 */
function updateRegistrationState(registration: ServiceWorkerRegistration): void {
  registrationState.isRegistered = !!registration;
  registrationState.isActive = !!registration.active;
  registrationState.isInstalling = !!registration.installing;
  registrationState.isWaiting = !!registration.waiting;
}

/**
 * Show healthcare-appropriate update notification
 */
function showHealthcareUpdateNotification(): void {
  console.log('[Healthcare SW] New version available with healthcare updates');
  
  // For healthcare applications, we need to be careful about updates
  // We should notify the user but not interrupt critical workflows
  
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('NeonPro Healthcare Update Available', {
        body: 'Uma nova versão com melhorias de saúde está disponível. Atualize quando conveniente.',
        icon: '/neonpro-favicon.svg',
        tag: 'healthcare-update',
        requireInteraction: false, // Don't interrupt critical work
      });
    }
  }
}

/**
 * Request notification permission for healthcare updates
 */
export async function requestHealthcareNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('[Healthcare SW] Healthcare notifications permission granted');
    }
    
    return permission;
  }

  return Notification.permission;
}

/**
 * Check healthcare service worker status
 */
export function getHealthcareServiceWorkerStatus(): ServiceWorkerRegistrationState {
  return { ...registrationState };
}

/**
 * Clear healthcare caches (for privacy compliance)
 */
export async function clearHealthcareCaches(): Promise<void> {
  const cacheManager = new HealthcareCacheManager(registrationState.config);
  await cacheManager.clearHealthcareCaches();
}

/**
 * Update healthcare service worker
 */
export async function updateHealthcareServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('[Healthcare SW] Healthcare service worker update triggered');
    }
  } catch (_error) {
    console.error('[Healthcare SW] Failed to update healthcare service worker:', error);
  }
}

/**
 * Unregister healthcare service worker
 */
export async function unregisterHealthcareServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      
      // Clear healthcare caches
      await clearHealthcareCaches();
      
      console.log('[Healthcare SW] Healthcare service worker unregistered:', result);
      return result;
    }
    return false;
  } catch (_error) {
    console.error('[Healthcare SW] Failed to unregister healthcare service worker:', error);
    return false;
  }
}

// Initialize healthcare service worker on module load
if (typeof window !== 'undefined') {
  // Auto-register in production or when explicitly enabled
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VITE_ENABLE_HEALTHCARE_SW
  ) {
    registerHealthcareServiceWorker().catch(console.error);
  }
}

export default {
  register: registerHealthcareServiceWorker,
  unregister: unregisterHealthcareServiceWorker,
  update: updateHealthcareServiceWorker,
  getStatus: getHealthcareServiceWorkerStatus,
  clearCaches: clearHealthcareCaches,
  requestNotificationPermission: requestHealthcareNotificationPermission,
};