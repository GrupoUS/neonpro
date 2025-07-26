-- ================================================
-- NeonPro Clinical Compliance & Documentation Schema
-- Migration: 20250127001300_create_compliance_documentation_schema
-- Story: 3.4 - Clinical Compliance & Documentation
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. CONSENT FORMS MANAGEMENT
-- Digital consent forms with LGPD compliance
-- ================================================

CREATE TABLE consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_html TEXT NOT NULL,
    content_version INTEGER NOT NULL DEFAULT 1,
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN (
        'treatment_consent', 'procedure_consent', 'data_processing',
        'marketing_consent', 'photography_consent', 'anesthesia_consent'
    )),
    language VARCHAR(5) NOT NULL DEFAULT 'pt-BR',
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_signature BOOLEAN NOT NULL DEFAULT true,
    requires_witness BOOLEAN NOT NULL DEFAULT false,
    legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN (
        'consent', 'legitimate_interest', 'contract', 'legal_obligation',
        'vital_interests', 'public_task'
    )),
    retention_period_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ================================================
-- 2. PATIENT CONSENT MANAGEMENT
-- Electronic signatures and consent tracking
-- ================================================

CREATE TABLE patient_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    consent_form_id UUID NOT NULL REFERENCES consent_forms(id),
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN (
        'electronic_signature', 'verbal_confirmed', 'written_physical',
        'digital_checkbox', 'biometric_signature'
    )),
    signature_data JSONB, -- Electronic signature capture data
    ip_address INET,
    user_agent TEXT,
    witness_name VARCHAR(255),
    witness_signature_data JSONB,
    withdrawal_date TIMESTAMPTZ,
    withdrawal_reason TEXT,
    is_withdrawn BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ================================================
-- 3. AUDIT TRAILS SYSTEM
-- Comprehensive activity logging for compliance
-- ================================================

CREATE TABLE audit_trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN (
        'INSERT', 'UPDATE', 'DELETE', 'SELECT', 'VIEW', 'EXPORT', 'PRINT'
    )),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    user_role VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_context VARCHAR(100), -- LGPD, ANVISA, CFM context
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- 4. COMPLIANCE REPORTS
-- Regulatory reporting and compliance tracking
-- ================================================

CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN (
        'anvisa_inspection', 'cfm_audit', 'crm_compliance', 'lgpd_report',
        'data_breach_notification', 'patient_safety_report', 'quality_metrics'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    regulatory_body VARCHAR(100) NOT NULL,
    report_data JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_review', 'approved', 'submitted', 'accepted', 'rejected'
    )),
    submission_deadline DATE,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    file_attachments JSONB, -- Array of file references
    compliance_score DECIMAL(5,2),
    findings TEXT[],
    corrective_actions TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ================================================
-- 5. LEGAL DOCUMENTS MANAGEMENT
-- Document storage and version control
-- ================================================

CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
        'contract', 'policy', 'procedure', 'regulation', 'license',
        'certification', 'insurance', 'legal_notice', 'terms_of_service'
    )),
    document_category VARCHAR(100) NOT NULL,
    description TEXT,
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    file_hash VARCHAR(128), -- For integrity verification
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_current_version BOOLEAN NOT NULL DEFAULT true,
    parent_document_id UUID REFERENCES legal_documents(id),
    effective_date DATE,
    expiration_date DATE,
    review_date DATE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (approval_status IN (
        'draft', 'pending_review', 'approved', 'rejected', 'archived'
    )),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    access_level VARCHAR(50) NOT NULL DEFAULT 'internal' CHECK (access_level IN (
        'public', 'internal', 'confidential', 'restricted'
    )),
    retention_period_years INTEGER,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ================================================
-- 6. COMPLIANCE METRICS
-- Performance tracking and monitoring
-- ================================================

CREATE TABLE compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN (
        'consent_completion_rate', 'data_breach_incidents', 'audit_findings',
        'training_completion', 'document_review_compliance', 'response_time',
        'patient_complaints', 'regulatory_violations'
    )),
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    measurement_date DATE NOT NULL,
    reporting_period VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly
    target_value DECIMAL(15,4),
    threshold_min DECIMAL(15,4),
    threshold_max DECIMAL(15,4),
    status VARCHAR(50) DEFAULT 'normal' CHECK (status IN (
        'normal', 'warning', 'critical', 'non_compliant'
    )),
    calculation_method TEXT,
    data_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ================================================
-- 7. COMPLIANCE TRAINING RECORDS
-- Training and awareness tracking
-- ================================================

