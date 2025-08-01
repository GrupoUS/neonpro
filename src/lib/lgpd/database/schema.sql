-- LGPD Compliance Automation System - Database Schema
-- Story 1.5: LGPD Compliance Automation
-- Comprehensive database schema for LGPD compliance system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- LGPD CONSENT MANAGEMENT TABLES
-- =====================================================

-- Consent records table
CREATE TABLE IF NOT EXISTS lgpd_consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_subject_id UUID NOT NULL, -- References patients or users
    consent_type VARCHAR(100) NOT NULL,
    processing_purpose TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN (
        'consent', 'contract', 'legal_obligation', 'vital_interests',
        'public_task', 'legitimate_interest'
    )),
    consent_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (consent_status IN (
        'active', 'withdrawn', 'expired', 'pending'
    )),
    consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consent_expires_at TIMESTAMPTZ,
    consent_withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,
    collection_context JSONB NOT NULL DEFAULT '{}',
    consent_evidence JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT unique_active_consent UNIQUE (clinic_id, data_subject_id, consent_type, processing_purpose)
        DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for consent records
CREATE INDEX idx_lgpd_consent_records_clinic_id ON lgpd_consent_records(clinic_id);
CREATE INDEX idx_lgpd_consent_records_user_id ON lgpd_consent_records(user_id);
CREATE INDEX idx_lgpd_consent_records_data_subject_id ON lgpd_consent_records(data_subject_id);
CREATE INDEX idx_lgpd_consent_records_status ON lgpd_consent_records(consent_status);
CREATE INDEX idx_lgpd_consent_records_expires_at ON lgpd_consent_records(consent_expires_at);
CREATE INDEX idx_lgpd_consent_records_legal_basis ON lgpd_consent_records(legal_basis);
CREATE INDEX idx_lgpd_consent_records_created_at ON lgpd_consent_records(created_at);

-- =====================================================
-- LGPD AUDIT LOGGING TABLES
-- =====================================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS lgpd_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    data_affected TEXT[] NOT NULL DEFAULT '{}',
    legal_basis VARCHAR(50) NOT NULL,
    processing_purpose TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    actor_id UUID,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (actor_type IN (
        'user', 'system', 'admin', 'api', 'service'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_lgpd_audit_logs_clinic_id ON lgpd_audit_logs(clinic_id);
CREATE INDEX idx_lgpd_audit_logs_user_id ON lgpd_audit_logs(user_id);
CREATE INDEX idx_lgpd_audit_logs_action ON lgpd_audit_logs(action);
CREATE INDEX idx_lgpd_audit_logs_resource_type ON lgpd_audit_logs(resource_type);
CREATE INDEX idx_lgpd_audit_logs_resource_id ON lgpd_audit_logs(resource_id);
CREATE INDEX idx_lgpd_audit_logs_severity ON lgpd_audit_logs(severity);
CREATE INDEX idx_lgpd_audit_logs_created_at ON lgpd_audit_logs(created_at);
CREATE INDEX idx_lgpd_audit_logs_actor_id ON lgpd_audit_logs(actor_id);
CREATE INDEX idx_lgpd_audit_logs_legal_basis ON lgpd_audit_logs(legal_basis);

-- GIN index for metadata JSONB queries
CREATE INDEX idx_lgpd_audit_logs_metadata_gin ON lgpd_audit_logs USING GIN (metadata);

-- =====================================================
-- LGPD DATA SUBJECT RIGHTS TABLES
-- =====================================================

-- Data subject requests table
CREATE TABLE IF NOT EXISTS lgpd_data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    data_subject_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability',
        'restriction', 'objection', 'consent_withdrawal'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'in_progress', 'completed',
        'rejected', 'partially_completed', 'cancelled'
    )),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN (
        'low', 'normal', 'high', 'urgent'
    )),
    description TEXT,
    specific_data_requested TEXT[],
    legal_basis_for_processing VARCHAR(50),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    response_data JSONB,
    rejection_reason TEXT,
    processing_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'failed', 'not_required'
    )),
    verification_method VARCHAR(50),
    verification_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for data subject requests
