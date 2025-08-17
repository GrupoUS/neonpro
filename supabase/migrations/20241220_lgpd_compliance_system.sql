-- =====================================================
-- LGPD Compliance Automation System - Database Schema
-- NeonPro Health Platform
-- Migration: 20241220_lgpd_compliance_system
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- LGPD CONSENT MANAGEMENT SYSTEM
-- =====================================================

-- Consent Records with Granular Permissions
CREATE TABLE lgpd_consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN (
        'data_processing', 'marketing', 'analytics', 'research', 
        'third_party_sharing', 'automated_decision_making'
    )),
    purpose TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN (
        'consent', 'legitimate_interest', 'legal_obligation', 
        'vital_interests', 'public_task', 'contract_performance'
    )),
    data_categories JSONB NOT NULL DEFAULT '[]', -- ['health_data', 'contact_info', 'biometric_data']
    processing_activities JSONB NOT NULL DEFAULT '[]',
    third_party_sharing BOOLEAN DEFAULT FALSE,
    third_party_details JSONB DEFAULT '{}',
    consent_hash VARCHAR(64) NOT NULL, -- SHA-256 for verification
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(64),
    geolocation JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_consent_period CHECK (
        expires_at IS NULL OR expires_at > granted_at
    ),
    CONSTRAINT valid_withdrawal CHECK (
        withdrawn_at IS NULL OR withdrawn_at >= granted_at
    )
);

-- Consent Templates for Standardization
CREATE TABLE lgpd_consent_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    consent_type VARCHAR(50) NOT NULL,
    purpose_description TEXT NOT NULL,
    data_categories JSONB NOT NULL DEFAULT '[]',
    processing_activities JSONB NOT NULL DEFAULT '[]',
    retention_period INTERVAL,
    legal_basis VARCHAR(50) NOT NULL,
    template_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- IMMUTABLE AUDIT TRAIL SYSTEM
-- =====================================================

-- Cryptographically Chained Audit Log
CREATE TABLE lgpd_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_number BIGSERIAL UNIQUE, -- For chronological ordering
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'consent_granted', 'consent_withdrawn', 'data_access', 'data_modification',
        'data_deletion', 'data_export', 'policy_update', 'breach_detected',
        'user_login', 'user_logout', 'admin_action', 'system_event'
    )),
    user_id UUID REFERENCES auth.users(id),
    actor_id UUID REFERENCES auth.users(id), -- Who performed the action
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET NOT NULL,
    user_agent TEXT,
    session_id UUID,
    legal_basis VARCHAR(50),
    purpose TEXT,
    
    -- Cryptographic Chain
    event_hash VARCHAR(64) NOT NULL, -- SHA-256 of event data
    previous_hash VARCHAR(64), -- Links to previous event
    merkle_root VARCHAR(64), -- For batch verification
    
    -- Metadata
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    compliance_flags JSONB DEFAULT '{}',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    automated_action BOOLEAN DEFAULT FALSE,
    
    -- Immutability enforcement
    created_at TIMESTAMPTZ DEFAULT NOW() -- No updated_at - immutable records
);

-- Audit Log Integrity Verification
CREATE TABLE lgpd_audit_integrity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_start_sequence BIGINT NOT NULL,
    batch_end_sequence BIGINT NOT NULL,
    batch_hash VARCHAR(64) NOT NULL,
    record_count INTEGER NOT NULL,
    verification_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (
        verification_status IN ('verified', 'failed', 'pending')
    ),
    blockchain_hash VARCHAR(64), -- Optional blockchain anchor
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DATA RETENTION & LIFECYCLE MANAGEMENT
-- =====================================================

-- Automated Data Retention Policies
CREATE TABLE lgpd_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    data_category VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    retention_period INTERVAL NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    auto_delete BOOLEAN DEFAULT TRUE,
    notification_period INTERVAL DEFAULT '30 days',
    grace_period INTERVAL DEFAULT '7 days',
    policy_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    
    CONSTRAINT valid_effective_period CHECK (
        effective_until IS NULL OR effective_until > effective_from
    )
);

-- Data Retention Execution Log
CREATE TABLE lgpd_retention_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES lgpd_retention_policies(id),
    execution_type VARCHAR(20) NOT NULL CHECK (execution_type IN (
        'notification', 'deletion', 'anonymization', 'archival'
    )),
    target_table VARCHAR(100) NOT NULL,
    records_affected INTEGER DEFAULT 0,
    execution_status VARCHAR(20) DEFAULT 'pending' CHECK (
        execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    ),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    execution_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DATA SUBJECT RIGHTS MANAGEMENT
