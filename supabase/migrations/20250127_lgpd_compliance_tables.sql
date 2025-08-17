-- ============================================================================
-- LGPD Compliance Framework - Database Schema
-- Tabelas para compliance LGPD no NeonPro
-- 
-- @author APEX Master Developer
-- @version 1.0.0
-- @compliance LGPD Art. 32, 37, 38, 39
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- LGPD CONSENT MANAGEMENT
-- ============================================================================

-- Consent purposes and categories
CREATE TABLE lgpd_consent_purposes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    purpose_code VARCHAR(50) NOT NULL,
    purpose_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'personal', 'sensitive', 'medical', 'marketing', 'analytics', 'third_party'
    legal_basis VARCHAR(100) NOT NULL, -- LGPD legal basis (Art. 7 and 11)
    data_types TEXT[], -- Array of data types collected
    retention_period INTEGER, -- Days
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clinic_id, purpose_code)
);

-- User consents
CREATE TABLE lgpd_user_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    purpose_id UUID NOT NULL REFERENCES lgpd_consent_purposes(id) ON DELETE CASCADE,
    consent_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'granted', 'withdrawn', 'expired', 'pending'
    consent_method VARCHAR(50), -- 'explicit', 'opt_in', 'pre_checked', 'inferred'
    consent_evidence JSONB, -- Evidence of consent (IP, timestamp, method, etc.)
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    withdrawal_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, clinic_id, purpose_id)
);

-- ============================================================================
-- LGPD AUDIT TRAIL
-- ============================================================================

-- Audit trail for all LGPD-related activities
CREATE TABLE lgpd_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'failure', 'warning', 'error'
    user_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    resource_type VARCHAR(100),
    resource_id UUID,
    action VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER, -- milliseconds
    data_classification VARCHAR(50), -- 'public', 'internal', 'confidential', 'restricted'
    legal_basis VARCHAR(100),
    consent_id UUID REFERENCES lgpd_user_consents(id),
    retention_period INTEGER DEFAULT 2555, -- days (7 years default)
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_lgpd_audit_clinic_timestamp (clinic_id, timestamp DESC),
    INDEX idx_lgpd_audit_user_timestamp (user_id, timestamp DESC),
    INDEX idx_lgpd_audit_event_type (event_type),
    INDEX idx_lgpd_audit_severity (severity),
    INDEX idx_lgpd_audit_resource (resource_type, resource_id)
);

-- ============================================================================
-- DATA SUBJECT RIGHTS MANAGEMENT
-- ============================================================================

-- Data subject rights requests (LGPD Art. 18)
CREATE TABLE lgpd_data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'objection'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected', 'cancelled'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    description TEXT,
    requested_data JSONB, -- Specific data requested
    legal_basis TEXT,
    verification_method VARCHAR(50),
    verification_data JSONB,
    processing_notes TEXT,
    response_data JSONB,
    response_method VARCHAR(50), -- 'email', 'portal', 'physical', 'api'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE, -- Legal deadline (usually 15 days)
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_lgpd_requests_user (user_id),
    INDEX idx_lgpd_requests_clinic_status (clinic_id, status),
    INDEX idx_lgpd_requests_due_date (due_date),
    INDEX idx_lgpd_requests_type (request_type)
);

-- ============================================================================
-- DATA ENCRYPTION MANAGEMENT
-- ============================================================================

-- Encryption keys and metadata
CREATE TABLE lgpd_encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    key_type VARCHAR(50) NOT NULL, -- 'master', 'data', 'field', 'backup'
    algorithm VARCHAR(50) NOT NULL, -- 'AES-256-GCM', 'ChaCha20-Poly1305'
    key_hash VARCHAR(255) NOT NULL, -- Hash of the key for verification
    key_metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    rotated_at TIMESTAMP WITH TIME ZONE,
    rotation_reason TEXT,
    
    INDEX idx_lgpd_keys_clinic_active (clinic_id, is_active),
    INDEX idx_lgpd_keys_type (key_type)
);

-- Encrypted data registry
CREATE TABLE lgpd_encrypted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    encryption_key_id UUID NOT NULL REFERENCES lgpd_encryption_keys(id),
    data_classification VARCHAR(50) NOT NULL,
    encryption_metadata JSONB DEFAULT '{}',
    encrypted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    
    UNIQUE(table_name, column_name, record_id),
    INDEX idx_lgpd_encrypted_clinic (clinic_id),
    INDEX idx_lgpd_encrypted_table (table_name, column_name),
    INDEX idx_lgpd_encrypted_key (encryption_key_id)
);

-- ============================================================================
-- COMPLIANCE REPORTS
-- ============================================================================

