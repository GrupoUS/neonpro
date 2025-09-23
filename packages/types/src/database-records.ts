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
  audit_trail?: Record<string, unknown>[];
}

export type { AuditTrailEntry } from "./governance.types";

// Healthcare governance database record types
// These map to the actual database schema structure used in Supabase queries

export interface HealthcareMetricRecord extends HealthcareDatabaseRecord {
  metric_type: string;
  category: string;
  value: number;
  unit: string;
  target_value?: number;
  status: string;
  description?: string;
  metadata?: Record<string, unknown>;
  clinic_id: string;
  patient_id?: string;
  period_start: string;
  period_end: string;
}

export interface PatientSafetyKPIRecord extends HealthcareDatabaseRecord {
  kpi_type: string;
  current_value: number;
  target_value: number;
  threshold_value?: number;
  trend_direction: 'improving' | 'stable' | 'declining';
  status: 'normal' | 'warning' | 'critical';
  category: string;
  clinic_id: string;
  period_start: string;
  period_end: string;
  description?: string;
  action_required?: boolean;
  recommendations?: string[];
}

export interface HealthcarePolicyRecord extends HealthcareDatabaseRecord {
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'review' | 'archived';
  version: string;
  effective_date?: string;
  review_date?: string;
  compliance_level?: number;
  requirements?: string[];
  attachments?: string[];
  clinic_id: string;
  created_by: string;
  updated_by?: string;
}

export interface HealthcareAlertRecord extends HealthcareDatabaseRecord {
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  source: string;
  target_audience: string[];
  metadata?: Record<string, unknown>;
  action_required?: boolean;
  due_date?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  clinic_id: string;
  patient_id?: string;
}

export interface ComplianceReportRecord extends HealthcareDatabaseRecord {
  report_type: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  overall_score?: number;
  compliance_level?: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  summary?: string;
  findings?: Record<string, unknown>;
  recommendations?: string[];
  action_items?: string[];
  clinic_id: string;
  generated_by: string;
  reviewed_by?: string;
  approved_by?: string;
}
