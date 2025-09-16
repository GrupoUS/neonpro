# Data Model: Patient Dashboard Enhancement

**Feature**: Patient Dashboard Enhancement with Modern UI Components  
**Generated**: 2025-01-15  
**Compliance**: LGPD, ANVISA, CFM  
**Database**: Supabase PostgreSQL with Row Level Security (RLS)

## Overview

This data model supports the modernized patient dashboard with Brazilian healthcare compliance, AI-enhanced features, and real-time operations. All entities include LGPD compliance fields, audit trails, and support for mobile-first workflows.

## Core Entities

### 1. Patient Record (Core Entity)

**Purpose**: Central entity representing individuals receiving healthcare services at aesthetic clinics.

**Constitutional Requirements**:
- LGPD compliance with encrypted PII storage
- Row Level Security (RLS) for multi-tenant access
- Audit trail for all data access and modifications
- Brazilian-specific data validation (CPF, phone, address)

```typescript
interface Patient {
  // Primary Identity
  id: string;                    // UUID primary key
  patient_number: string;        // Clinic-generated patient number
  
  // Personal Information (LGPD Protected)
  cpf: string;                   // Encrypted CPF (Brazilian tax ID)
  rg?: string;                   // Encrypted RG (Brazilian ID)
  full_name: string;             // Legal full name
  preferred_name?: string;       // Name used in clinic interactions
  birth_date: Date;              // Date of birth
  gender: GenderType;            // Gender identity
  
  // Contact Information
  email: string;                 // Primary email address
  phone: string;                 // Brazilian-formatted phone number
  whatsapp?: string;             // WhatsApp number (if different)
  
  // Address Information
  address: {
    street: string;              // Street address
    number: string;              // Address number
    complement?: string;         // Apartment, suite, etc.
    neighborhood: string;        // Neighborhood/district
    city: string;                // City name
    state: string;               // Brazilian state (2-letter code)
    zip_code: string;           // CEP (Brazilian postal code)
    country: string;            // Default: "BR"
  };
  
  // Medical Information
  allergies?: string[];          // Known allergies
  medications?: string[];        // Current medications
  medical_conditions?: string[]; // Existing medical conditions
  emergency_contact: {
    name: string;               // Emergency contact name
    relationship: string;       // Relationship to patient
    phone: string;             // Emergency contact phone
  };
  
  // Insurance & Healthcare
  insurance_provider?: string;   // Health insurance provider
  insurance_number?: string;     // Insurance policy number
  
  // Clinic Workflow
  status: PatientStatus;         // Active, Inactive, Suspended
  preferred_language: string;    // Default: "pt-BR"
  notes?: string;               // Internal clinic notes
  
  // LGPD Compliance
  consent_records: ConsentRecord[]; // LGPD consent history
  data_retention_until?: Date;   // Data retention expiry
  marketing_consent: boolean;    // Marketing communication consent
  data_sharing_consent: boolean; // Third-party data sharing consent
  
  // Audit Trail (Constitutional Requirement)
  created_at: Date;             // Record creation timestamp
  updated_at: Date;             // Last modification timestamp
  created_by: string;           // User ID who created record
  updated_by: string;           // User ID who last updated record
  clinic_id: string;            // Multi-tenant clinic isolation (RLS)
  
  // Soft Delete Support
  deleted_at?: Date;            // Soft delete timestamp
  deleted_by?: string;          // User who deleted record
}

// Supporting Types
type GenderType = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';
type PatientStatus = 'active' | 'inactive' | 'suspended' | 'pending-review';
```

### 2. Medical History (Temporal Medical Data)

**Purpose**: Historical medical data associated with patients including treatments, procedures, and outcomes.

