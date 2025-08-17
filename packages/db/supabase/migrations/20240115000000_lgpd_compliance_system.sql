-- Migration: 20240115000000_lgpd_compliance_system.sql
-- Created: 2024-01-15
-- Purpose: LGPD (Brazilian Data Protection Law) Compliance System
-- Healthcare Focus: Patient data protection and privacy compliance

-- Enable necessary extensions for LGPD compliance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- LGPD Consent Management
CREATE TABLE IF NOT EXISTS lgpd_consent_purposes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    purpose_code VARCHAR(50) NOT NULL,
    purpose_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- consent, legitimate_interest, vital_interest, etc.
    is_required BOOLEAN DEFAULT false,
    retention_period_months INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, purpose_code)
);

-- LGPD Patient Consent Records
CREATE TABLE IF NOT EXISTS lgpd_patient_consents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    purpose_id UUID REFERENCES lgpd_consent_purposes(id),
    consent_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, granted, withdrawn, expired
    consent_given_at TIMESTAMPTZ,
    consent_withdrawn_at TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    consent_method VARCHAR(50), -- digital_signature, verbal, written, implicit
    consent_evidence JSONB DEFAULT '{}', -- IP, user agent, signature data, etc.
    withdrawal_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD Data Processing Activities
CREATE TABLE IF NOT EXISTS lgpd_processing_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    purpose_description TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    data_categories TEXT[] NOT NULL, -- personal_data, sensitive_data, health_data, biometric_data
    data_subjects TEXT[] NOT NULL, -- patients, employees, suppliers, etc.
    recipients TEXT[], -- who receives the data
    international_transfers BOOLEAN DEFAULT false,
    transfer_safeguards TEXT,
    retention_period VARCHAR(100),
    security_measures TEXT,
    responsible_person VARCHAR(255),
    dpo_contact VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD Data Subject Requests
CREATE TABLE IF NOT EXISTS lgpd_data_subject_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID,
    request_type VARCHAR(50) NOT NULL, -- access, rectification, deletion, portability, restriction, objection
    request_status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, rejected
    request_details TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    response_data JSONB,
    rejection_reason TEXT,
    assigned_to UUID, -- user handling the request
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    deadline_date TIMESTAMPTZ, -- 15 days from submission
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD Audit Trail
CREATE TABLE IF NOT EXISTS lgpd_audit_trail (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID,
    action_type VARCHAR(50) NOT NULL, -- data_access, data_modification, consent_change, etc.
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    legal_basis VARCHAR(100),
    purpose VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD Data Breach Incidents
CREATE TABLE IF NOT EXISTS lgpd_data_breaches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    incident_type VARCHAR(50) NOT NULL, -- unauthorized_access, data_loss, system_compromise, etc.
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    affected_data_types TEXT[] NOT NULL,
    estimated_affected_subjects INTEGER,
    incident_description TEXT NOT NULL,
    discovery_date TIMESTAMPTZ NOT NULL,
    incident_date TIMESTAMPTZ,
    containment_measures TEXT,
    notification_required BOOLEAN DEFAULT true,
    anpd_notification_date TIMESTAMPTZ, -- Brazilian Data Protection Authority
    subject_notification_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'investigating', -- investigating, contained, resolved
    assigned_to UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD Privacy Impact Assessments
CREATE TABLE IF NOT EXISTS lgpd_privacy_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    processing_activity_id UUID REFERENCES lgpd_processing_activities(id),
    risk_level VARCHAR(20), -- low, medium, high
    assessment_data JSONB NOT NULL,
    mitigation_measures TEXT,
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lgpd_consent_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_privacy_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY "lgpd_consent_purposes_tenant_access" ON lgpd_consent_purposes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_consent_purposes.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_patient_consents_tenant_access" ON lgpd_patient_consents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_patient_consents.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_processing_activities_tenant_access" ON lgpd_processing_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_processing_activities.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_data_subject_requests_tenant_access" ON lgpd_data_subject_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_data_subject_requests.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_audit_trail_tenant_access" ON lgpd_audit_trail
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_audit_trail.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_data_breaches_tenant_access" ON lgpd_data_breaches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_data_breaches.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "lgpd_privacy_assessments_tenant_access" ON lgpd_privacy_assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = lgpd_privacy_assessments.tenant_id
            AND is_active = true
        )
    );

-- Create indexes for performance
CREATE INDEX idx_lgpd_patient_consents_patient_id ON lgpd_patient_consents(patient_id);
CREATE INDEX idx_lgpd_patient_consents_purpose_id ON lgpd_patient_consents(purpose_id);
CREATE INDEX idx_lgpd_audit_trail_patient_id ON lgpd_audit_trail(patient_id);
CREATE INDEX idx_lgpd_audit_trail_timestamp ON lgpd_audit_trail(timestamp);
CREATE INDEX idx_lgpd_data_subject_requests_status ON lgpd_data_subject_requests(request_status);
CREATE INDEX idx_lgpd_data_breaches_severity ON lgpd_data_breaches(severity);

-- Add triggers for updated_at
CREATE TRIGGER update_lgpd_consent_purposes_updated_at BEFORE UPDATE ON lgpd_consent_purposes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_patient_consents_updated_at BEFORE UPDATE ON lgpd_patient_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_processing_activities_updated_at BEFORE UPDATE ON lgpd_processing_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_data_subject_requests_updated_at BEFORE UPDATE ON lgpd_data_subject_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_data_breaches_updated_at BEFORE UPDATE ON lgpd_data_breaches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lgpd_privacy_assessments_updated_at BEFORE UPDATE ON lgpd_privacy_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();