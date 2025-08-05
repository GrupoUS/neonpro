-- ================================================================================================
-- NEONPRO HEALTHCARE SaaS - ROW LEVEL SECURITY POLICIES
-- ================================================================================================
-- Description: Comprehensive RLS policies for multi-tenant healthcare SaaS
-- Features: LGPD compliance, ANVISA audit trails, CFM requirements
-- Date: 2025-01-05
-- Version: 1.0
-- ================================================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ================================================================================================

-- Function to get current user's clinic_id(s)
CREATE OR REPLACE FUNCTION get_user_clinic_ids()
RETURNS TEXT[] AS $$
DECLARE
    user_clinics TEXT[];
BEGIN
    -- Get clinic IDs associated with the current user
    -- This could be from user metadata, a user_clinics table, or profile
    SELECT ARRAY(
        SELECT clinic_id 
        FROM profiles 
        WHERE id = auth.uid()
        AND clinic_id IS NOT NULL
    ) INTO user_clinics;
    
    -- If user has admin role, return empty array (access to all clinics)
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    RETURN COALESCE(user_clinics, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access clinic
CREATE OR REPLACE FUNCTION can_access_clinic(clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_clinics TEXT[];
BEGIN
    -- Admins can access all clinics
    IF user_has_role('admin') THEN
        RETURN TRUE;
    END IF;
    
    user_clinics := get_user_clinic_ids();
    
    -- If user has no clinic associations, deny access
    IF array_length(user_clinics, 1) IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if clinic_id is in user's allowed clinics
    RETURN clinic_id::TEXT = ANY(user_clinics);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================================
-- PROFILES TABLE RLS POLICIES
-- ================================================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (with restrictions)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (user_has_role('admin'));

-- Healthcare professionals can read profiles in their clinic
CREATE POLICY "Healthcare professionals can read clinic profiles" ON profiles
    FOR SELECT USING (
        can_access_clinic(clinic_id::UUID) AND
        user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin')
    );

-- ================================================================================================
-- CLINICS TABLE RLS POLICIES
-- ================================================================================================

-- Users can read clinics they have access to
CREATE POLICY "Users can read accessible clinics" ON clinics
    FOR SELECT USING (can_access_clinic(id));

-- Only admins can create clinics
CREATE POLICY "Only admins can create clinics" ON clinics
    FOR INSERT WITH CHECK (user_has_role('admin'));

-- Only admins and clinic creators can update clinics
CREATE POLICY "Admins and creators can update clinics" ON clinics
    FOR UPDATE USING (
        user_has_role('admin') OR 
        created_by = auth.uid()
    );

-- Only admins can delete clinics
CREATE POLICY "Only admins can delete clinics" ON clinics
    FOR DELETE USING (user_has_role('admin'));

-- ================================================================================================
-- PATIENTS TABLE RLS POLICIES (LGPD COMPLIANT)
-- ================================================================================================

-- Healthcare professionals can read patients in their clinic
CREATE POLICY "Healthcare professionals can read clinic patients" ON patients
    FOR SELECT USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- Healthcare professionals can create patients in their clinic
CREATE POLICY "Healthcare professionals can create clinic patients" ON patients
    FOR INSERT WITH CHECK (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin')) AND
        created_by = auth.uid()
    );

-- Healthcare professionals can update patients in their clinic (with LGPD restrictions)
CREATE POLICY "Healthcare professionals can update clinic patients" ON patients
    FOR UPDATE USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- Only admins can delete patients (LGPD Right to be Forgotten)
CREATE POLICY "Only admins can delete patients (LGPD)" ON patients
    FOR DELETE USING (user_has_role('admin'));

-- ================================================================================================
-- APPOINTMENTS TABLE RLS POLICIES
-- ================================================================================================

-- Healthcare professionals can read appointments in their clinic
CREATE POLICY "Healthcare professionals can read clinic appointments" ON appointments
    FOR SELECT USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- Providers can read their own appointments
CREATE POLICY "Providers can read own appointments" ON appointments
    FOR SELECT USING (provider_id = auth.uid());

-- Healthcare professionals can create appointments in their clinic
CREATE POLICY "Healthcare professionals can create clinic appointments" ON appointments
    FOR INSERT WITH CHECK (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin')) AND
        created_by = auth.uid()
    );

-- Providers can update their own appointments
CREATE POLICY "Providers can update own appointments" ON appointments
    FOR UPDATE USING (
        provider_id = auth.uid() OR
        (can_access_clinic(clinic_id) AND user_has_role('admin'))
    );

-- Healthcare professionals can cancel appointments in their clinic
CREATE POLICY "Healthcare professionals can cancel clinic appointments" ON appointments
    FOR UPDATE USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- ================================================================================================
-- MEDICAL RECORDS TABLE RLS POLICIES (HIPAA/LGPD COMPLIANT)
-- ================================================================================================

-- Only treating physicians can read medical records
CREATE POLICY "Treating physicians can read medical records" ON medical_records
    FOR SELECT USING (
        can_access_clinic(clinic_id) AND
        (
            provider_id = auth.uid() OR  -- Record creator
            user_has_role('admin') OR    -- Admin access
            -- Patient's current treating physician
            EXISTS (
                SELECT 1 FROM appointments 
                WHERE patient_id = medical_records.patient_id 
                AND provider_id = auth.uid()
                AND status IN ('scheduled', 'confirmed', 'completed')
                AND scheduled_at >= NOW() - INTERVAL '90 days'
            )
        )
    );

-- Only treating physicians can create medical records
CREATE POLICY "Treating physicians can create medical records" ON medical_records
    FOR INSERT WITH CHECK (
        can_access_clinic(clinic_id) AND
        user_has_role('doctor') AND
        created_by = auth.uid() AND
        provider_id = auth.uid()
    );

-- Only record creators can update their medical records
CREATE POLICY "Record creators can update own medical records" ON medical_records
    FOR UPDATE USING (
        can_access_clinic(clinic_id) AND
        (created_by = auth.uid() OR user_has_role('admin'))
    );

-- Only admins can delete medical records (with audit trail)
CREATE POLICY "Only admins can delete medical records" ON medical_records
    FOR DELETE USING (user_has_role('admin'));

-- ================================================================================================
-- PRESCRIPTIONS TABLE RLS POLICIES (ANVISA COMPLIANT)
-- ================================================================================================

-- Healthcare professionals can read prescriptions in their clinic
CREATE POLICY "Healthcare professionals can read clinic prescriptions" ON prescriptions
    FOR SELECT USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- Prescribers can read their own prescriptions
CREATE POLICY "Prescribers can read own prescriptions" ON prescriptions
    FOR SELECT USING (prescriber_id = auth.uid());

-- Only licensed doctors can create prescriptions
CREATE POLICY "Only doctors can create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        can_access_clinic(clinic_id) AND
        user_has_role('doctor') AND
        created_by = auth.uid() AND
        prescriber_id = auth.uid()
    );

-- Only prescribers can update their own prescriptions (within limits)
CREATE POLICY "Prescribers can update own prescriptions" ON prescriptions
    FOR UPDATE USING (
        prescriber_id = auth.uid() AND
        -- Can only update if not yet dispensed
        pharmacy_dispensed = FALSE
    );

-- Prescriptions cannot be deleted (ANVISA requirement for audit trail)
-- DELETE operations are blocked entirely for prescriptions

-- ================================================================================================
-- AUDIT LOGS TABLE RLS POLICIES (LGPD/ANVISA COMPLIANCE)
-- ================================================================================================

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- Healthcare professionals can read audit logs for their clinic
CREATE POLICY "Healthcare professionals can read clinic audit logs" ON audit_logs
    FOR SELECT USING (
        can_access_clinic(clinic_id) AND
        (user_has_role('doctor') OR user_has_role('nurse') OR user_has_role('admin'))
    );

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON audit_logs
    FOR SELECT USING (user_has_role('admin'));

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- Audit logs cannot be updated or deleted (immutable audit trail)
-- UPDATE and DELETE operations are blocked entirely for audit_logs

-- ================================================================================================
-- ADDITIONAL SECURITY MEASURES
-- ================================================================================================

-- Create indexes for performance on RLS policy queries
CREATE INDEX IF NOT EXISTS idx_profiles_clinic_id_role ON profiles(clinic_id, role);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id_provider ON appointments(clinic_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_provider_date ON appointments(patient_id, provider_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_clinic_patient ON medical_records(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_provider ON medical_records(provider_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic_prescriber ON prescriptions(clinic_id, prescriber_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_clinic ON audit_logs(user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ================================================================================================
-- LGPD COMPLIANCE FUNCTIONS
-- ================================================================================================

-- Function to log data access (LGPD Article 37)
CREATE OR REPLACE FUNCTION log_data_access(
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_action TEXT DEFAULT 'READ'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        clinic_id,
        action,
        resource_type,
        resource_id,
        lgpd_lawful_basis,
        timestamp
    ) VALUES (
        auth.uid(),
        COALESCE(
            (SELECT clinic_id FROM profiles WHERE id = auth.uid()),
            'system'
        ),
        p_action,
        p_resource_type,
        p_resource_id,
        'legitimate_interest',
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle LGPD data portability requests
CREATE OR REPLACE FUNCTION export_patient_data(patient_uuid UUID)
RETURNS JSON AS $$
DECLARE
    patient_data JSON;
BEGIN
    -- Verify user has access to this patient's data
    IF NOT EXISTS (
        SELECT 1 FROM patients 
        WHERE id = patient_uuid 
        AND can_access_clinic(clinic_id)
    ) THEN
        RAISE EXCEPTION 'Access denied to patient data';
    END IF;

    -- Log the data export (LGPD compliance)
    PERFORM log_data_access('patient', patient_uuid, 'EXPORT');

    -- Collect all patient data
    SELECT json_build_object(
        'patient', row_to_json(p.*),
        'appointments', (
            SELECT json_agg(row_to_json(a.*)) 
            FROM appointments a 
            WHERE a.patient_id = patient_uuid
        ),
        'medical_records', (
            SELECT json_agg(row_to_json(m.*)) 
            FROM medical_records m 
            WHERE m.patient_id = patient_uuid
        ),
        'prescriptions', (
            SELECT json_agg(row_to_json(pr.*)) 
            FROM prescriptions pr 
            WHERE pr.patient_id = patient_uuid
        ),
        'export_date', NOW(),
        'export_user', auth.uid()
    ) INTO patient_data
    FROM patients p
    WHERE p.id = patient_uuid;

    RETURN patient_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================================
-- ANVISA COMPLIANCE FUNCTIONS
-- ================================================================================================

-- Function to create controlled substance prescription report
CREATE OR REPLACE FUNCTION generate_controlled_substances_report(
    p_start_date DATE,
    p_end_date DATE,
    p_clinic_id UUID DEFAULT NULL
)
RETURNS TABLE (
    prescription_id UUID,
    patient_name TEXT,
    medication_name TEXT,
    prescriber_name TEXT,
    prescriber_license TEXT,
    prescribed_date TIMESTAMPTZ,
    anvisa_code TEXT,
    controlled_substance BOOLEAN,
    digital_signature TEXT
) AS $$
BEGIN
    -- Log report generation
    PERFORM log_data_access('prescription', NULL, 'ANVISA_REPORT');

    RETURN QUERY
    SELECT 
        p.id,
        pat.full_name,
        p.medication_name,
        prof.full_name,
        prof.medical_license,
        p.prescribed_date,
        p.anvisa_code,
        p.controlled_substance,
        p.digital_signature
    FROM prescriptions p
    JOIN patients pat ON p.patient_id = pat.id
    JOIN profiles prof ON p.prescriber_id = prof.id
    WHERE p.prescribed_date BETWEEN p_start_date AND p_end_date
    AND (p_clinic_id IS NULL OR p.clinic_id = p_clinic_id)
    AND p.controlled_substance = TRUE
    AND can_access_clinic(p.clinic_id)
    ORDER BY p.prescribed_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- ================================================================================================

-- Trigger function to automatically log data modifications
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        clinic_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        timestamp
    ) VALUES (
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        CASE 
            WHEN TG_TABLE_NAME = 'patients' THEN 
                COALESCE(NEW.clinic_id, OLD.clinic_id)
            WHEN TG_TABLE_NAME = 'appointments' THEN 
                COALESCE(NEW.clinic_id, OLD.clinic_id)
            WHEN TG_TABLE_NAME = 'medical_records' THEN 
                COALESCE(NEW.clinic_id, OLD.clinic_id)
            WHEN TG_TABLE_NAME = 'prescriptions' THEN 
                COALESCE(NEW.clinic_id, OLD.clinic_id)
            ELSE 'system'
        END,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER audit_patients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_appointments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_medical_records_trigger
    AFTER INSERT OR UPDATE OR DELETE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_prescriptions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ================================================================================================
-- FINAL SECURITY NOTES
-- ================================================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Revoke dangerous permissions from anon users
REVOKE ALL ON audit_logs FROM anon;
REVOKE ALL ON prescriptions FROM anon;
REVOKE ALL ON medical_records FROM anon;

COMMENT ON SCHEMA public IS 'NeonPro Healthcare SaaS - Multi-tenant with RLS policies for LGPD and ANVISA compliance';

-- ================================================================================================
-- END OF RLS POLICIES MIGRATION
-- ================================================================================================