CREATE TABLE compliance_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    training_title VARCHAR(255) NOT NULL,
    training_type VARCHAR(100) NOT NULL CHECK (training_type IN (
        'lgpd_awareness', 'patient_safety', 'infection_control',
        'emergency_procedures', 'data_security', 'anvisa_regulations'
    )),
    description TEXT,
    training_content JSONB,
    required_for_roles TEXT[],
    completion_required BOOLEAN NOT NULL DEFAULT true,
    certification_valid_months INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE training_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES auth.users(id),
    training_id UUID NOT NULL REFERENCES compliance_training(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    completion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    score DECIMAL(5,2),
    passing_score DECIMAL(5,2),
    passed BOOLEAN NOT NULL,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_number VARCHAR(100),
    expiration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);-- ================================================
-- INDEXES for Performance Optimization
-- ================================================

-- Consent Forms indexes
CREATE INDEX idx_consent_forms_clinic_id ON consent_forms(clinic_id);
CREATE INDEX idx_consent_forms_type_active ON consent_forms(form_type, is_active);
CREATE INDEX idx_consent_forms_created_at ON consent_forms(created_at DESC);

-- Patient Consents indexes
CREATE INDEX idx_patient_consents_clinic_id ON patient_consents(clinic_id);
CREATE INDEX idx_patient_consents_patient_id ON patient_consents(patient_id);
CREATE INDEX idx_patient_consents_form_id ON patient_consents(consent_form_id);
CREATE INDEX idx_patient_consents_date ON patient_consents(consent_date DESC);
CREATE INDEX idx_patient_consents_withdrawn ON patient_consents(is_withdrawn);

-- Audit Trails indexes (critical for performance)
CREATE INDEX idx_audit_trails_clinic_id ON audit_trails(clinic_id);
CREATE INDEX idx_audit_trails_table_record ON audit_trails(table_name, record_id);
CREATE INDEX idx_audit_trails_user_id ON audit_trails(user_id);
CREATE INDEX idx_audit_trails_created_at ON audit_trails(created_at DESC);
CREATE INDEX idx_audit_trails_operation ON audit_trails(operation);
CREATE INDEX idx_audit_trails_risk_level ON audit_trails(risk_level);

-- Compliance Reports indexes
CREATE INDEX idx_compliance_reports_clinic_id ON compliance_reports(clinic_id);
CREATE INDEX idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX idx_compliance_reports_status ON compliance_reports(status);
CREATE INDEX idx_compliance_reports_period ON compliance_reports(reporting_period_start, reporting_period_end);
CREATE INDEX idx_compliance_reports_deadline ON compliance_reports(submission_deadline);

-- Legal Documents indexes
CREATE INDEX idx_legal_documents_clinic_id ON legal_documents(clinic_id);
CREATE INDEX idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX idx_legal_documents_current ON legal_documents(is_current_version);
CREATE INDEX idx_legal_documents_status ON legal_documents(approval_status);
CREATE INDEX idx_legal_documents_dates ON legal_documents(effective_date, expiration_date);

-- Compliance Metrics indexes
CREATE INDEX idx_compliance_metrics_clinic_id ON compliance_metrics(clinic_id);
CREATE INDEX idx_compliance_metrics_type ON compliance_metrics(metric_type);
CREATE INDEX idx_compliance_metrics_date ON compliance_metrics(measurement_date DESC);
CREATE INDEX idx_compliance_metrics_status ON compliance_metrics(status);

-- Training indexes
CREATE INDEX idx_compliance_training_clinic_id ON compliance_training(clinic_id);
CREATE INDEX idx_training_completions_clinic_id ON training_completions(clinic_id);
CREATE INDEX idx_training_completions_user_id ON training_completions(user_id);
CREATE INDEX idx_training_completions_training_id ON training_completions(training_id);
CREATE INDEX idx_training_completions_expiration ON training_completions(expiration_date);

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;

-- Consent Forms RLS Policies
CREATE POLICY "Consent forms are clinic-specific" ON consent_forms
    FOR ALL USING (clinic_id = auth.uid());

-- Patient Consents RLS Policies
CREATE POLICY "Patient consents are clinic-specific" ON patient_consents
    FOR ALL USING (clinic_id = auth.uid());

-- Audit Trails RLS Policies (read-only for compliance)
CREATE POLICY "Audit trails are clinic-specific" ON audit_trails
    FOR SELECT USING (clinic_id = auth.uid());

CREATE POLICY "Audit trails insert only by system" ON audit_trails
    FOR INSERT WITH CHECK (clinic_id = auth.uid());

-- Compliance Reports RLS Policies
CREATE POLICY "Compliance reports are clinic-specific" ON compliance_reports
    FOR ALL USING (clinic_id = auth.uid());

