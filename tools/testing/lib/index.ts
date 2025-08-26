/**
 * Testing Library Index - Exports all mock services for testing
 * This resolves the import path issues in test files
 */

export * from './auth/performance-tracker';
export {
  AuthPerformanceTracker,
  authPerformanceTracker,
  trackAuthOperation,
} from './auth/performance-tracker';
export * from './auth/webauthn-client';
// Auth Services
export * from './auth/webauthn-service';
// Re-export specific instances for compatibility
export {
  mockWebAuthnService,
  mockWebAuthnService as WebAuthnService,
  mockWebAuthnService as webAuthnService,
} from './auth/webauthn-service';

// Cache Services
export * from './cache/cache-service';
export { mockCacheService, mockCacheService as cacheService } from './cache/cache-service';
// Monitoring Services
export * from './monitoring/monitoring-service';
export { mockMonitoringService as MonitoringService } from './monitoring/monitoring-service';
export * from './monitoring/performance/performance-service';
export {
  mockPerformanceService,
  mockPerformanceService as performanceService,
} from './monitoring/performance/performance-service';
// Notification Services
export * from './notifications/notification-service';
export {
  mockNotificationService,
  mockNotificationService as notificationService,
} from './notifications/notification-service';
