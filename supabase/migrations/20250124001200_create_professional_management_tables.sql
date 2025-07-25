-- Migration: Create Professional Management System Tables
-- Description: FHIR-compliant professional credentialing and management system
-- Author: VoidBeast V4.0 Enhanced Context Engine
-- Date: 2025-01-24

-- Enable RLS
ALTER DATABASE postgres SET "app.current_user_id" = '';

-- Create enum types for professional management
CREATE TYPE professional_status AS ENUM ('active', 'inactive', 'suspended', 'retired');
CREATE TYPE credential_type AS ENUM ('license', 'certification', 'degree', 'continuing_education', 'fellowship');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'expired', 'revoked', 'under_review');
CREATE TYPE metric_type AS ENUM ('patient_satisfaction', 'clinical_quality', 'safety', 'productivity', 'outcomes');
CREATE TYPE workflow_status AS ENUM ('initiated', 'in_progress', 'pending_review', 'approved', 'rejected', 'completed');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- =============================================
-- PROFESSIONALS TABLE (FHIR Practitioner)
-- =============================================
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- FHIR Practitioner Identifiers
    npi_number VARCHAR(10) UNIQUE NOT NULL, -- National Provider Identifier
    fhir_identifier JSONB NOT NULL DEFAULT '[]', -- FHIR identifier array
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    suffix VARCHAR(20),
    preferred_name VARCHAR(100),
    
    -- Demographics
    gender VARCHAR(20),
    date_of_birth DATE,
    
    -- Contact Information (FHIR compliant)
    contact_info JSONB NOT NULL DEFAULT '{}', -- phone, email, address
    emergency_contact JSONB DEFAULT '{}',
    
    -- Professional Information
    languages_spoken JSONB NOT NULL DEFAULT '[]', -- Array of language codes
    professional_summary TEXT,
    biography TEXT,
    photo_url TEXT,
    
    -- Employment Status
    status professional_status NOT NULL DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    
    -- LGPD Compliance
    lgpd_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    lgpd_consent_date TIMESTAMPTZ,
    lgpd_data_retention_until DATE,
    lgpd_consent_version VARCHAR(20) DEFAULT '1.0',
    
    -- Audit Fields
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    
    CONSTRAINT valid_npi_format CHECK (npi_number ~ '^[0-9]{10}$'),
    CONSTRAINT valid_dates CHECK (
        (hire_date IS NULL OR termination_date IS NULL OR hire_date <= termination_date) AND
        (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
    )
);

-- =============================================
-- SPECIALTIES REFERENCE TABLE
-- =============================================
CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Specialty Information
    specialty_name VARCHAR(200) NOT NULL UNIQUE,
    specialty_code VARCHAR(50) UNIQUE,
    fhir_specialty_code VARCHAR(100), -- FHIR PractitionerRole.specialty
    
    -- Categorization
    category VARCHAR(50) NOT NULL DEFAULT 'specialist', -- primary_care, specialist, sub_specialist
    parent_specialty_id UUID REFERENCES specialties(id),
    
    -- Details
    description TEXT,
    certification_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- PROFESSIONAL CREDENTIALS TABLE
-- =============================================
CREATE TABLE professional_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Credential Information
    credential_type credential_type NOT NULL,
    credential_name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    
    -- Identifiers
    license_number VARCHAR(100),
    certification_number VARCHAR(100),
    
    -- Dates
    issue_date DATE NOT NULL,
    expiration_date DATE,
    renewal_date DATE,
    
    -- Verification
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verification_date TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    verification_notes TEXT,
    
    -- FHIR Compliance
    fhir_qualification_code VARCHAR(100), -- FHIR Practitioner.qualification
    
    -- Document Management
    document_url TEXT, -- Secure document storage URL
    document_hash VARCHAR(64), -- For blockchain verification
    
    -- Automation Settings
    auto_renewal_enabled BOOLEAN DEFAULT FALSE,
    reminder_days_before INTEGER DEFAULT 30,
    
    CONSTRAINT valid_credential_dates CHECK (
        issue_date <= COALESCE(expiration_date, CURRENT_DATE + INTERVAL '100 years') AND
        (renewal_date IS NULL OR renewal_date >= issue_date)
    )
);-- Continue Professional Management System Tables
-- Part 2: Professional Specialties, Services, Metrics, and Workflows

