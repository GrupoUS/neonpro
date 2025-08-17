-- ================================================
-- STORY 4.1: HEALTHCARE COMPLIANCE AUTOMATION SCHEMA
-- Advanced compliance automation for LGPD, ANVISA, and CFM
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- LGPD COMPLIANCE AUTOMATION TABLES
-- ================================================

-- Data Classification and Inventory System
CREATE TABLE compliance_data_classification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_category VARCHAR(50) NOT NULL CHECK (data_category IN ('personal', 'sensitive', 'anonymous', 'pseudonymous')),
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    purpose TEXT[] NOT NULL,
    legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests')),
    retention_period_days INTEGER NOT NULL,
    data_subjects TEXT[] NOT NULL,
    third_party_sharing BOOLEAN DEFAULT FALSE,
    international_transfer BOOLEAN DEFAULT FALSE,
    encryption_required BOOLEAN DEFAULT TRUE,
    anonymization_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(table_name, column_name)
);

-- Legal Basis Tracking for Data Processing
CREATE TABLE compliance_legal_basis_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processing_activity_id UUID NOT NULL,
    processing_purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    legal_basis_details TEXT,
    data_categories TEXT[] NOT NULL,
    data_subjects_categories TEXT[] NOT NULL,
    recipients TEXT[],
    retention_criteria TEXT,
    technical_measures TEXT[],
    organizational_measures TEXT[],
    impact_assessment_required BOOLEAN DEFAULT FALSE,
    impact_assessment_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enhanced Consent Management with Granular Controls
CREATE TABLE compliance_consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_id VARCHAR(255) UNIQUE NOT NULL,
    data_subject_id UUID NOT NULL,
    clinic_id UUID REFERENCES clinics(id),
    purposes TEXT[] NOT NULL,
    consent_text TEXT NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN ('explicit', 'opt_in', 'pre_checked', 'implicit')),
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn BOOLEAN DEFAULT FALSE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    withdrawal_reason TEXT,
    evidence JSONB NOT NULL, -- IP, User-Agent, timestamp, etc.
    consent_scope JSONB NOT NULL, -- Detailed scope of consent
    expiry_date TIMESTAMP WITH TIME ZONE,
    renewal_required BOOLEAN DEFAULT FALSE,
    parent_consent_id UUID REFERENCES compliance_consent_records(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Protection Impact Assessment (DPIA) System
CREATE TABLE compliance_dpia_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_name VARCHAR(255) NOT NULL,
    clinic_id UUID REFERENCES clinics(id),
    processing_operation TEXT NOT NULL,
    systematic_description TEXT NOT NULL,
    legitimate_interests TEXT,
    necessity_assessment TEXT NOT NULL,
    proportionality_assessment TEXT NOT NULL,
    risk_identification JSONB NOT NULL,
    risk_mitigation_measures JSONB NOT NULL,
    residual_risk_level VARCHAR(20) CHECK (residual_risk_level IN ('low', 'medium', 'high')),
    safeguards_implemented JSONB,
    consultation_required BOOLEAN DEFAULT FALSE,
    consultation_details TEXT,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'review_required')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Data Subject Rights Request Processing
CREATE TABLE compliance_data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) UNIQUE NOT NULL,
    data_subject_id UUID NOT NULL,
    clinic_id UUID REFERENCES clinics(id),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    request_details TEXT NOT NULL,
    identity_verification_status VARCHAR(20) DEFAULT 'pending' CHECK (identity_verification_status IN ('pending', 'verified', 'failed')),
    identity_verification_method VARCHAR(100),
    verification_documents JSONB,
    processing_status VARCHAR(20) DEFAULT 'received' CHECK (processing_status IN ('received', 'in_progress', 'completed', 'rejected', 'partially_completed')),
    response_text TEXT,
    data_provided JSONB,
    actions_taken JSONB,
    rejection_reason TEXT,
    legal_basis_for_processing TEXT,
    third_parties_notified TEXT[],
    response_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- ANVISA MEDICAL DEVICE COMPLIANCE TABLES
-- ================================================

