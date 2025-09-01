# Database Schema Architecture - Supabase Guidelines

## Configuration

- **Client Setup:** Centralize Supabase client configuration in `lib/supabase/` (client, server-rls, admin)
- **Project Details:**
  - **Name:** `{project-name}`
  - **ID:** `{project-id}`

## Security & Access

- **Admin Client:** Use `adminClient` (Service Role) carefully in public APIs, implementing all necessary validations and checks in the API itself
- **RLS:** Use Row Level Security for protected API routes and server operations done on behalf of a logged-in user
- **Authentication:** Middleware with Supabase for route protection

## Data Operations

- **Validation:** Implement proper data validation (Zod) before insert/update operations
- **MCP Interaction:** Use Supabase MCP tools (`mcp_supabase_*`) for database interactions, especially for listing tables, executing SQL, and applying migrations

## API Routes

- **Organization:** Route Handlers in `app/api/` following RESTful principles
- **Error Handling:** Implement consistent error handling with appropriate JSON responses
- **Middleware:** Use for authentication, Rate Limiting (Upstash), and public route definition
- **Public Routes:** Explicitly mark as public in middleware
- **Documentation:** Document API endpoints with usage examples

## Overview

Complete database architecture reference for NeonPro advanced aesthetic clinic operations. Built on **Supabase PostgreSQL 17** with constitutional healthcare compliance.

**Architecture**: Multi-tenant with Row Level Security (RLS)
**Compliance**: LGPD + ANVISA + CFM requirements built-in
**Extensions**: pgvector, uuid-ossp, pgcrypto, pg_audit

## Prerequisites

- Supabase project with PostgreSQL 17
- Healthcare compliance understanding (LGPD, ANVISA, CFM)
- Basic knowledge of RLS, triggers, and database functions
- Brazilian advanced aesthetic regulations familiarity

## Quick Start

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable RLS for healthcare data protection
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create healthcare professional access policy
CREATE POLICY "professional_clinic_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = table_name.clinic_id
    )
  );