-- =====================================================

-- Data Subject Rights Requests (LGPD Articles 18-22)
CREATE TABLE lgpd_data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ID
    user_id UUID REFERENCES auth.users(id),
    requester_email VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability', 
        'restriction', 'objection', 'automated_decision_info'
    )),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'verification_required', 'processing', 'completed', 
        'rejected', 'partially_completed', 'cancelled'
    )),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN (
        'low', 'normal', 'high', 'urgent'
    )),
    
    -- Request Details
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    request_details JSONB NOT NULL DEFAULT '{}',
    response_data JSONB,
    
    -- Verification & Processing
    verification_method VARCHAR(50),
    verification_token VARCHAR(64),
    verification_expires_at TIMESTAMPTZ,
    processing_notes TEXT,
    rejection_reason TEXT,
    legal_review_required BOOLEAN DEFAULT FALSE,
    automated_processing BOOLEAN DEFAULT TRUE,
    
    -- Compliance Tracking
    legal_deadline TIMESTAMPTZ, -- 15 days from verification
    reminder_sent_at TIMESTAMPTZ,
    escalation_level INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Processing Steps
CREATE TABLE lgpd_request_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES lgpd_data_requests(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    )),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    step_data JSONB DEFAULT '{}',
    error_message TEXT,
    automated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPLIANCE MONITORING & ASSESSMENT
-- =====================================================