CREATE INDEX idx_lgpd_dsr_clinic_id ON lgpd_data_subject_requests(clinic_id);
CREATE INDEX idx_lgpd_dsr_data_subject_id ON lgpd_data_subject_requests(data_subject_id);
CREATE INDEX idx_lgpd_dsr_request_type ON lgpd_data_subject_requests(request_type);
CREATE INDEX idx_lgpd_dsr_status ON lgpd_data_subject_requests(status);
CREATE INDEX idx_lgpd_dsr_priority ON lgpd_data_subject_requests(priority);
CREATE INDEX idx_lgpd_dsr_due_date ON lgpd_data_subject_requests(due_date);
CREATE INDEX idx_lgpd_dsr_submitted_at ON lgpd_data_subject_requests(submitted_at);
CREATE INDEX idx_lgpd_dsr_assigned_to ON lgpd_data_subject_requests(assigned_to);
CREATE INDEX idx_lgpd_dsr_verification_status ON lgpd_data_subject_requests(verification_status);

-- =====================================================
-- LGPD COMPLIANCE MONITORING TABLES
-- =====================================================

-- Compliance assessments table
CREATE TABLE IF NOT EXISTS lgpd_compliance_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'regular',
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    module_scores JSONB NOT NULL DEFAULT '{}',
    compliance_gaps TEXT[],
    recommendations TEXT[],
    critical_issues TEXT[],
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assessment_data JSONB NOT NULL DEFAULT '{}',
    next_assessment_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compliance alerts table
CREATE TABLE IF NOT EXISTS lgpd_compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'acknowledged', 'resolved', 'dismissed'
    )),
    alert_data JSONB NOT NULL DEFAULT '{}',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for compliance tables
CREATE INDEX idx_lgpd_compliance_assessments_clinic_id ON lgpd_compliance_assessments(clinic_id);
CREATE INDEX idx_lgpd_compliance_assessments_date ON lgpd_compliance_assessments(assessment_date);
CREATE INDEX idx_lgpd_compliance_assessments_score ON lgpd_compliance_assessments(overall_score);
CREATE INDEX idx_lgpd_compliance_alerts_clinic_id ON lgpd_compliance_alerts(clinic_id);
CREATE INDEX idx_lgpd_compliance_alerts_severity ON lgpd_compliance_alerts(severity);
CREATE INDEX idx_lgpd_compliance_alerts_status ON lgpd_compliance_alerts(status);
CREATE INDEX idx_lgpd_compliance_alerts_triggered_at ON lgpd_compliance_alerts(triggered_at);

-- =====================================================
-- LGPD BREACH DETECTION TABLES
-- =====================================================

-- Breach incidents table
CREATE TABLE IF NOT EXISTS lgpd_breach_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN (
        'detected', 'investigating', 'contained', 'resolved', 'false_positive'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_data_types TEXT[],
    affected_data_subjects_count INTEGER DEFAULT 0,
    detection_method VARCHAR(100),
    detection_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    containment_time TIMESTAMPTZ,
    resolution_time TIMESTAMPTZ,
    anpd_notification_required BOOLEAN DEFAULT FALSE,
    anpd_notified_at TIMESTAMPTZ,
    data_subjects_notified_at TIMESTAMPTZ,
    incident_data JSONB NOT NULL DEFAULT '{}',
    investigation_notes TEXT,
    containment_actions TEXT[],
    remediation_actions TEXT[],
    lessons_learned TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for breach incidents
CREATE INDEX idx_lgpd_breach_incidents_clinic_id ON lgpd_breach_incidents(clinic_id);
CREATE INDEX idx_lgpd_breach_incidents_severity ON lgpd_breach_incidents(severity);
CREATE INDEX idx_lgpd_breach_incidents_status ON lgpd_breach_incidents(status);
CREATE INDEX idx_lgpd_breach_incidents_detection_time ON lgpd_breach_incidents(detection_time);
CREATE INDEX idx_lgpd_breach_incidents_incident_type ON lgpd_breach_incidents(incident_type);
CREATE INDEX idx_lgpd_breach_incidents_assigned_to ON lgpd_breach_incidents(assigned_to);

-- =====================================================
-- LGPD DATA RETENTION TABLES
-- =====================================================

-- Data retention policies table
CREATE TABLE IF NOT EXISTS lgpd_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    retention_period_months INTEGER NOT NULL CHECK (retention_period_months > 0),
    legal_basis VARCHAR(50) NOT NULL,
    processing_purpose TEXT NOT NULL,
    retention_action VARCHAR(50) NOT NULL DEFAULT 'delete' CHECK (retention_action IN (
        'delete', 'anonymize', 'archive', 'review'
    )),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    policy_rules JSONB NOT NULL DEFAULT '{}',
    exceptions JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_retention_policy UNIQUE (clinic_id, data_category, processing_purpose)
);

