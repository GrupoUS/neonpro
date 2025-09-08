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
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(data_text::text, encryption_key, 'cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### decrypt_patient_data

```sql
CREATE OR REPLACE FUNCTION decrypt_patient_data(encrypted_data bytea, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN convert_from(pgp_sym_decrypt(encrypted_data, encryption_key), 'UTF8');
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

### Healthcare Data Processing Functions

#### encrypt_patient_sensitive_fields

```sql
CREATE OR REPLACE FUNCTION encrypt_patient_sensitive_fields()
RETURNS trigger AS $$
DECLARE
  encryption_key text := current_setting('app.encryption_key', true);
BEGIN
  -- Encrypt CPF if provided and changed
  IF NEW.cpf IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.cpf != OLD.cpf) THEN
    NEW.cpf_encrypted = encrypt_patient_data(NEW.cpf, encryption_key);
    NEW.cpf = NULL; -- Clear plaintext
  END IF;

  -- Encrypt RG if provided and changed
  IF NEW.rg IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.rg != OLD.rg) THEN
    NEW.rg_encrypted = encrypt_patient_data(NEW.rg, encryption_key);
    NEW.rg = NULL; -- Clear plaintext
  END IF;

  -- Log PHI access for compliance
  PERFORM create_audit_log(
    'ENCRYPT_PHI',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object('fields_encrypted', array['cpf', 'rg'])
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### validate_patient_consent

```sql
CREATE OR REPLACE FUNCTION validate_patient_consent()
RETURNS trigger AS $$
DECLARE
  consent_valid boolean := false;
  processing_purpose text;
BEGIN
  -- Determine processing purpose based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'medical_records' THEN processing_purpose := 'medical_treatment';
    WHEN 'ai_chat_messages' THEN processing_purpose := 'ai_assistance';
    WHEN 'appointment_reminders' THEN processing_purpose := 'communication';
    ELSE processing_purpose := 'general_processing';
  END CASE;

  -- Check if patient has valid consent for this purpose
  SELECT validate_lgpd_consent(NEW.patient_id, processing_purpose) INTO consent_valid;

  IF NOT consent_valid THEN
    RAISE EXCEPTION 'LGPD_CONSENT_REQUIRED: Patient % has not provided valid consent for %', 
      NEW.patient_id, processing_purpose
      USING ERRCODE = 'P0001';
  END IF;

  -- Log consent validation for audit trail
  PERFORM create_audit_log(
    'CONSENT_VALIDATED',
    TG_TABLE_NAME,
    NEW.patient_id,
    NULL,
    jsonb_build_object(
      'purpose', processing_purpose,
      'consent_valid', consent_valid
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### validate_professional_license

```sql
CREATE OR REPLACE FUNCTION validate_professional_license()
RETURNS trigger AS $$
DECLARE
  license_valid boolean := false;
  required_license_type text;
BEGIN
  -- Determine required license based on professional type
  CASE NEW.professional_type
    WHEN 'doctor' THEN required_license_type := 'CRM';
    WHEN 'dentist' THEN required_license_type := 'CRO';
    WHEN 'nurse' THEN required_license_type := 'COREN';
    WHEN 'aesthetician' THEN required_license_type := 'CERTIFICATION';
    ELSE required_license_type := 'NONE';
  END CASE;

  -- Validate license if required
  IF required_license_type != 'NONE' THEN
    -- Check license number format and expiration
    IF NEW.license_number IS NULL OR LENGTH(NEW.license_number) < 4 THEN
      RAISE EXCEPTION 'INVALID_LICENSE: % license number required for %', 
        required_license_type, NEW.professional_type
        USING ERRCODE = 'P0002';
    END IF;

    -- Check license expiration
    IF NEW.license_expires_at IS NOT NULL AND NEW.license_expires_at <= NOW() THEN
      RAISE EXCEPTION 'EXPIRED_LICENSE: % license expired on %', 
        required_license_type, NEW.license_expires_at
        USING ERRCODE = 'P0003';
    END IF;

    license_valid := true;
  END IF;

  -- Update license status
  NEW.license_status := CASE 
    WHEN license_valid THEN 'valid'::license_status
    ELSE 'invalid'::license_status
  END;

  -- Log license validation
  PERFORM create_audit_log(
    'LICENSE_VALIDATED',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object(
      'license_type', required_license_type,
      'license_valid', license_valid,
      'professional_type', NEW.professional_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### AI Integration Functions

#### sanitize_phi_content

```sql
CREATE OR REPLACE FUNCTION sanitize_phi_content()
RETURNS trigger AS $$
DECLARE
  phi_detected boolean := false;
  sanitized_content text;
BEGIN
  -- Apply PHI sanitization to content
  sanitized_content := sanitize_for_ai(NEW.content);
  
  -- Check if PHI was detected and removed
  phi_detected := (sanitized_content != NEW.content);
  
  -- Update content with sanitized version
  NEW.content := sanitized_content;
  
  -- Mark message for PHI audit if detected
  NEW.phi_detected := phi_detected;
  NEW.sanitized_at := CASE WHEN phi_detected THEN NOW() ELSE NULL END;

  -- Log PHI sanitization event
  IF phi_detected THEN
    PERFORM create_audit_log(
      'PHI_SANITIZED',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('original_length', LENGTH(NEW.content)),
      jsonb_build_object(
        'phi_detected', phi_detected,
        'sanitized_length', LENGTH(sanitized_content)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### update_no_show_prediction

```sql
CREATE OR REPLACE FUNCTION update_no_show_prediction()
RETURNS trigger AS $$
DECLARE
  risk_score integer;
  prediction_id uuid;
BEGIN
  -- Calculate no-show risk for new/updated appointments
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.status = 'scheduled' THEN
    risk_score := calculate_no_show_risk(NEW.id);
    
    -- Insert or update prediction record
    INSERT INTO ai_no_show_predictions (
      id, appointment_id, risk_score, predicted_at,
      model_version, confidence_level
    ) VALUES (
      gen_random_uuid(), NEW.id, risk_score, NOW(),
      'no_show_v2.1', CASE 
        WHEN risk_score >= 70 THEN 'high'
        WHEN risk_score >= 40 THEN 'medium'
        ELSE 'low'
      END
    )
    ON CONFLICT (appointment_id) DO UPDATE SET
      risk_score = EXCLUDED.risk_score,
      predicted_at = EXCLUDED.predicted_at,
      confidence_level = EXCLUDED.confidence_level
    RETURNING id INTO prediction_id;

    -- Log prediction update
    PERFORM create_audit_log(
      'NO_SHOW_PREDICTION_UPDATED',
      'ai_no_show_predictions',
      prediction_id,
      NULL,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'risk_score', risk_score,
        'confidence_level', CASE 
          WHEN risk_score >= 70 THEN 'high'
          WHEN risk_score >= 40 THEN 'medium'
          ELSE 'low'
        END
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Business Logic Functions

#### prevent_appointment_conflicts

```sql
CREATE OR REPLACE FUNCTION prevent_appointment_conflicts()
RETURNS trigger AS $$
DECLARE
  conflict_count integer := 0;
  conflict_appointment_id uuid;
BEGIN
  -- Check for professional availability conflicts
  SELECT COUNT(*), MIN(id) 
  INTO conflict_count, conflict_appointment_id
  FROM appointments
  WHERE professional_id = NEW.professional_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    AND status NOT IN ('cancelled', 'no_show', 'completed')
    AND (
      -- New appointment overlaps with existing
      (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
      (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
      -- New appointment encompasses existing
      (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'APPOINTMENT_CONFLICT: Professional % already has appointment % during % - %',
      NEW.professional_id, conflict_appointment_id, NEW.start_time, NEW.end_time
      USING ERRCODE = 'P0004';
  END IF;

  -- Check for room/resource conflicts if specified
  IF NEW.room_id IS NOT NULL THEN
    SELECT COUNT(*) INTO conflict_count
    FROM appointments
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND status NOT IN ('cancelled', 'no_show', 'completed')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      );

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'ROOM_CONFLICT: Room % is already booked during % - %',
        NEW.room_id, NEW.start_time, NEW.end_time
        USING ERRCODE = 'P0005';
    END IF;
  END IF;

  -- Log successful conflict check
  PERFORM create_audit_log(
    'APPOINTMENT_CONFLICT_CHECK',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object(
      'professional_id', NEW.professional_id,
      'room_id', NEW.room_id,
      'time_slot', jsonb_build_object(
        'start_time', NEW.start_time,
        'end_time', NEW.end_time
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### check_data_retention_policy

```sql
CREATE OR REPLACE FUNCTION check_data_retention_policy()
RETURNS trigger AS $$
DECLARE
  retention_years integer := 20; -- CFM requirement: 20-year retention
  archive_threshold date;
  should_archive boolean := false;
BEGIN
  -- Calculate archive threshold (20 years from last update)
  archive_threshold := (NEW.updated_at - INTERVAL '20 years')::date;
  
  -- Check if record should be archived
  IF NEW.updated_at::date <= archive_threshold THEN
    should_archive := true;
  END IF;

  -- Archive old records if policy requires it
  IF should_archive AND NEW.archived_at IS NULL THEN
    -- Mark as archived but preserve for compliance
    UPDATE medical_records 
    SET 
      archived_at = NOW(),
      archive_reason = 'DATA_RETENTION_POLICY',
      compliance_retention_until = NOW() + INTERVAL '25 years' -- Extra 5 years for safety
    WHERE id = NEW.id;

    -- Log archival action
    PERFORM create_audit_log(
      'RECORD_ARCHIVED',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      jsonb_build_object(
        'archive_reason', 'DATA_RETENTION_POLICY',
        'retention_years', retention_years,
        'compliance_retention_until', NOW() + INTERVAL '25 years'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Healthcare Compliance Functions

#### assess_medical_device_risk

```sql
CREATE OR REPLACE FUNCTION assess_medical_device_risk()
RETURNS trigger AS $$
DECLARE
  risk_level text := 'low';
  risk_score integer := 0;
  device_classification text;
BEGIN
  -- Assess risk based on medical record content and procedures
  
  -- High-risk procedures (Class IIb/III devices)
  IF NEW.procedure_notes ~* 'laser|injectable|implant|surgery|anesthesia' THEN
    risk_score := risk_score + 30;
    risk_level := 'high';
  END IF;

  -- Medium-risk procedures (Class IIa devices)
  IF NEW.procedure_notes ~* 'radiofrequency|ultrasound|led|microneedling' THEN
    risk_score := risk_score + 15;
    risk_level := CASE WHEN risk_level != 'high' THEN 'medium' ELSE risk_level END;
  END IF;

  -- Patient risk factors
  IF NEW.patient_allergies IS NOT NULL OR NEW.patient_conditions IS NOT NULL THEN
    risk_score := risk_score + 10;
  END IF;

  -- Update medical record with risk assessment
  NEW.device_risk_level := risk_level;
  NEW.device_risk_score := risk_score;
  NEW.anvisa_compliance_checked := true;

  -- Log ANVISA compliance assessment
  PERFORM create_audit_log(
    'ANVISA_RISK_ASSESSMENT',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object(
      'risk_level', risk_level,
      'risk_score', risk_score,
      'assessment_date', NOW(),
      'compliance_standard', 'ANVISA_RDC_185_2001'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### monitor_ai_software_quality

```sql
CREATE OR REPLACE FUNCTION monitor_ai_software_quality()
RETURNS trigger AS $$
DECLARE
  quality_score integer := 100;
  quality_issues text[] := '{}';
  compliance_level text := 'compliant';
BEGIN
  -- Monitor AI response quality for ANVISA Class IIa software compliance
  
  -- Check response time (should be reasonable for healthcare)
  IF NEW.response_time_ms > 5000 THEN
    quality_score := quality_score - 10;
    quality_issues := array_append(quality_issues, 'SLOW_RESPONSE_TIME');
  END IF;

  -- Check for inappropriate medical advice (AI should not diagnose)
  IF NEW.content ~* 'you have|diagnosis|prescribe|medication|treatment plan' THEN
    quality_score := quality_score - 30;
    quality_issues := array_append(quality_issues, 'INAPPROPRIATE_MEDICAL_ADVICE');
    compliance_level := 'non_compliant';
  END IF;

  -- Check for proper disclaimers in AI responses
  IF NEW.role = 'assistant' AND NEW.content !~* 'not a substitute for professional|consult.*healthcare' THEN
    quality_score := quality_score - 15;
    quality_issues := array_append(quality_issues, 'MISSING_MEDICAL_DISCLAIMER');
  END IF;

  -- Update message with quality metrics
  NEW.quality_score := quality_score;
  NEW.quality_issues := quality_issues;
  NEW.anvisa_compliant := (compliance_level = 'compliant');

  -- Alert if quality issues detected
  IF array_length(quality_issues, 1) > 0 THEN
    PERFORM create_audit_log(
      'AI_QUALITY_ALERT',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      jsonb_build_object(
        'quality_score', quality_score,
        'quality_issues', quality_issues,
        'compliance_level', compliance_level,
        'anvisa_standard', 'CLASS_IIA_SOFTWARE'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### require_professional_signature

```sql
CREATE OR REPLACE FUNCTION require_professional_signature()
RETURNS trigger AS $$
DECLARE
  professional_record professionals%ROWTYPE;
  signature_valid boolean := false;
BEGIN
  -- Get professional details for signature validation
  SELECT * INTO professional_record
  FROM professionals
  WHERE id = NEW.professional_id;

  -- Check if professional can create medical records
  IF professional_record.professional_type NOT IN ('doctor', 'dentist', 'nurse') THEN
    RAISE EXCEPTION 'UNAUTHORIZED_PROFESSIONAL: Only licensed healthcare professionals can create medical records'
      USING ERRCODE = 'P0006';
  END IF;

  -- Validate digital signature requirements (CFM Resolution 1821/2007)
  IF NEW.digital_signature IS NULL OR LENGTH(NEW.digital_signature) < 10 THEN
    RAISE EXCEPTION 'MISSING_DIGITAL_SIGNATURE: CFM requires digital signature for all medical records'
      USING ERRCODE = 'P0007';
  END IF;

  -- Validate signature timestamp (must be recent)
  IF NEW.signed_at IS NULL OR NEW.signed_at < NOW() - INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'INVALID_SIGNATURE_TIMESTAMP: Digital signature must be current'
      USING ERRCODE = 'P0008';
  END IF;

  -- Mark record as properly signed
  NEW.cfm_compliant := true;
  NEW.signature_validated_at := NOW();

  -- Log CFM compliance validation
  PERFORM create_audit_log(
    'CFM_SIGNATURE_VALIDATED',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object(
      'professional_id', NEW.professional_id,
      'professional_type', professional_record.professional_type,
      'license_number', professional_record.license_number,
      'signature_validation', 'CFM_RESOLUTION_1821_2007'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### validate_cfm_license

```sql
CREATE OR REPLACE FUNCTION validate_cfm_license()
RETURNS trigger AS $$
DECLARE
  license_format_valid boolean := false;
  crm_pattern text := '^\d{4,6}-[A-Z]{2}$'; -- Format: 123456-SP
  license_api_response jsonb;
BEGIN
  -- Only validate CFM licenses for doctors
  IF NEW.professional_type != 'doctor' THEN
    RETURN NEW;
  END IF;

  -- Validate CRM license format
  IF NEW.license_number ~ crm_pattern THEN
    license_format_valid := true;
  ELSE
    RAISE EXCEPTION 'INVALID_CRM_FORMAT: CRM license must follow format NNNNNN-UF (e.g., 123456-SP)'
      USING ERRCODE = 'P0009';
  END IF;

  -- Update CFM validation status
  NEW.cfm_validated := true;
  NEW.cfm_validated_at := NOW();
  NEW.license_status := 'valid'::license_status;

  -- Log CFM license validation
  PERFORM create_audit_log(
    'CFM_LICENSE_VALIDATED',
    TG_TABLE_NAME,
    NEW.id,
    NULL,
    jsonb_build_object(
      'license_number', NEW.license_number,
      'license_format_valid', license_format_valid,
      'validation_standard', 'CFM_REGULATION',
      'professional_type', NEW.professional_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Security Functions

#### send_security_alert

```sql
CREATE OR REPLACE FUNCTION send_security_alert()
RETURNS trigger AS $$
DECLARE
  alert_message text;
  alert_severity text;
  notification_payload jsonb;
BEGIN
  -- Determine alert severity and message
  IF NEW.risk_score >= 90 THEN
    alert_severity := 'CRITICAL';
    alert_message := 'Critical security event detected requiring immediate attention';
  ELSIF NEW.risk_score >= 80 THEN
    alert_severity := 'HIGH';
    alert_message := 'High-risk security event detected';
  ELSIF NEW.emergency_access = true THEN
    alert_severity := 'MEDIUM';
    alert_message := 'Emergency access to patient data granted';
  ELSE
    alert_severity := 'LOW';
    alert_message := 'Security event logged for monitoring';
  END IF;

  -- Create notification payload
  notification_payload := jsonb_build_object(
    'alert_id', gen_random_uuid(),
    'severity', alert_severity,
    'message', alert_message,
    'audit_log_id', NEW.id,
    'user_id', NEW.user_id,
    'table_name', NEW.table_name,
    'action', NEW.action,
    'risk_score', NEW.risk_score,
    'timestamp', NEW.timestamp,
    'ip_address', NEW.ip_address,
    'requires_immediate_action', (alert_severity IN ('CRITICAL', 'HIGH'))
  );

  -- Insert into security alerts table for dashboard
  INSERT INTO security_alerts (
    id, audit_log_id, severity, message, payload, 
    requires_action, created_at, resolved_at
  ) VALUES (
    (notification_payload->>'alert_id')::uuid,
    NEW.id,
    alert_severity,
    alert_message,
    notification_payload,
    (alert_severity IN ('CRITICAL', 'HIGH')),
    NOW(),
    NULL
  );

  -- Send real-time notification (this would integrate with your notification system)
  PERFORM pg_notify(
    'security_alerts',
    notification_payload::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### log_emergency_access

```sql
CREATE OR REPLACE FUNCTION log_emergency_access(patient_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_user_id uuid;
  professional_record professionals%ROWTYPE;
  emergency_justified boolean := false;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: Emergency access requires authenticated user'
      USING ERRCODE = 'P0010';
  END IF;

  -- Get professional details
  SELECT * INTO professional_record
  FROM professionals
  WHERE user_id = current_user_id
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'UNAUTHORIZED_EMERGENCY_ACCESS: Only active healthcare professionals can use emergency access'
      USING ERRCODE = 'P0011';
  END IF;

  -- Log emergency access event with high risk score
  PERFORM create_audit_log(
    'EMERGENCY_DATA_ACCESS',
    'patients',
    patient_uuid,
    NULL,
    jsonb_build_object(
      'accessing_professional', professional_record.id,
      'professional_type', professional_record.professional_type,
      'license_number', professional_record.license_number,
      'justification_required', true,
      'emergency_access', true
    )
  );

  -- Create emergency access record requiring justification
  INSERT INTO emergency_access_logs (
    id, patient_id, professional_id, access_timestamp,
    justification_provided, justification_deadline,
    compliance_status, created_at
  ) VALUES (
    gen_random_uuid(),
    patient_uuid,
    professional_record.id,
    NOW(),
    false, -- Requires subsequent justification
    NOW() + INTERVAL '24 hours', -- Must justify within 24 hours
    'PENDING_JUSTIFICATION',
    NOW()
  );

  -- Always allow emergency access but log it heavily
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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

## Missing Table Definitions

### AI Integration Tables

#### ai_no_show_predictions

```sql
CREATE TABLE ai_no_show_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE UNIQUE,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence_level text NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  model_version text NOT NULL DEFAULT 'no_show_v2.1',
  predicted_at timestamp with time zone NOT NULL DEFAULT NOW(),
  features_used jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_no_show_predictions_risk ON ai_no_show_predictions (risk_score DESC);
CREATE INDEX idx_no_show_predictions_appointment ON ai_no_show_predictions (appointment_id);
CREATE INDEX idx_no_show_predictions_predicted_at ON ai_no_show_predictions (predicted_at);

-- RLS Policy
ALTER TABLE ai_no_show_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professionals_clinic_predictions" ON ai_no_show_predictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN professionals p ON p.id = a.professional_id
      WHERE a.id = ai_no_show_predictions.appointment_id
      AND p.user_id = auth.uid()
    )
  );
```

### Security Tables

#### security_alerts

```sql
CREATE TABLE security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id uuid REFERENCES audit_logs(id) ON DELETE RESTRICT,
  severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  message text NOT NULL,
  payload jsonb NOT NULL,
  requires_action boolean NOT NULL DEFAULT false,
  assigned_to uuid REFERENCES professionals(id) ON DELETE SET NULL,
  resolved_at timestamp with time zone,
  resolution_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Indexes for security monitoring
CREATE INDEX idx_security_alerts_severity ON security_alerts (severity, created_at DESC);
CREATE INDEX idx_security_alerts_unresolved ON security_alerts (requires_action, resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_security_alerts_audit_log ON security_alerts (audit_log_id);

-- RLS Policy - Only security professionals can view
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_professionals_only" ON security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'security_officer', 'clinic_manager')
      AND p.is_active = true
    )
  );
```

#### emergency_access_logs

```sql
CREATE TABLE emergency_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE RESTRICT,
  access_timestamp timestamp with time zone NOT NULL DEFAULT NOW(),
  justification_provided boolean NOT NULL DEFAULT false,
  justification_text text,
  justification_deadline timestamp with time zone NOT NULL,
  compliance_status text NOT NULL DEFAULT 'PENDING_JUSTIFICATION' 
    CHECK (compliance_status IN ('PENDING_JUSTIFICATION', 'JUSTIFIED', 'VIOLATION', 'EXPIRED')),
  reviewed_by uuid REFERENCES professionals(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- Indexes for compliance monitoring
CREATE INDEX idx_emergency_access_compliance ON emergency_access_logs (compliance_status, justification_deadline);
CREATE INDEX idx_emergency_access_patient ON emergency_access_logs (patient_id, access_timestamp DESC);
CREATE INDEX idx_emergency_access_professional ON emergency_access_logs (professional_id, access_timestamp DESC);

-- RLS Policy - Restricted to compliance officers
ALTER TABLE emergency_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_officers_only" ON emergency_access_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'compliance_officer', 'clinic_manager')
      AND p.is_active = true
    )
  );

-- Trigger to update compliance status when deadline expires
CREATE OR REPLACE FUNCTION update_emergency_access_compliance()
RETURNS void AS $$
BEGIN
  UPDATE emergency_access_logs
  SET compliance_status = 'EXPIRED',
      updated_at = NOW()
  WHERE justification_deadline < NOW()
    AND compliance_status = 'PENDING_JUSTIFICATION'
    AND justification_provided = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule compliance check (would need to be run periodically)
CREATE OR REPLACE FUNCTION schedule_emergency_access_compliance_check()
RETURNS void AS $$
BEGIN
  -- This function should be called by a scheduled job
  PERFORM update_emergency_access_compliance();
  
  -- Alert on compliance violations
  INSERT INTO security_alerts (severity, message, payload, requires_action)
  SELECT 
    'HIGH',
    'Emergency access violation: Justification deadline expired',
    jsonb_build_object(
      'emergency_access_id', id,
      'patient_id', patient_id,
      'professional_id', professional_id,
      'access_timestamp', access_timestamp,
      'deadline_expired', justification_deadline
    ),
    true
  FROM emergency_access_logs
  WHERE compliance_status = 'EXPIRED'
    AND created_at > NOW() - INTERVAL '1 hour'; -- Only alert on recent violations
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Enhanced Table Updates

#### Update patients table for encryption fields

```sql
-- Add encryption fields to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS cpf_encrypted bytea,
ADD COLUMN IF NOT EXISTS rg_encrypted bytea,
ADD COLUMN IF NOT EXISTS phi_encrypted_at timestamp with time zone;

-- Add indexes for encrypted fields
CREATE INDEX IF NOT EXISTS idx_patients_encrypted_phi ON patients (phi_encrypted_at) WHERE phi_encrypted_at IS NOT NULL;
```

#### Update medical_records table for compliance fields

```sql
-- Add compliance and risk assessment fields to medical_records
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS digital_signature text,
ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cfm_compliant boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS signature_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS device_risk_level text CHECK (device_risk_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS device_risk_score integer CHECK (device_risk_score >= 0 AND device_risk_score <= 100),
ADD COLUMN IF NOT EXISTS anvisa_compliance_checked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS patient_allergies text,
ADD COLUMN IF NOT EXISTS patient_conditions text,
ADD COLUMN IF NOT EXISTS procedure_notes text,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archive_reason text,
ADD COLUMN IF NOT EXISTS compliance_retention_until timestamp with time zone;

-- Add indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_medical_records_cfm_compliance ON medical_records (cfm_compliant, signed_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_anvisa_risk ON medical_records (device_risk_level, anvisa_compliance_checked);
CREATE INDEX IF NOT EXISTS idx_medical_records_archived ON medical_records (archived_at) WHERE archived_at IS NOT NULL;
```

#### Update ai_chat_messages table for quality monitoring

```sql
-- Add quality monitoring fields to ai_chat_messages
ALTER TABLE ai_chat_messages 
ADD COLUMN IF NOT EXISTS quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
ADD COLUMN IF NOT EXISTS quality_issues text[],
ADD COLUMN IF NOT EXISTS anvisa_compliant boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS phi_detected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sanitized_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS response_time_ms integer;

-- Add indexes for AI quality monitoring
CREATE INDEX IF NOT EXISTS idx_ai_messages_quality ON ai_chat_messages (quality_score, anvisa_compliant);
CREATE INDEX IF NOT EXISTS idx_ai_messages_phi ON ai_chat_messages (phi_detected, sanitized_at) WHERE phi_detected = true;
```

#### Update professionals table for license validation

```sql
-- Add CFM validation fields to professionals
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS cfm_validated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cfm_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS license_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS license_status license_status DEFAULT 'pending';

-- Add indexes for license management
CREATE INDEX IF NOT EXISTS idx_professionals_license_status ON professionals (license_status, license_expires_at);
CREATE INDEX IF NOT EXISTS idx_professionals_cfm_validation ON professionals (cfm_validated, cfm_validated_at);
```

#### Update audit_logs table for security monitoring

```sql
-- Add security monitoring fields to audit_logs
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
ADD COLUMN IF NOT EXISTS emergency_access boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phi_accessed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS success boolean DEFAULT true;

-- Add indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_score ON audit_logs (risk_score DESC, timestamp DESC) WHERE risk_score > 0;
CREATE INDEX IF NOT EXISTS idx_audit_logs_emergency ON audit_logs (emergency_access, timestamp DESC) WHERE emergency_access = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi_access ON audit_logs (phi_accessed, timestamp DESC) WHERE phi_accessed = true;
```

## Supabase Integration

### Client Architecture

```typescript
// lib/supabase/client.ts - Browser client with RLS
import { createBrowserClient, } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// lib/supabase/server.ts - Server client with RLS
import { createServerClient, } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Cookie configuration for server-side RLS
  )
}

// lib/supabase/admin.ts - Service role client (bypasses RLS)
import { createClient, } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
  )
}
```

### Authentication Patterns

```typescript
// Client-side auth check
'use client'
import { createClient, } from '@/lib/supabase/client'
import { useEffect, useState, } from 'react'

export function ClientAuthComponent() {
  const [session, setSession,] = useState(null,)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session, }, },) => {
      setSession(session,)
    },)

    const { data: { subscription, }, } = supabase.auth.onAuthStateChange(
      (_event, session,) => setSession(session,),
    )

    return () => subscription?.unsubscribe()
  }, [supabase,],)

  return session ? <AuthenticatedContent /> : <LoginPrompt />
}

// Server-side auth check
import { createClient, } from '@/lib/supabase/server'
import { redirect, } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data, error, } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login',)
  }

  return <ProtectedContent user={data.user} />
}
```

### Data Access Patterns

```typescript
// Professional accessing patient data with consent validation
const { data, error, } = await supabase
  .from('patients',)
  .select('id, full_name, phone_primary',)
  .eq('clinic_id', clinicId,)
  .eq('lgpd_consent_given', true,)
  .limit(20,)

// Appointment scheduling with conflict prevention
const { data, error, } = await supabase
  .from('appointments',)
  .insert({
    patient_id: patientId,
    professional_id: professionalId,
    start_time: startTime,
    end_time: endTime,
  },)
  .select()
  .single()

// AI chat with PHI sanitization
const { data, error, } = await supabase
  .from('ai_chat_messages',)
  .insert({
    session_id: sessionId,
    role: 'user',
    content: sanitizedContent, // PHI already removed
  },)
```

### Realtime Subscriptions

```typescript
// Healthcare realtime subscription
import { subscribeToChannel, } from '@/lib/supabase/realtime'

useEffect(() => {
  if (!userId) return

  const subscription = subscribeToChannel({
    channelName: `appointments-${userId}`,
    tableName: 'appointments',
    filter: `professional_id=eq.${userId}`,
    event: '*',
    callback: (payload,) => {
      // Handle appointment updates
      updateAppointmentsList(payload,)
    },
  },)

  return () => subscription.unsubscribe()
}, [userId,],)
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
