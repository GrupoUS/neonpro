/**
 * Enhanced Realtime Services with Resilience Features
 * Comprehensive real-time management for healthcare applications
 */

// Legacy exports for backward compatibility
export { RealtimeManager } from './realtime-manager';
export type { RealtimeSubscriptionOptions } from './realtime-manager';

// Enhanced resilience-focused exports
export {
  EnhancedRealtimeManager,
  CacheInvalidationStrategy,
  type EnhancedRealtimeOptions,
  type RealtimeMetrics,
  type ConnectionHealth
} from './enhanced-realtime-manager';

// Legacy adapter system
import type { RealtimeEventAdapter, RealtimeAdapterConfig } from './event-adapter';
import { SupabaseRealtimeAdapter } from './supabase-adapter';
import { MockRealtimeAdapter } from './mock-adapter';

export function createRealtimeAdapter(config: RealtimeAdapterConfig): RealtimeEventAdapter {
  switch (config.provider) {
    case 'supabase':
      return new SupabaseRealtimeAdapter(config);
    case 'mock':
      return new MockRealtimeAdapter(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Default configurations for common scenarios
export const defaultConfigs = {
  supabase: (overrides: Partial<RealtimeAdapterConfig> = {}): RealtimeAdapterConfig => ({
    provider: 'supabase',
    connection: {
      timeout: 30000,
      retryAttempts: 3,
      heartbeatInterval: 30000,
    },
    healthcare: {
      enableAuditLogging: true,
      lgpdCompliance: true,
      maxSessionDuration: 120, // 2 hours
      inactivityTimeout: 15, // 15 minutes
      emergencyEscalation: true,
    },
    performance: {
      maxChannels: 100,
      maxParticipantsPerChannel: 50,
      eventBatchSize: 10,
      presenceSyncInterval: 5000,
    },
    ...overrides,
  }),

  mock: (overrides: Partial<RealtimeAdapterConfig> = {}): RealtimeAdapterConfig => ({
    provider: 'mock',
    connection: {
      timeout: 5000,
      retryAttempts: 1,
      heartbeatInterval: 10000,
    },
    healthcare: {
      enableAuditLogging: false,
      lgpdCompliance: true,
      maxSessionDuration: 30, // 30 minutes for testing
      inactivityTimeout: 5, // 5 minutes for testing
      emergencyEscalation: false,
    },
    performance: {
      maxChannels: 10,
      maxParticipantsPerChannel: 5,
      eventBatchSize: 5,
      presenceSyncInterval: 1000,
    },
    ...overrides,
  }),
};

// Re-export all types and utilities
export type {
  RealtimeEventAdapter,
  RealtimeEvent,
  RealtimeParticipant,
  RealtimeChannelState,
  RealtimeEventHandlers,
  RealtimeAdapterConfig,
  RealtimeAdapterError,
  RealtimeEventType,
} from './event-adapter.js';

export {
  createRealtimeEvent,
  validateParticipant,
  isHealthcareCompliant,
} from './event-adapter.js';

export { SupabaseRealtimeAdapter } from './supabase-adapter.js';
export { MockRealtimeAdapter } from './mock-adapter.js';