-- Data retention executions table
CREATE TABLE IF NOT EXISTS lgpd_retention_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES lgpd_retention_policies(id) ON DELETE CASCADE,
    execution_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),
    records_processed INTEGER DEFAULT 0,
    records_affected INTEGER DEFAULT 0,
    execution_data JSONB NOT NULL DEFAULT '{}',
    error_details TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for retention tables
CREATE INDEX idx_lgpd_retention_policies_clinic_id ON lgpd_retention_policies(clinic_id);
CREATE INDEX idx_lgpd_retention_policies_data_category ON lgpd_retention_policies(data_category);
CREATE INDEX idx_lgpd_retention_policies_is_active ON lgpd_retention_policies(is_active);
CREATE INDEX idx_lgpd_retention_policies_next_review ON lgpd_retention_policies(next_review_date);
CREATE INDEX idx_lgpd_retention_executions_clinic_id ON lgpd_retention_executions(clinic_id);
CREATE INDEX idx_lgpd_retention_executions_policy_id ON lgpd_retention_executions(policy_id);
CREATE INDEX idx_lgpd_retention_executions_status ON lgpd_retention_executions(status);
CREATE INDEX idx_lgpd_retention_executions_started_at ON lgpd_retention_executions(started_at);

-- =====================================================
-- LGPD DATA MINIMIZATION TABLES
-- =====================================================

-- Data minimization rules table
CREATE TABLE IF NOT EXISTS lgpd_minimization_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    processing_purpose VARCHAR(255) NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    required_fields TEXT[] NOT NULL,
    optional_fields TEXT[] NOT NULL DEFAULT '{}',
    prohibited_fields TEXT[] NOT NULL DEFAULT '{}',
    collection_rules JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_minimization_rule UNIQUE (clinic_id, processing_purpose, data_category)
);

-- Data minimization violations table
CREATE TABLE IF NOT EXISTS lgpd_minimization_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES lgpd_minimization_rules(id) ON DELETE CASCADE,
    violation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    description TEXT NOT NULL,
    data_involved JSONB NOT NULL DEFAULT '{}',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_action TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for minimization tables
CREATE INDEX idx_lgpd_minimization_rules_clinic_id ON lgpd_minimization_rules(clinic_id);
CREATE INDEX idx_lgpd_minimization_rules_purpose ON lgpd_minimization_rules(processing_purpose);
CREATE INDEX idx_lgpd_minimization_rules_category ON lgpd_minimization_rules(data_category);
CREATE INDEX idx_lgpd_minimization_rules_is_active ON lgpd_minimization_rules(is_active);
CREATE INDEX idx_lgpd_minimization_violations_clinic_id ON lgpd_minimization_violations(clinic_id);
CREATE INDEX idx_lgpd_minimization_violations_rule_id ON lgpd_minimization_violations(rule_id);
CREATE INDEX idx_lgpd_minimization_violations_severity ON lgpd_minimization_violations(severity);
CREATE INDEX idx_lgpd_minimization_violations_detected_at ON lgpd_minimization_violations(detected_at);

-- =====================================================
-- LGPD THIRD-PARTY COMPLIANCE TABLES
-- =====================================================

-- Third-party agreements table
CREATE TABLE IF NOT EXISTS lgpd_third_party_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    third_party_name VARCHAR(255) NOT NULL,
    third_party_type VARCHAR(100) NOT NULL,
    agreement_type VARCHAR(100) NOT NULL,
    data_categories TEXT[] NOT NULL,
    processing_purposes TEXT[] NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    data_transfer_mechanism VARCHAR(100),
    security_requirements JSONB NOT NULL DEFAULT '{}',
    compliance_requirements JSONB NOT NULL DEFAULT '{}',
    agreement_start_date DATE NOT NULL,
    agreement_end_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'draft', 'active', 'suspended', 'terminated', 'expired'
    )),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    last_assessment_date DATE,
    next_assessment_due DATE,
    agreement_document_url TEXT,
    contact_information JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Third-party data transfers table
