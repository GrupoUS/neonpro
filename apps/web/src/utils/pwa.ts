// PWA Utilities for offline data storage and synchronization

// IndexedDB configuration for offline data storage
export interface OfflineData {
  id: string;
  type: 'appointment' | 'patient' | 'inventory' | 'treatment' | 'financial' | 'communication';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

// IndexedDB Database Setup
export class PWAIndexedDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'NeonProOfflineDB';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline data
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }

        // Store for app settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addOfflineData(data: Omit<OfflineData, 'id'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `${data.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = { ...data, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');

      const request = store.add(offlineData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Failed to add offline data'));
    });
  }

  async getOfflineData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');

      const request = index.getAll(false); // Get only unsynced data

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get offline data'));
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');

      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to mark data as synced'));
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to get offline data for sync'));
    });
  }

  async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) await this.init();

    const expiry = Date.now() + ttl;
    const cachedItem = { key, data, expiry };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');

      const request = store.put(cachedItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to cache data'));
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');

      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to get cached data'));
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const index = store.index('expiry');

      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to clear expired cache'));
    });
  }
}

// Push Notification Manager
export class PWAPushManager {
  private subscription: PushSubscription | null = null;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY
            || 'BH2jO8W3j8Z2gF3h6K9L1mN3pQ6rT2yV5bX8cF4j7H1k9L2mN3pQ6rT2yV5bX8cF4j7H',
        ),
      });

      console.log('Push notification subscription successful');
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async sendLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Offline Sync Manager
export class PWAOfflineSync {
  private indexedDB: PWAIndexedDB;
  private syncInProgress = false;
  private retryAttempts = 3;
  private retryDelay = 5000;

  constructor() {
    this.indexedDB = new PWAIndexedDB();
  }

  async init(): Promise<void> {
    await this.indexedDB.init();

    // Set up background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('neonpro-sync');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }

    // Listen for online events to trigger sync
    window.addEventListener('online', () => this.sync());

    // Periodic sync check
    setInterval(() => this.sync(), 30000); // Check every 30 seconds
  }

  async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
      const offlineData = await this.indexedDB.getOfflineData();

      for (const item of offlineData) {
        await this.syncItem(item);
      }

      // Clear expired cache
      await this.indexedDB.clearExpiredCache();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: OfflineData, attempt = 1): Promise<void> {
    try {
      // Here you would make API calls to sync the data
      // This is a placeholder - implement actual API calls based on your backend
      console.log(`Syncing ${item.type} item:`, item);

      // Mark as synced
      await this.indexedDB.markAsSynced(item.id);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);

      if (attempt < this.retryAttempts) {
        setTimeout(() => {
          this.syncItem(item, attempt + 1);
        }, this.retryDelay * attempt);
      }
    }
  }

  async addOfflineAction(
    type: OfflineData['type'],
    action: OfflineData['action'],
    data: any,
  ): Promise<string> {
    return await this.indexedDB.addOfflineData({
      type,
      action,
      data,
      timestamp: Date.now(),
      synced: false,
    });
  }
}

// PWA Status Manager
export class PWAStatus {
  private static instance: PWAStatus;
  private online = navigator.onLine;
  private installPromptAvailable = false;
  private isInstalled = false;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.init();
  }

  static getInstance(): PWAStatus {
    if (!PWAStatus.instance) {
      PWAStatus.instance = new PWAStatus();
    }
    return PWAStatus.instance;
  }

  private init(): void {
    // Online/offline status
    window.addEventListener('online', () => this.updateStatus('online', true));
    window.addEventListener('offline', () => this.updateStatus('online', false));

    // PWA install prompts
    window.addEventListener('pwa-install-available', () => {
      this.updateStatus('installPromptAvailable', true);
    });

    window.addEventListener('pwa-installed', () => {
      this.updateStatus('isInstalled', true);
    });

    // Check if already installed
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  }

  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private updateStatus(key: string, value: any): void {
    (this as any)[key] = value;
    this.listeners.get(key)?.forEach(callback => callback(value));
  }

  isOnline(): boolean {
    return this.online;
  }

  isInstallPromptAvailable(): boolean {
    return this.installPromptAvailable;
  }

  isPWAInstalled(): boolean {
    return this.isInstalled;
  }
}

// Export singleton instances
export const pwaIndexedDB = new PWAIndexedDB();
export const pwaPushManager = new PWAPushManager();
export const pwaOfflineSync = new PWAOfflineSync();
export const pwaStatus = PWAStatus.getInstance();
