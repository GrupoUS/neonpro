/**
 * Testing Library Index - Exports all mock services for testing
 * This resolves the import path issues in test files
 */

// Auth Services
export * from './auth/webauthn-service';
export * from './auth/webauthn-client';
export * from './auth/performance-tracker';

// Monitoring Services  
export * from './monitoring/monitoring-service';
export * from './monitoring/performance/performance-service';

// Notification Services
export * from './notifications/notification-service';

// Cache Services
export * from './cache/cache-service';

// Re-export specific instances for compatibility
export { 
  mockWebAuthnService as webAuthnService,
  mockWebAuthnService 
} from './auth/webauthn-service';

export { 
  authPerformanceTracker,
  AuthPerformanceTracker,
  trackAuthOperation 
} from './auth/performance-tracker';

export { 
  mockPerformanceService as performanceService,
  mockPerformanceService 
} from './monitoring/performance/performance-service';

export { 
  mockNotificationService as notificationService,
  mockNotificationService 
} from './notifications/notification-service';

export { 
  mockCacheService as cacheService,
  mockCacheService 
} from './cache/cache-service';

// Compatibility aliases for legacy imports
export { mockWebAuthnService as WebAuthnService } from './auth/webauthn-service';
export { mockMonitoringService as MonitoringService } from './monitoring/monitoring-service';