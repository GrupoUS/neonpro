-- Healthcare Core Schema Migration
-- Created: 2025-01-25
-- Purpose: Core healthcare entities with LGPD compliance and RLS
-- Version: 1.0.0
-- Author: NeonPro AI Healthcare Team

-- =============================================================================
-- EXTENSIONS AND SETUP
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =============================================================================
-- HEALTHCARE ORGANIZATIONS/CLINICS TABLE ENHANCEMENT
-- =============================================================================

-- Check if clinics table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinics') THEN
        CREATE TABLE clinics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add healthcare-specific columns to clinics if they don't exist
DO $$
BEGIN
    -- Business information
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'cnpj') THEN
        ALTER TABLE clinics ADD COLUMN cnpj TEXT UNIQUE;
        ALTER TABLE clinics ADD COLUMN legal_name TEXT NOT NULL DEFAULT '';
        ALTER TABLE clinics ADD COLUMN business_type TEXT DEFAULT 'clinic' CHECK (business_type IN ('clinic', 'hospital', 'laboratory', 'pharmacy', 'telemedicine'));
        
        -- Contact information
        ALTER TABLE clinics ADD COLUMN email TEXT NOT NULL DEFAULT '';
        ALTER TABLE clinics ADD COLUMN phone TEXT;
        ALTER TABLE clinics ADD COLUMN website TEXT;
        
        -- Address information
        ALTER TABLE clinics ADD COLUMN address_street TEXT;
        ALTER TABLE clinics ADD COLUMN address_number TEXT;
        ALTER TABLE clinics ADD COLUMN address_complement TEXT;
        ALTER TABLE clinics ADD COLUMN address_neighborhood TEXT;
        ALTER TABLE clinics ADD COLUMN address_city TEXT;
        ALTER TABLE clinics ADD COLUMN address_state TEXT;
        ALTER TABLE clinics ADD COLUMN address_zipcode TEXT;
        ALTER TABLE clinics ADD COLUMN address_country TEXT DEFAULT 'Brasil';
        
        -- Healthcare regulations
        ALTER TABLE clinics ADD COLUMN anvisa_license TEXT;
        ALTER TABLE clinics ADD COLUMN cfm_registration TEXT;
        ALTER TABLE clinics ADD COLUMN cnes_code TEXT;
        ALTER TABLE clinics ADD COLUMN specialty_focus TEXT[];
        
        -- Operational information
        ALTER TABLE clinics ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        ALTER TABLE clinics ADD COLUMN timezone TEXT DEFAULT 'America/Sao_Paulo';
        ALTER TABLE clinics ADD COLUMN operating_hours JSONB DEFAULT '{}'::JSONB;
        ALTER TABLE clinics ADD COLUMN emergency_contact JSONB DEFAULT '{}'::JSONB;
        
        -- LGPD Compliance
        ALTER TABLE clinics ADD COLUMN lgpd_responsible_name TEXT;
        ALTER TABLE clinics ADD COLUMN lgpd_responsible_email TEXT;
        ALTER TABLE clinics ADD COLUMN lgpd_dpo_name TEXT;
        ALTER TABLE clinics ADD COLUMN lgpd_dpo_email TEXT;
        ALTER TABLE clinics ADD COLUMN privacy_policy_url TEXT;
        ALTER TABLE clinics ADD COLUMN terms_of_service_url TEXT;
        
        -- Subscription and limits
        ALTER TABLE clinics ADD COLUMN subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise'));
        ALTER TABLE clinics ADD COLUMN max_patients INTEGER DEFAULT 1000;
        ALTER TABLE clinics ADD COLUMN max_staff INTEGER DEFAULT 10;
        ALTER TABLE clinics ADD COLUMN features_enabled TEXT[] DEFAULT ARRAY['appointments', 'patients']::TEXT[];
        
        -- Audit fields
        ALTER TABLE clinics ADD COLUMN created_by UUID REFERENCES auth.users(id);
        ALTER TABLE clinics ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes for clinics
