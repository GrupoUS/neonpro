# Data Model: Patient Dashboard Enhancement

**Feature**: Patient Dashboard Enhancement with Modern UI Components  
**Date**: 2025-01-15  
**Phase**: 1 - Data Model Design

## Overview

This document defines the data models and entities required for the enhanced patient dashboard. The enhancement builds upon existing NeonPro patient data structures while adding UI-specific optimizations and compliance tracking.

## Core Entity Enhancements

### Patient Entity (Enhanced)

The existing Patient entity is enhanced with additional fields for improved UI functionality:

```typescript
interface PatientEnhanced extends Patient {
  // Existing fields preserved from packages/types/src/Patient.ts
  id: string;
  cpf: string;
  rg?: string;
  full_name: string;
  preferred_name?: string;
  email: string;
  phone: BrazilianPhone;
  address: BrazilianAddress;
  birth_date: Date;
  gender: Gender;
  medical_history?: MedicalHistory[];
  allergies?: string[];
  medications?: Medication[];
  insurance?: InsuranceInfo;
  emergency_contact: EmergencyContact;
  consent_lgpd: LGPDConsent;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;

  // UI Enhancement fields
  ui_preferences?: PatientUIPreferences;
  registration_progress?: RegistrationProgress;
  last_accessed?: Date;
  access_count?: number;
  search_keywords?: string[]; // For improved search performance
}
```

### UI-Specific Data Models

#### PatientUIPreferences
```typescript
interface PatientUIPreferences {
  table_density: 'comfortable' | 'compact';
  visible_columns: string[];
  default_sort_field: string;
  default_sort_direction: 'asc' | 'desc';
  items_per_page: 25 | 50 | 100;
  mobile_view_preference: 'card' | 'list';
}
```

#### RegistrationProgress
```typescript
interface RegistrationProgress {
  current_step: number;
  total_steps: number;
  completed_steps: number[];
  saved_data: Record<string, any>;
  last_saved_at: Date;
  form_version: string;
}
```

### Form Data Models

#### PatientRegistrationForm
```typescript
interface PatientRegistrationForm {
  // Step 1: Personal Information
  personal_info: {
    full_name: string;
    preferred_name?: string;
    cpf: string;
    rg?: string;
    birth_date: Date;
    gender: Gender;
    marital_status?: MaritalStatus;
  };

  // Step 2: Contact Information
  contact_info: {
    email: string;
    phone: BrazilianPhone;
    secondary_phone?: BrazilianPhone;
    address: BrazilianAddress;
    preferred_contact_method: 'email' | 'phone' | 'sms' | 'whatsapp';
  };

  // Step 3: Medical Information
  medical_info: {
    medical_history?: MedicalHistory[];
    current_medications?: Medication[];
    allergies?: Allergy[];
    emergency_contact: EmergencyContact;
    insurance?: InsuranceInfo;
  };

  // Step 4: Compliance & Consent
  compliance: {
    consent_lgpd: LGPDConsent;
    marketing_consent?: boolean;
    data_sharing_consent?: boolean;
    terms_accepted: boolean;
    privacy_policy_accepted: boolean;
  };

  // Form metadata
  form_metadata: {
    started_at: Date;
    last_updated_at: Date;
    completed_at?: Date;
    ip_address: string;
    user_agent: string;
    form_version: string;
  };
}
```

### Brazilian-Specific Data Types

#### BrazilianPhone
```typescript
interface BrazilianPhone {
  country_code: '+55';
  area_code: string; // 2-digit area code
  number: string; // 8 or 9 digits
  formatted: string; // +55 (11) 99999-9999
  type: 'mobile' | 'landline' | 'commercial';
  whatsapp_enabled?: boolean;
}
```

#### BrazilianAddress
```typescript
interface BrazilianAddress {
  cep: string; // 12345-678 format
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: BrazilianState;
  country: 'Brasil';
  latitude?: number;
  longitude?: number;
  validated: boolean;
  validation_source?: 'correios' | 'google' | 'manual';
}
```

#### LGPDConsent (Enhanced)
```typescript
interface LGPDConsent {
  data_processing: boolean; // Required for basic operations
  data_processing_date: Date;
  
  marketing_communications?: boolean;
  marketing_date?: Date;
  
  data_sharing_third_parties?: boolean;
  sharing_date?: Date;
  
  research_participation?: boolean;
  research_date?: Date;
  
  // Audit information
  consent_version: string;
  ip_address: string;
  user_agent: string;
  consent_method: 'web_form' | 'paper' | 'verbal' | 'email';
  
  // Withdrawal tracking
  withdrawal_date?: Date;
  withdrawal_reason?: string;
  withdrawal_method?: string;
  
  // Legal basis
  legal_basis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests';
  processing_purpose: string[];
}
```

### Table and Filter Models

#### PatientTableState
```typescript
interface PatientTableState {
  filters: PatientFilters;
  sorting: SortingState;
  pagination: PaginationState;
  selection: RowSelectionState;
  column_visibility: Record<string, boolean>;
  search_query: string;
}

interface PatientFilters {
  name_search?: string;
  cpf_search?: string;
  email_search?: string;
  phone_search?: string;
  registration_date_range?: {
    start: Date;
    end: Date;
  };
  age_range?: {
    min: number;
    max: number;
  };
  gender?: Gender[];
  has_insurance?: boolean;
  consent_status?: ('active' | 'withdrawn' | 'expired')[];
  last_visit_range?: {
    start: Date;
    end: Date;
  };
  city?: string[];
  state?: BrazilianState[];
}

interface SortingState {
  field: keyof Patient;
  direction: 'asc' | 'desc';
}

interface PaginationState {
  page: number;
  per_page: 25 | 50 | 100;
  total_count: number;
  total_pages: number;
}

interface RowSelectionState {
  selected_ids: string[];
  select_all: boolean;
  exclude_ids?: string[];
}
```

