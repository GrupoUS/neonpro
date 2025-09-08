# Database Tables Reference - Version: 1.0.0

## Overview

Complete table reference for NeonPro advanced aesthetic clinic operations on **Supabase PostgreSQL 17**. All tables implement LGPD/ANVISA/CFM compliance with constitutional security patterns.

## Prerequisites

- Supabase project with PostgreSQL 17
- Row Level Security (RLS) enabled on all healthcare tables
- pgvector, uuid-ossp, pgcrypto extensions enabled
- Understanding of Brazilian healthcare regulations (LGPD, ANVISA, CFM)

## Quick Start

```sql
-- Enable RLS for healthcare data protection
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create professional access policy
CREATE POLICY "professionals_clinic_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = table_name.clinic_id
      AND p.is_active = true
    )
  );
```

## Core Healthcare Tables

### patients

**Purpose**: Patient records and demographics with LGPD compliance
**LGPD Status**: ✅ Sensitive Personal Data + Health Data
**Data Retention**: 7 years minimum (Brazilian medical records law)

#### Schema Essentials

```sql
CREATE TABLE patients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid NOT NULL REFERENCES clinics(id),
  medical_record_number varchar(100) NOT NULL UNIQUE,
  full_name             text NOT NULL,
  cpf                   text UNIQUE, -- Encrypted at rest
  birth_date            date,
  phone_primary         varchar(20),
  email                 varchar(255),
  -- LGPD compliance fields
  lgpd_consent_given    boolean NOT NULL DEFAULT false,
  data_retention_until  date,
  -- AI analytics fields
  no_show_risk_score    integer DEFAULT 0,
  -- Audit fields
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
```

#### RLS Policies

```sql
-- Professionals access patients in their clinic
CREATE POLICY "professionals_clinic_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = patients.clinic_id
      AND p.is_active = true
    )
  );

-- Patients access own data only
CREATE POLICY "patients_own_data" ON patients
  FOR SELECT USING (auth.uid()::text = id::text);
```

### professionals

**Purpose**: Healthcare professionals with license validation
**LGPD Status**: ✅ Personal Data + Professional Data
**CFM Requirements**: Professional license validation and tracking

#### Schema Essentials

```sql
CREATE TABLE professionals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  user_id             uuid REFERENCES auth.users(id),
  full_name           varchar(255) NOT NULL,
  specialization      varchar(255),
  license_number      varchar(100), -- CRM, CRO, etc.
  email               varchar(255),
  is_active           boolean DEFAULT true,
  service_type_ids    uuid[], -- Services professional can perform
  created_at          timestamptz DEFAULT now()
);
```

### appointments

**Purpose**: Appointment scheduling and management
**LGPD Status**: ✅ Personal Data + Health Data
**Business Rules**: Conflict prevention, status flow validation

#### Schema Essentials

```sql
CREATE TABLE appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  patient_id      uuid NOT NULL REFERENCES patients(id),
  professional_id uuid NOT NULL REFERENCES professionals(id),
  service_type_id uuid NOT NULL REFERENCES services(id),
  status          varchar(50) DEFAULT 'scheduled',
  start_time      timestamptz NOT NULL,
  end_time        timestamptz NOT NULL,
  notes           text,
  created_at      timestamptz DEFAULT now()
);
```

#### Status Flow

```
scheduled → confirmed → checked_in → in_progress → completed
         ↘ cancelled ↗           ↘ no_show
```

### medical_records

**Purpose**: Advanced aesthetic medical information (most sensitive)
**LGPD Status**: ⚠️ Special Category Data - Enhanced protection required
**CFM Requirements**: 20-year retention, digital signature, professional accountability

#### Schema Essentials