CREATE INDEX IF NOT EXISTS idx_clinics_cnpj ON clinics(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_clinics_business_type ON clinics(business_type, is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_city_state ON clinics(address_city, address_state);

-- =============================================================================
-- USER PROFILES ENHANCEMENT FOR HEALTHCARE
-- =============================================================================

-- Check if profiles table exists, enhance it for healthcare
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add healthcare-specific columns to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Basic user information
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'nurse', 'receptionist', 'admin', 'super_admin'));
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
        ALTER TABLE profiles ADD COLUMN full_name TEXT GENERATED ALWAYS AS (TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) STORED;
        ALTER TABLE profiles ADD COLUMN phone TEXT;
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        
        -- Healthcare-specific fields
        ALTER TABLE profiles ADD COLUMN professional_license TEXT;
        ALTER TABLE profiles ADD COLUMN specialty TEXT[];
        ALTER TABLE profiles ADD COLUMN department TEXT;
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        ALTER TABLE profiles ADD COLUMN hire_date DATE;
        ALTER TABLE profiles ADD COLUMN termination_date DATE;
        
        -- Permissions and access control
        ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}'::JSONB;
        ALTER TABLE profiles ADD COLUMN access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 10);
        ALTER TABLE profiles ADD COLUMN can_access_all_patients BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN restricted_areas TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        -- LGPD Consent tracking
        ALTER TABLE profiles ADD COLUMN lgpd_consent_given BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN lgpd_consent_date TIMESTAMPTZ;
        ALTER TABLE profiles ADD COLUMN lgpd_consent_version TEXT;
        ALTER TABLE profiles ADD COLUMN privacy_settings JSONB DEFAULT '{}'::JSONB;
        
        -- Contact preferences
        ALTER TABLE profiles ADD COLUMN preferred_language TEXT DEFAULT 'pt-BR';
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::JSONB;
        ALTER TABLE profiles ADD COLUMN communication_consent JSONB DEFAULT '{}'::JSONB;
        
        -- Audit and security
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
        ALTER TABLE profiles ADD COLUMN password_changed_at TIMESTAMPTZ;
        ALTER TABLE profiles ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
        ALTER TABLE profiles ADD COLUMN account_locked_until TIMESTAMPTZ;
        ALTER TABLE profiles ADD COLUMN mfa_enabled BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
        
        -- Set default clinic_id if not exists
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_clinic_role ON profiles(clinic_id, role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON profiles(role, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles USING gin(to_tsvector('portuguese', full_name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_professional_license ON profiles(professional_license) WHERE professional_license IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);

-- =============================================================================
-- HEALTHCARE PROFESSIONALS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS healthcare_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Professional identity
    professional_type TEXT NOT NULL CHECK (professional_type IN (
        'doctor', 'nurse', 'physiotherapist', 'psychologist', 'nutritionist', 
        'pharmacist', 'dentist', 'veterinarian', 'other_health_professional'
    )),
    specialty_primary TEXT,
    specialty_secondary TEXT[],
    sub_specialties TEXT[],
    
    -- Licenses and certifications
    crm_number TEXT, -- Conselho Regional de Medicina
    coren_number TEXT, -- Conselho Regional de Enfermagem
    crefito_number TEXT, -- Conselho Regional de Fisioterapia
    crp_number TEXT, -- Conselho Regional de Psicologia
    other_license_numbers JSONB DEFAULT '{}'::JSONB,
    
    -- Professional information
    medical_school TEXT,
    graduation_year INTEGER,
    residency_hospital TEXT,
    fellowship_details TEXT[],
    board_certifications TEXT[],
    continuing_education JSONB DEFAULT '[]'::JSONB,
    
    -- Practice information
    years_of_experience INTEGER,
    languages_spoken TEXT[] DEFAULT ARRAY['português']::TEXT[],
    consultation_fee DECIMAL(10,2),
    accepts_insurance BOOLEAN DEFAULT true,
    insurance_plans TEXT[],
    
    -- Schedule and availability
    working_hours JSONB DEFAULT '{}'::JSONB,
    consultation_duration_minutes INTEGER DEFAULT 30,
    max_daily_appointments INTEGER DEFAULT 20,
    advance_booking_days INTEGER DEFAULT 30,
    
    -- Digital presence
    bio TEXT,
    education_summary TEXT,
    experience_summary TEXT,
    profile_image_url TEXT,
    telemedicine_enabled BOOLEAN DEFAULT false,
    
    -- Compliance and verification
    license_verified BOOLEAN DEFAULT false,
    license_verification_date TIMESTAMPTZ,
    background_check_completed BOOLEAN DEFAULT false,
    background_check_date TIMESTAMPTZ,
    malpractice_insurance BOOLEAN DEFAULT false,
    malpractice_policy_number TEXT,
    
    -- Status and audit
    professional_status TEXT DEFAULT 'active' CHECK (professional_status IN ('active', 'inactive', 'suspended', 'retired')),
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT healthcare_professionals_user_clinic_unique UNIQUE (user_id, clinic_id),
    CONSTRAINT valid_graduation_year CHECK (graduation_year > 1900 AND graduation_year <= EXTRACT(YEAR FROM NOW())),
    CONSTRAINT valid_experience CHECK (years_of_experience >= 0 AND years_of_experience <= 70)
);

-- Create indexes for healthcare_professionals
CREATE INDEX idx_healthcare_professionals_clinic_type ON healthcare_professionals(clinic_id, professional_type);
CREATE INDEX idx_healthcare_professionals_specialty ON healthcare_professionals(specialty_primary);
CREATE INDEX idx_healthcare_professionals_status ON healthcare_professionals(professional_status, clinic_id);
CREATE INDEX idx_healthcare_professionals_license_verified ON healthcare_professionals(license_verified, professional_status);
CREATE INDEX idx_healthcare_professionals_user_id ON healthcare_professionals(user_id);

-- =============================================================================
-- ENHANCED PATIENTS TABLE
-- =============================================================================

-- Check if patients table exists, enhance it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patients') THEN
        CREATE TABLE patients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Add healthcare-specific columns to patients
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cpf') THEN
        -- Personal identification
        ALTER TABLE patients ADD COLUMN cpf TEXT UNIQUE;
        ALTER TABLE patients ADD COLUMN rg TEXT;
        ALTER TABLE patients ADD COLUMN passport_number TEXT;
        ALTER TABLE patients ADD COLUMN birth_date DATE;
        ALTER TABLE patients ADD COLUMN gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado'));
        ALTER TABLE patients ADD COLUMN nationality TEXT DEFAULT 'brasileira';
        ALTER TABLE patients ADD COLUMN marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'));
        
        -- Contact information
        ALTER TABLE patients ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
        ALTER TABLE patients ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
        ALTER TABLE patients ADD COLUMN full_name TEXT GENERATED ALWAYS AS (TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) STORED;
        ALTER TABLE patients ADD COLUMN email TEXT;
        ALTER TABLE patients ADD COLUMN phone_primary TEXT;
        ALTER TABLE patients ADD COLUMN phone_secondary TEXT;
        ALTER TABLE patients ADD COLUMN preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'whatsapp'));
        
        -- Address information
        ALTER TABLE patients ADD COLUMN address_street TEXT;
        ALTER TABLE patients ADD COLUMN address_number TEXT;
        ALTER TABLE patients ADD COLUMN address_complement TEXT;
        ALTER TABLE patients ADD COLUMN address_neighborhood TEXT;
        ALTER TABLE patients ADD COLUMN address_city TEXT;
        ALTER TABLE patients ADD COLUMN address_state TEXT;
        ALTER TABLE patients ADD COLUMN address_zipcode TEXT;
        ALTER TABLE patients ADD COLUMN address_country TEXT DEFAULT 'Brasil';
        
        -- Emergency contact
        ALTER TABLE patients ADD COLUMN emergency_contact_name TEXT;
        ALTER TABLE patients ADD COLUMN emergency_contact_phone TEXT;
        ALTER TABLE patients ADD COLUMN emergency_contact_relationship TEXT;
        
        -- Healthcare information
        ALTER TABLE patients ADD COLUMN blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));
        ALTER TABLE patients ADD COLUMN allergies TEXT[];
        ALTER TABLE patients ADD COLUMN chronic_conditions TEXT[];
        ALTER TABLE patients ADD COLUMN current_medications TEXT[];
        ALTER TABLE patients ADD COLUMN insurance_provider TEXT;
        ALTER TABLE patients ADD COLUMN insurance_number TEXT;
        ALTER TABLE patients ADD COLUMN insurance_plan TEXT;
        
        -- LGPD Compliance
        ALTER TABLE patients ADD COLUMN lgpd_consent_given BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE patients ADD COLUMN lgpd_consent_date TIMESTAMPTZ;
        ALTER TABLE patients ADD COLUMN lgpd_consent_version TEXT;
        ALTER TABLE patients ADD COLUMN data_sharing_consent JSONB DEFAULT '{}'::JSONB;
        ALTER TABLE patients ADD COLUMN marketing_consent BOOLEAN DEFAULT false;
        ALTER TABLE patients ADD COLUMN research_consent BOOLEAN DEFAULT false;
        
        -- Behavioral and AI data
        ALTER TABLE patients ADD COLUMN preferred_appointment_time TEXT[];
        ALTER TABLE patients ADD COLUMN no_show_risk_score INTEGER DEFAULT 0 CHECK (no_show_risk_score BETWEEN 0 AND 100);
        ALTER TABLE patients ADD COLUMN last_no_show_date TIMESTAMPTZ;
        ALTER TABLE patients ADD COLUMN total_no_shows INTEGER DEFAULT 0;
        ALTER TABLE patients ADD COLUMN total_appointments INTEGER DEFAULT 0;
        ALTER TABLE patients ADD COLUMN patient_notes TEXT;
        ALTER TABLE patients ADD COLUMN communication_preferences JSONB DEFAULT '{}'::JSONB;
        
        -- Status and audit
        ALTER TABLE patients ADD COLUMN patient_status TEXT DEFAULT 'active' CHECK (patient_status IN ('active', 'inactive', 'suspended', 'deceased'));
        ALTER TABLE patients ADD COLUMN registration_source TEXT DEFAULT 'manual' CHECK (registration_source IN ('manual', 'online', 'referral', 'import', 'api'));
        ALTER TABLE patients ADD COLUMN primary_doctor_id UUID REFERENCES healthcare_professionals(id);
        ALTER TABLE patients ADD COLUMN last_visit_date TIMESTAMPTZ;
        ALTER TABLE patients ADD COLUMN next_appointment_date TIMESTAMPTZ;
        ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMPTZ;
        
        -- Set default clinic_id if not exists
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS name TEXT;
        
        -- Update full_name from existing name if needed
        UPDATE patients SET first_name = SPLIT_PART(name, ' ', 1), last_name = SPLIT_PART(name, ' ', 2) WHERE name IS NOT NULL AND first_name IS NULL;
    END IF;