-- =============================================
-- PROFESSIONAL SPECIALTIES (Many-to-Many)
-- =============================================
CREATE TABLE professional_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES specialties(id),
    
    -- Specialty Details
    is_primary BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    board_certified BOOLEAN DEFAULT FALSE,
    years_experience INTEGER DEFAULT 0,
    
    -- FHIR PractitionerRole fields
    location_ids JSONB DEFAULT '[]', -- Array of location UUIDs
    availability_hours JSONB DEFAULT '{}', -- Weekly schedule
    
    UNIQUE(professional_id, specialty_id),
    CONSTRAINT valid_experience CHECK (years_experience >= 0)
);

-- =============================================
-- PROFESSIONAL SERVICES
-- =============================================
CREATE TABLE professional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Service Information
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(50), -- CPT, SNOMED, or internal code
    fhir_service_code VARCHAR(100), -- FHIR HealthcareService
    
    -- Service Details
    description TEXT,
    category VARCHAR(100), -- diagnostic, therapeutic, preventive
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    location_ids JSONB DEFAULT '[]', -- Where service is offered
    availability_schedule JSONB DEFAULT '{}',
    
    -- Insurance and Billing
    insurance_accepted JSONB DEFAULT '[]', -- Array of insurance types
    estimated_duration INTEGER, -- Minutes
    base_cost DECIMAL(10,2),
    
    CONSTRAINT valid_duration CHECK (estimated_duration > 0),
    CONSTRAINT valid_cost CHECK (base_cost >= 0)
);

-- =============================================
-- PERFORMANCE METRICS
-- =============================================
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Metric Information
    metric_type metric_type NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_code VARCHAR(50), -- Standardized metric code
    
    -- Values
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(50), -- %, score, count, etc.
    
    -- Benchmarking
    benchmark_value DECIMAL(10,4),
    target_value DECIMAL(10,4),
    percentile_rank INTEGER, -- 1-100
    
    -- Time Period
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    
    -- Status and Analysis
    performance_status VARCHAR(50), -- above_target, meets_target, below_target
    improvement_trend VARCHAR(20), -- improving, stable, declining
    
    -- Metadata
    data_source VARCHAR(100), -- EHR, survey, manual_entry
    calculation_method TEXT,
    notes TEXT,
    
    CONSTRAINT valid_metric_period CHECK (measurement_period_start <= measurement_period_end),
    CONSTRAINT valid_percentile CHECK (percentile_rank BETWEEN 1 AND 100)
);

-- =============================================
-- PROFESSIONAL DEVELOPMENT
-- =============================================
CREATE TABLE professional_development (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Activity Information
    activity_type VARCHAR(50) NOT NULL, -- cme, conference, training, publication, research
    activity_name VARCHAR(300) NOT NULL,
    provider_organization VARCHAR(200),
    
    -- Dates and Credits
    start_date DATE,
    completion_date DATE,
    credits_earned DECIMAL(6,2), -- CME/CE credits
    total_hours INTEGER,
    
    -- Verification
    certificate_url TEXT,
    certificate_number VARCHAR(100),
    verification_status verification_status DEFAULT 'pending',
    
    -- FHIR Compliance
    fhir_education_code VARCHAR(100), -- FHIR Practitioner.qualification
    
    -- Details
    description TEXT,
    objectives_met JSONB DEFAULT '[]', -- Learning objectives achieved
    
    CONSTRAINT valid_development_dates CHECK (
        start_date IS NULL OR completion_date IS NULL OR start_date <= completion_date
    ),
    CONSTRAINT valid_credits CHECK (credits_earned >= 0)
);-- Continue Professional Management System Tables
-- Part 3: Workflow Management, Alerts, and Security

