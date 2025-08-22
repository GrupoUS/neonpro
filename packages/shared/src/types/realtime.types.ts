/**
 * 🔄 Real-time Types - NeonPro Healthcare
 * ======================================
 *
 * Type-safe definitions for Supabase real-time subscriptions
 * with healthcare-specific events and LGPD compliance
 */

import type { Database } from '@neonpro/db';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

// Healthcare database tables for real-time subscriptions
export type Tables = Database['public']['Tables'];
export type PatientRow = Tables['patients']['Row'];
export type AppointmentRow = Tables['appointments']['Row'];
export type ProfessionalRow = Tables['healthcare_professionals']['Row'];
export type AuditLogRow = Tables['healthcare_audit_logs']['Row'];

// Real-time payload types - Using Record constraint to satisfy TypeScript
export type RealtimePayload<
  T extends Record<string, any> = Record<string, any>,
> = RealtimePostgresChangesPayload<T>;

// Healthcare-specific event types - Using type alias instead of interface to avoid extension issues
export type PatientRealtimePayload = RealtimePayload<PatientRow> & {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'patients';
  schema: 'public';
};

export type AppointmentRealtimePayload = RealtimePayload<AppointmentRow> & {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'appointments';
  schema: 'public';
};

export type ProfessionalRealtimePayload = RealtimePayload<ProfessionalRow> & {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'professionals';
  schema: 'public';
};

export type AuditRealtimePayload = RealtimePayload<AuditLogRow> & {
  eventType: 'INSERT';
  table: 'audit_logs';
  schema: 'public';
};

// Union type for all healthcare real-time events
export type HealthcareRealtimePayload =
  | PatientRealtimePayload
  | AppointmentRealtimePayload
  | ProfessionalRealtimePayload
  | AuditRealtimePayload;

// Real-time subscription configuration
export interface RealtimeSubscriptionConfig {
  table: string;
  schema?: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  enableAuditLogging?: boolean;
  lgpdCompliance?: boolean;
}

// LGPD compliance for real-time data
export interface LGPDRealtimeConfig {
  enableDataMinimization: boolean;
  enableConsentValidation: boolean;
  enableAuditLogging: boolean;
  sensitiveFields: string[];
  retentionPeriodDays?: number;
}

// Healthcare-specific subscription types
export interface PatientSubscriptionConfig extends RealtimeSubscriptionConfig {
  table: 'patients';
  patientId?: string;
  clinicId?: string;
  lgpdConfig?: LGPDRealtimeConfig;
}

export interface AppointmentSubscriptionConfig
  extends RealtimeSubscriptionConfig {
  table: 'appointments';
  appointmentId?: string;
  patientId?: string;
  professionalId?: string;
  clinicId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ProfessionalSubscriptionConfig
  extends RealtimeSubscriptionConfig {
  table: 'professionals';
  professionalId?: string;
  clinicId?: string;
  specialty?: string;
}

// Real-time channel management
export interface RealtimeChannelManager {
  channels: Map<string, RealtimeChannel>;
  subscribe: (config: RealtimeSubscriptionConfig) => Promise<RealtimeChannel>;
  unsubscribe: (channelName: string) => Promise<void>;
  unsubscribeAll: () => Promise<void>;
  getActiveChannels: () => string[];
}

// Real-time event handlers - Using Record constraint for generic type
export type RealtimeEventHandler<
  T extends Record<string, any> = Record<string, any>,
> = (payload: RealtimePayload<T>) => void;

export interface RealtimeEventHandlers {
  onInsert?: RealtimeEventHandler;
  onUpdate?: RealtimeEventHandler;
  onDelete?: RealtimeEventHandler;
  onError?: (error: Error) => void;
  onSubscribe?: (status: string) => void;
  onUnsubscribe?: () => void;
}

// Health monitoring for real-time connections
export interface RealtimeHealthCheck {
  isConnected: boolean;
  activeSubscriptions: number;
  lastPing?: Date;
  connectionDuration?: number;
  errorCount: number;
  lastError?: Error;
}

// Real-time hooks configuration
export interface UseRealtimeConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onUpdate?: RealtimeEventHandler<T>;
  onInsert?: RealtimeEventHandler<T>;
  onDelete?: RealtimeEventHandler<T>;
  onError?: (error: Error) => void;
  enabled: boolean;
  lgpdCompliance?: boolean;
  auditLogging?: boolean;
}

// TanStack Query integration types
export interface RealtimeQueryOptions {
  invalidateOnInsert?: boolean;
  invalidateOnUpdate?: boolean;
  invalidateOnDelete?: boolean;
  optimisticUpdates?: boolean;
  backgroundRefetch?: boolean;
}

// TanStack Query integration types - Using Record constraint
export interface UseRealtimeQueryConfig<
  T extends Record<string, any> = Record<string, any>,
> extends UseRealtimeConfig<T> {
  queryKey: string[];
  queryOptions?: RealtimeQueryOptions;
}
