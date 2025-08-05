"use strict";
/**
 * Mobile API Types & Interfaces
 * Story 7.4: Mobile App API Support Implementation
 *
 * Comprehensive type definitions for mobile-optimized APIs:
 * - Offline synchronization types
 * - Push notification interfaces
 * - Mobile authentication types
 * - Data compression schemas
 * - Cache management types
 * - Mobile-specific request/response formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_NOTIFICATION_TYPES = exports.SUPPORTED_SYNC_DIRECTIONS = exports.SUPPORTED_CACHE_STRATEGIES = exports.SUPPORTED_COMPRESSION_ALGORITHMS = exports.SUPPORTED_PLATFORMS = exports.MOBILE_API_CONSTANTS = void 0;
// ============================================================================
// CONSTANTS
// ============================================================================
exports.MOBILE_API_CONSTANTS = {
    VERSION: '2.0',
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    MAX_RETRY_ATTEMPTS: 3,
    DEFAULT_CACHE_TTL: 300, // 5 minutes
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_OFFLINE_STORAGE: 100 * 1024 * 1024, // 100MB
    SYNC_INTERVAL: 60, // 1 minute
    COMPRESSION_THRESHOLD: 1024, // 1KB
    MAX_PUSH_NOTIFICATIONS: 100,
    BIOMETRIC_TIMEOUT: 300, // 5 minutes
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900, // 15 minutes
};
exports.SUPPORTED_PLATFORMS = ['ios', 'android', 'web'];
exports.SUPPORTED_COMPRESSION_ALGORITHMS = ['gzip', 'brotli', 'deflate'];
exports.SUPPORTED_CACHE_STRATEGIES = ['cache-first', 'network-first', 'cache-only', 'network-only'];
exports.SUPPORTED_SYNC_DIRECTIONS = ['up', 'down', 'both'];
exports.SUPPORTED_NOTIFICATION_TYPES = ['appointment_reminder', 'payment_due', 'treatment_complete', 'system_alert', 'marketing'];