CREATE TABLE IF NOT EXISTS lgpd_third_party_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    agreement_id UUID NOT NULL REFERENCES lgpd_third_party_agreements(id) ON DELETE CASCADE,
    transfer_type VARCHAR(100) NOT NULL,
    data_categories TEXT[] NOT NULL,
    data_subjects_count INTEGER DEFAULT 0,
    transfer_purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    authorization_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (authorization_status IN (
        'pending', 'approved', 'rejected', 'auto_approved'
    )),
    transfer_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (transfer_status IN (
        'pending', 'in_progress', 'completed', 'failed', 'cancelled'
    )),
    authorized_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    authorized_at TIMESTAMPTZ,
    transfer_started_at TIMESTAMPTZ,
    transfer_completed_at TIMESTAMPTZ,
    transfer_data JSONB NOT NULL DEFAULT '{}',
    compliance_checks JSONB NOT NULL DEFAULT '{}',
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for third-party tables
CREATE INDEX idx_lgpd_third_party_agreements_clinic_id ON lgpd_third_party_agreements(clinic_id);
CREATE INDEX idx_lgpd_third_party_agreements_status ON lgpd_third_party_agreements(status);
CREATE INDEX idx_lgpd_third_party_agreements_risk_level ON lgpd_third_party_agreements(risk_level);
CREATE INDEX idx_lgpd_third_party_agreements_end_date ON lgpd_third_party_agreements(agreement_end_date);
CREATE INDEX idx_lgpd_third_party_agreements_assessment_due ON lgpd_third_party_agreements(next_assessment_due);
CREATE INDEX idx_lgpd_third_party_transfers_clinic_id ON lgpd_third_party_transfers(clinic_id);
CREATE INDEX idx_lgpd_third_party_transfers_agreement_id ON lgpd_third_party_transfers(agreement_id);
CREATE INDEX idx_lgpd_third_party_transfers_auth_status ON lgpd_third_party_transfers(authorization_status);
CREATE INDEX idx_lgpd_third_party_transfers_transfer_status ON lgpd_third_party_transfers(transfer_status);
CREATE INDEX idx_lgpd_third_party_transfers_created_at ON lgpd_third_party_transfers(created_at);

-- =====================================================
-- LGPD ASSESSMENT TABLES
-- =====================================================

-- LGPD assessments (DPIA) table
CREATE TABLE IF NOT EXISTS lgpd_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    assessment_name VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(100) NOT NULL DEFAULT 'dpia',
    processing_activity TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    data_subjects_categories TEXT[] NOT NULL,
    processing_purposes TEXT[] NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    data_sources TEXT[],
    data_recipients TEXT[],
    international_transfers BOOLEAN DEFAULT FALSE,
    retention_period TEXT,
    security_measures JSONB NOT NULL DEFAULT '{}',
    risk_assessment JSONB NOT NULL DEFAULT '{}',
    mitigation_measures JSONB NOT NULL DEFAULT '{}',
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_review', 'approved', 'rejected', 'requires_update'
    )),
    is_dpia_required BOOLEAN DEFAULT FALSE,
    dpia_completion_date DATE,
    next_review_date DATE,
    assessor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    assessment_data JSONB NOT NULL DEFAULT '{}',
    recommendations TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for assessments
CREATE INDEX idx_lgpd_assessments_clinic_id ON lgpd_assessments(clinic_id);
CREATE INDEX idx_lgpd_assessments_status ON lgpd_assessments(status);
CREATE INDEX idx_lgpd_assessments_compliance_score ON lgpd_assessments(compliance_score);
CREATE INDEX idx_lgpd_assessments_next_review ON lgpd_assessments(next_review_date);
CREATE INDEX idx_lgpd_assessments_assessor_id ON lgpd_assessments(assessor_id);
CREATE INDEX idx_lgpd_assessments_is_dpia_required ON lgpd_assessments(is_dpia_required);

-- =====================================================
-- LGPD LEGAL DOCUMENTATION TABLES
-- =====================================================

-- Legal documents table
CREATE TABLE IF NOT EXISTS lgpd_legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    document_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    document_content TEXT NOT NULL,
    document_metadata JSONB NOT NULL DEFAULT '{}',
    template_version VARCHAR(20),
    language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'archived', 'expired'
    )),
    effective_date DATE NOT NULL,
    expiration_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_period_months INTEGER,
    last_review_date DATE,
    next_review_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    document_hash VARCHAR(64), -- SHA-256 hash for integrity
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_active_document UNIQUE (clinic_id, document_type, status)
        WHERE status = 'active'
);

