// Web Utilities Index
// Centralized exports for all web utility modules

// PWA (Progressive Web App) utilities
export type { OfflineData as IndexedDBConfig } from './pwa.ts';
export { pwaIndexedDB, pwaOfflineSync, pwaPushManager, pwaStatus } from './pwa.ts';

// Lite PWA utilities
export type { OfflineData } from './pwa-lite.ts';
export type { OfflineData as OfflineDataType } from './pwa-lite.ts';

// Import the actual values for local use
import { pwaIndexedDB, pwaOfflineSync, pwaPushManager, pwaStatus } from './pwa.ts';

// Utility collections for easy import
export const PWAUtils = {
  indexedDB: pwaIndexedDB,
  offlineSync: pwaOfflineSync,
  pushManager: pwaPushManager,
  status: pwaStatus,
  offlineData: { OfflineData: {} as any }, // Type placeholder
};

// Common utility exports for web applications
export type * from './pwa.ts';
export * from './pwa-lite.ts';