-- =============================================
-- CREDENTIALING WORKFLOW
-- =============================================
CREATE TABLE credentialing_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Workflow Information
    workflow_type VARCHAR(50) NOT NULL, -- initial_credentialing, re_credentialing, renewal
    workflow_name VARCHAR(200) NOT NULL,
    
    -- Status Tracking
    status workflow_status NOT NULL DEFAULT 'initiated',
    priority_level INTEGER DEFAULT 3, -- 1=high, 2=medium, 3=low
    
    -- Dates
    started_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    reviewer_id UUID REFERENCES auth.users(id),
    
    -- Automation and AI
    automated_checks_passed INTEGER DEFAULT 0,
    manual_review_required BOOLEAN DEFAULT TRUE,
    ai_verification_score DECIMAL(5,2), -- AI confidence score 0-100
    
    -- Compliance and Risk
    compliance_score DECIMAL(5,2), -- Overall compliance score 0-100
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    risk_factors JSONB DEFAULT '[]', -- Array of identified risks
    
    -- Progress Tracking
    steps_completed INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 1,
    current_step_name VARCHAR(200),
    
    -- Notes and Documentation
    notes TEXT,
    workflow_data JSONB DEFAULT '{}', -- Custom workflow data
    
    CONSTRAINT valid_priority CHECK (priority_level BETWEEN 1 AND 5),
    CONSTRAINT valid_scores CHECK (
        (ai_verification_score IS NULL OR ai_verification_score BETWEEN 0 AND 100) AND
        (compliance_score IS NULL OR compliance_score BETWEEN 0 AND 100)
    ),
    CONSTRAINT valid_steps CHECK (steps_completed <= total_steps)
);

-- =============================================
-- CREDENTIALING ALERTS
-- =============================================
CREATE TABLE credentialing_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Alert Information
    alert_type VARCHAR(50) NOT NULL, -- expiration, renewal, compliance, performance
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Severity and Priority
    severity alert_severity NOT NULL DEFAULT 'medium',
    priority INTEGER DEFAULT 3, -- 1=high, 5=low
    
    -- Dates
    due_date DATE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Automation
    auto_generated BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    
    -- Related Records
    related_credential_id UUID REFERENCES professional_credentials(id),
    related_workflow_id UUID REFERENCES credentialing_workflow(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    requires_action BOOLEAN DEFAULT TRUE,
    
    -- Response Tracking
    response_notes TEXT,
    escalated BOOLEAN DEFAULT FALSE,
    escalated_to UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_alert_priority CHECK (priority BETWEEN 1 AND 5)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentialing_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentialing_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professionals
CREATE POLICY "Professionals are viewable by authenticated users" ON professionals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own professional profile" ON professionals
    FOR UPDATE USING (auth.uid()::text = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can manage all professionals" ON professionals
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'credentialing_manager'
    );

-- RLS Policies for professional_credentials
CREATE POLICY "Credentials viewable by owner and admins" ON professional_credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professionals p 
            WHERE p.id = professional_credentials.professional_id 
            AND p.created_by = auth.uid()
        ) OR
        auth.jwt() ->> 'role' IN ('admin', 'credentialing_manager')
    );

CREATE POLICY "Credentials manageable by admins" ON professional_credentials
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'credentialing_manager'));

-- RLS Policies for performance_metrics (sensitive data)
CREATE POLICY "Performance metrics viewable by owner and managers" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professionals p 
            WHERE p.id = performance_metrics.professional_id 
            AND p.created_by = auth.uid()
        ) OR
        auth.jwt() ->> 'role' IN ('admin', 'quality_manager', 'credentialing_manager')
    );-- Complete Professional Management System Tables
-- Part 4: Indexes, Triggers, Functions, and Sample Data

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Primary lookup indexes
CREATE INDEX idx_professionals_npi ON professionals(npi_number);
CREATE INDEX idx_professionals_status ON professionals(status);
CREATE INDEX idx_professionals_name ON professionals(last_name, first_name);