-- Create indexes for legal documents
CREATE INDEX idx_lgpd_legal_documents_clinic_id ON lgpd_legal_documents(clinic_id);
CREATE INDEX idx_lgpd_legal_documents_type ON lgpd_legal_documents(document_type);
CREATE INDEX idx_lgpd_legal_documents_status ON lgpd_legal_documents(status);
CREATE INDEX idx_lgpd_legal_documents_effective_date ON lgpd_legal_documents(effective_date);
CREATE INDEX idx_lgpd_legal_documents_expiration_date ON lgpd_legal_documents(expiration_date);
CREATE INDEX idx_lgpd_legal_documents_next_review ON lgpd_legal_documents(next_review_date);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_lgpd_consent_records_updated_at
    BEFORE UPDATE ON lgpd_consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_data_subject_requests_updated_at
    BEFORE UPDATE ON lgpd_data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_breach_incidents_updated_at
    BEFORE UPDATE ON lgpd_breach_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_retention_policies_updated_at
    BEFORE UPDATE ON lgpd_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_minimization_rules_updated_at
    BEFORE UPDATE ON lgpd_minimization_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_third_party_agreements_updated_at
    BEFORE UPDATE ON lgpd_third_party_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_third_party_transfers_updated_at
    BEFORE UPDATE ON lgpd_third_party_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_assessments_updated_at
    BEFORE UPDATE ON lgpd_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lgpd_legal_documents_updated_at
    BEFORE UPDATE ON lgpd_legal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all LGPD tables
ALTER TABLE lgpd_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_retention_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_minimization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_minimization_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_third_party_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_third_party_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_legal_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinic-based access
-- Users can only access LGPD data for clinics they belong to

-- Consent records policies
CREATE POLICY "Users can view consent records for their clinics" ON lgpd_consent_records
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert consent records for their clinics" ON lgpd_consent_records
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update consent records for their clinics" ON lgpd_consent_records
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Audit logs policies (read-only for most users)
CREATE POLICY "Users can view audit logs for their clinics" ON lgpd_audit_logs
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert audit logs" ON lgpd_audit_logs
    FOR INSERT WITH CHECK (true); -- System-level inserts allowed

-- Data subject requests policies
CREATE POLICY "Users can manage DSR for their clinics" ON lgpd_data_subject_requests
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Compliance assessments policies
CREATE POLICY "Users can manage compliance assessments for their clinics" ON lgpd_compliance_assessments
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Compliance alerts policies
CREATE POLICY "Users can manage compliance alerts for their clinics" ON lgpd_compliance_alerts
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Breach incidents policies
CREATE POLICY "Users can manage breach incidents for their clinics" ON lgpd_breach_incidents
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Retention policies
CREATE POLICY "Users can manage retention policies for their clinics" ON lgpd_retention_policies
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage retention executions for their clinics" ON lgpd_retention_executions
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Minimization rules policies
CREATE POLICY "Users can manage minimization rules for their clinics" ON lgpd_minimization_rules
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage minimization violations for their clinics" ON lgpd_minimization_violations
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Third-party compliance policies
CREATE POLICY "Users can manage third-party agreements for their clinics" ON lgpd_third_party_agreements
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage third-party transfers for their clinics" ON lgpd_third_party_transfers
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Assessment policies
CREATE POLICY "Users can manage assessments for their clinics" ON lgpd_assessments
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Legal documents policies
CREATE POLICY "Users can manage legal documents for their clinics" ON lgpd_legal_documents
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active consents
CREATE OR REPLACE VIEW lgpd_active_consents AS
SELECT 
    cr.*,
    CASE 
        WHEN cr.consent_expires_at IS NOT NULL AND cr.consent_expires_at < NOW() THEN 'expired'
        ELSE cr.consent_status
    END AS effective_status
FROM lgpd_consent_records cr
WHERE cr.consent_status = 'active'
   OR (cr.consent_status = 'active' AND cr.consent_expires_at > NOW());

