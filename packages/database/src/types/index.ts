/**
 * Database types and interfaces for package
 */

export interface DatabasePatient {
  id: string
  clinic_id: string
  medical_record_number: string
  external_ids?: Record<string, unknown>
  given_names?: string[]
  family_name?: string
  full_name?: string
  preferred_name?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  is_active?: boolean
  deceased_indicator?: boolean
  deceased_date?: string
  data_consent_status?: string
  data_consent_date?: string
  data_retention_until?: string
  data_source?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  photo_url?: string
  cpf?: string
  rg?: string
  passport_number?: string
  preferred_contact_method?: string
  blood_type?: string
  allergies?: string[]
  chronic_conditions?: string[]
  current_medications?: string[]
  insurance_provider?: string
  insurance_number?: string
  insurance_plan?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  lgpd_consent_given?: boolean
}

/**
 * Query options for patient search and filtering
 */
export interface PatientQueryOptions {
  /** Search query string */
  search?: string
  /** Patient status filter */
  status?: string
  /** Maximum number of results to return */
  limit?: number
  /** Offset for pagination */
  offset?: number
  /** Field to sort by */
  sortBy?: string
  /** Sort order: 'asc' or 'desc' */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Search result interface for patient queries
 */
export interface PatientSearchResult {
  /** Array of matching patients */
  patients: any[]
  /** Total number of matching patients */
  total: number
  /** Limit applied to this result */
  limit: number
  /** Offset applied to this result */
  offset: number
}
