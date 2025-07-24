# 🗄️ Enhanced Data Model & RLS Policies

*VoidBeast Autonomous Multi-Mode Development Agent - VIBECODE V2.1 Compliance*

## 📊 Enhanced Core Data Model with Sharding

### Enhanced Standard Fields (All Tables)
```sql
-- Every table includes these enhanced standard fields
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
deleted_at TIMESTAMPTZ NULL, -- Soft delete for LGPD compliance
clinic_id UUID NOT NULL, -- Sharding key
shard_id INTEGER NOT NULL, -- Explicit shard identifier
version INTEGER DEFAULT 1, -- Optimistic locking
data_classification VARCHAR(20) DEFAULT 'internal', -- LGPD data classification
encryption_key_id UUID, -- Field-level encryption reference
audit_trail JSONB DEFAULT '{}', -- Immutable audit information
compliance_flags JSONB DEFAULT '{}' -- LGPD/ANVISA/CFM compliance markers
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