```

## Database Functions

### Healthcare Compliance Functions

#### encrypt_patient_data

```sql
CREATE OR REPLACE FUNCTION encrypt_patient_data(data_text text, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN encode(encrypt(data_text::bytea, encryption_key, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### decrypt_patient_data

```sql
CREATE OR REPLACE FUNCTION decrypt_patient_data(encrypted_data text, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), encryption_key, 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### LGPD Compliance Functions

#### validate_lgpd_consent

```sql
CREATE OR REPLACE FUNCTION validate_lgpd_consent(patient_uuid uuid, purpose text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM consent_records
    WHERE patient_id = patient_uuid
    AND purpose = validate_lgpd_consent.purpose
    AND status = 'granted'
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### anonymize_patient_data

```sql
CREATE OR REPLACE FUNCTION anonymize_patient_data(patient_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE patients
  SET
    cpf = 'ANONYMIZED_' || extract(epoch from now()),
    full_name = 'ANONYMIZED_PATIENT_' || id,
    birth_date = '1900-01-01',
    anonymized_at = NOW()
  WHERE id = patient_uuid;

  INSERT INTO audit_logs (action, table_name, record_id, performed_by, timestamp)
  VALUES ('ANONYMIZE_PATIENT', 'patients', patient_uuid, 'SYSTEM_LGPD', NOW());

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### AI Integration Functions

#### sanitize_for_ai

```sql
CREATE OR REPLACE FUNCTION sanitize_for_ai(input_text text)
RETURNS text AS $$
BEGIN
  -- Remove CPF patterns
  input_text := regexp_replace(input_text, '\d{3}\.\d{3}\.\d{3}-\d{2}', '[CPF_REMOVED]', 'g');
  -- Remove phone patterns
  input_text := regexp_replace(input_text, '\(\d{2}\)\s*\d{4,5}-\d{4}', '[PHONE_REMOVED]', 'g');
  -- Remove email patterns
  input_text := regexp_replace(input_text, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}', '[EMAIL_REMOVED]', 'g');
  RETURN input_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### calculate_no_show_risk

```sql
CREATE OR REPLACE FUNCTION calculate_no_show_risk(appointment_uuid uuid)
RETURNS integer AS $$
DECLARE
  risk_score integer := 0;
  appointment_record appointments%ROWTYPE;
BEGIN
  SELECT * INTO appointment_record FROM appointments WHERE id = appointment_uuid;

  -- Previous no-shows (15 points each)
  risk_score := risk_score + (
    SELECT COUNT(*) * 15
    FROM appointments
    WHERE patient_id = appointment_record.patient_id
    AND status = 'no_show'
    AND created_at > NOW() - INTERVAL '6 months'
  );

  -- Weekend appointments (+10 points)
  IF EXTRACT(dow FROM appointment_record.start_time) IN (0, 6) THEN
    risk_score := risk_score + 10;
  END IF;

  -- Early morning appointments (+5 points)
  IF EXTRACT(hour FROM appointment_record.start_time) < 9 THEN
    risk_score := risk_score + 5;
  END IF;

  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Audit Trail Functions

#### create_audit_log

```sql
CREATE OR REPLACE FUNCTION create_audit_log(
  action_type text,
  table_name text,
  record_id uuid,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    id, action, table_name, record_id, old_values, new_values,
    user_id, session_id, ip_address, user_agent, timestamp
  ) VALUES (
    gen_random_uuid(), action_type, table_name, record_id, old_values, new_values,
    auth.uid(), current_setting('app.session_id', true),
    current_setting('app.ip_address', true), current_setting('app.user_agent', true), NOW()
  ) RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### update_updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Database Triggers

### Audit Trail Triggers

```sql
-- Universal audit trigger template
CREATE TRIGGER {table_name}_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER {table_name}_updated_at_trigger
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Healthcare Compliance Triggers

```sql
-- Patient data encryption
CREATE TRIGGER patients_encrypt_sensitive_data
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_patient_sensitive_fields();

-- LGPD consent validation
CREATE TRIGGER consent_validation_trigger
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_patient_consent();

-- Professional license validation
CREATE TRIGGER professional_license_validation_trigger
  BEFORE INSERT OR UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION validate_professional_license();
```

### AI Integration Triggers

```sql
-- AI content sanitization
CREATE TRIGGER ai_chat_content_sanitization
  BEFORE INSERT OR UPDATE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_phi_content();

-- No-show prediction updates
CREATE TRIGGER appointment_no_show_prediction
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_no_show_prediction();
```

### Business Logic Triggers

```sql
-- Appointment conflict prevention
CREATE TRIGGER appointment_conflict_prevention
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_appointment_conflicts();

-- Automatic data retention enforcement
CREATE TRIGGER automatic_data_archival
  AFTER UPDATE ON medical_records
  FOR EACH ROW
  WHEN (NEW.updated_at != OLD.updated_at)
  EXECUTE FUNCTION check_data_retention_policy();
```

## Table Relationships

### Core Business Relationships

```sql
-- Clinic-centric (RESTRICT - preserve business integrity)
clinics.id ← patients.clinic_id
clinics.id ← professionals.clinic_id
clinics.id ← appointments.clinic_id

-- Patient-centric (CASCADE DELETE - LGPD compliance)
patients.id ← appointments.patient_id
patients.id ← medical_records.patient_id
patients.id ← consent_records.patient_id
patients.id ← ai_chat_sessions.patient_id

-- Professional-centric (RESTRICT - preserve accountability)
professionals.id ← appointments.professional_id
professionals.id ← medical_records.professional_id
professionals.id ← ai_chat_sessions.professional_id

-- Appointment-centric (mixed CASCADE/RESTRICT)
appointments.id ← appointment_reminders.appointment_id (CASCADE DELETE)
appointments.id ← payment_transactions.appointment_id (RESTRICT)
```

### AI Integration Relationships

```sql
-- AI Chat System (CASCADE DELETE for data cleanup)
ai_chat_sessions.id ← ai_chat_messages.session_id
professionals.id ← ai_chat_sessions.professional_id (RESTRICT)

-- AI Analytics (CASCADE DELETE with patient data)
appointments.id ← ai_no_show_predictions.appointment_id
patients.id ← no_show_analytics.patient_id
```

### Compliance Relationships

```sql
-- Audit Trail (RESTRICT - preserve compliance evidence)
audit_logs.id ← compliance_violations.audit_log_id
professionals.id ← audit_logs.performed_by

-- LGPD Compliance (CASCADE DELETE with patient data)
patients.id ← consent_records.patient_id
consent_forms.id ← consent_records.form_id (RESTRICT)
```

## Custom Enums

### Healthcare Professional Types

```sql
CREATE TYPE professional_type AS ENUM (
  'doctor',           -- CRM required
  'dentist',          -- CRO required
  'nurse',            -- COREN required
  'aesthetician',     -- Specific certification
  'receptionist',     -- Administrative staff
  'manager'           -- Supervisory roles
);

CREATE TYPE license_status AS ENUM (
  'valid',
  'expired',
  'suspended',
  'pending',
  'invalid'
);
```

### Patient & Appointment Status

```sql
CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled'
);

CREATE TYPE patient_status AS ENUM (
  'active',
  'inactive',
  'discharged',
  'transferred',
  'deceased'
);

CREATE TYPE urgency_level AS ENUM (
  'routine',
  'urgent',
  'emergency',
  'critical'
);
```

### LGPD Compliance Types

```sql
CREATE TYPE lgpd_data_category AS ENUM (
  'public',
  'personal',
  'sensitive',
  'health',
  'biometric'
);

CREATE TYPE consent_status AS ENUM (
  'pending',
  'granted',
  'denied',
  'withdrawn',
  'expired'
);

CREATE TYPE audit_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'anonymize',
  'export',
  'login',
  'logout'
);
```

### AI Integration Types

```sql
CREATE TYPE ai_model_type AS ENUM (
  'chat',
  'prediction',
  'classification',
  'recommendation',
  'vision'
);

CREATE TYPE chat_role AS ENUM (
  'system',
  'user',
  'assistant',
  'tool'
);
```

### Financial Types

```sql
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
  'disputed'
);

CREATE TYPE payment_method_type AS ENUM (
  'credit_card',
  'debit_card',
  'pix',
  'bank_transfer',
  'cash',
  'insurance'
);
```

## Supabase Integration

### Client Architecture

```typescript
// lib/supabase/client.ts - Browser client with RLS
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// lib/supabase/server.ts - Server client with RLS
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Cookie configuration for server-side RLS
  );
}