```typescript
interface MedicalHistory {
  // Primary Identity
  id: string;                   // UUID primary key
  patient_id: string;           // Foreign key to Patient
  
  // Medical Event Details
  event_type: MedicalEventType; // Type of medical event
  event_date: Date;             // Date of medical event
  procedure_code?: string;      // Medical procedure code (if applicable)
  description: string;          // Detailed description of event
  
  // Treatment Information
  treatment_area?: string;      // Body area treated (for aesthetic procedures)
  equipment_used?: string[];    // Medical equipment used (ANVISA tracked)
  medications_prescribed?: string[]; // Medications prescribed
  
  // Outcomes & Results
  outcome: TreatmentOutcome;    // Treatment outcome classification
  side_effects?: string[];      // Observed side effects
  patient_satisfaction?: number; // Patient satisfaction score (1-10)
  follow_up_required: boolean;  // Whether follow-up is needed
  follow_up_date?: Date;        // Scheduled follow-up date
  
  // Clinical Documentation
  clinical_notes: string;       // Clinical observations
  before_photos?: string[];     // Before treatment photos (encrypted URLs)
  after_photos?: string[];      // After treatment photos (encrypted URLs)
  
  // Professional Information
  performed_by: string;         // Healthcare professional ID
  professional_license: string; // Professional license number (CFM validation)
  supervised_by?: string;       // Supervising physician (if applicable)
  
  // Compliance & Quality
  informed_consent_signed: boolean; // Informed consent documentation
  anvisa_notification_id?: string;  // ANVISA notification (if required)
  quality_indicators: {
    pain_level?: number;        // Pain level reported (1-10)
    recovery_time?: number;     // Recovery time in days
    complications?: string[];   // Any complications observed
  };
  
  // Audit Trail
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  clinic_id: string;            // RLS clinic isolation
  
  // Soft Delete
  deleted_at?: Date;
  deleted_by?: string;
}

// Supporting Types
type MedicalEventType = 
  | 'consultation' 
  | 'treatment' 
  | 'procedure' 
  | 'follow-up' 
  | 'emergency' 
  | 'screening';

type TreatmentOutcome = 
  | 'excellent' 
  | 'good' 
  | 'satisfactory' 
  | 'poor' 
  | 'complications' 
  | 'pending';
```

### 3. Contact Information (Structured Communication Data)

**Purpose**: Comprehensive contact management with Brazilian formatting and communication preferences.

```typescript
interface ContactInformation {
  // Primary Identity
  id: string;                   // UUID primary key
  patient_id: string;           // Foreign key to Patient
  
  // Contact Details
  contact_type: ContactType;    // Type of contact information
  value: string;                // Contact value (phone, email, etc.)
  country_code?: string;        // Country code for phone numbers
  is_primary: boolean;          // Primary contact method
  is_verified: boolean;         // Whether contact is verified
  
  // Brazilian Specific
  formatted_value: string;      // Brazilian-formatted display value
  carrier_info?: {              // For phone numbers
    carrier: string;            // Mobile carrier (Vivo, Claro, TIM, Oi)
    is_whatsapp: boolean;       // WhatsApp availability
    sms_enabled: boolean;       // SMS capability
  };
  
  // Communication Preferences
  preferred_time: {
    start_hour: number;         // Preferred contact start hour (0-23)
    end_hour: number;           // Preferred contact end hour (0-23)
    days_of_week: number[];     // Preferred days (0=Sunday, 6=Saturday)
    timezone: string;           // Default: "America/Sao_Paulo"
  };
  
  // Privacy & Consent
  can_contact_marketing: boolean;    // Marketing communication consent
  can_contact_appointment: boolean;  // Appointment reminders consent
  can_contact_emergency: boolean;    // Emergency contact consent
  lgpd_consent_date: Date;          // LGPD consent timestamp
  
  // Validation & Quality
  last_verified: Date;          // Last verification timestamp
  verification_method?: string; // How contact was verified
  delivery_status?: {           // For messaging
    last_successful: Date;      // Last successful delivery
    failed_attempts: number;    // Failed delivery attempts
    is_blocked: boolean;        // Blocked/bounced status
  };
  
  // Audit Trail
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  clinic_id: string;
  
  // Soft Delete
  deleted_at?: Date;
  deleted_by?: string;
}

// Supporting Types
type ContactType = 
  | 'email' 
  | 'phone' 
  | 'whatsapp' 
  | 'telegram' 
  | 'address' 
  | 'emergency';
```

### 4. LGPD Consent (Legal Consent Tracking)

**Purpose**: Comprehensive LGPD consent management with granular permissions and audit trails.