-- Credential management indexes
CREATE INDEX idx_credentials_professional ON professional_credentials(professional_id);
CREATE INDEX idx_credentials_expiration ON professional_credentials(expiration_date);
CREATE INDEX idx_credentials_status ON professional_credentials(verification_status);
CREATE INDEX idx_credentials_type ON professional_credentials(credential_type);

-- Performance tracking indexes
CREATE INDEX idx_metrics_professional ON performance_metrics(professional_id);
CREATE INDEX idx_metrics_period ON performance_metrics(measurement_period_start, measurement_period_end);
CREATE INDEX idx_metrics_type ON performance_metrics(metric_type);

-- Workflow management indexes
CREATE INDEX idx_workflow_professional ON credentialing_workflow(professional_id);
CREATE INDEX idx_workflow_status ON credentialing_workflow(status);
CREATE INDEX idx_workflow_assigned ON credentialing_workflow(assigned_to);
CREATE INDEX idx_workflow_due_date ON credentialing_workflow(due_date);

-- Alert management indexes
CREATE INDEX idx_alerts_professional ON credentialing_alerts(professional_id);
CREATE INDEX idx_alerts_active ON credentialing_alerts(is_active, due_date);
CREATE INDEX idx_alerts_severity ON credentialing_alerts(severity, created_at);

-- =============================================
-- AUTOMATED TRIGGERS
-- =============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON professional_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON professional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_updated_at BEFORE UPDATE ON credentialing_workflow
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON credentialing_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic alert generation for expiring credentials
CREATE OR REPLACE FUNCTION generate_expiration_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate alerts for credentials expiring in 30, 60, and 90 days
    INSERT INTO credentialing_alerts (
        professional_id,
        alert_type,
        title,
        message,
        severity,
        due_date,
        auto_generated,
        related_credential_id
    )
    SELECT 
        NEW.professional_id,
        'expiration',
        NEW.credential_name || ' Expiring Soon',
        'Your ' || NEW.credential_name || ' will expire on ' || NEW.expiration_date || '. Please renew before expiration.',
        CASE 
            WHEN NEW.expiration_date - CURRENT_DATE <= 30 THEN 'high'::alert_severity
            WHEN NEW.expiration_date - CURRENT_DATE <= 60 THEN 'medium'::alert_severity
            ELSE 'low'::alert_severity
        END,
        NEW.expiration_date,
        TRUE,
        NEW.id
    WHERE NEW.expiration_date IS NOT NULL 
        AND NEW.expiration_date > CURRENT_DATE
        AND NEW.expiration_date <= CURRENT_DATE + INTERVAL '90 days'
        AND NEW.verification_status = 'verified';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_expiration_alerts 
    AFTER INSERT OR UPDATE ON professional_credentials
    FOR EACH ROW EXECUTE FUNCTION generate_expiration_alerts();

-- =============================================
-- AUDIT LOGGING
-- =============================================

