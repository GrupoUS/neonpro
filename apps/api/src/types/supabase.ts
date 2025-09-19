/**
 * Supabase Types Module
 *
 * Re-exports database types from the shared packages directory
 * for use in the API application with proper path resolution.
 */

import type { Database, Json } from '../../../../packages/database/src/types/supabase';

// Re-export the main types
export type { Database, Json };

// Type aliases for commonly used tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table type exports for common use cases
export type Patient = TableRow<'patients'>;
export type Appointment = TableRow<'appointments'>;
export type Clinic = TableRow<'clinics'>;
export type Doctor = TableRow<'doctors'>;
export type AuditLog = TableRow<'audit_logs'>;
export type PatientConsent = TableRow<'patient_consent'>;
export type MessageDeliveryLog = TableRow<'message_delivery_log'>;

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