END $$;

-- Create indexes for patients
CREATE INDEX IF NOT EXISTS idx_patients_clinic_status ON patients(clinic_id, patient_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients USING gin(to_tsvector('portuguese', full_name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_primary_doctor ON patients(primary_doctor_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_no_show_risk ON patients(no_show_risk_score DESC) WHERE patient_status = 'active';
CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON patients(last_visit_date DESC) WHERE deleted_at IS NULL;

-- =============================================================================
-- MEDICAL SPECIALTIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical_specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT CHECK (category IN ('clinical', 'surgical', 'diagnostic', 'therapeutic', 'preventive')),
    cfm_code TEXT, -- Código do Conselho Federal de Medicina
    requires_referral BOOLEAN DEFAULT false,
    average_consultation_time INTEGER DEFAULT 30, -- minutes
    common_procedures TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert common Brazilian medical specialties
INSERT INTO medical_specialties (name, description, category, cfm_code, requires_referral, average_consultation_time) VALUES
('Clínica Médica', 'Medicina Interna', 'clinical', '1', false, 30),
('Cardiologia', 'Doenças do coração e sistema circulatório', 'clinical', '2', true, 30),
('Dermatologia', 'Doenças da pele', 'clinical', '3', true, 20),
('Endocrinologia', 'Doenças hormonais e metabólicas', 'clinical', '4', true, 30),
('Gastroenterologia', 'Doenças do sistema digestivo', 'clinical', '5', true, 30),
('Ginecologia', 'Saúde feminina', 'clinical', '6', false, 30),
('Neurologia', 'Doenças do sistema nervoso', 'clinical', '7', true, 40),
('Oftalmologia', 'Doenças dos olhos', 'clinical', '8', true, 20),
('Ortopedia', 'Doenças do sistema musculoesquelético', 'clinical', '9', true, 30),
('Pediatria', 'Medicina infantil', 'clinical', '10', false, 20),
('Psiquiatria', 'Saúde mental', 'clinical', '11', true, 50),
('Urologia', 'Doenças do sistema urinário', 'clinical', '12', true, 30)
ON CONFLICT (name) DO NOTHING;

-- Create index for medical_specialties
CREATE INDEX idx_medical_specialties_category ON medical_specialties(category, is_active);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;

-- Clinics RLS Policies
CREATE POLICY "clinics_admin_full_access" ON clinics
FOR ALL USING (
    (auth.jwt() ->> 'role')::TEXT = 'super_admin'
);

CREATE POLICY "clinics_owner_access" ON clinics
FOR ALL USING (
    id = (auth.jwt() ->> 'clinic_id')::UUID OR
    created_by = auth.uid()
);

CREATE POLICY "clinics_staff_read_own" ON clinics
FOR SELECT USING (
    id = (auth.jwt() ->> 'clinic_id')::UUID
);

-- Profiles RLS Policies
CREATE POLICY "profiles_self_access" ON profiles
FOR ALL USING (
    id = auth.uid()
);

CREATE POLICY "profiles_clinic_staff_read" ON profiles
FOR SELECT USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::UUID AND
    (auth.jwt() ->> 'role')::TEXT IN ('admin', 'doctor', 'nurse', 'receptionist')
);

CREATE POLICY "profiles_admin_full_access" ON profiles
FOR ALL USING (
    (auth.jwt() ->> 'role')::TEXT = 'super_admin' OR
    (clinic_id = (auth.jwt() ->> 'clinic_id')::UUID AND (auth.jwt() ->> 'role')::TEXT = 'admin')
);

-- Healthcare Professionals RLS Policies
CREATE POLICY "healthcare_professionals_clinic_access" ON healthcare_professionals
FOR ALL USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
    (auth.jwt() ->> 'role')::TEXT = 'super_admin'
);

CREATE POLICY "healthcare_professionals_self_read" ON healthcare_professionals
FOR SELECT USING (
    user_id = auth.uid()
);

-- Patients RLS Policies
CREATE POLICY "patients_clinic_access" ON patients
FOR ALL USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
    (auth.jwt() ->> 'role')::TEXT = 'super_admin'
);

CREATE POLICY "patients_doctor_assigned" ON patients
FOR SELECT USING (
    primary_doctor_id IN (
        SELECT id FROM healthcare_professionals 
        WHERE user_id = auth.uid() AND clinic_id = patients.clinic_id
    )
);

-- Medical Specialties RLS Policies (read-only for all authenticated users)
CREATE POLICY "medical_specialties_read_all" ON medical_specialties
FOR SELECT USING (
    auth.role() = 'authenticated'
);

CREATE POLICY "medical_specialties_admin_write" ON medical_specialties
FOR INSERT, UPDATE, DELETE USING (
    (auth.jwt() ->> 'role')::TEXT IN ('super_admin', 'admin')
);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_clinics_updated_at ON clinics;
CREATE TRIGGER update_clinics_updated_at 
    BEFORE UPDATE ON clinics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_healthcare_professionals_updated_at ON healthcare_professionals;
CREATE TRIGGER update_healthcare_professionals_updated_at 
    BEFORE UPDATE ON healthcare_professionals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_specialties_updated_at ON medical_specialties;
CREATE TRIGGER update_medical_specialties_updated_at 
    BEFORE UPDATE ON medical_specialties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_professionals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON patients TO authenticated;
GRANT SELECT ON medical_specialties TO authenticated;

-- Grant specific permissions to service role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE clinics IS 'Healthcare organizations with LGPD compliance and regulatory information';
COMMENT ON TABLE profiles IS 'Enhanced user profiles with healthcare roles and LGPD consent tracking';
COMMENT ON TABLE healthcare_professionals IS 'Healthcare professionals with licenses, specialties, and practice information';
COMMENT ON TABLE patients IS 'Patient records with comprehensive healthcare data and LGPD compliance';
COMMENT ON TABLE medical_specialties IS 'Medical specialties catalog with CFM codes and requirements';

-- Add column comments for important fields
COMMENT ON COLUMN patients.no_show_risk_score IS 'AI-calculated risk score for appointment no-shows (0-100)';
COMMENT ON COLUMN patients.lgpd_consent_given IS 'LGPD consent status - required for data processing';
COMMENT ON COLUMN healthcare_professionals.license_verified IS 'Professional license verification status';
COMMENT ON COLUMN clinics.anvisa_license IS 'ANVISA license number for pharmaceutical activities';

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Log the migration completion
INSERT INTO ai_audit_trail (
    operation_id, 
    service_name, 
    operation_type, 
    status, 
    output_data, 
    timestamp
) VALUES (
    'migration-healthcare-core-' || extract(epoch from now())::text,
    'database_migration',
    'data_processing',
    'completed',
    jsonb_build_object(
        'migration', '20250125_healthcare_core_schema',
        'tables_created', 5,
        'policies_created', 12,
        'version', '1.0.0'
    ),
    NOW()
) ON CONFLICT DO NOTHING;

SELECT 'Healthcare Core Schema Migration Completed Successfully - LGPD Compliant' as status;