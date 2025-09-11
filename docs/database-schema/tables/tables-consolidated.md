---
title: "NeonPro Database Tables Reference"
last_updated: 2025-09-10
form: reference
tags: [database, tables, supabase, healthcare, rls, lgpd]
related:
  - ../AGENTS.md
  - ../database-schema-consolidated.md
  - ../../apis/apis.md
---

# NeonPro Database Tables Reference

Complete table reference for NeonPro aesthetic clinic management platform.

**Tech Stack**: Supabase PostgreSQL 17 + TanStack Router + Vite + Hono
**Compliance**: LGPD + ANVISA + CFM requirements built-in
**Architecture**: Multi-tenant with Row Level Security (RLS)

## Core Healthcare Tables

### patients
**Purpose**: Patient records with LGPD compliance
**Compliance**: LGPD + 7-year retention requirement

```sql
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  cpf text UNIQUE, -- Encrypted at rest
  birth_date date,
  phone text,
  email text,
  -- LGPD compliance
  lgpd_consent_given boolean DEFAULT false,
  data_retention_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professionals_clinic_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = patients.clinic_id
      AND p.is_active = true
    )
  );
```

### professionals
**Purpose**: Healthcare professionals with CFM license validation

```sql
CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  license_number text, -- CRM, CRO, etc.
  professional_type text NOT NULL, -- doctor, dentist, nurse
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### appointments
**Purpose**: Appointment scheduling with conflict prevention

```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  patient_id uuid NOT NULL REFERENCES patients(id),
  professional_id uuid NOT NULL REFERENCES professionals(id),
  service_id uuid REFERENCES services(id),
  status appointment_status DEFAULT 'scheduled',
  scheduled_at timestamptz NOT NULL,
  duration_hours numeric(3,2) DEFAULT 1.0,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### medical_records
**Purpose**: Medical records with CFM digital signature compliance

```sql
CREATE TABLE medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  patient_id uuid NOT NULL REFERENCES patients(id),
  professional_id uuid NOT NULL REFERENCES professionals(id),
  appointment_id uuid REFERENCES appointments(id),
  visit_date timestamptz NOT NULL DEFAULT now(),
  chief_complaint text,
  treatment_plan text,
  digital_signature text, -- CFM requirement
  signed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### services
**Purpose**: Aesthetic services catalog

```sql
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 60,
  price numeric NOT NULL,
  category text, -- facial, body, laser, injectable
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### clinics
**Purpose**: Multi-tenant clinic management with regulatory compliance

```sql
CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text, -- CNPJ
  anvisa_license text,
  cfm_registration text,
  lgpd_responsible_email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

## AI Integration Tables

### ai_chat_sessions
**Purpose**: AI conversation sessions with PHI sanitization

```sql
CREATE TABLE ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  clinic_id uuid REFERENCES clinics(id),
  title text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
```

### ai_chat_messages
**Purpose**: AI messages with compliance monitoring

```sql
CREATE TABLE ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ai_chat_sessions(id),
  role text NOT NULL, -- user, assistant, system
  content text NOT NULL, -- PHI-sanitized only
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

## Compliance & Audit Tables

### audit_logs
**Purpose**: Immutable audit trail for LGPD compliance

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL, -- INSERT, UPDATE, DELETE
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES auth.users(id),
  phi_accessed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### consent_records
**Purpose**: LGPD consent management

```sql
CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  purpose text NOT NULL, -- medical_treatment, ai_assistance
  status consent_status DEFAULT 'pending',
  granted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

## Essential Enums

```sql
-- Appointment status flow
CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
);

-- LGPD consent status
CREATE TYPE consent_status AS ENUM (
  'pending', 'granted', 'withdrawn', 'expired'
);

-- Professional types for CFM compliance
CREATE TYPE professional_type AS ENUM (
  'doctor', 'dentist', 'nurse', 'aesthetician'
);
```

## Essential RLS Patterns

```sql
-- Professional clinic access (most common)
CREATE POLICY "professionals_clinic_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = table_name.clinic_id
      AND p.is_active = true
    )
  );

-- Patient self-access
CREATE POLICY "patients_self_access" ON patients
  FOR ALL USING (user_id = auth.uid());
```

## Common Triggers

```sql
-- Audit trail for all tables
CREATE TRIGGER table_name_audit
  AFTER INSERT OR UPDATE OR DELETE ON table_name
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Update timestamp
CREATE TRIGGER table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Essential Indexes

```sql
-- Core healthcare indexes
CREATE INDEX idx_table_clinic ON table_name(clinic_id);
CREATE INDEX idx_table_patient ON table_name(patient_id);
CREATE INDEX idx_table_created ON table_name(created_at DESC);
```

---

> **Security Notice**: All tables implement LGPD, ANVISA, and CFM compliance with RLS policies and audit trails.
