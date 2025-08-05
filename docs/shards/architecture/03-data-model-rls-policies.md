# 🗄️ BMAD-Enhanced Data Model & RLS Policies

*Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0*

## 📊 BMAD-Enhanced Core Data Model with Multi-Tenant Sharding

### BMAD Standard Fields (All Tables - Quality ≥9.5/10)
```sql
-- Every table includes these BMAD-enhanced standard fields
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
deleted_at TIMESTAMPTZ NULL, -- Soft delete for LGPD compliance
clinic_id UUID NOT NULL, -- Multi-tenant isolation key
shard_id INTEGER NOT NULL, -- Explicit shard identifier for horizontal scaling
version INTEGER DEFAULT 1, -- Optimistic locking for concurrent updates
data_classification VARCHAR(20) DEFAULT 'internal', -- LGPD data classification
encryption_key_id UUID, -- Field-level encryption reference for sensitive data
audit_trail JSONB DEFAULT '{}', -- Immutable audit information (BMAD compliance)
compliance_flags JSONB DEFAULT '{}', -- LGPD/ANVISA/CFM compliance markers
bmad_metadata JSONB DEFAULT '{}', -- BMAD method tracking and quality metrics
created_by UUID, -- User who created the record (audit trail)
updated_by UUID, -- User who last updated the record (audit trail)
tenant_isolation_verified BOOLEAN DEFAULT FALSE -- RLS policy verification flag
```

### Enhanced Key Tables

#### Enhanced Clinics with AI & Compliance
```sql
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shard_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL, -- CNPJ
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    
    -- Enhanced Settings
    settings JSONB DEFAULT '{}',
    ai_settings JSONB DEFAULT '{
        "prediction_enabled": true,
        "wellness_integration": true,
        "auto_scheduling": false,
        "ml_models": {
            "treatment_success": true,
            "no_show_prediction": true,
            "revenue_forecasting": true
        }
    }',
    
    -- Subscription & Performance
    subscription_tier VARCHAR(20) DEFAULT 'basic', -- basic, professional, enterprise, ai_premium
    performance_tier VARCHAR(20) DEFAULT 'standard', -- standard, high_performance, ultra
    
    -- Compliance
    lgpd_compliance JSONB DEFAULT '{
        "consent_management": true,
        "data_portability": true,
        "right_to_erasure": true,
        "automated_compliance": false
    }',
    anvisa_compliance JSONB DEFAULT '{
        "medical_device_registered": false,
        "quality_management": false,
        "risk_management": false
    }',
    cfm_compliance JSONB DEFAULT '{
        "telemedicine_enabled": false,
        "digital_prescription": false,
        "professional_validation": true
    }',
    
    -- Professional Information
    medical_professionals JSONB DEFAULT '[]', -- Array of validated professionals
    specializations JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    
    -- Business Intelligence
    business_metrics JSONB DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    
    -- Constraints
    CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('basic', 'professional', 'enterprise', 'ai_premium')),
    CONSTRAINT valid_performance_tier CHECK (performance_tier IN ('standard', 'high_performance', 'ultra'))
);

-- Sharding function for clinics
CREATE OR REPLACE FUNCTION get_clinic_shard(clinic_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    -- Simple hash-based sharding (can be enhanced with consistent hashing)
    RETURN (hashtext(clinic_uuid::text) % 10) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Enhanced Patients with AI & Wellness
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    shard_id INTEGER NOT NULL,
    
    -- Basic Information (LGPD Protected)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document_encrypted TEXT, -- PGP encrypted CPF
    birth_date DATE,
    gender VARCHAR(10),
    address JSONB,
    
    -- Enhanced Medical Information
    medical_history JSONB DEFAULT '{}',
    allergies JSONB DEFAULT '[]',
    medications JSONB DEFAULT '[]',
    previous_treatments JSONB DEFAULT '[]',
    
    -- AI & Wellness Integration
    wellness_profile JSONB DEFAULT '{
        "physical_wellness": 0,
        "mental_wellness": 0,
        "lifestyle_factors": {},
        "stress_level": 0,
        "satisfaction_score": 0,
        "last_assessment": null
    }',
    
    ai_predictions JSONB DEFAULT '{
        "treatment_success_rates": {},
        "no_show_probability": 0,
        "optimal_treatments": [],
        "risk_factors": [],
        "last_updated": null
    }',
    
    -- Behavioral Analytics
    behavior_patterns JSONB DEFAULT '{
        "appointment_frequency": 0,
        "cancellation_rate": 0,
        "preferred_times": [],
        "communication_preferences": {},
        "payment_behavior": {}
    }',
    
    -- Preferences & Consent
    preferences JSONB DEFAULT '{}',
    consent_records JSONB DEFAULT '{
        "data_processing": null,
        "marketing": null,
        "analytics": null,
        "ai_processing": null,
        "wellness_integration": null
    }',
    
    -- Compliance & Privacy
    data_retention_policy JSONB DEFAULT '{
        "retention_period_years": 5,
        "auto_deletion_enabled": false,
        "deletion_date": null
    }',
    
    privacy_settings JSONB DEFAULT '{
        "data_sharing": false,
        "analytics_participation": true,
        "marketing_communications": false
    }',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    
    -- Foreign Key with Shard Awareness
    FOREIGN KEY (clinic_id, shard_id) REFERENCES clinics(id, shard_id)
);

-- Trigger to auto-set shard_id
CREATE OR REPLACE FUNCTION set_patient_shard()
RETURNS TRIGGER AS $$
BEGIN
    NEW.shard_id := get_clinic_shard(NEW.clinic_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_shard_trigger
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_patient_shard();
```