-- Audit log table for compliance tracking
CREATE TABLE professional_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO professional_audit_log (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';-- Apply audit triggers to all professional management tables
CREATE TRIGGER audit_professionals AFTER INSERT OR UPDATE OR DELETE ON professionals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_credentials AFTER INSERT OR UPDATE OR DELETE ON professional_credentials
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_services AFTER INSERT OR UPDATE OR DELETE ON professional_services
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_metrics AFTER INSERT OR UPDATE OR DELETE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_workflow AFTER INSERT OR UPDATE OR DELETE ON credentialing_workflow
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- HELPER FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to calculate professional availability score
CREATE OR REPLACE FUNCTION calculate_availability_score(prof_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_score DECIMAL(3,2);
BEGIN
    SELECT AVG(metric_value)
    INTO avg_score
    FROM performance_metrics
    WHERE professional_id = prof_id
        AND metric_type = 'availability'
        AND measurement_period_start >= CURRENT_DATE - INTERVAL '90 days';
    
    RETURN COALESCE(avg_score, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Function to get active credentials count
CREATE OR REPLACE FUNCTION get_active_credentials_count(prof_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count_result
    FROM professional_credentials
    WHERE professional_id = prof_id
        AND verification_status = 'verified'
        AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE);
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if professional has required specialties for a service
CREATE OR REPLACE FUNCTION has_required_specialties(prof_id UUID, service_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    required_count INTEGER;
    prof_count INTEGER;
BEGIN
    -- Get required specialties for the service
    SELECT COUNT(DISTINCT ps.specialty_id)
    INTO required_count
    FROM professional_services ps
    WHERE ps.service_name = service_name
        AND ps.is_active = TRUE;
    
    -- Count professional's matching specialties
    SELECT COUNT(DISTINCT psp.specialty_id)
    INTO prof_count
    FROM professional_specialties psp
    JOIN professional_services ps ON ps.specialty_id = psp.specialty_id
    WHERE psp.professional_id = prof_id
        AND ps.service_name = service_name
        AND ps.is_active = TRUE
        AND psp.is_primary = TRUE;
    
    RETURN prof_count >= required_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample medical specialties
INSERT INTO medical_specialties (name, code, description, category, is_active) VALUES
('Internal Medicine', 'IM', 'General internal medicine practice', 'primary_care', TRUE),
('Cardiology', 'CARD', 'Heart and cardiovascular system specialists', 'specialty', TRUE),
('Orthopedic Surgery', 'ORTHO', 'Musculoskeletal system surgery', 'surgical', TRUE),
('Pediatrics', 'PED', 'Medical care for infants, children, and adolescents', 'primary_care', TRUE),
('Emergency Medicine', 'EM', 'Acute care and emergency medical services', 'emergency', TRUE),
('Radiology', 'RAD', 'Medical imaging and diagnostic services', 'diagnostic', TRUE),
('Anesthesiology', 'ANES', 'Perioperative care and pain management', 'perioperative', TRUE),
('Psychiatry', 'PSY', 'Mental health and behavioral disorders', 'mental_health', TRUE),
('Dermatology', 'DERM', 'Skin, hair, and nail conditions', 'specialty', TRUE),
('Obstetrics and Gynecology', 'OBGYN', 'Women''s reproductive health', 'specialty', TRUE);

-- Insert sample professional (anonymized for demonstration)
INSERT INTO professionals (
    npi_number,
    first_name,
    last_name,
    professional_suffix,
    license_number,
    license_state,
    primary_specialty,
    phone,
    email,
    hire_date,
    employment_status,
    status,
    fhir_practitioner_id
) VALUES (
    '1234567890',
    'John',
    'Smith',
    'MD',
    'MD123456',
    'CA',
    'Internal Medicine',
    '+1-555-0123',
    'john.smith@example.com',
    '2023-01-15',
    'full_time',
    'active',
    gen_random_uuid()
);

-- Sample professional credentials
INSERT INTO professional_credentials (
    professional_id,
    credential_type,
    credential_name,
    issuing_organization,
    credential_number,
    issue_date,
    expiration_date,
    verification_status,
    verification_date,
    auto_renewal
) SELECT 
    p.id,
    'license',
    'Medical License',
    'California Medical Board',
    'CA-MD-123456',
    '2023-01-01',
    '2025-12-31',
    'verified',
    '2023-01-15',
    FALSE
FROM professionals p WHERE p.npi_number = '1234567890';

-- Sample performance metrics
INSERT INTO performance_metrics (
    professional_id,
    metric_type,
    metric_name,
    metric_value,
    measurement_period_start,
    measurement_period_end,
    benchmark_value,
    target_value
) SELECT 
    p.id,
    'quality',
    'Patient Satisfaction Score',
    4.8,
    '2024-01-01',
    '2024-03-31',
    4.5,
    4.7
FROM professionals p WHERE p.npi_number = '1234567890';

COMMIT;