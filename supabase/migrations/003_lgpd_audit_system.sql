-- Migration: LGPD Audit System
-- LGPD (Lei Geral de Proteção de Dados) Compliance Audit Tables
-- Implements comprehensive audit logging for healthcare data protection

-- Create LGPD audit logs table
CREATE TABLE public.lgpd_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'data_access',
        'data_modification', 
        'data_deletion',
        'consent_granted',
        'consent_revoked',
        'data_export',
        'user_authentication',
        'sensitive_data_access',
        'patient_record_access',
        'medical_procedure_access',
        'professional_access',
        'system_admin_access',
        'audit_log_access'
    )),
    
    -- User and entity identification
    user_id UUID REFERENCES auth.users(id),
    patient_id UUID,
    clinic_id UUID,
    
    -- Data access details
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    
    -- Data change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Session and security information
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- LGPD compliance fields
    consent_type TEXT,
    data_subject_rights TEXT CHECK (data_subject_rights IN (
        'access',
        'rectification', 
        'erasure',
        'portability',
        'restriction',
        'objection',
        'consent_withdrawal'
    )),
    legal_basis TEXT NOT NULL DEFAULT 'Legitimate interest',
    purpose TEXT NOT NULL DEFAULT 'Healthcare service provision',
    retention_period TEXT DEFAULT '20_years',
    
    -- Compliance status
    encryption_status BOOLEAN DEFAULT true,
    anonymization_status BOOLEAN DEFAULT false,
    
    -- Metadata and timestamps
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT valid_retention_period CHECK (retention_period IN (
        '1_year', '5_years', '10_years', '20_years', 
        'indefinite_or_until_withdrawal', 'legal_requirement'
    ))
);

-- Create indexes for optimal query performance
CREATE INDEX idx_lgpd_audit_logs_event_type ON public.lgpd_audit_logs(event_type);
CREATE INDEX idx_lgpd_audit_logs_user_id ON public.lgpd_audit_logs(user_id);
CREATE INDEX idx_lgpd_audit_logs_patient_id ON public.lgpd_audit_logs(patient_id);
CREATE INDEX idx_lgpd_audit_logs_clinic_id ON public.lgpd_audit_logs(clinic_id);
CREATE INDEX idx_lgpd_audit_logs_table_name ON public.lgpd_audit_logs(table_name);
CREATE INDEX idx_lgpd_audit_logs_created_at ON public.lgpd_audit_logs(created_at DESC);
CREATE INDEX idx_lgpd_audit_logs_sensitive_access ON public.lgpd_audit_logs(event_type, patient_id, created_at) 
    WHERE event_type IN ('sensitive_data_access', 'patient_record_access');

-- Create patient consents table for LGPD compliance
CREATE TABLE public.patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity relationships
    patient_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Consent details
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'medical_treatment',
        'data_processing', 
        'marketing',
        'research',
        'data_sharing',
        'photo_usage',
        'telemedicine',
        'wearable_integration',
        'wellness_tracking'
    )),
    
    -- Consent status and lifecycle
    consent_status TEXT NOT NULL DEFAULT 'active' CHECK (consent_status IN (
        'active', 'withdrawn', 'expired', 'updated'
    )),
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawal_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    
    -- LGPD compliance details
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL DEFAULT 'Article 8 - Consent',
    data_categories TEXT[] NOT NULL DEFAULT ARRAY['personal', 'medical'],
    retention_period TEXT NOT NULL DEFAULT '20_years',
    
    -- Consent form details
    consent_version TEXT NOT NULL DEFAULT '1.0',
    consent_method TEXT NOT NULL DEFAULT 'digital_signature',
    consent_document_url TEXT,
    
    -- Patient rights information
    withdrawal_method TEXT DEFAULT 'Patient portal or written request',
    can_withdraw BOOLEAN DEFAULT true,
    informed_of_rights BOOLEAN DEFAULT true,
    
    -- Processing details
    processing_activities TEXT[],
    third_party_sharing BOOLEAN DEFAULT false,
    international_transfer BOOLEAN DEFAULT false,
    automated_decision_making BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for patient consents