```sql
CREATE TABLE medical_records (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             uuid NOT NULL REFERENCES clinics(id),
  patient_id            uuid NOT NULL REFERENCES patients(id),
  professional_id       uuid NOT NULL REFERENCES professionals(id),
  appointment_id        uuid REFERENCES appointments(id),
  visit_date            timestamptz NOT NULL DEFAULT now(),
  chief_complaint       text,
  assessment_diagnosis  text,
  treatment_plan        text,
  -- Digital signature for CFM compliance
  digital_signature     text,
  signature_timestamp   timestamptz,
  signature_verified    boolean NOT NULL DEFAULT false,
  -- Record integrity
  record_integrity_hash text,
  -- AI features
  quality_score         integer DEFAULT 100,
  ai_suggestions        jsonb DEFAULT '{}',
  -- LGPD compliance
  consent_status        varchar(20) NOT NULL DEFAULT 'valid',
  retention_until       timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);
```

### services

**Purpose**: Advanced aesthetic services and procedures catalog
**LGPD Status**: ✅ Business Data
**ANVISA Requirements**: Advanced aesthetic procedure classification

#### Schema Essentials

```sql
CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  duration_minutes integer DEFAULT 60,
  price            numeric NOT NULL,
  category         text, -- facial, body, laser, injectable
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);
```

### clinics

**Purpose**: Multi-tenant clinic management with regulatory compliance
**LGPD Status**: ✅ Business Data + Compliance Data
**Regulatory**: ANVISA, CFM, CNES registration tracking

#### Schema Essentials

```sql
CREATE TABLE clinics (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_code            varchar(20) NOT NULL UNIQUE,
  clinic_name            varchar(255) NOT NULL,
  tax_id                 varchar(20), -- CNPJ
  anvisa_license         varchar(50),
  cfm_registration       text,
  cnes_code              text,
  -- LGPD compliance
  lgpd_responsible_name  text,
  lgpd_responsible_email text,
  privacy_policy_url     text,
  is_active              boolean DEFAULT true,
  created_at             timestamptz DEFAULT now()
);
```

## AI Integration Tables

### ai_chat_sessions

**Purpose**: AI conversation sessions with healthcare professional oversight
**LGPD Status**: ✅ Personal Data (PHI-sanitized)
**AI Safety**: Professional oversight required, no PHI storage

#### Schema Essentials

```sql
CREATE TABLE ai_chat_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id),
  clinic_id       uuid REFERENCES clinics(id),
  session_type    varchar(50) NOT NULL DEFAULT 'general',
  title           varchar(255),
  status          varchar(20) DEFAULT 'active',
  context         jsonb DEFAULT '{}', -- AI configuration
  metadata        jsonb DEFAULT '{}', -- Performance metrics
  last_message_at timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);
```

### ai_chat_messages

**Purpose**: AI conversation messages with PHI sanitization
**LGPD Status**: ✅ Health Data (Sanitized) - All PHI removed before storage
**Compliance**: Complete audit trail for AI-assisted healthcare decisions

#### Schema Essentials

```sql
CREATE TABLE ai_chat_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES ai_chat_sessions(id),
  role             varchar(20) NOT NULL, -- user, assistant, system, tool
  content          text NOT NULL, -- PHI-sanitized content only
  tokens_used      integer DEFAULT 0,
  model_used       varchar(100),
  response_time_ms integer,
  confidence_score numeric,
  compliance_flags jsonb DEFAULT '{}', -- Safety and compliance monitoring
  created_at       timestamptz DEFAULT now()
);
```

## Compliance & Audit Tables

### audit_logs

**Purpose**: Immutable audit trail for all system activities
**LGPD Status**: ✅ Audit Data - Comprehensive compliance tracking
**Retention**: 10 years minimum for healthcare audit logs

#### Schema Essentials