### Bulk Operations Models

#### BulkOperation
```typescript
interface BulkOperation {
  operation_id: string;
  operation_type: 'update' | 'delete' | 'export' | 'send_communication';
  patient_ids: string[];
  operation_data: Record<string, any>;
  initiated_by: string;
  initiated_at: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress?: {
    total: number;
    completed: number;
    failed: number;
  };
  results?: BulkOperationResult[];
  completed_at?: Date;
  error_message?: string;
}

interface BulkOperationResult {
  patient_id: string;
  status: 'success' | 'failed' | 'skipped';
  error_message?: string;
  old_value?: any;
  new_value?: any;
}
```

### File Upload Models

#### PatientDocument
```typescript
interface PatientDocument {
  document_id: string;
  patient_id: string;
  document_type: 'identification' | 'medical_record' | 'insurance' | 'consent_form' | 'photo' | 'other';
  file_name: string;
  file_size: number;
  file_type: string; // MIME type
  storage_path: string;
  upload_date: Date;
  uploaded_by: string;
  description?: string;
  tags?: string[];
  is_sensitive: boolean;
  encryption_status: 'encrypted' | 'not_encrypted';
  access_permissions: string[]; // User roles that can access
  retention_date?: Date; // For compliance purposes
}
```

### Navigation and UI State Models

#### NavigationState
```typescript
interface NavigationState {
  current_patient?: string;
  sidebar_collapsed: boolean;
  breadcrumb_trail: BreadcrumbItem[];
  recent_patients: RecentPatient[];
  quick_actions: QuickAction[];
}

interface BreadcrumbItem {
  label: string;
  path: string;
  patient_id?: string;
  is_current: boolean;
}

interface RecentPatient {
  patient_id: string;
  patient_name: string;
  last_accessed: Date;
  access_context: 'view' | 'edit' | 'registration';
}

interface QuickAction {
  action_id: string;
  label: string;
  icon: string;
  keyboard_shortcut?: string;
  permission_required?: string;
  patient_context_required: boolean;
}
```

### Validation Schemas

#### Form Validation Rules
```typescript
// Zod schemas for form validation
const PatientRegistrationSchema = z.object({
  personal_info: z.object({
    full_name: z.string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo"),
    cpf: z.string()
      .refine(validateCPF, "CPF inválido"),
    birth_date: z.date()
      .max(new Date(), "Data de nascimento não pode ser futura")
      .min(new Date('1900-01-01'), "Data de nascimento inválida"),
  }),
  
  contact_info: z.object({
    email: z.string()
      .email("Email inválido")
      .max(254, "Email muito longo"),
    phone: z.object({
      area_code: z.string()
        .regex(/^\d{2}$/, "Código de área deve ter 2 dígitos"),
      number: z.string()
        .regex(/^\d{8,9}$/, "Número deve ter 8 ou 9 dígitos"),
    }),
    address: z.object({
      cep: z.string()
        .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
      street: z.string()
        .min(1, "Logradouro é obrigatório"),
      city: z.string()
        .min(1, "Cidade é obrigatória"),
      state: z.enum(BRAZILIAN_STATES),
    }),
  }),
  
  compliance: z.object({
    consent_lgpd: z.object({
      data_processing: z.literal(true, {
        errorMap: () => ({ message: "Consentimento obrigatório para processar dados" })
      }),
    }),
    terms_accepted: z.literal(true, {
      errorMap: () => ({ message: "Deve aceitar os termos de uso" })
    }),
  }),
});
```

## Data Relationships

### Primary Relationships
- Patient → PatientDocument (1:n)
- Patient → LGPDConsent (1:1, enhanced)
- Patient → RegistrationProgress (1:1)
- Patient → PatientUIPreferences (1:1)

### Audit Relationships
- Patient → AuditLog (1:n) - All patient data changes
- BulkOperation → BulkOperationResult (1:n)
- PatientDocument → AccessLog (1:n) - Document access tracking

### UI State Relationships
- User → NavigationState (1:1) - Per-user navigation preferences
- User → PatientTableState (1:1) - Per-user table preferences

## Performance Considerations

### Indexing Strategy
```sql
-- Enhanced indexes for improved search performance
CREATE INDEX idx_patients_search_keywords ON patients USING GIN(search_keywords);
CREATE INDEX idx_patients_full_name_trgm ON patients USING GIN(full_name gin_trgm_ops);
CREATE INDEX idx_patients_cpf_hash ON patients (cpf_hash); -- For privacy
CREATE INDEX idx_patients_registration_date ON patients (created_at);
CREATE INDEX idx_patients_last_accessed ON patients (last_accessed);
```

### Computed Fields
```sql
-- Virtual columns for improved search
ALTER TABLE patients ADD COLUMN search_text TEXT GENERATED ALWAYS AS (
  full_name || ' ' || cpf || ' ' || email || ' ' || phone_formatted
) STORED;

CREATE INDEX idx_patients_search_text ON patients USING GIN(to_tsvector('portuguese', search_text));
```

## Data Migration Notes

### Backward Compatibility
All enhancements are additive - no existing fields are modified or removed. New fields use nullable columns or have sensible defaults.

### Migration Steps
1. Add new columns to existing tables
2. Create new tables for UI-specific data
3. Populate default values for existing patients
4. Update application code to use enhanced models
5. Verify data integrity and performance

---
**Data Model Status**: ✅ Complete  
**Validation**: All models follow TypeScript strict typing  
**Compliance**: LGPD and ANVISA requirements integrated  
**Next Phase**: Contract generation and testing setup