CREATE INDEX idx_patient_consents_patient_id ON public.patient_consents(patient_id);
CREATE INDEX idx_patient_consents_clinic_id ON public.patient_consents(clinic_id);
CREATE INDEX idx_patient_consents_consent_type ON public.patient_consents(consent_type);
CREATE INDEX idx_patient_consents_status ON public.patient_consents(consent_status);
CREATE INDEX idx_patient_consents_active ON public.patient_consents(patient_id, consent_type) 
    WHERE consent_status = 'active';

-- Create data subject requests table
CREATE TABLE public.data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request identification
    request_number TEXT UNIQUE NOT NULL DEFAULT 'DSR-' || extract(year from now()) || '-' || 
        lpad(nextval('data_subject_request_seq')::text, 6, '0'),
    
    -- Entity relationships
    patient_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    requestor_user_id UUID REFERENCES auth.users(id),
    
    -- Request details
    request_type TEXT NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability', 
        'restriction', 'objection', 'consent_withdrawal'
    )),
    request_description TEXT NOT NULL,
    request_status TEXT NOT NULL DEFAULT 'submitted' CHECK (request_status IN (
        'submitted', 'under_review', 'approved', 'completed', 
        'rejected', 'partially_fulfilled'
    )),
    
    -- Timeline
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Processing details
    affected_tables TEXT[],
    processing_notes TEXT,
    reviewer_user_id UUID REFERENCES auth.users(id),
    completion_method TEXT,
    
    -- Legal compliance
    legal_basis_for_rejection TEXT,
    patient_verification_status TEXT DEFAULT 'pending' CHECK (patient_verification_status IN (
        'pending', 'verified', 'failed'
    )),
    identity_verification_method TEXT,
    
    -- Output and delivery
    response_delivered_at TIMESTAMPTZ,
    delivery_method TEXT DEFAULT 'secure_portal',
    file_references TEXT[],
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sequence for data subject request numbers
CREATE SEQUENCE data_subject_request_seq START 1;

-- Create indexes for data subject requests
CREATE INDEX idx_data_subject_requests_patient_id ON public.data_subject_requests(patient_id);
CREATE INDEX idx_data_subject_requests_clinic_id ON public.data_subject_requests(clinic_id);
CREATE INDEX idx_data_subject_requests_status ON public.data_subject_requests(request_status);
CREATE INDEX idx_data_subject_requests_type ON public.data_subject_requests(request_type);
CREATE INDEX idx_data_subject_requests_deadline ON public.data_subject_requests(deadline) 
    WHERE request_status IN ('submitted', 'under_review', 'approved');

-- Create LGPD compliance view for easier querying
CREATE VIEW public.lgpd_compliance_summary AS
SELECT 
    p.id as patient_id,
    p.clinic_id,
    p.name as patient_name,
    -- Consent summary
    COUNT(DISTINCT pc.id) FILTER (WHERE pc.consent_status = 'active') as active_consents,
    COUNT(DISTINCT pc.id) FILTER (WHERE pc.consent_status = 'withdrawn') as withdrawn_consents,
    -- Data subject requests summary  
    COUNT(DISTINCT dsr.id) as total_requests,
    COUNT(DISTINCT dsr.id) FILTER (WHERE dsr.request_status = 'completed') as completed_requests,
    -- Recent audit activity
    COUNT(DISTINCT lal.id) FILTER (WHERE lal.created_at > NOW() - INTERVAL '30 days') as recent_audit_entries,
    -- Last access tracking
    MAX(lal.created_at) FILTER (WHERE lal.event_type = 'patient_record_access') as last_record_access,
    MAX(lal.created_at) FILTER (WHERE lal.event_type = 'sensitive_data_access') as last_sensitive_access
