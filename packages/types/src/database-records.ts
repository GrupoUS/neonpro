// Basic database records types for governance and healthcare services
// Used for Prisma/Supabase integration in governance

export interface DatabaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface HealthcareDatabaseRecord extends DatabaseRecord {
  clinic_id?: string;
  patient_id?: string;
  compliance_status?: string;
  audit_trail?: AuditTrailEntry[];
}

export type { AuditTrailEntry } from "./governance.types";