-- Compliance reports and documentation
CREATE TABLE lgpd_compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'compliance', 'audit', 'consent', 'data_subject', 'security'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    format VARCHAR(20) DEFAULT 'json', -- 'json', 'pdf', 'csv', 'xlsx'
    status VARCHAR(20) DEFAULT 'generating', -- 'generating', 'completed', 'failed'
    summary JSONB DEFAULT '{}',
    compliance_score INTEGER, -- 0-100
    critical_issues INTEGER DEFAULT 0,
    recommendations TEXT[],
    report_data JSONB,
    download_url TEXT,
    file_size INTEGER, -- bytes
    generated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Report retention
    filters JSONB DEFAULT '{}',
    error_message TEXT,
    
    INDEX idx_lgpd_reports_clinic_type (clinic_id, report_type),
    INDEX idx_lgpd_reports_period (period_start, period_end),
    INDEX idx_lgpd_reports_status (status),
    INDEX idx_lgpd_reports_generated_by (generated_by)
);

-- ============================================================================
-- DATA PROCESSING ACTIVITIES
-- ============================================================================

-- Record of processing activities (LGPD Art. 37)
CREATE TABLE lgpd_processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    activity_name VARCHAR(200) NOT NULL,
    activity_description TEXT,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    data_categories TEXT[] NOT NULL, -- Types of personal data
    data_subjects TEXT[] NOT NULL, -- Categories of data subjects
    recipients TEXT[], -- Who receives the data
    international_transfers BOOLEAN DEFAULT false,
    transfer_safeguards TEXT,
    retention_period INTEGER, -- days
    security_measures TEXT[],
    dpo_contact TEXT, -- Data Protection Officer contact
    controller_contact TEXT,
    processor_contact TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    
    INDEX idx_lgpd_activities_clinic (clinic_id),
    INDEX idx_lgpd_activities_active (is_active)
);

-- ============================================================================
-- DATA BREACH MANAGEMENT
-- ============================================================================

-- Data breach incidents and notifications
CREATE TABLE lgpd_data_breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    incident_id VARCHAR(50) UNIQUE NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'detected', -- 'detected', 'investigating', 'contained', 'resolved', 'reported'
    breach_type VARCHAR(50) NOT NULL, -- 'unauthorized_access', 'data_loss', 'system_compromise', 'human_error'
    description TEXT NOT NULL,
    affected_data_types TEXT[],
    affected_records_count INTEGER,
    affected_users UUID[], -- Array of affected user IDs
    detection_method VARCHAR(100),
    detection_source VARCHAR(100),
    root_cause TEXT,
    impact_assessment TEXT,
    containment_measures TEXT,
    remediation_actions TEXT,
    notification_required BOOLEAN DEFAULT false,
    authority_notified BOOLEAN DEFAULT false,
    users_notified BOOLEAN DEFAULT false,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    contained_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    authority_notification_date TIMESTAMP WITH TIME ZONE,
    user_notification_date TIMESTAMP WITH TIME ZONE,
    reported_by UUID NOT NULL REFERENCES users(id),
    investigated_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_lgpd_breaches_clinic_severity (clinic_id, severity),
    INDEX idx_lgpd_breaches_status (status),
    INDEX idx_lgpd_breaches_detected_at (detected_at DESC)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all LGPD tables
ALTER TABLE lgpd_consent_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_encrypted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_breaches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinic isolation
CREATE POLICY "Users can only access their clinic's LGPD consent purposes" ON lgpd_consent_purposes
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD user consents" ON lgpd_user_consents
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD audit trail" ON lgpd_audit_trail
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD data subject requests" ON lgpd_data_subject_requests
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD encryption keys" ON lgpd_encryption_keys
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD encrypted data" ON lgpd_encrypted_data
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD compliance reports" ON lgpd_compliance_reports
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD processing activities" ON lgpd_processing_activities
    FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can only access their clinic's LGPD data breaches" ON lgpd_data_breaches
    FOR ALL USING (clinic_id = get_user_clinic_id());

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_lgpd_consent_purposes_updated_at BEFORE UPDATE ON lgpd_consent_purposes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_user_consents_updated_at BEFORE UPDATE ON lgpd_user_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_processing_activities_updated_at BEFORE UPDATE ON lgpd_processing_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set due_date for data subject requests
CREATE OR REPLACE FUNCTION set_data_subject_request_due_date()
RETURNS TRIGGER AS $$
BEGIN
    -- LGPD requires response within 15 days (Art. 19)
    IF NEW.due_date IS NULL THEN
        NEW.due_date = NEW.requested_at + INTERVAL '15 days';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_lgpd_data_subject_request_due_date BEFORE INSERT ON lgpd_data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION set_data_subject_request_due_date();

