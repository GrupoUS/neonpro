/**
 * Database types and interfaces for @neonpro/database package
 */

export interface DatabasePatient {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  external_ids?: Record<string, unknown>;
  given_names?: string[];
  family_name?: string;
  full_name?: string;
  preferred_name?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  is_active?: boolean;
  deceased_indicator?: boolean;
  deceased_date?: string;
  data_consent_status?: string;
  data_consent_date?: string;
  data_retention_until?: string;
  data_source?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  photo_url?: string;
  cpf?: string;
  rg?: string;
  passport_number?: string;
  preferred_contact_method?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_provider?: string;
  insurance_number?: string;
  insurance_plan?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  lgpd_consent_given?: boolean;
}

/**
 * Query options for patient search and filtering
 */
export interface PatientQueryOptions {
  /** Search query string */
  search?: string;
  /** Patient status filter */
  status?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort order: 'asc' or 'desc' */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search result interface for patient queries
 */
export interface PatientSearchResult {
  /** Array of matching patients */
  patients: any[];
  /** Total number of matching patients */
  total: number;
  /** Limit applied to this result */
  limit: number;
  /** Offset applied to this result */
  offset: number;
}

<<<<<<< HEAD
// Re-export for convenience
export * from './supabase.js';
=======
export interface MedicalRecordData {
  id: string;
  patientId: string;
  type: string;
  content: any;
  date: string;
  doctorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  id: string;
  type: string;
  data: any;
  date: string;
  metadata?: any;
  createdAt: string;
}

export interface ComplianceData {
  id: string;
  type: string;
  status: string;
  details: any;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationData {
  id: string;
  provider: string;
  type: string;
  status: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  id: string;
  type: string;
  status: string;
  size?: number;
  createdAt: string;
  expiresAt?: string;
}

export interface SecurityData {
  id: string;
  type: string;
  status: string;
  details: any;
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  _userId: string;
  action: string;
  resource: string;
  details: any;
  createdAt: string;
}

export interface CacheData {
  key: string;
  value: any;
  expiresAt?: string;
  createdAt: string;
}

export interface RateLimitData {
  key: string;
  count: number;
  resetAt: string;
  createdAt: string;
}

export interface ReportData {
  id: string;
  type: string;
  status: string;
  data: any;
  createdAt: string;
}

export interface MonitoringData {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  metadata?: any;
}
>>>>>>> origin/main