-- View for overdue data subject requests
CREATE OR REPLACE VIEW lgpd_overdue_requests AS
SELECT 
    dsr.*,
    EXTRACT(DAYS FROM (NOW() - dsr.due_date)) AS days_overdue
FROM lgpd_data_subject_requests dsr
WHERE dsr.status NOT IN ('completed', 'cancelled', 'rejected')
  AND dsr.due_date < NOW();

-- View for compliance dashboard
CREATE OR REPLACE VIEW lgpd_compliance_dashboard AS
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    -- Consent metrics
    COUNT(DISTINCT cr.id) as total_consents,
    COUNT(DISTINCT CASE WHEN cr.consent_status = 'active' THEN cr.id END) as active_consents,
    COUNT(DISTINCT CASE WHEN cr.consent_expires_at < NOW() THEN cr.id END) as expired_consents,
    -- DSR metrics
    COUNT(DISTINCT dsr.id) as total_dsr_requests,
    COUNT(DISTINCT CASE WHEN dsr.status = 'completed' THEN dsr.id END) as completed_dsr_requests,
    COUNT(DISTINCT CASE WHEN dsr.due_date < NOW() AND dsr.status NOT IN ('completed', 'cancelled') THEN dsr.id END) as overdue_dsr_requests,
    -- Breach metrics
    COUNT(DISTINCT bi.id) as total_breach_incidents,
    COUNT(DISTINCT CASE WHEN bi.status = 'resolved' THEN bi.id END) as resolved_breach_incidents,
    COUNT(DISTINCT CASE WHEN bi.severity = 'critical' AND bi.status != 'resolved' THEN bi.id END) as critical_open_incidents,
    -- Alert metrics
    COUNT(DISTINCT ca.id) as total_alerts,
    COUNT(DISTINCT CASE WHEN ca.status = 'active' THEN ca.id END) as active_alerts,
    COUNT(DISTINCT CASE WHEN ca.severity = 'critical' AND ca.status = 'active' THEN ca.id END) as critical_active_alerts
