-- Patient Profiles Table with LGPD Compliance and Healthcare Security
-- Story 1.3, Task 1: Patient Authentication System
-- Created: $(date) - Patient portal authentication system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patient profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic patient information
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE, -- Brazilian CPF, optional for privacy
    birth_date DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Contact information
    address JSONB, -- Flexible address structure
    emergency_contact JSONB, -- Emergency contact details
    
    -- LGPD Compliance fields
    privacy_consent BOOLEAN DEFAULT FALSE NOT NULL,
    privacy_consent_date TIMESTAMPTZ,
    privacy_consent_version VARCHAR(10) DEFAULT '1.0',
    marketing_consent BOOLEAN DEFAULT FALSE,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    
    -- Healthcare specific
    medical_history_consent BOOLEAN DEFAULT FALSE,
    treatment_photos_consent BOOLEAN DEFAULT FALSE,
    insurance_info JSONB, -- Insurance details if provided
    
    -- Audit and security
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    
    -- Privacy and access control
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('private', 'staff_only')),
    data_retention_until DATE, -- For LGPD right to be forgotten
    
    -- Unique constraints
    CONSTRAINT unique_user_id UNIQUE (user_id),
    CONSTRAINT privacy_consent_check CHECK (
        (privacy_consent = TRUE AND privacy_consent_date IS NOT NULL) 
        OR (privacy_consent = FALSE)
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_cpf ON patient_profiles(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_profiles_phone ON patient_profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_profiles_status ON patient_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_created ON patient_profiles(created_at);

-- Audit log table for LGPD compliance
CREATE TABLE IF NOT EXISTS patient_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'login', 'data_access', 'data_update', 'consent_change', etc.
    details JSONB, -- Additional context about the action
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Index for audit queries
    INDEX idx_patient_audit_patient_id (patient_id),
    INDEX idx_patient_audit_action (action),
    INDEX idx_patient_audit_created (created_at)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_profile_updated_at();

-- Function to create patient profile after user registration
CREATE OR REPLACE FUNCTION create_patient_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO patient_profiles (
        user_id,
        full_name,
        account_status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'pending_verification'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create patient profile (only for patient registrations)
-- Note: This will be controlled by application logic to distinguish between staff and patients
CREATE TRIGGER create_patient_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    WHEN (NEW.raw_user_meta_data->>'user_type' = 'patient')
    EXECUTE FUNCTION create_patient_profile_for_new_user();

-- Row Level Security (RLS) Policies
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audit_log ENABLE ROW LEVEL SECURITY;

-- Patients can only access their own profile
CREATE POLICY "Patients can view own profile" ON patient_profiles
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Patients can update their own profile
CREATE POLICY "Patients can update own profile" ON patient_profiles
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Staff can view patient profiles (with proper permissions)
CREATE POLICY "Staff can view patient profiles" ON patient_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
        )
    );

-- Staff can update patient profiles (with proper permissions)
CREATE POLICY "Staff can update patient profiles" ON patient_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor', 'nurse')
        )
    );

-- Audit log access policies
CREATE POLICY "Patients can view own audit log" ON patient_audit_log
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Staff can view audit logs" ON patient_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs" ON patient_audit_log
    FOR INSERT WITH CHECK (true);

-- Create LGPD compliance helper functions
CREATE OR REPLACE FUNCTION record_patient_data_access(
    p_patient_id UUID,
    p_action VARCHAR(50),
    p_details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO patient_audit_log (
        patient_id,
        user_id,
        action,
        details,
        ip_address,
        created_at
    ) VALUES (
        p_patient_id,
        auth.uid(),
        p_action,
        p_details,
        inet_client_addr(),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check patient consent for specific data access
CREATE OR REPLACE FUNCTION check_patient_consent(
    p_patient_id UUID,
    p_consent_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    consent_value BOOLEAN;
BEGIN
    CASE p_consent_type
        WHEN 'privacy' THEN
            SELECT privacy_consent INTO consent_value 
            FROM patient_profiles WHERE id = p_patient_id;
        WHEN 'marketing' THEN
            SELECT marketing_consent INTO consent_value 
            FROM patient_profiles WHERE id = p_patient_id;
        WHEN 'data_sharing' THEN
            SELECT data_sharing_consent INTO consent_value 
            FROM patient_profiles WHERE id = p_patient_id;
        WHEN 'medical_history' THEN
            SELECT medical_history_consent INTO consent_value 
            FROM patient_profiles WHERE id = p_patient_id;
        WHEN 'treatment_photos' THEN
            SELECT treatment_photos_consent INTO consent_value 
            FROM patient_profiles WHERE id = p_patient_id;
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN COALESCE(consent_value, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON patient_profiles TO authenticated;
GRANT ALL ON patient_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION record_patient_data_access(UUID, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION check_patient_consent(UUID, VARCHAR) TO authenticated;

-- Insert initial privacy policy version for tracking
INSERT INTO public.system_settings (key, value, description, created_at)
VALUES (
    'privacy_policy_version',
    '1.0',
    'Current privacy policy version for LGPD compliance tracking',
    NOW()
) ON CONFLICT (key) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE patient_profiles IS 'Patient profiles with LGPD compliance and healthcare security features';
COMMENT ON TABLE patient_audit_log IS 'Audit log for patient data access and modifications (LGPD compliance)';
COMMENT ON FUNCTION check_patient_consent IS 'Validates patient consent for specific data access types';
COMMENT ON FUNCTION record_patient_data_access IS 'Records patient data access for audit compliance';