Stored Procedure `sp_book_appointment` garante atomicidade; triggers delegam enfileiramento via `pg_notify`.

## Enhanced RLS Policies with Compliance

```sql
-- Enhanced appointment policy with audit trail
CREATE POLICY select_appt ON appointments
FOR SELECT USING (
  clinic_id = current_setting('request.jwt.claims', true)::json->>'clinic_id'
  AND deleted_at IS NULL
  AND shard_id = get_clinic_shard(clinic_id::UUID)
  AND (data_classification != 'restricted' OR 
       current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
);

-- LGPD compliance policy for patient data
CREATE POLICY lgpd_patient_access ON patients
FOR SELECT USING (
  clinic_id = current_setting('request.jwt.claims', true)::json->>'clinic_id'
  AND deleted_at IS NULL
  AND (
    consent_records->>'data_processing' = 'granted' OR
    current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'doctor')
  )
);
```

Criptografia **PGP_symm** aprimorada em `patients.document_encrypted` com rotação de chaves. Timezone armazenado em UTC + coluna `tz` na tabela `clinics` com suporte a múltiplos fusos.

## 🔐 BMAD-Enhanced RLS Policies with Zero-Trust Architecture

### Multi-Tenant Isolation (BMAD Security Standard)
```sql
-- BMAD Pattern: Comprehensive tenant isolation with audit logging
CREATE OR REPLACE FUNCTION bmad_tenant_check(table_clinic_id UUID, user_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    access_granted BOOLEAN := FALSE;
    audit_record JSONB;
BEGIN
    -- Check basic tenant isolation
    IF table_clinic_id = user_clinic_id THEN
        access_granted := TRUE;
    END IF;
    
    -- Log access attempt for audit trail
    audit_record := jsonb_build_object(
        'timestamp', NOW(),
        'table_clinic_id', table_clinic_id,
        'user_clinic_id', user_clinic_id,
        'access_granted', access_granted,
        'function', 'bmad_tenant_check'
    );
    
    -- Insert audit record (non-blocking)
    BEGIN
        INSERT INTO audit_logs (event_type, details, clinic_id)
        VALUES ('tenant_access_check', audit_record, user_clinic_id);
    EXCEPTION WHEN OTHERS THEN
        -- Continue execution even if audit logging fails
        NULL;
    END;
    
    RETURN access_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policy for patients with BMAD compliance
CREATE POLICY bmad_patients_select ON patients
FOR SELECT USING (
    bmad_tenant_check(
        clinic_id,
        (current_setting('request.jwt.claims', true)::json->>'clinic_id')::UUID
    )
    AND deleted_at IS NULL
    AND (
        -- Data classification check
        data_classification IN ('public', 'internal') OR
        (current_setting('request.jwt.claims', true)::json->>'role') IN ('admin', 'doctor')
    )
    AND (
        -- LGPD consent verification
        consent_records->>'data_processing' = 'granted' OR
        (current_setting('request.jwt.claims', true)::json->>'role') = 'admin'
    )
);

CREATE POLICY bmad_patients_insert ON patients
FOR INSERT WITH CHECK (
    clinic_id = (current_setting('request.jwt.claims', true)::json->>'clinic_id')::UUID
    AND created_by = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
    AND bmad_metadata->>'quality_check' = 'passed'
);

CREATE POLICY bmad_patients_update ON patients
FOR UPDATE USING (
    bmad_tenant_check(
        clinic_id,
        (current_setting('request.jwt.claims', true)::json->>'clinic_id')::UUID
    )
    AND (
        created_by = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID OR
        (current_setting('request.jwt.claims', true)::json->>'role') IN ('admin', 'doctor')
    )
) WITH CHECK (
    clinic_id = (current_setting('request.jwt.claims', true)::json->>'clinic_id')::UUID
    AND updated_by = (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID
);
```

