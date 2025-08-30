import type { BaseEntity } from "./common";

/**
 * Patient Interface - Enhanced based on Supabase Healthcare Schema Validation
 * 
 * Reflects real database structure with Brazilian healthcare compliance:
 * - Multi-tenant isolation (clinic_id)
 * - LGPD compliance fields
 * - Brazilian identity fields (CPF, RG)
 * - Healthcare-specific data
 */
export interface Patient extends BaseEntity {
  // Core Identity & Multi-tenancy
  id: string;
  clinic_id: string;              // Multi-tenant isolation

  // Personal Information
  name: string;
  email: string;
  phone: string;
  birth_date: string;             // ISO date string
  cpf?: string;                   // Brazilian tax ID
  rg?: string;                    // Brazilian identity document

  // Address Information (Brazil-specific)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;                 // Brazilian state code
  postal_code?: string;           // CEP format
  country?: string;               // Default: 'Brazil'

  // Healthcare-Specific Information
  medical_history?: string;
  allergies?: string[];           // Array of allergy descriptions
  medications?: string[];         // Current medications list
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // LGPD Compliance (Lei Geral de Proteção de Dados)
  data_consent_given: boolean;
  lgpd_consent_date?: string;     // ISO timestamp
  lgpd_consent_version?: string;  // Version of consent terms
  privacy_settings: PrivacySettings;
  communication_consent: CommunicationConsent;

  // Media & Preferences
  photo_url?: string;             // Patient photo URL
  preferred_language?: string;    // Default: 'pt-BR'

  // System Fields (BaseEntity)
  created_at: string;
  updated_at: string;
  created_by: string;             // User ID who created
  updated_by?: string;            // User ID who last updated
  deleted_at?: string;            // Soft delete timestamp
}

/**
 * LGPD Privacy Settings
 */
export interface PrivacySettings {
  allow_marketing: boolean;
  allow_research: boolean;
  allow_third_party_sharing: boolean;
  data_retention_period?: number;  // Days
  anonymize_after_period: boolean;
}

/**
 * Communication Consent for Brazilian Healthcare
 */
export interface CommunicationConsent {
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  phone_calls: boolean;
  postal_mail: boolean;
  emergency_contact: boolean;      // Always true for healthcare
}

/**
 * Patient Creation Request (frontend -> backend)
 */
export interface CreatePatientRequest {
  // Required fields
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  data_consent_given: boolean;
  lgpd_consent_version: string;

  // Optional fields
  cpf?: string;
  rg?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  privacy_settings?: Partial<PrivacySettings>;
  communication_consent?: Partial<CommunicationConsent>;
}

/**
 * Patient Update Request (partial updates)
 */
export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  medical_history?: string;
  allergies?: string[];
  medications?: string[];
  photo_url?: string;
}

/**
 * Patient Data Export (LGPD Right to Data Portability)
 */
export interface PatientDataExport {
  patient: Patient;
  appointments: Array<{
    id: string;
    date: string;
    professional: string;
    service: string;
    status: string;
    notes?: string;
  }>;
  treatments?: Array<{
    id: string;
    type: string;
    date: string;
    description: string;
  }>;
  consent_history: Array<{
    date: string;
    version: string;
    ip_address?: string;
    user_agent?: string;
  }>;
  exported_at: string;
  exported_by: string;
}

/**
 * LGPD Consent Status
 */
export interface ConsentStatus {
  patient_id: string;
  current_version: string;
  consent_date: string;
  is_valid: boolean;
  expires_at?: string;
  requires_renewal: boolean;
  privacy_settings: PrivacySettings;
  communication_consent: CommunicationConsent;
}

/**
 * Consent Update Request
 */
export interface ConsentUpdate {
  lgpd_consent_version: string;
  privacy_settings?: Partial<PrivacySettings>;
  communication_consent?: Partial<CommunicationConsent>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Patient Search/Filter Parameters
 */
export interface PatientQueryParams {
  clinic_id: string;
  search?: string;              // Search in name, email, phone
  cpf?: string;                 // Exact CPF match
  active_only?: boolean;        // Exclude soft-deleted
  has_appointments?: boolean;   // Filter by appointment history
  created_after?: string;       // ISO date
  created_before?: string;      // ISO date
  page?: number;
  limit?: number;
}