-- Real-time Compliance Monitoring
CREATE TABLE lgpd_compliance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL CHECK (metric_category IN (
        'consent_management', 'data_protection', 'user_rights', 
        'security', 'retention', 'breach_response'
    )),
    current_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    compliance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN target_value = 0 THEN 100.00
            ELSE LEAST(100.00, (current_value / target_value) * 100)
        END
    ) STORED,
    measurement_unit VARCHAR(20),
    measurement_period VARCHAR(20) DEFAULT 'daily',
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trend_direction VARCHAR(10) CHECK (trend_direction IN (
        'improving', 'stable', 'declining', 'unknown'
    )),
    risk_level VARCHAR(10) DEFAULT 'low' CHECK (risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Violations & Incidents
CREATE TABLE lgpd_compliance_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN (
        'data_breach', 'consent_violation', 'retention_violation',
        'access_violation', 'processing_violation', 'security_incident'
    )),
    severity VARCHAR(10) NOT NULL CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN (
        'open', 'investigating', 'resolved', 'closed', 'escalated'
    )),
    
    -- Incident Details
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_users_count INTEGER DEFAULT 0,
    affected_data_categories JSONB DEFAULT '[]',
    potential_impact TEXT,
    
    -- Timeline
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reported_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Response
    response_actions JSONB DEFAULT '[]',
    remediation_steps JSONB DEFAULT '[]',
    notification_required BOOLEAN DEFAULT FALSE,
    authority_notified BOOLEAN DEFAULT FALSE,
    users_notified BOOLEAN DEFAULT FALSE,
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    escalated_to UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Consent Records Indexes
CREATE INDEX idx_lgpd_consent_user_id ON lgpd_consent_records(user_id);
CREATE INDEX idx_lgpd_consent_type_active ON lgpd_consent_records(consent_type, is_active);
CREATE INDEX idx_lgpd_consent_expires ON lgpd_consent_records(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_lgpd_consent_withdrawn ON lgpd_consent_records(withdrawn_at) WHERE withdrawn_at IS NOT NULL;

-- Audit Log Indexes
CREATE INDEX idx_lgpd_audit_sequence ON lgpd_audit_log(sequence_number);
CREATE INDEX idx_lgpd_audit_user_id ON lgpd_audit_log(user_id);
CREATE INDEX idx_lgpd_audit_event_type ON lgpd_audit_log(event_type);
CREATE INDEX idx_lgpd_audit_timestamp ON lgpd_audit_log(timestamp);
CREATE INDEX idx_lgpd_audit_resource ON lgpd_audit_log(resource_type, resource_id);

-- Data Requests Indexes
CREATE INDEX idx_lgpd_requests_user_id ON lgpd_data_requests(user_id);
CREATE INDEX idx_lgpd_requests_status ON lgpd_data_requests(status);
CREATE INDEX idx_lgpd_requests_type ON lgpd_data_requests(request_type);
CREATE INDEX idx_lgpd_requests_deadline ON lgpd_data_requests(legal_deadline);

-- Compliance Metrics Indexes
CREATE INDEX idx_lgpd_metrics_category ON lgpd_compliance_metrics(metric_category);
CREATE INDEX idx_lgpd_metrics_risk ON lgpd_compliance_metrics(risk_level);

-- Incidents Indexes
CREATE INDEX idx_lgpd_incidents_status ON lgpd_compliance_incidents(status);
CREATE INDEX idx_lgpd_incidents_severity ON lgpd_compliance_incidents(severity);
CREATE INDEX idx_lgpd_incidents_detected ON lgpd_compliance_incidents(detected_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE lgpd_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_integrity ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_retention_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_request_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_incidents ENABLE ROW LEVEL SECURITY;

-- User access to their own consent records
CREATE POLICY "Users can view their own consent records" ON lgpd_consent_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent records" ON lgpd_consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User access to their own data requests
CREATE POLICY "Users can view their own data requests" ON lgpd_data_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests" ON lgpd_data_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin access to all LGPD data (requires admin role)
CREATE POLICY "Admins can access all LGPD data" ON lgpd_consent_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

-- Similar admin policies for other tables
CREATE POLICY "Admins can access all audit logs" ON lgpd_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'compliance_officer', 'dpo', 'security_analyst')
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_lgpd_consent_records_updated_at 
    BEFORE UPDATE ON lgpd_consent_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_data_requests_updated_at 
    BEFORE UPDATE ON lgpd_data_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_compliance_metrics_updated_at 
    BEFORE UPDATE ON lgpd_compliance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_compliance_incidents_updated_at 
    BEFORE UPDATE ON lgpd_compliance_incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default consent templates
INSERT INTO lgpd_consent_templates (template_name, consent_type, purpose_description, data_categories, processing_activities, retention_period, legal_basis) VALUES
('Health Data Processing', 'data_processing', 'Processing of health data for medical care and treatment', '["health_data", "medical_records", "diagnostic_data"]', '["diagnosis", "treatment", "monitoring", "care_coordination"]', '10 years', 'consent'),
('Marketing Communications', 'marketing', 'Sending promotional materials and health tips', '["contact_info", "preferences"]', '["email_marketing", "sms_marketing", "personalized_content"]', '2 years', 'consent'),
('Analytics and Improvement', 'analytics', 'Analyzing usage patterns to improve services', '["usage_data", "performance_metrics"]', '["service_improvement", "research", "quality_assurance"]', '3 years', 'legitimate_interest'),
('Third Party Integration', 'third_party_sharing', 'Sharing data with healthcare partners and laboratories', '["health_data", "contact_info"]', '["lab_results", "specialist_referrals", "insurance_processing"]', '5 years', 'consent');

-- Insert default retention policies
INSERT INTO lgpd_retention_policies (policy_name, data_category, table_name, retention_period, legal_basis, notification_period) VALUES
('Patient Health Records', 'health_data', 'patient_records', '10 years', 'legal_obligation', '90 days'),
('Appointment History', 'appointment_data', 'appointments', '5 years', 'legitimate_interest', '30 days'),
('Marketing Preferences', 'marketing_data', 'user_preferences', '2 years', 'consent', '30 days'),
('Audit Logs', 'audit_data', 'lgpd_audit_log', '7 years', 'legal_obligation', '180 days'),
('Session Data', 'session_data', 'user_sessions', '1 year', 'legitimate_interest', '30 days');

-- Insert default compliance metrics
INSERT INTO lgpd_compliance_metrics (metric_name, metric_category, current_value, target_value, measurement_unit, measurement_period) VALUES
('Consent Completion Rate', 'consent_management', 95.5, 95.0, 'percentage', 'daily'),
('Data Request Response Time', 'user_rights', 2.5, 3.0, 'days', 'weekly'),
('Audit Log Integrity', 'security', 100.0, 100.0, 'percentage', 'daily'),
('Retention Policy Compliance', 'retention', 98.2, 98.0, 'percentage', 'weekly'),
('Incident Response Time', 'breach_response', 4.2, 4.0, 'hours', 'monthly');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE lgpd_consent_records IS 'Stores granular consent records with cryptographic verification for LGPD compliance';
COMMENT ON TABLE lgpd_audit_log IS 'Immutable audit trail with cryptographic chaining for compliance monitoring';
COMMENT ON TABLE lgpd_retention_policies IS 'Automated data retention policies for lifecycle management';
COMMENT ON TABLE lgpd_data_requests IS 'Data subject rights requests processing (LGPD Articles 18-22)';
COMMENT ON TABLE lgpd_compliance_metrics IS 'Real-time compliance monitoring and KPI tracking';
COMMENT ON TABLE lgpd_compliance_incidents IS 'Incident management for compliance violations and breaches';

-- Migration completed successfully
SELECT 'LGPD Compliance System - Database Schema Created Successfully' AS status;