-- Legal Documents RLS Policies
CREATE POLICY "Legal documents are clinic-specific" ON legal_documents
    FOR ALL USING (clinic_id = auth.uid());

-- Compliance Metrics RLS Policies
CREATE POLICY "Compliance metrics are clinic-specific" ON compliance_metrics
    FOR ALL USING (clinic_id = auth.uid());

-- Training RLS Policies
CREATE POLICY "Training is clinic-specific" ON compliance_training
    FOR ALL USING (clinic_id = auth.uid());

CREATE POLICY "Training completions are clinic-specific" ON training_completions
    FOR ALL USING (clinic_id = auth.uid());

-- ================================================
-- AUDIT TRIGGERS for Compliance Tracking
-- ================================================

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_compliance_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit record for compliance-sensitive operations
    INSERT INTO audit_trails (
        clinic_id,
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_id,
        compliance_context,
        risk_level
    )
    VALUES (
        COALESCE(NEW.clinic_id, OLD.clinic_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN 
                ARRAY(SELECT key FROM jsonb_each(to_jsonb(NEW)) WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key)
            ELSE NULL 
        END,
        auth.uid(),
        CASE TG_TABLE_NAME 
            WHEN 'patient_consents' THEN 'LGPD'
            WHEN 'compliance_reports' THEN 'REGULATORY'
            WHEN 'legal_documents' THEN 'LEGAL'
            ELSE 'GENERAL'
        END,
        CASE TG_TABLE_NAME 
            WHEN 'patient_consents' THEN 'high'
            WHEN 'audit_trails' THEN 'critical'
            ELSE 'medium'
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to compliance-sensitive tables
CREATE TRIGGER audit_consent_forms_trigger
    AFTER INSERT OR UPDATE OR DELETE ON consent_forms
    FOR EACH ROW EXECUTE FUNCTION audit_compliance_changes();

CREATE TRIGGER audit_patient_consents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patient_consents
    FOR EACH ROW EXECUTE FUNCTION audit_compliance_changes();

CREATE TRIGGER audit_compliance_reports_trigger
    AFTER INSERT OR UPDATE OR DELETE ON compliance_reports
    FOR EACH ROW EXECUTE FUNCTION audit_compliance_changes();

CREATE TRIGGER audit_legal_documents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION audit_compliance_changes();

-- ================================================
-- SAMPLE DATA for Testing
-- ================================================

-- Sample consent form templates
INSERT INTO consent_forms (
    clinic_id, title, description, content_html, form_type, language, legal_basis
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Placeholder clinic ID
    'Consentimento para Tratamento Estético',
    'Formulário de consentimento para procedimentos estéticos em geral',
    '<h2>Consentimento Informado para Tratamento Estético</h2><p>Eu, abaixo assinado, autorizo...</p>',
    'treatment_consent',
    'pt-BR',
    'consent'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Tratamento de Dados Pessoais - LGPD',
    'Consentimento para tratamento de dados pessoais conforme LGPD',
    '<h2>Consentimento LGPD</h2><p>Autorizo o tratamento dos meus dados pessoais...</p>',
    'data_processing',
    'pt-BR',
    'consent'
);

-- Sample compliance training
INSERT INTO compliance_training (
    clinic_id, training_title, training_type, description, required_for_roles
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    'Treinamento LGPD para Clínicas',
    'lgpd_awareness',
    'Curso completo sobre Lei Geral de Proteção de Dados aplicada a clínicas estéticas',
    ARRAY['admin', 'doctor', 'nurse', 'receptionist']
),
(
    '00000000-0000-0000-0000-000000000000',
    'Segurança do Paciente',
    'patient_safety',
    'Protocolos de segurança do paciente em procedimentos estéticos',
    ARRAY['doctor', 'nurse']
);

COMMENT ON TABLE consent_forms IS 'Digital consent forms for clinical procedures with LGPD compliance';
COMMENT ON TABLE patient_consents IS 'Electronic consent tracking with digital signatures';
COMMENT ON TABLE audit_trails IS 'Comprehensive audit logging for regulatory compliance';
COMMENT ON TABLE compliance_reports IS 'Regulatory reporting for ANVISA, CFM, and other bodies';
COMMENT ON TABLE legal_documents IS 'Legal document management with version control';
COMMENT ON TABLE compliance_metrics IS 'Compliance performance metrics and KPIs';
COMMENT ON TABLE compliance_training IS 'Training programs for compliance awareness';
COMMENT ON TABLE training_completions IS 'Training completion tracking and certification';