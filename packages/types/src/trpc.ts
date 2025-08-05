/**
 * Shared tRPC types for NeonPro Healthcare
 * 
 * Type definitions for:
 * - Healthcare user roles and permissions
 * - Medical data structures
 * - LGPD compliance types
 * - Audit trail interfaces
 * - API response formats
 */

// Healthcare user roles
export type HealthcareRole = 
  | 'admin'
  | 'healthcare_professional' 
  | 'patient'
  | 'staff';

// Medical professional specializations
export type MedicalSpecialization = 
  | 'general_medicine'
  | 'cardiology'
  | 'pediatrics'
  | 'orthopedics'
  | 'neurology'
  | 'dermatology'
  | 'psychiatry'
  | 'radiology'
  | 'surgery'
  | 'emergency'
  | 'other';

// Healthcare facility types
export type FacilityType = 
  | 'hospital'
  | 'clinic'
  | 'practice'
  | 'laboratory'
  | 'pharmacy'
  | 'diagnostic_center';

// LGPD compliance status
export interface LGPDCompliance {
  lgpd_consent: boolean;
  data_consent_given: boolean;
  data_consent_date?: string;
  data_retention_period?: number;
  data_processing_purposes: string[];
  third_party_sharing_consent: boolean;
}

// Healthcare user profile
export interface HealthcareUser {
  id: string;
  email: string;
  role: HealthcareRole;
  tenant_id: string;
  medical_license?: string;
  specialization?: MedicalSpecialization;
  department?: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  lgpd_compliance: LGPDCompliance;
  created_at: string;
  updated_at: string;
}

// Healthcare tenant/facility
export interface HealthcareTenant {
  id: string;
  name: string;
  type: FacilityType;
  cnpj?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    language: string;
    lgpd_settings: {
      data_retention_days: number;
      audit_log_retention_days: number;
      consent_reminder_interval_days: number;
    };
  };
  created_at: string;
  updated_at: string;
}// Audit trail interface
export interface HealthcareAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id?: string;
  tenant_id?: string;
  metadata: Record<string, any>;
  request_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  compliance_flags: {
    lgpd_compliant: boolean;
    data_consent_validated: boolean;
    medical_role_verified: boolean;
  };
}

// API response wrapper
export interface HealthcareAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    request_id: string;
    version: string;
    compliance_validated: boolean;
  };
}

// Error codes for healthcare API
export enum HealthcareErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  LGPD_CONSENT_REQUIRED = 'LGPD_CONSENT_REQUIRED',
  MEDICAL_LICENSE_INVALID = 'MEDICAL_LICENSE_INVALID',
  TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED',
  DATA_RETENTION_EXPIRED = 'DATA_RETENTION_EXPIRED',
  AUDIT_LOG_REQUIRED = 'AUDIT_LOG_REQUIRED',
}

// Performance metrics for healthcare operations
export interface HealthcarePerformanceMetrics {
  response_time_ms: number;
  database_queries: number;
  cache_hits: number;
  compliance_checks: number;
  audit_logs_created: number;
  data_size_bytes: number;
}

// All types are already exported individually above