FROM clinics c
LEFT JOIN lgpd_consent_records cr ON c.id = cr.clinic_id
LEFT JOIN lgpd_data_subject_requests dsr ON c.id = dsr.clinic_id
LEFT JOIN lgpd_breach_incidents bi ON c.id = bi.clinic_id
LEFT JOIN lgpd_compliance_alerts ca ON c.id = ca.clinic_id
GROUP BY c.id, c.name;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to calculate consent expiration
CREATE OR REPLACE FUNCTION calculate_consent_expiration(
    consent_given_at TIMESTAMPTZ,
    retention_period_months INTEGER
) RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN consent_given_at + (retention_period_months || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if DPIA is required
CREATE OR REPLACE FUNCTION is_dpia_required(
    data_categories TEXT[],
    processing_purposes TEXT[],
    data_subjects_count INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
BEGIN
    -- DPIA required for sensitive data categories
    IF 'health_data' = ANY(data_categories) OR 
       'biometric_data' = ANY(data_categories) OR
       'genetic_data' = ANY(data_categories) THEN
        RETURN TRUE;
    END IF;
    
    -- DPIA required for large scale processing
    IF data_subjects_count > 1000 THEN
        RETURN TRUE;
    END IF;
    
    -- DPIA required for automated decision making
    IF 'automated_decision_making' = ANY(processing_purposes) OR
       'profiling' = ANY(processing_purposes) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(
    clinic_id_param UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    consent_score DECIMAL(5,2) := 0;
    dsr_score DECIMAL(5,2) := 0;
    breach_score DECIMAL(5,2) := 0;
    retention_score DECIMAL(5,2) := 0;
    overall_score DECIMAL(5,2) := 0;
BEGIN
    -- Calculate consent management score (25%)
    SELECT COALESCE(
        (COUNT(CASE WHEN consent_status = 'active' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 100
    ) INTO consent_score
    FROM lgpd_consent_records 
    WHERE clinic_id = clinic_id_param;
    
    -- Calculate DSR response score (25%)
    SELECT COALESCE(
        (COUNT(CASE WHEN status = 'completed' AND completed_at <= due_date THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 100
    ) INTO dsr_score
    FROM lgpd_data_subject_requests 
    WHERE clinic_id = clinic_id_param;
    
    -- Calculate breach response score (25%)
    SELECT COALESCE(
        100 - (COUNT(CASE WHEN status NOT IN ('resolved', 'false_positive') THEN 1 END) * 10), 0
    ) INTO breach_score
    FROM lgpd_breach_incidents 
    WHERE clinic_id = clinic_id_param;
    
    -- Calculate retention compliance score (25%)
    SELECT COALESCE(
        (COUNT(CASE WHEN is_active = true THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 100
    ) INTO retention_score
    FROM lgpd_retention_policies 
    WHERE clinic_id = clinic_id_param;
    
    -- Calculate weighted overall score
    overall_score := (consent_score * 0.25) + (dsr_score * 0.25) + 
                    (breach_score * 0.25) + (retention_score * 0.25);
    
    RETURN GREATEST(0, LEAST(100, overall_score));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert default data minimization rules
INSERT INTO lgpd_minimization_rules (clinic_id, rule_name, processing_purpose, data_category, required_fields, optional_fields, prohibited_fields, collection_rules, is_active)
SELECT 
    c.id,
    'Default Patient Registration',
    'patient_registration',
    'personal_data',
    ARRAY['full_name', 'date_of_birth', 'cpf'],
    ARRAY['phone', 'email', 'address'],
    ARRAY['political_opinions', 'religious_beliefs'],
    '{
        "purpose_limitation": true,
        "data_accuracy": true,
        "storage_limitation": true
    }'::JSONB,
    true
FROM clinics c
ON CONFLICT (clinic_id, processing_purpose, data_category) DO NOTHING;

-- Insert default retention policies
INSERT INTO lgpd_retention_policies (clinic_id, policy_name, data_category, retention_period_months, legal_basis, processing_purpose, retention_action, is_active)
SELECT 
    c.id,
    'Medical Records Retention',
    'health_data',
    240, -- 20 years as required by CFM
    'legal_obligation',
    'medical_care',
    'archive',
    true
FROM clinics c
ON CONFLICT (clinic_id, data_category, processing_purpose) DO NOTHING;

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lgpd_consent_records_composite 
    ON lgpd_consent_records(clinic_id, consent_status, consent_expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lgpd_audit_logs_composite 
    ON lgpd_audit_logs(clinic_id, created_at DESC, severity);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lgpd_dsr_composite 
    ON lgpd_data_subject_requests(clinic_id, status, due_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lgpd_alerts_composite 
    ON lgpd_compliance_alerts(clinic_id, status, severity, triggered_at DESC);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA public IS 'LGPD Compliance Automation System - Comprehensive database schema for LGPD compliance management';

COMMENT ON TABLE lgpd_consent_records IS 'Stores all consent records for LGPD compliance, including consent status, legal basis, and expiration tracking';
COMMENT ON TABLE lgpd_audit_logs IS 'Comprehensive audit trail for all LGPD-related activities and data processing operations';
COMMENT ON TABLE lgpd_data_subject_requests IS 'Manages data subject rights requests (access, rectification, erasure, portability, etc.)';
COMMENT ON TABLE lgpd_compliance_assessments IS 'Stores compliance assessment results and scores for monitoring LGPD compliance';
COMMENT ON TABLE lgpd_compliance_alerts IS 'Manages compliance alerts and notifications for LGPD violations or issues';
COMMENT ON TABLE lgpd_breach_incidents IS 'Tracks data breach incidents, investigation, and resolution for LGPD compliance';
COMMENT ON TABLE lgpd_retention_policies IS 'Defines data retention policies and rules for different data categories';
COMMENT ON TABLE lgpd_retention_executions IS 'Tracks execution of data retention policies and cleanup operations';
COMMENT ON TABLE lgpd_minimization_rules IS 'Defines data minimization rules for different processing purposes';
COMMENT ON TABLE lgpd_minimization_violations IS 'Tracks violations of data minimization principles';
COMMENT ON TABLE lgpd_third_party_agreements IS 'Manages agreements with third parties for data sharing and processing';
COMMENT ON TABLE lgpd_third_party_transfers IS 'Tracks data transfers to third parties and compliance validation';
COMMENT ON TABLE lgpd_assessments IS 'Stores LGPD impact assessments (DPIA) and compliance evaluations';
COMMENT ON TABLE lgpd_legal_documents IS 'Manages legal documents like privacy policies, consent forms, and compliance documentation';

-- End of LGPD Compliance Database Schema