FROM 
    patients p
    LEFT JOIN patient_consents pc ON p.id = pc.patient_id AND p.clinic_id = pc.clinic_id
    LEFT JOIN data_subject_requests dsr ON p.id = dsr.patient_id AND p.clinic_id = dsr.clinic_id  
    LEFT JOIN lgpd_audit_logs lal ON p.id = lal.patient_id AND p.clinic_id = lal.clinic_id
GROUP BY p.id, p.clinic_id, p.name;

-- Create function for automatic audit log cleanup (data retention compliance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit logs older than their retention period
    -- Standard retention: 5 years for most audit logs
    DELETE FROM public.lgpd_audit_logs 
    WHERE created_at < NOW() - INTERVAL '5 years'
    AND retention_period IN ('1_year', '5_years');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    INSERT INTO public.lgpd_audit_logs (
        event_type, user_id, table_name, action, 
        purpose, legal_basis, metadata
    ) VALUES (
        'audit_log_access', 
        NULL, 
        'lgpd_audit_logs', 
        'automated_cleanup',
        'Data retention compliance',
        'LGPD data retention requirements',
        jsonb_build_object(
            'deleted_records', deleted_count,
            'cleanup_date', NOW(),
            'automated', true
        )
    );
    
    RETURN deleted_count;
END;
$$;

-- Create trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER trigger_update_patient_consents_updated_at
    BEFORE UPDATE ON public.patient_consents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_data_subject_requests_updated_at  
    BEFORE UPDATE ON public.data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all LGPD tables
ALTER TABLE public.lgpd_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for LGPD audit logs (clinic-based isolation)
CREATE POLICY "Clinic isolation for LGPD audit logs" ON public.lgpd_audit_logs
    FOR ALL 
    USING (
        auth.uid() IS NOT NULL 
        AND (
            clinic_id = (
                SELECT clinic_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'system_admin')
            )
        )
    );

-- Create RLS policies for patient consents
CREATE POLICY "Clinic isolation for patient consents" ON public.patient_consents
    FOR ALL
    USING (
        auth.uid() IS NOT NULL
        AND clinic_id = (
            SELECT clinic_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for data subject requests  
CREATE POLICY "Clinic isolation for data subject requests" ON public.data_subject_requests
    FOR ALL
    USING (
        auth.uid() IS NOT NULL
        AND clinic_id = (
            SELECT clinic_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Grant appropriate permissions
GRANT SELECT, INSERT ON public.lgpd_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_consents TO authenticated;  
GRANT SELECT, INSERT, UPDATE ON public.data_subject_requests TO authenticated;
GRANT SELECT ON public.lgpd_compliance_summary TO authenticated;

-- Grant sequence usage
GRANT USAGE ON SEQUENCE data_subject_request_seq TO authenticated;

-- Create indexes for the compliance summary view
CREATE INDEX idx_patients_lgpd_clinic ON patients(clinic_id, id);

-- Add helpful comments for documentation
COMMENT ON TABLE public.lgpd_audit_logs IS 'LGPD compliance audit trail for all healthcare data operations';
COMMENT ON TABLE public.patient_consents IS 'Patient consent management for LGPD compliance';
COMMENT ON TABLE public.data_subject_requests IS 'Data subject rights requests under LGPD Articles 17-22';
COMMENT ON VIEW public.lgpd_compliance_summary IS 'Summary view of LGPD compliance status per patient';
COMMENT ON FUNCTION public.cleanup_expired_audit_logs() IS 'Automated cleanup function for audit log retention compliance';

-- Final verification query
DO $$
BEGIN
    RAISE NOTICE 'LGPD Audit System migration completed successfully!';
    RAISE NOTICE 'Tables created: lgpd_audit_logs, patient_consents, data_subject_requests';
    RAISE NOTICE 'View created: lgpd_compliance_summary';
    RAISE NOTICE 'RLS policies enabled for multi-tenant data isolation';
    RAISE NOTICE 'Compliance with LGPD Articles 8, 11, 17-22, and 37';
END $$;