```typescript
interface LGPDConsent {
  // Primary Identity
  id: string;                   // UUID primary key
  patient_id: string;           // Foreign key to Patient
  
  // Consent Details
  consent_version: string;      // Consent form version (for tracking changes)
  consent_type: ConsentType;    // Type of consent given
  consent_status: ConsentStatus; // Current status of consent
  
  // Granular Permissions
  permissions: {
    data_processing: boolean;           // Basic data processing
    data_storage: boolean;              // Data storage beyond treatment
    marketing_communication: boolean;   // Marketing emails/SMS
    research_participation: boolean;    // Anonymous research participation
    data_sharing_partners: boolean;     // Sharing with trusted partners
    photo_video_usage: boolean;         // Use of photos/videos for marketing
    treatment_reminders: boolean;       // Appointment and treatment reminders
    satisfaction_surveys: boolean;      // Post-treatment surveys
  };
  
  // Legal Documentation
  consent_text: string;         // Full consent text presented to user
  consent_language: string;     // Language of consent (default: "pt-BR")
  legal_basis: string;          // LGPD legal basis for processing
  
  // Technical Details
  ip_address: string;           // IP address when consent given
  user_agent: string;           // Browser/device information
  consent_method: ConsentMethod; // How consent was obtained
  digital_signature?: string;   // Digital signature (if applicable)
  
  // Temporal Information
  given_at: Date;               // When consent was given
  expires_at?: Date;            // Consent expiration (if applicable)
  withdrawn_at?: Date;          // When consent was withdrawn
  last_confirmed_at?: Date;     // Last time consent was reconfirmed
  
  // Withdrawal Information
  withdrawal_reason?: string;   // Reason for withdrawal
  withdrawal_method?: string;   // How consent was withdrawn
  withdrawal_ip?: string;       // IP address for withdrawal
  
  // Compliance Tracking
  processing_purposes: string[]; // Specific purposes for data processing
  data_categories: string[];    // Categories of data being processed
  retention_period: string;     // How long data will be retained
  third_party_sharing: {        // Third-party sharing details
    enabled: boolean;
    partners: string[];         // List of partners (if enabled)
    purposes: string[];         // Purposes for sharing
  };
  
  // Audit Trail
  created_at: Date;
  updated_at: Date;
  created_by: string;           // System or user who recorded consent
  clinic_id: string;
  
  // Compliance History
  consent_history: ConsentHistoryEntry[]; // Previous consent versions
}

// Supporting Types
type ConsentType = 
  | 'initial_registration' 
  | 'treatment_specific' 
  | 'marketing_consent' 
  | 'research_participation' 
  | 'data_sharing';

type ConsentStatus = 
  | 'given' 
  | 'withdrawn' 
  | 'expired' 
  | 'pending_renewal';

type ConsentMethod = 
  | 'online_form' 
  | 'paper_form' 
  | 'verbal_recorded' 
  | 'digital_signature' 
  | 'biometric';

interface ConsentHistoryEntry {
  version: string;
  status: ConsentStatus;
  changed_at: Date;
  changed_by: string;
  change_reason: string;
}
```

## Relationships & Constraints

### Entity Relationships
```sql
-- Primary relationships
Patient 1:N MedicalHistory
Patient 1:N ContactInformation  
Patient 1:N LGPDConsent

-- Clinic multi-tenancy (RLS)
ALL entities MUST include clinic_id for Row Level Security

-- Audit trail requirements
ALL entities MUST include: created_at, updated_at, created_by, updated_by

-- Soft delete support
ALL entities SHOULD include: deleted_at, deleted_by for data retention compliance
```

### Database Constraints

#### Primary Keys & Indexes
```sql
-- Primary keys: UUID v4 for all entities
-- Composite indexes for performance:
CREATE INDEX idx_patient_clinic_status ON patients(clinic_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_medical_history_patient_date ON medical_history(patient_id, event_date DESC);
CREATE INDEX idx_contact_patient_primary ON contact_information(patient_id) WHERE is_primary = true;
CREATE INDEX idx_consent_patient_active ON lgpd_consent(patient_id) WHERE consent_status = 'given';

-- Full-text search for patient search
CREATE INDEX idx_patient_search ON patients USING gin(
  to_tsvector('portuguese', full_name || ' ' || preferred_name || ' ' || cpf)
);
```

#### LGPD Compliance Constraints
```sql
-- Ensure LGPD consent exists before processing sensitive data
ALTER TABLE patients ADD CONSTRAINT ensure_lgpd_consent 
  CHECK (EXISTS (
    SELECT 1 FROM lgpd_consent 
    WHERE patient_id = patients.id 
    AND consent_status = 'given' 
    AND consent_type = 'initial_registration'
  ));

-- Encrypt sensitive PII fields
-- CPF and RG must be encrypted using PostgreSQL pgcrypto
-- Implementation: bytea columns with AES encryption
```

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consent ENABLE ROW LEVEL SECURITY;

-- Clinic isolation policy (example for patients table)
CREATE POLICY clinic_isolation ON patients 
  FOR ALL 
  TO authenticated 
  USING (clinic_id = current_setting('app.current_clinic_id'));