// lib/supabase/admin.ts - Service role client (bypasses RLS)
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
  );
}
```

### Authentication Patterns

```typescript
// Client-side auth check
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function ClientAuthComponent() {
  const [session, setSession] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription?.unsubscribe();
  }, [supabase]);

  return session ? <AuthenticatedContent /> : <LoginPrompt />;
}

// Server-side auth check
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <ProtectedContent user={data.user} />;
}
```

### Data Access Patterns

```typescript
// Professional accessing patient data with consent validation
const { data, error } = await supabase
  .from("patients")
  .select("id, full_name, phone_primary")
  .eq("clinic_id", clinicId)
  .eq("lgpd_consent_given", true)
  .limit(20);

// Appointment scheduling with conflict prevention
const { data, error } = await supabase
  .from("appointments")
  .insert({
    patient_id: patientId,
    professional_id: professionalId,
    start_time: startTime,
    end_time: endTime,
  })
  .select()
  .single();

// AI chat with PHI sanitization
const { data, error } = await supabase
  .from("ai_chat_messages")
  .insert({
    session_id: sessionId,
    role: "user",
    content: sanitizedContent, // PHI already removed
  });
```

### Realtime Subscriptions

```typescript
// Healthcare realtime subscription
import { subscribeToChannel } from "@/lib/supabase/realtime";

useEffect(() => {
  if (!userId) return;

  const subscription = subscribeToChannel({
    channelName: `appointments-${userId}`,
    tableName: "appointments",
    filter: `professional_id=eq.${userId}`,
    event: "*",
    callback: (payload) => {
      // Handle appointment updates
      updateAppointmentsList(payload);
    },
  });

  return () => subscription.unsubscribe();
}, [userId]);
```

## Healthcare Compliance Framework

### LGPD (Lei Geral de Proteção de Dados) Implementation

**Data Classification System:**

- **Public**: id, created_at, metadata fields
- **Personal**: names, contact info, demographics
- **Sensitive**: CPF, RG, passport (encrypted at rest)
- **Health**: medical records, diagnoses, treatments
- **Special Category**: Requires enhanced protection

**Patient Rights Implementation:**

```sql
-- Right to Access: Patient portal with RLS
CREATE POLICY "patients_own_data" ON patients
  FOR SELECT USING (auth.uid()::text = id::text);

-- Right to Rectification: Audit trail for modifications
-- Right to Erasure: CASCADE DELETE relationships
-- Right to Portability: JSON export functions
```

**Consent Management:**

```sql
-- Validate consent before data processing
CREATE OR REPLACE FUNCTION require_lgpd_consent()
RETURNS trigger AS $$
BEGIN
  IF NOT validate_lgpd_consent(NEW.patient_id, TG_ARGV[0]) THEN
    RAISE EXCEPTION 'LGPD consent required for %', TG_ARGV[0];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### ANVISA (Medical Device Software) Compliance

**Class IIa Requirements:**

- Quality management system audit trails
- Risk management logging (ISO 14971)
- Post-market surveillance monitoring
- Clinical evaluation documentation