-- IEC 62304 Software Lifecycle Compliance
CREATE TABLE compliance_software_lifecycle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_item_name VARCHAR(255) NOT NULL,
    software_version VARCHAR(50) NOT NULL,
    safety_classification VARCHAR(10) NOT NULL CHECK (safety_classification IN ('A', 'B', 'C')),
    medical_device_classification VARCHAR(50),
    intended_use TEXT NOT NULL,
    clinical_evaluation JSONB,
    risk_management_file_id UUID,
    software_requirements JSONB NOT NULL,
    architecture_design JSONB NOT NULL,
    detailed_design JSONB,
    implementation_verification JSONB,
    integration_testing JSONB,
    system_testing JSONB,
    release_criteria JSONB NOT NULL,
    configuration_management JSONB NOT NULL,
    problem_resolution JSONB,
    software_maintenance_plan JSONB,
    compliance_status VARCHAR(20) DEFAULT 'in_progress' CHECK (compliance_status IN ('in_progress', 'compliant', 'non_compliant')),
    last_review_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(software_item_name, software_version)
);

-- Risk Analysis Records (ISO 14971)
CREATE TABLE compliance_risk_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_lifecycle_id UUID REFERENCES compliance_software_lifecycle(id),
    hazard_id VARCHAR(50) NOT NULL,
    hazard_description TEXT NOT NULL,
    hazardous_situation TEXT NOT NULL,
    harm TEXT NOT NULL,
    sequence_of_events TEXT,
    severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
    probability_occurrence INTEGER NOT NULL CHECK (probability_occurrence BETWEEN 1 AND 5),
    initial_risk_level INTEGER GENERATED ALWAYS AS (severity_level * probability_occurrence) STORED,
    risk_control_measures JSONB NOT NULL,
    residual_severity INTEGER NOT NULL CHECK (residual_severity BETWEEN 1 AND 5),
    residual_probability INTEGER NOT NULL CHECK (residual_probability BETWEEN 1 AND 5),
    residual_risk_level INTEGER GENERATED ALWAYS AS (residual_severity * residual_probability) STORED,
    risk_acceptability VARCHAR(20) NOT NULL CHECK (risk_acceptability IN ('acceptable', 'unacceptable', 'alarp')),
    additional_measures_required BOOLEAN DEFAULT FALSE,
    additional_measures TEXT,
    verification_activities JSONB,
    review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Clinical Data Management (FDA 21 CFR Part 11)
