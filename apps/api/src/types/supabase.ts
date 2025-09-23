/**
 * Supabase Types Module
 *
 * Re-exports database types from the shared packages directory
 * for use in the API application with proper path resolution.
 */

import type {
  Database as DatabaseType,
  Json as JsonType,
} from '../../../../packages/database/src/types/supabase';

// Re-export the main types with explicit aliases to avoid conflicts
export type { DatabaseType as SupabaseDatabase, JsonType as SupabaseJson };

// Type aliases for commonly used tables
export type Tables<T extends keyof DatabaseType['public']['Tables']> = DatabaseType['public']['Tables'][T];
export type TableRow<T extends keyof DatabaseType['public']['Tables']> =
  DatabaseType['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof DatabaseType['public']['Tables']> =
  DatabaseType['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof DatabaseType['public']['Tables']> =
  DatabaseType['public']['Tables'][T]['Update'];

// Specific table type exports for common use cases
export type Patient = TableRow<'patients'>;
export type Appointment = TableRow<'appointments'>;
export type Clinic = TableRow<'clinics'>;
export type Doctor = TableRow<'professionals'>;
export type AuditLog = TableRow<'audit_logs'>;
export type PatientConsent = TableRow<'consent_records'>;
// export type MessageDeliveryLog = TableRow<'message_delivery_log'>; // Table doesn't exist in schema

// Function types for Supabase edge functions
export type SupabaseFunction<T = any, R = any> = (args: T) => Promise<R>;

// LGPD Compliance function types
export type AnonymizePatientDataFunction = SupabaseFunction<
  { patient_id: string; clinic_id: string },
  { success: boolean; anonymized_fields: string[] }
>;

export type DeletePatientDataFunction = SupabaseFunction<
  { patient_id: string; clinic_id: string; retention_period_days?: number },
  { success: boolean; deleted_records: number }
>;

export type ExportPatientDataFunction = SupabaseFunction<
  { patient_id: string; clinic_id: string; format?: 'json' | 'csv' },
  { success: boolean; export_url: string; expires_at: string }
>;