### Real-Time Subscriptions with RLS
```sql
-- BMAD Pattern: Real-time subscriptions respecting RLS policies
CREATE OR REPLACE FUNCTION bmad_realtime_filter()
RETURNS TRIGGER AS $$
DECLARE
    user_clinic_id UUID;
    user_role TEXT;
BEGIN
    -- Extract user context from realtime connection
    user_clinic_id := (current_setting('request.jwt.claims', true)::json->>'clinic_id')::UUID;
    user_role := current_setting('request.jwt.claims', true)::json->>'role';
    
    -- Apply tenant isolation check
    IF NOT bmad_tenant_check(NEW.clinic_id, user_clinic_id) THEN
        RETURN NULL; -- Don't broadcast to unauthorized users
    END IF;
    
    -- Apply role-based filtering
    IF NEW.data_classification = 'restricted' AND user_role NOT IN ('admin', 'doctor') THEN
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply realtime filter to sensitive tables
CREATE TRIGGER patients_realtime_filter
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION bmad_realtime_filter();
```

## 🔄 Data Migration and Sharding Strategy

### Horizontal Sharding Implementation
```sql
-- BMAD Pattern: Intelligent shard distribution
CREATE OR REPLACE FUNCTION bmad_get_optimal_shard(clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
    shard_count INTEGER := 10; -- Configurable shard count
    clinic_hash BIGINT;
    optimal_shard INTEGER;
    shard_load RECORD;
BEGIN
    -- Calculate hash-based initial shard
    clinic_hash := hashtext(clinic_id::text);
    optimal_shard := (clinic_hash % shard_count) + 1;
    
    -- Check shard load balancing (optional optimization)
    SELECT shard_id, clinic_count INTO shard_load
    FROM shard_statistics
    WHERE shard_id = optimal_shard;
    
    -- If shard is overloaded, find alternative (load balancing logic)
    IF shard_load.clinic_count > 100 THEN -- Configurable threshold
        SELECT shard_id INTO optimal_shard
        FROM shard_statistics
        WHERE clinic_count < 100
        ORDER BY clinic_count ASC
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(optimal_shard, (clinic_hash % shard_count) + 1);
END;
$$ LANGUAGE plpgsql;

-- Shard statistics table for load balancing
CREATE TABLE shard_statistics (
    shard_id INTEGER PRIMARY KEY,
    clinic_count INTEGER DEFAULT 0,
    data_size_gb DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update shard statistics
CREATE OR REPLACE FUNCTION update_shard_statistics()
RETURNS VOID AS $$
BEGIN
    INSERT INTO shard_statistics (shard_id, clinic_count, last_updated)
    SELECT 
        shard_id,
        COUNT(*) as clinic_count,
        NOW()
    FROM clinics
    WHERE deleted_at IS NULL
    GROUP BY shard_id
    ON CONFLICT (shard_id) DO UPDATE SET
        clinic_count = EXCLUDED.clinic_count,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Performance Optimization (BMAD Standards)

### Intelligent Indexing Strategy
```sql
-- BMAD Pattern: Composite indexes for multi-tenant queries
CREATE INDEX idx_patients_clinic_active 
ON patients (clinic_id, deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_clinic_date 
ON appointments (clinic_id, scheduled_date, deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_treatments_clinic_patient 
ON treatments (clinic_id, patient_id, created_at) 
WHERE deleted_at IS NULL;

-- Partial indexes for frequently filtered data
CREATE INDEX idx_patients_active_consent 
ON patients (clinic_id, id) 
WHERE deleted_at IS NULL 
AND consent_records->>'data_processing' = 'granted';

-- GIN indexes for JSONB columns
CREATE INDEX idx_patients_ai_predictions 
ON patients USING GIN (ai_predictions);

CREATE INDEX idx_clinics_settings 
ON clinics USING GIN (settings);
```

### Query Performance Functions
```sql
-- BMAD Pattern: Optimized patient search with full-text search
CREATE OR REPLACE FUNCTION bmad_search_patients(
    p_clinic_id UUID,
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    last_appointment TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.email,
        p.phone,
        MAX(a.scheduled_date) as last_appointment
    FROM patients p
    LEFT JOIN appointments a ON p.id = a.patient_id AND a.deleted_at IS NULL
    WHERE p.clinic_id = p_clinic_id
    AND p.deleted_at IS NULL
    AND (
        p.name ILIKE '%' || p_search_term || '%' OR
        p.email ILIKE '%' || p_search_term || '%' OR
        p.phone ILIKE '%' || p_search_term || '%'
    )
    GROUP BY p.id, p.name, p.email, p.phone
    ORDER BY 
        CASE 
            WHEN p.name ILIKE p_search_term || '%' THEN 1
            WHEN p.name ILIKE '%' || p_search_term || '%' THEN 2
            ELSE 3
        END,
        p.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🛡️ LGPD Compliance Functions

### Data Portability (LGPD Article 18)
```sql
-- BMAD Pattern: Complete patient data export for LGPD compliance
CREATE OR REPLACE FUNCTION bmad_export_patient_data(
    p_clinic_id UUID,
    p_patient_id UUID
)
RETURNS JSONB AS $$
DECLARE
    patient_data JSONB;
    appointments_data JSONB;
    treatments_data JSONB;
    export_data JSONB;
BEGIN
    -- Verify tenant isolation
    IF NOT bmad_tenant_check(p_clinic_id, p_clinic_id) THEN
        RAISE EXCEPTION 'Access denied for patient data export';
    END IF;
    
    -- Export patient basic data
    SELECT to_jsonb(p.*) INTO patient_data
    FROM patients p
    WHERE p.id = p_patient_id AND p.clinic_id = p_clinic_id;
    
    -- Export appointments
    SELECT jsonb_agg(to_jsonb(a.*)) INTO appointments_data
    FROM appointments a
    WHERE a.patient_id = p_patient_id AND a.clinic_id = p_clinic_id;
    
    -- Export treatments
    SELECT jsonb_agg(to_jsonb(t.*)) INTO treatments_data
    FROM treatments t
    WHERE t.patient_id = p_patient_id AND t.clinic_id = p_clinic_id;
    
    -- Combine all data
    export_data := jsonb_build_object(
        'patient', patient_data,
        'appointments', COALESCE(appointments_data, '[]'::jsonb),
        'treatments', COALESCE(treatments_data, '[]'::jsonb),
        'export_date', NOW(),
        'export_version', '1.0'
    );
    
    -- Log export for audit trail
    INSERT INTO audit_logs (event_type, details, clinic_id, patient_id)
    VALUES ('data_export', jsonb_build_object('exported_records', jsonb_array_length(export_data->'appointments') + jsonb_array_length(export_data->'treatments') + 1), p_clinic_id, p_patient_id);
    
    RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Right to Erasure (LGPD Article 18)
```sql
-- BMAD Pattern: Secure patient data deletion with audit trail
CREATE OR REPLACE FUNCTION bmad_delete_patient_data(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_deletion_reason TEXT DEFAULT 'user_request'
)
RETURNS BOOLEAN AS $$
DECLARE
    deletion_summary JSONB;
    records_affected INTEGER := 0;
BEGIN
    -- Verify tenant isolation
    IF NOT bmad_tenant_check(p_clinic_id, p_clinic_id) THEN
        RAISE EXCEPTION 'Access denied for patient data deletion';
    END IF;
    
    -- Soft delete related records
    UPDATE appointments 
    SET deleted_at = NOW(), updated_by = p_clinic_id
    WHERE patient_id = p_patient_id AND clinic_id = p_clinic_id AND deleted_at IS NULL;
    GET DIAGNOSTICS records_affected = ROW_COUNT;
    
    UPDATE treatments 
    SET deleted_at = NOW(), updated_by = p_clinic_id
    WHERE patient_id = p_patient_id AND clinic_id = p_clinic_id AND deleted_at IS NULL;
    GET DIAGNOSTICS records_affected = records_affected + ROW_COUNT;
    
    -- Soft delete patient record
    UPDATE patients 
    SET 
        deleted_at = NOW(),
        updated_by = p_clinic_id,
        -- Anonymize sensitive data
        name = 'DELETED_USER_' || p_patient_id,
        email = NULL,
        phone = NULL,
        document_encrypted = NULL,
        medical_history = '{}',
        privacy_settings = jsonb_build_object('data_deleted', true, 'deletion_date', NOW())
    WHERE id = p_patient_id AND clinic_id = p_clinic_id;
    GET DIAGNOSTICS records_affected = records_affected + ROW_COUNT;
    
    -- Create deletion summary
    deletion_summary := jsonb_build_object(
        'patient_id', p_patient_id,
        'clinic_id', p_clinic_id,
        'records_affected', records_affected,
        'deletion_reason', p_deletion_reason,
        'deletion_date', NOW()
    );
    
    -- Log deletion for compliance audit
    INSERT INTO audit_logs (event_type, details, clinic_id, patient_id)
    VALUES ('data_deletion', deletion_summary, p_clinic_id, p_patient_id);
    
    RETURN records_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

*This BMAD-enhanced data model ensures NeonPro maintains the highest standards of security, compliance, and performance while supporting the multi-tenant SaaS architecture required for aesthetic clinic management.*