-- Function to log consent changes in audit trail
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO lgpd_audit_trail (
        event_type,
        severity,
        status,
        user_id,
        clinic_id,
        resource_type,
        resource_id,
        action,
        description,
        details,
        consent_id
    ) VALUES (
        CASE 
            WHEN NEW.consent_status = 'granted' THEN 'consent_granted'
            WHEN NEW.consent_status = 'withdrawn' THEN 'consent_withdrawn'
            WHEN NEW.consent_status = 'expired' THEN 'consent_expired'
            ELSE 'consent_updated'
        END,
        'medium',
        'success',
        NEW.user_id,
        NEW.clinic_id,
        'consent',
        NEW.id,
        'consent_status_change',
        'User consent status changed to ' || NEW.consent_status,
        jsonb_build_object(
            'old_status', COALESCE(OLD.consent_status, 'none'),
            'new_status', NEW.consent_status,
            'purpose_id', NEW.purpose_id,
            'method', NEW.consent_method
        ),
        NEW.id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_lgpd_consent_change AFTER INSERT OR UPDATE ON lgpd_user_consents
    FOR EACH ROW EXECUTE FUNCTION log_consent_change();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_lgpd_consent_purposes_clinic_active 
    ON lgpd_consent_purposes(clinic_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_lgpd_user_consents_status_expires 
    ON lgpd_user_consents(consent_status, expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_lgpd_audit_trail_timestamp_desc 
    ON lgpd_audit_trail(timestamp DESC);

CREATE INDEX CONCURRENTLY idx_lgpd_data_subject_requests_pending 
    ON lgpd_data_subject_requests(clinic_id, status, due_date) WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY idx_lgpd_encrypted_data_last_accessed 
    ON lgpd_encrypted_data(last_accessed) WHERE last_accessed IS NOT NULL;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default consent purposes (will be customized per clinic)
INSERT INTO lgpd_consent_purposes (clinic_id, purpose_code, purpose_name, description, category, legal_basis, data_types, retention_period, is_required) 
SELECT 
    id as clinic_id,
    'essential_services',
    'Serviços Essenciais',
    'Dados necessários para prestação dos serviços médicos essenciais',
    'medical',
    'Execução de contrato (Art. 7, V)',
    ARRAY['nome', 'cpf', 'email', 'telefone', 'endereco'],
    2555, -- 7 years
    true
FROM clinics;

INSERT INTO lgpd_consent_purposes (clinic_id, purpose_code, purpose_name, description, category, legal_basis, data_types, retention_period, is_required) 
SELECT 
    id as clinic_id,
    'medical_treatment',
    'Tratamento Médico',
    'Dados de saúde para diagnóstico e tratamento médico',
    'sensitive',
    'Cuidados de saúde (Art. 11, II, a)',
    ARRAY['historico_medico', 'exames', 'diagnosticos', 'prescricoes'],
    3650, -- 10 years (medical records)
    true
FROM clinics;

INSERT INTO lgpd_consent_purposes (clinic_id, purpose_code, purpose_name, description, category, legal_basis, data_types, retention_period, is_required) 
SELECT 
    id as clinic_id,
    'marketing_communications',
    'Comunicações de Marketing',
    'Envio de informações promocionais e comunicações de marketing',
    'marketing',
    'Consentimento (Art. 7, I)',
    ARRAY['email', 'telefone', 'preferencias'],
    1095, -- 3 years
    false
FROM clinics;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE lgpd_consent_purposes IS 'LGPD consent purposes and legal basis for data processing';
COMMENT ON TABLE lgpd_user_consents IS 'User consent records for LGPD compliance';
COMMENT ON TABLE lgpd_audit_trail IS 'Comprehensive audit trail for LGPD compliance monitoring';
COMMENT ON TABLE lgpd_data_subject_requests IS 'Data subject rights requests (LGPD Art. 18)';
COMMENT ON TABLE lgpd_encryption_keys IS 'Encryption key management for data protection';
COMMENT ON TABLE lgpd_encrypted_data IS 'Registry of encrypted personal data';
COMMENT ON TABLE lgpd_compliance_reports IS 'Compliance reports and documentation';
COMMENT ON TABLE lgpd_processing_activities IS 'Record of processing activities (LGPD Art. 37)';
COMMENT ON TABLE lgpd_data_breaches IS 'Data breach incident management and notifications';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant appropriate permissions to application roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Restrict sensitive operations
REVOKE DELETE ON lgpd_audit_trail FROM authenticated;
REVOKE UPDATE ON lgpd_audit_trail FROM authenticated;

-- Only allow INSERT on audit trail (immutable log)
GRANT INSERT ON lgpd_audit_trail TO authenticated;
GRANT SELECT ON lgpd_audit_trail TO authenticated;