```

## Validation Rules

### Brazilian-Specific Validation

#### CPF (Cadastro de Pessoas Físicas)
```typescript
const validateCPF = (cpf: string): boolean => {
  // Remove formatting
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Check length and known invalid patterns
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // All same digits
  
  // Validate check digits using Brazilian CPF algorithm
  const digits = cleanCPF.split('').map(Number);
  
  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const firstCheck = ((sum * 10) % 11) % 10;
  if (firstCheck !== digits[9]) return false;
  
  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const secondCheck = ((sum * 10) % 11) % 10;
  return secondCheck === digits[10];
};
```

#### Brazilian Phone Number
```typescript
const validateBrazilianPhone = (phone: string): boolean => {
  // Remove formatting
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Mobile: 11 digits (55 + 2-digit area code + 9-digit number)
  // Landline: 10 digits (55 + 2-digit area code + 8-digit number)
  // With country code: +55 + area code + number
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('55')) {
    // Mobile with country code
    return /^55[1-9][1-9]9\d{8}$/.test(cleanPhone);
  } else if (cleanPhone.length === 10 && cleanPhone.startsWith('55')) {
    // Landline with country code
    return /^55[1-9][1-9]\d{8}$/.test(cleanPhone);
  } else if (cleanPhone.length === 11) {
    // Mobile without country code
    return /^[1-9][1-9]9\d{8}$/.test(cleanPhone);
  } else if (cleanPhone.length === 10) {
    // Landline without country code
    return /^[1-9][1-9]\d{8}$/.test(cleanPhone);
  }
  
  return false;
};
```

#### CEP (Postal Code)
```typescript
const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return /^\d{8}$/.test(cleanCEP);
};

// CEP lookup for address auto-completion
const lookupCEP = async (cep: string): Promise<AddressInfo | null> => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  if (!validateCEP(cleanCEP)) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      zip_code: cleanCEP
    };
  } catch (error) {
    return null;
  }
};
```

## Performance Optimization

### Search & Filtering Performance
```sql
-- Patient search with performance optimization
CREATE OR REPLACE FUNCTION search_patients(
  search_term TEXT,
  clinic_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  patient_id UUID,
  full_name TEXT,
  preferred_name TEXT,
  cpf TEXT,
  phone TEXT,
  status patient_status,
  last_visit DATE,
  rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.preferred_name,
    CASE 
      WHEN current_setting('app.user_role') = 'admin' 
      THEN decrypt(p.cpf_encrypted, current_setting('app.encryption_key'))
      ELSE '***.***.***-**'
    END,
    p.phone,
    p.status,
    (SELECT MAX(mh.event_date) FROM medical_history mh WHERE mh.patient_id = p.id),
    ts_rank(
      to_tsvector('portuguese', p.full_name || ' ' || COALESCE(p.preferred_name, '')),
      plainto_tsquery('portuguese', search_term)
    ) as search_rank
  FROM patients p
  WHERE 
    p.clinic_id = clinic_id_param
    AND p.deleted_at IS NULL
    AND (
      search_term IS NULL OR
      to_tsvector('portuguese', p.full_name || ' ' || COALESCE(p.preferred_name, '')) 
      @@ plainto_tsquery('portuguese', search_term)
      OR p.phone LIKE '%' || search_term || '%'
      OR (
        current_setting('app.user_role') = 'admin' AND
        decrypt(p.cpf_encrypted, current_setting('app.encryption_key')) LIKE '%' || search_term || '%'
      )
    )
  ORDER BY search_rank DESC NULLS LAST, p.full_name
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;
```

### Real-time Subscriptions
```sql
-- Enable real-time for patient updates
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE medical_history;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_information;

-- Optimized subscription filters
-- Subscribe only to specific clinic data to reduce bandwidth
```

## Security Considerations

### Data Encryption
- **PII Fields**: CPF, RG stored as encrypted bytea using AES-256
- **Photos**: Treatment photos encrypted and stored in secure cloud storage
- **API Communication**: All API calls use HTTPS with certificate pinning
- **Database**: TDE (Transparent Data Encryption) enabled

### Access Control
- **Role-Based Access**: Different permissions for doctors, nurses, admins
- **Field-Level Security**: Sensitive fields masked based on user role
- **Audit Logging**: All data access logged with user context
- **Session Management**: Automatic timeout and secure session storage

### LGPD Compliance Features
- **Right to Access**: Patients can request all their data
- **Right to Rectification**: Patients can update their information
- **Right to Erasure**: Soft delete with data retention policies
- **Data Portability**: Export patient data in standard formats
- **Consent Management**: Granular consent with withdrawal options

---

**Data Model Status**: ✅ COMPLETED  
**LGPD Compliance**: ✅ VALIDATED  
**Constitutional Alignment**: ✅ CONFIRMED  
**Next Phase**: API Contracts & Test Generation