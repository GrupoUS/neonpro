# Database Functions - NeonPro Healthcare Platform

## Overview
Custom database functions for healthcare operations, compliance automation, and AI integration.

## Healthcare Compliance Functions

### encrypt_patient_data
**Purpose**: Encrypt sensitive patient information (CPF, name, birth_date)
**Parameters**: `data_text text`, `encryption_key text`
**Returns**: `text` (encrypted data)
**Usage**: Automatically called on INSERT/UPDATE of patient sensitive fields

```sql
CREATE OR REPLACE FUNCTION encrypt_patient_data(data_text text, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN encode(encrypt(data_text::bytea, encryption_key, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### decrypt_patient_data
**Purpose**: Decrypt sensitive patient information for authorized access
**Parameters**: `encrypted_data text`, `encryption_key text`
**Returns**: `text` (decrypted data)
**Usage**: Called by authorized healthcare professionals

```sql
CREATE OR REPLACE FUNCTION decrypt_patient_data(encrypted_data text, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), encryption_key, 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## LGPD Compliance Functions

### anonymize_patient_data
**Purpose**: Anonymize patient data for LGPD Right to Erasure compliance
**Parameters**: `patient_uuid uuid`
**Returns**: `boolean` (success status)
**Usage**: Called when patient requests data deletion

```sql
CREATE OR REPLACE FUNCTION anonymize_patient_data(patient_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Anonymize patient data while preserving statistical integrity
  UPDATE patients 
  SET 
    cpf = 'ANONYMIZED_' || extract(epoch from now()),
    name = 'ANONYMIZED_PATIENT_' || id,
    birth_date = '1900-01-01',
    anonymized_at = NOW()
  WHERE id = patient_uuid;
  
  -- Log anonymization action
  INSERT INTO audit_logs (action, table_name, record_id, performed_by, timestamp)
  VALUES ('ANONYMIZE_PATIENT', 'patients', patient_uuid, 'SYSTEM_LGPD', NOW());
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### validate_lgpd_consent
**Purpose**: Validate patient consent for data processing
**Parameters**: `patient_uuid uuid`, `purpose text`
**Returns**: `boolean` (consent valid)
**Usage**: Called before processing patient data

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

## AI Integration Functions

### calculate_no_show_risk
**Purpose**: Calculate no-show risk score for appointments
**Parameters**: `appointment_uuid uuid`
**Returns**: `integer` (risk score 0-100)
**Usage**: Called by AI prediction service

```sql
CREATE OR REPLACE FUNCTION calculate_no_show_risk(appointment_uuid uuid)
RETURNS integer AS $$
DECLARE
  risk_score integer := 0;
  appointment_record appointments%ROWTYPE;
BEGIN
  SELECT * INTO appointment_record 
  FROM appointments 
  WHERE id = appointment_uuid;
  
  -- Base risk factors calculation
  -- Previous no-shows
  risk_score := risk_score + (
    SELECT COUNT(*) * 15
    FROM appointments 
    WHERE patient_id = appointment_record.patient_id 
    AND status = 'no_show'
    AND created_at > NOW() - INTERVAL '6 months'
  );
  
  -- Weekend appointments (higher risk)
  IF EXTRACT(dow FROM appointment_record.scheduled_at) IN (0, 6) THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Early morning appointments (higher risk)
  IF EXTRACT(hour FROM appointment_record.scheduled_at) < 9 THEN
    risk_score := risk_score + 5;
  END IF;
  
  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### sanitize_for_ai
**Purpose**: Remove PHI from text before AI processing
**Parameters**: `input_text text`
**Returns**: `text` (sanitized text)
**Usage**: Called before sending healthcare data to AI models

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

## Audit Trail Functions

### create_audit_log
**Purpose**: Create comprehensive audit log entries
**Parameters**: `action_type text`, `table_name text`, `record_id uuid`, `old_values jsonb`, `new_values jsonb`
**Returns**: `uuid` (audit log ID)
**Usage**: Called by triggers on all healthcare table modifications

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
    id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    user_id,
    session_id,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    gen_random_uuid(),
    action_type,
    table_name,
    record_id,
    old_values,
    new_values,
    auth.uid(),
    current_setting('app.session_id', true),
    current_setting('app.ip_address', true),
    current_setting('app.user_agent', true),
    NOW()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance Optimization Functions

### update_updated_at
**Purpose**: Automatically update updated_at timestamp
**Parameters**: None (trigger function)
**Returns**: `trigger`
**Usage**: Used by BEFORE UPDATE triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### generate_appointment_id
**Purpose**: Generate human-readable appointment IDs
**Parameters**: None
**Returns**: `text`
**Usage**: Called on appointment creation

```sql
CREATE OR REPLACE FUNCTION generate_appointment_id()
RETURNS text AS $$
BEGIN
  RETURN 'APT_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || substr(md5(random()::text), 1, 6);
END;
$$ LANGUAGE plpgsql;
```

---

> **Security Notice**: All functions with `SECURITY DEFINER` run with elevated privileges. Access is controlled through RLS policies and professional authentication requirements.

> **Compliance**: Functions follow LGPD Article 46 (data processing transparency) and ANVISA RDC 657/2022 (medical device software) requirements.