**Implementation:**

```sql
-- Medical device risk assessment
CREATE TRIGGER medical_device_risk_assessment
  AFTER INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION assess_medical_device_risk();

-- Software quality monitoring
CREATE TRIGGER software_quality_monitoring
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION monitor_ai_software_quality();
```

### CFM (Federal Council of Medicine) Compliance

**Medical Record Standards (CFM Resolution 1821/2007):**

- Digital signature requirements
- 20-year retention period
- Professional accountability tracking

**Implementation:**

```sql
-- Professional digital signature requirement
CREATE TRIGGER medical_record_signature_required
  BEFORE INSERT OR UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION require_professional_signature();

-- Professional license validation
CREATE TRIGGER validate_professional_credentials
  BEFORE INSERT OR UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION validate_cfm_license();
```

## Performance Optimization

### Standard Healthcare Indexes

```sql
-- Core healthcare operations
CREATE INDEX idx_patients_clinic_active ON patients (clinic_id, is_active);
CREATE INDEX idx_appointments_professional_date ON appointments (professional_id, start_time);
CREATE INDEX idx_medical_records_patient_date ON medical_records (patient_id, visit_date DESC);

-- LGPD compliance queries
CREATE INDEX idx_patients_consent_status ON patients (lgpd_consent_given, data_retention_until);
CREATE INDEX idx_audit_logs_phi_access ON audit_logs (phi_accessed, created_at) WHERE phi_accessed = true;

-- AI integration queries
CREATE INDEX idx_ai_sessions_user_active ON ai_chat_sessions (user_id, status);
CREATE INDEX idx_ai_messages_session_time ON ai_chat_messages (session_id, created_at);
```

### Query Performance Patterns

```sql
-- Efficient patient lookup with consent validation
SELECT p.id, p.full_name, p.phone_primary
FROM patients p
WHERE p.clinic_id = $1
  AND p.is_active = true
  AND p.lgpd_consent_given = true
  AND p.data_retention_until > NOW()
ORDER BY p.created_at DESC
LIMIT 20;

-- Professional availability check
SELECT COUNT(*) = 0 as available
FROM appointments a
WHERE a.professional_id = $1
  AND a.start_time < $3
  AND a.end_time > $2
  AND a.status NOT IN ('cancelled', 'no_show');
```

## Security Implementation

### RLS Policy Templates

```sql
-- Professional clinic access (most common)
CREATE POLICY "professionals_clinic_access" ON {table_name}
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = {table_name}.clinic_id
      AND p.is_active = true
    )
  );

-- Patient self-access with consent validation
CREATE POLICY "patients_own_data" ON {table_name}
  FOR SELECT USING (
    patient_id = auth.uid()::uuid AND
    validate_lgpd_consent(patient_id, 'self_access') = true
  );

-- Emergency access with logging
CREATE POLICY "emergency_access" ON {table_name}
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'emergency_professional' AND
    log_emergency_access({table_name}.patient_id) = true
  );
```

### Audit Monitoring

```sql
-- Real-time security alerts
CREATE TRIGGER security_alert_trigger
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  WHEN (NEW.risk_score > 80 OR NEW.emergency_access = true)
  EXECUTE FUNCTION send_security_alert();

-- Failed access attempts
CREATE VIEW failed_access_attempts AS
SELECT user_id, COUNT(*) as failed_attempts, MAX(created_at) as last_attempt
FROM audit_logs
WHERE success = false
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 5;
```

## Troubleshooting

### Common Issues

**RLS Policy Not Working:**

- Verify `auth.uid()` returns expected user ID
- Check professional-clinic relationships exist
- Ensure `is_active = true` on professional records

**LGPD Consent Validation Failing:**

- Verify consent records with `status = 'granted'`
- Check consent expiration dates
- Validate processing purpose matches consent

**Audit Logs Missing:**

- Ensure triggers installed on all tables
- Check `create_audit_log()` function permissions
- Verify audit_logs table INSERT permissions

**Poor Performance:**

- Add appropriate indexes for RLS policies
- Use LIMIT clauses for large datasets
- Monitor query execution plans

### Performance Monitoring

```sql
-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check RLS policy performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM patients
WHERE clinic_id = 'clinic-uuid';
```

---

> **Security Notice**: This architecture implements comprehensive healthcare data protection through constitutional principles, regulatory compliance, and defense-in-depth security patterns.

> **Compliance Assurance**: All components meet LGPD, ANVISA, and CFM requirements with automated compliance monitoring and audit trails for regulatory inspections.