```sql
CREATE TABLE audit_logs (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id              uuid NOT NULL REFERENCES clinics(id),
  user_id                uuid REFERENCES professionals(id),
  table_name             varchar(100) NOT NULL,
  record_id              uuid,
  action_type            varchar(20) NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
  action_description     text NOT NULL,
  old_values             jsonb,
  new_values             jsonb,
  ip_address             inet,
  user_agent             text,
  -- LGPD compliance tracking
  data_classification    varchar(30) NOT NULL DEFAULT 'public',
  phi_accessed           boolean NOT NULL DEFAULT false,
  consent_verified       boolean,
  emergency_access       boolean NOT NULL DEFAULT false,
  -- Risk assessment
  risk_score             integer DEFAULT 0, -- 0-100
  -- Immutable audit trail
  created_at             timestamptz NOT NULL DEFAULT now()
  -- NO updated_at - audit logs are immutable
);
```

#### Security Features

```sql
-- Audit logs are immutable - prevent updates
CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Real-time security monitoring for high-risk actions
CREATE TRIGGER audit_logs_security_monitoring
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  WHEN (NEW.risk_score > 80 OR NEW.emergency_access = true)
  EXECUTE FUNCTION security_alert_notification();
```

### compliance_tracking

**Purpose**: Compliance monitoring across LGPD/ANVISA/CFM regulations
**LGPD Status**: ✅ Compliance Data - Tracks all regulatory requirements
**Automation**: Automated compliance checks with remediation tracking

#### Schema Essentials

```sql
CREATE TABLE compliance_tracking (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id                uuid NOT NULL REFERENCES clinics(id),
  patient_id               uuid REFERENCES patients(id),
  professional_id          uuid REFERENCES professionals(id),
  compliance_type          varchar(50) NOT NULL, -- LGPD, ANVISA, CFM
  regulation_reference     varchar(100) NOT NULL, -- Specific article/section
  check_description        text NOT NULL,
  current_status           varchar(20) NOT NULL DEFAULT 'compliant',
  risk_level               varchar(10) NOT NULL DEFAULT 'low',
  automated_check          boolean NOT NULL DEFAULT true,
  next_check_due           timestamptz,
  remediation_required     boolean NOT NULL DEFAULT false,
  remediation_deadline     timestamptz,
  compliance_score         integer DEFAULT 100, -- 0-100
  -- Specific compliance areas
  data_retention_compliant boolean NOT NULL DEFAULT true,
  consent_compliant        boolean NOT NULL DEFAULT true,
  security_compliant       boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now()
);
```

## Universal Healthcare Compliance

### LGPD (Lei Geral de Proteção de Dados) Requirements

**Data Classification System:**

- **Public**: Identifiers, metadata (id, created_at)
- **Personal Data**: Names, contact info, demographics
- **Sensitive Personal Data**: CPF, RG, passport numbers (encrypted)
- **Health Data**: Medical information, treatments, diagnoses
- **Special Category Data**: Requires enhanced protection (medical_records)

**Patient Rights Implementation:**

- **Right to Access**: RLS policies + patient portal access
- **Right to Rectification**: Audit trail for all data modifications
- **Right to Erasure**: CASCADE DELETE relationships + anonymization
- **Right to Portability**: JSON export functions for data portability

### ANVISA (Medical Device Software) Requirements

**Class IIa Compliance:**

- Quality management system audit trails
- Risk management logging (ISO 14971)
- Post-market surveillance monitoring
- Clinical evaluation documentation

### CFM (Federal Council of Medicine) Requirements

**Medical Record Standards (CFM Resolution 1821/2007):**

- Digital signature requirements for professionals
- 20-year retention for advanced aesthetic records
- Professional accountability tracking
- Telemedicine compliance (CFM Resolution 2314/2022)

## Row Level Security (RLS) Patterns

### Standard Healthcare RLS

```sql
-- Template: Professional clinic access
CREATE POLICY "professionals_clinic_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = table_name.clinic_id
      AND p.is_active = true
    )
  );

-- Template: Patient self-access
CREATE POLICY "patients_own_data" ON table_name
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE auth.uid()::text = id::text
    ) AND
    validate_lgpd_consent(patient_id, 'self_access') = true
  );

-- Template: Emergency access with logging
CREATE POLICY "emergency_access" ON table_name
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'emergency_professional' AND
    EXISTS (
      SELECT 1 FROM emergency_access_log
      WHERE patient_id = table_name.patient_id
      AND created_at > NOW() - INTERVAL '24 hours'
    )
  );
```