CREATE TABLE compliance_electronic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id VARCHAR(100) UNIQUE NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    clinic_id UUID REFERENCES clinics(id),
    patient_id UUID,
    professional_id UUID,
    record_content JSONB NOT NULL,
    data_integrity_hash VARCHAR(255) NOT NULL,
    digital_signature JSONB NOT NULL,
    audit_trail JSONB NOT NULL,
    creation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    last_modification TIMESTAMP WITH TIME ZONE NOT NULL,
    record_status VARCHAR(20) DEFAULT 'active' CHECK (record_status IN ('active', 'archived', 'deleted')),
    retention_period_years INTEGER NOT NULL DEFAULT 20,
    retention_end_date TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (creation_timestamp + INTERVAL '1 year' * retention_period_years) STORED,
    access_controls JSONB NOT NULL,
    backup_status VARCHAR(20) DEFAULT 'backed_up' CHECK (backup_status IN ('backed_up', 'pending_backup', 'backup_failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Signature Management
CREATE TABLE compliance_digital_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    electronic_record_id UUID REFERENCES compliance_electronic_records(id),
    signer_id UUID REFERENCES auth.users(id) NOT NULL,
    signer_role VARCHAR(100) NOT NULL,
    signature_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    signature_method VARCHAR(50) NOT NULL CHECK (signature_method IN ('pki', 'biometric', 'password', 'pin')),
    signature_data JSONB NOT NULL,
    biometric_data JSONB,
    certificate_details JSONB,
    signature_reason VARCHAR(255) NOT NULL,
    signature_location VARCHAR(255),
    non_repudiation_evidence JSONB NOT NULL,
    validation_status VARCHAR(20) DEFAULT 'valid' CHECK (validation_status IN ('valid', 'invalid', 'expired', 'revoked')),
    validation_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- CFM PROFESSIONAL STANDARDS COMPLIANCE TABLES
-- ================================================

-- Medical Professional Validation and Licensing
CREATE TABLE compliance_medical_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professionals(id),
    cfm_registration VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_status VARCHAR(20) NOT NULL CHECK (license_status IN ('active', 'inactive', 'suspended', 'revoked')),
    specializations JSONB NOT NULL,
    license_expiry_date DATE NOT NULL,
    continuing_education_status VARCHAR(20) DEFAULT 'current' CHECK (continuing_education_status IN ('current', 'expired', 'pending')),
    ethics_training_status VARCHAR(20) DEFAULT 'current' CHECK (ethics_training_status IN ('current', 'expired', 'pending')),
    telemedicine_authorization BOOLEAN DEFAULT FALSE,
    telemedicine_certification_date DATE,
    electronic_prescription_authorization BOOLEAN DEFAULT FALSE,
    digital_signature_certificate JSONB,
    professional_responsibility_score INTEGER DEFAULT 100 CHECK (professional_responsibility_score BETWEEN 0 AND 100),
    last_validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_validation_due TIMESTAMP WITH TIME ZONE,
    validation_frequency_days INTEGER DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continuing Education Tracking
CREATE TABLE compliance_continuing_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES compliance_medical_professionals(id),
    education_type VARCHAR(100) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    provider_institution VARCHAR(255) NOT NULL,
    credit_hours DECIMAL(5,2) NOT NULL,
    completion_date DATE NOT NULL,
    certificate_number VARCHAR(100),
    certificate_document JSONB,
    accreditation_body VARCHAR(255),
    specialty_relevance VARCHAR(255),
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Ethics Compliance Tracking
CREATE TABLE compliance_medical_ethics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES compliance_medical_professionals(id),
    clinic_id UUID REFERENCES clinics(id),
    ethics_training_date TIMESTAMP WITH TIME ZONE NOT NULL,
    training_provider VARCHAR(255) NOT NULL,
    training_certificate JSONB,
    ethics_violations JSONB DEFAULT '[]'::jsonb,
    patient_complaints JSONB DEFAULT '[]'::jsonb,
    disciplinary_actions JSONB DEFAULT '[]'::jsonb,
    professional_conduct_score INTEGER DEFAULT 100 CHECK (professional_conduct_score BETWEEN 0 AND 100),
    advertising_compliance_status VARCHAR(20) DEFAULT 'compliant' CHECK (advertising_compliance_status IN ('compliant', 'warning', 'violation')),
    last_ethics_review DATE,
    next_ethics_review DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- COMPLIANCE MONITORING AND ALERTING TABLES
-- ================================================

-- Real-time Compliance Monitoring Events
CREATE TABLE compliance_monitoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('lgpd', 'anvisa', 'cfm', 'general')),
    clinic_id UUID REFERENCES clinics(id),
    user_id UUID REFERENCES auth.users(id),
    event_data JSONB NOT NULL,
    compliance_status VARCHAR(20) NOT NULL CHECK (compliance_status IN ('compliant', 'warning', 'violation', 'critical')),
    severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
    auto_resolved BOOLEAN DEFAULT FALSE,
    resolution_action TEXT,
    resolution_timestamp TIMESTAMP WITH TIME ZONE,
    escalation_required BOOLEAN DEFAULT FALSE,
    escalated_to UUID REFERENCES auth.users(id),
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Alerts and Notifications
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(100) NOT NULL,
    alert_category VARCHAR(50) NOT NULL CHECK (alert_category IN ('lgpd', 'anvisa', 'cfm', 'system')),
    clinic_id UUID REFERENCES clinics(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    affected_systems TEXT[],
    recommended_actions JSONB,
    alert_status VARCHAR(20) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[] DEFAULT '{"email", "dashboard"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Metrics and KPIs
CREATE TABLE compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL CHECK (metric_category IN ('lgpd', 'anvisa', 'cfm', 'overall')),
    clinic_id UUID REFERENCES clinics(id),
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(50),
    target_value DECIMAL(10,4),
    threshold_warning DECIMAL(10,4),
    threshold_critical DECIMAL(10,4),
    measurement_period VARCHAR(50) NOT NULL,
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable')),
    benchmark_comparison VARCHAR(50),
    data_source VARCHAR(100),
    calculation_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- EVIDENCE MANAGEMENT AND DOCUMENTATION TABLES
-- ================================================

-- Compliance Evidence Storage
CREATE TABLE compliance_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_type VARCHAR(100) NOT NULL,
    compliance_category VARCHAR(50) NOT NULL CHECK (compliance_category IN ('lgpd', 'anvisa', 'cfm', 'general')),
    clinic_id UUID REFERENCES clinics(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_data JSONB NOT NULL,
    file_attachments JSONB DEFAULT '[]'::jsonb,
    hash_verification VARCHAR(255),
    digital_signature JSONB,
    retention_period_years INTEGER NOT NULL DEFAULT 7,
    retention_end_date TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (created_at + INTERVAL '1 year' * retention_period_years) STORED,
    access_level VARCHAR(20) DEFAULT 'restricted' CHECK (access_level IN ('public', 'internal', 'restricted', 'confidential')),
    chain_of_custody JSONB DEFAULT '[]'::jsonb,
    version_number INTEGER DEFAULT 1,
    parent_evidence_id UUID REFERENCES compliance_evidence(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================

-- Data Classification Indexes
CREATE INDEX idx_data_classification_table_column ON compliance_data_classification(table_name, column_name);
CREATE INDEX idx_data_classification_category ON compliance_data_classification(data_category);
CREATE INDEX idx_data_classification_legal_basis ON compliance_data_classification(legal_basis);

-- Consent Management Indexes
CREATE INDEX idx_consent_data_subject ON compliance_consent_records(data_subject_id);
CREATE INDEX idx_consent_clinic ON compliance_consent_records(clinic_id);
CREATE INDEX idx_consent_status ON compliance_consent_records(granted, withdrawn);
CREATE INDEX idx_consent_expiry ON compliance_consent_records(expiry_date) WHERE expiry_date IS NOT NULL;

-- Data Subject Requests Indexes
CREATE INDEX idx_dsr_data_subject ON compliance_data_subject_requests(data_subject_id);
CREATE INDEX idx_dsr_clinic ON compliance_data_subject_requests(clinic_id);
CREATE INDEX idx_dsr_status ON compliance_data_subject_requests(processing_status);
CREATE INDEX idx_dsr_due_date ON compliance_data_subject_requests(response_due_date);

-- Professional Compliance Indexes
CREATE INDEX idx_med_prof_cfm ON compliance_medical_professionals(cfm_registration);
CREATE INDEX idx_med_prof_license_status ON compliance_medical_professionals(license_status);
CREATE INDEX idx_med_prof_expiry ON compliance_medical_professionals(license_expiry_date);

-- Monitoring and Alerts Indexes
CREATE INDEX idx_monitoring_events_category ON compliance_monitoring_events(event_category);
CREATE INDEX idx_monitoring_events_status ON compliance_monitoring_events(compliance_status);
CREATE INDEX idx_monitoring_events_clinic ON compliance_monitoring_events(clinic_id);
CREATE INDEX idx_monitoring_events_created ON compliance_monitoring_events(created_at);

CREATE INDEX idx_alerts_category ON compliance_alerts(alert_category);
CREATE INDEX idx_alerts_status ON compliance_alerts(alert_status);
CREATE INDEX idx_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_alerts_clinic ON compliance_alerts(clinic_id);

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all compliance tables
ALTER TABLE compliance_data_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_legal_basis_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_dpia_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_software_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_electronic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_medical_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_continuing_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_medical_ethics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinic-based access
DO $$
BEGIN
    -- Compliance Data Classification
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_data_classification' AND policyname = 'compliance_data_classification_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_data_classification_tenant_isolation ON compliance_data_classification FOR ALL TO authenticated USING (true)';
    END IF;

    -- Consent Records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_consent_records' AND policyname = 'compliance_consent_records_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_consent_records_tenant_isolation ON compliance_consent_records FOR ALL TO authenticated USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid())))';
    END IF;

    -- Data Subject Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_data_subject_requests' AND policyname = 'compliance_data_subject_requests_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_data_subject_requests_tenant_isolation ON compliance_data_subject_requests FOR ALL TO authenticated USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid())))';
    END IF;

    -- Medical Professionals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_medical_professionals' AND policyname = 'compliance_medical_professionals_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_medical_professionals_tenant_isolation ON compliance_medical_professionals FOR ALL TO authenticated USING (professional_id IN (SELECT id FROM professionals WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()))))';
    END IF;

    -- Monitoring Events
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_monitoring_events' AND policyname = 'compliance_monitoring_events_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_monitoring_events_tenant_isolation ON compliance_monitoring_events FOR ALL TO authenticated USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid())))';
    END IF;

    -- Alerts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compliance_alerts' AND policyname = 'compliance_alerts_tenant_isolation') THEN
        EXECUTE 'CREATE POLICY compliance_alerts_tenant_isolation ON compliance_alerts FOR ALL TO authenticated USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid())))';
    END IF;

END $$;