## Common Triggers & Automation

### Audit Trail Automation

```sql
-- Universal audit trigger for all healthcare tables
CREATE TRIGGER table_name_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER table_name_updated_at_trigger
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### LGPD Compliance Automation

```sql
-- Consent validation before data processing
CREATE TRIGGER table_name_consent_validation
  BEFORE INSERT OR UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION validate_lgpd_consent();

-- Automatic data retention policy enforcement
CREATE TRIGGER table_name_retention_enforcement
  AFTER UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION enforce_data_retention_policy();
```

## Performance Optimization

### Standard Indexes

```sql
-- Template: Core healthcare table indexes
CREATE INDEX idx_table_name_clinic_id ON table_name(clinic_id);
CREATE INDEX idx_table_name_patient_id ON table_name(patient_id);
CREATE INDEX idx_table_name_professional_id ON table_name(professional_id);
CREATE INDEX idx_table_name_created_at ON table_name(created_at DESC);

-- Template: LGPD compliance indexes
CREATE INDEX idx_table_name_consent ON table_name(consent_status) WHERE consent_status != 'valid';
CREATE INDEX idx_table_name_retention ON table_name(retention_until) WHERE retention_until IS NOT NULL;
```

### Query Patterns

```sql
-- Professional accessing patient data with consent validation
SELECT * FROM patients
WHERE clinic_id = $1
  AND validate_lgpd_consent(id, 'medical_access') = true
  AND created_at > NOW() - INTERVAL '1 year';

-- Appointment conflict prevention
SELECT * FROM appointments
WHERE professional_id = $1
  AND start_time < $2
  AND end_time > $3
  AND status NOT IN ('cancelled', 'no_show');
```

## AI Integration Patterns

### PHI Sanitization

```sql
-- Automatic PHI removal before AI processing
CREATE TRIGGER ai_message_phi_sanitization
  BEFORE INSERT OR UPDATE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_phi_content();

-- AI safety compliance monitoring
CREATE TRIGGER ai_safety_monitor
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION monitor_ai_safety_compliance();
```

### Healthcare AI Tools

```json
{
  "patient_lookup": "Search anonymized patient information",
  "medication_check": "Verify drug interactions and dosages",
  "icd10_search": "Search ICD-10 diagnostic codes",
  "emergency_protocols": "Emergency response assistance",
  "compliance_check": "Regulatory compliance verification"
}
```

## Troubleshooting

### Common Issues

**RLS Policy Not Working:**

- Verify `auth.uid()` returns expected user ID
- Check professional/patient relationship in junction tables
- Ensure `is_active = true` conditions are met

**LGPD Consent Validation Failing:**

- Verify consent records exist with status 'granted'
- Check consent expiration dates
- Validate processing purpose matches consent scope

**Audit Logs Not Generated:**

- Ensure audit triggers are installed on all healthcare tables
- Verify `create_audit_log()` function exists and has correct permissions
- Check audit_logs table permissions for INSERT operations

### Performance Issues

**Slow Patient Queries:**

- Add composite index: `(clinic_id, is_active, created_at)`
- Use LIMIT clauses for large result sets
- Consider patient data archival for old records

**RLS Policy Overhead:**

- Cache professional-clinic relationships in application layer
- Use prepared statements for repeated RLS queries
- Monitor query execution plans for policy efficiency

---

> **Security Notice**: All healthcare tables contain sensitive information protected by Brazilian regulations. Access is strictly controlled through RLS policies, comprehensive audit logging, and regulatory compliance monitoring.

> **Developer Tip**: Always test RLS policies in development environment before production deployment. Use `SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims TO '{"sub": "user-id", "role": "professional"}';` for RLS testing.
