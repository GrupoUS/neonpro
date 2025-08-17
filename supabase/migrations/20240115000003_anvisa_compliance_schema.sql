-- ANVISA Compliance Database Schema
-- Migration: 20240115000003_anvisa_compliance_schema
-- Description: Comprehensive ANVISA regulatory compliance schema for aesthetic clinics
-- Brazilian Health Regulatory Agency (ANVISA) compliance implementation

-- ============================================================================
-- ANVISA PRODUCTS TABLE - Product Registration and Tracking
-- ============================================================================

CREATE TABLE anvisa_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Product Registration Information
    anvisa_registration_number VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    manufacturer_country VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255),
    supplier_cnpj VARCHAR(20),
    
    -- Product Classification
    product_category anvisa_product_category NOT NULL,
    risk_classification anvisa_risk_class NOT NULL,
    is_medical_device BOOLEAN DEFAULT false,
    is_cosmetic_product BOOLEAN DEFAULT false,
    is_pharmaceutical BOOLEAN DEFAULT false,
    
    -- Registration Details
    registration_date DATE NOT NULL,
    registration_expiry_date DATE,
    last_renewal_date DATE,
    regulatory_status anvisa_regulatory_status DEFAULT 'active',
    
    -- Product Specifications
    composition TEXT,
    concentration VARCHAR(100),
    presentation_form VARCHAR(100),
    packaging_size VARCHAR(50),
    volume_weight VARCHAR(50),
    
    -- Regulatory Documentation
    technical_report_url TEXT,
    safety_data_sheet_url TEXT,
    certificate_of_analysis_url TEXT,
    anvisa_approval_document_url TEXT,
    
    -- Inventory and Usage Tracking
    current_stock_quantity INTEGER DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 0,
    maximum_stock_level INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2),
    last_inventory_check TIMESTAMPTZ,
    
    -- Usage Restrictions and Warnings
    contraindications TEXT,
    usage_warnings TEXT,
    storage_requirements TEXT,
    disposal_instructions TEXT,
    professional_use_only BOOLEAN DEFAULT true,
    
    -- Audit and Compliance
    last_anvisa_inspection_date DATE,
    last_compliance_check TIMESTAMPTZ,
    compliance_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ANVISA PROCEDURES TABLE - Procedure Classification and Requirements
-- ============================================================================

CREATE TABLE anvisa_procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Procedure Classification
    procedure_code VARCHAR(20) UNIQUE NOT NULL,
    procedure_name VARCHAR(255) NOT NULL,
    procedure_category anvisa_procedure_category NOT NULL,
    risk_level anvisa_risk_level NOT NULL,
    
    -- Regulatory Requirements
    requires_medical_supervision BOOLEAN DEFAULT true,
    requires_specialist_certification BOOLEAN DEFAULT false,
    minimum_professional_qualification anvisa_professional_level NOT NULL,
    required_certifications TEXT[],
    
    -- Documentation Requirements
    requires_informed_consent BOOLEAN DEFAULT true,
    requires_pre_procedure_evaluation BOOLEAN DEFAULT true,
    requires_post_procedure_monitoring BOOLEAN DEFAULT true,
    monitoring_period_days INTEGER DEFAULT 30,
    
    -- Safety Protocols
    contraindications TEXT,
    safety_warnings TEXT,
    emergency_protocols TEXT,
    required_equipment TEXT[],
    required_medications TEXT[],
    
    -- Regulatory Compliance
    anvisa_classification_code VARCHAR(50),
    last_classification_update DATE,
    regulatory_notes TEXT,
    
    -- Quality and Safety Metrics
    success_rate_threshold DECIMAL(5,2) DEFAULT 95.00,
    complication_rate_threshold DECIMAL(5,2) DEFAULT 5.00,
    patient_satisfaction_threshold DECIMAL(5,2) DEFAULT 90.00,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ANVISA ADVERSE EVENTS TABLE - Adverse Event Reporting and Monitoring
-- ============================================================================

CREATE TABLE anvisa_adverse_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Event Identification
    event_id VARCHAR(50) UNIQUE NOT NULL,
    anvisa_notification_number VARCHAR(50) UNIQUE,
    
    -- Patient and Procedure Information
    patient_id UUID REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    procedure_id UUID REFERENCES anvisa_procedures(id),
    professional_id UUID REFERENCES users(id),
    
    -- Product Information (if applicable)
    product_id UUID REFERENCES anvisa_products(id),
    batch_number VARCHAR(50),
    product_expiry_date DATE,
    
    -- Event Classification
    event_type anvisa_event_type NOT NULL,
    severity_level anvisa_severity_level NOT NULL,
    event_category anvisa_event_category NOT NULL,
    
    -- Event Description
    event_description TEXT NOT NULL,
    symptoms_observed TEXT,
    onset_date_time TIMESTAMPTZ NOT NULL,
    discovery_date_time TIMESTAMPTZ NOT NULL,
    
    -- Clinical Information
    patient_age INTEGER,
    patient_gender VARCHAR(10),
    medical_history_relevant TEXT,
    concomitant_medications TEXT,
    previous_adverse_reactions TEXT,
    
    -- Event Management
    immediate_actions_taken TEXT,
    treatment_provided TEXT,
    hospitalization_required BOOLEAN DEFAULT false,
    hospitalization_duration_days INTEGER,
    event_outcome anvisa_event_outcome,
    
    -- Investigation and Root Cause
    investigation_conducted BOOLEAN DEFAULT false,
    investigation_findings TEXT,
    root_cause_analysis TEXT,
    corrective_actions_taken TEXT,
    preventive_measures_implemented TEXT,
    
    -- Regulatory Reporting
    anvisa_notification_required BOOLEAN DEFAULT false,
    anvisa_notification_sent BOOLEAN DEFAULT false,
    notification_date TIMESTAMPTZ,
    notification_response TEXT,
    regulatory_follow_up_required BOOLEAN DEFAULT false,
    
    -- Follow-up and Resolution
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_schedule TEXT,
    resolution_date TIMESTAMPTZ,
    final_outcome TEXT,
    
    -- Quality Assurance
    investigated_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    
    -- Metadata
    status anvisa_event_status DEFAULT 'reported',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ANVISA PROFESSIONALS TABLE - Professional Qualification and Certification
-- ============================================================================

CREATE TABLE anvisa_professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Identification
    professional_registration_number VARCHAR(50) NOT NULL,
    cfm_registration VARCHAR(20) UNIQUE,
    crm_state VARCHAR(2),
    specialty_code VARCHAR(10),
    
    -- Professional Qualifications
    medical_degree_institution VARCHAR(255),
    medical_degree_year INTEGER,
    residency_specialty VARCHAR(255),
    residency_institution VARCHAR(255),
    
    -- Certifications and Training
    aesthetic_medicine_certification BOOLEAN DEFAULT false,
    certification_institution VARCHAR(255),
    certification_date DATE,
    certification_expiry_date DATE,
    
    -- ANVISA Specific Authorizations
    authorized_procedures TEXT[],
    procedure_certifications JSONB DEFAULT '{}',
    training_records JSONB DEFAULT '[]',
    continuing_education_hours INTEGER DEFAULT 0,
    
    -- Compliance Status
    license_status anvisa_license_status DEFAULT 'active',
    last_verification_date DATE,
    next_verification_due DATE,
    compliance_score DECIMAL(5,2) DEFAULT 100.00,
    
    -- Professional Performance Metrics
    procedures_performed_count INTEGER DEFAULT 0,
    adverse_events_count INTEGER DEFAULT 0,
    patient_satisfaction_average DECIMAL(5,2) DEFAULT 0.00,
    
    -- Regulatory Notes and Alerts
    regulatory_notes TEXT,
    compliance_alerts TEXT[],
    restrictions TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ANVISA AUDITS TABLE - Audit Trails and Compliance Documentation
-- ============================================================================

CREATE TABLE anvisa_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Audit Identification
    audit_id VARCHAR(50) UNIQUE NOT NULL,
    audit_type anvisa_audit_type NOT NULL,
    audit_scope VARCHAR(255) NOT NULL,
    
    -- Audit Details
    audit_date DATE NOT NULL,
    auditor_name VARCHAR(255),
    auditor_organization VARCHAR(255),
    audit_duration_hours DECIMAL(5,2),
    
    -- Audit Findings
    compliance_score DECIMAL(5,2),
    major_findings INTEGER DEFAULT 0,
    minor_findings INTEGER DEFAULT 0,
    observations INTEGER DEFAULT 0,
    
    -- Findings Details
    findings_summary TEXT,
    major_non_conformities TEXT[],
    minor_non_conformities TEXT[],
    recommendations TEXT[],
    
    -- Corrective Actions
    corrective_action_plan TEXT,
    corrective_actions_due_date DATE,
    corrective_actions_completed BOOLEAN DEFAULT false,
    corrective_actions_verification_date DATE,
    
    -- Follow-up
    follow_up_audit_required BOOLEAN DEFAULT false,
    follow_up_audit_date DATE,
    final_audit_report_url TEXT,
    
    -- Regulatory Impact
    regulatory_sanctions TEXT,
    business_impact TEXT,
    improvement_opportunities TEXT,
    
    -- Metadata
    status anvisa_audit_status DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ANVISA PRODUCT BATCHES TABLE - Batch Tracking and Expiration Management
-- ============================================================================

CREATE TABLE anvisa_product_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES anvisa_products(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Batch Information
    batch_number VARCHAR(50) NOT NULL,
    lot_number VARCHAR(50),
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    
    -- Quantity Tracking
    initial_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    reserved_quantity INTEGER DEFAULT 0,
    
    -- Quality Control
    quality_control_passed BOOLEAN DEFAULT false,
    quality_control_date DATE,
    quality_control_notes TEXT,
    
    -- Storage and Location
    storage_location VARCHAR(255),
    storage_temperature_min DECIMAL(5,2),
    storage_temperature_max DECIMAL(5,2),
    storage_humidity_max DECIMAL(5,2),
    
    -- Usage Tracking
    first_use_date DATE,
    last_use_date DATE,
    procedures_used_count INTEGER DEFAULT 0,
    
    -- Alerts and Notifications
    expiry_alert_sent BOOLEAN DEFAULT false,
    low_stock_alert_sent BOOLEAN DEFAULT false,
    quarantine_status BOOLEAN DEFAULT false,
    quarantine_reason TEXT,
    
    -- Metadata
    status anvisa_batch_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(product_id, batch_number)
);

-- ============================================================================
-- CUSTOM ENUM TYPES FOR ANVISA COMPLIANCE
-- ============================================================================

-- Product Categories
CREATE TYPE anvisa_product_category AS ENUM (
    'medical_device_class_i',
    'medical_device_class_ii',
    'medical_device_class_iii',
    'cosmetic_product',
    'pharmaceutical',
    'dermatological',
    'injectables',
    'implants',
    'surgical_instruments',
    'diagnostic_equipment'
);

-- Risk Classifications
CREATE TYPE anvisa_risk_class AS ENUM (
    'low_risk',
    'moderate_risk',
    'high_risk',
    'critical_risk'
);

-- Regulatory Status
CREATE TYPE anvisa_regulatory_status AS ENUM (
    'active',
    'pending_renewal',
    'expired',
    'suspended',
    'revoked',
    'under_review'
);

-- Procedure Categories
CREATE TYPE anvisa_procedure_category AS ENUM (
    'aesthetic_minimally_invasive',
    'aesthetic_surgical',
    'cosmetic_treatment',
    'dermatological_treatment',
    'injectable_treatment',
    'laser_treatment',
    'radiofrequency_treatment',
    'surgical_procedure'
);

-- Risk Levels
CREATE TYPE anvisa_risk_level AS ENUM (
    'minimal',
    'low',
    'moderate',
    'high',
    'critical'
);

-- Professional Levels
CREATE TYPE anvisa_professional_level AS ENUM (
    'technician',
    'nurse',
    'specialist_nurse',
    'general_physician',
    'specialist_physician',
    'certified_specialist'
);

-- Event Types
CREATE TYPE anvisa_event_type AS ENUM (
    'adverse_reaction',
    'device_malfunction',
    'product_quality_issue',
    'procedure_complication',
    'infection',
    'allergic_reaction',
    'unexpected_outcome'
);

-- Severity Levels
CREATE TYPE anvisa_severity_level AS ENUM (
    'mild',
    'moderate',
    'severe',
    'critical',
    'fatal'
);

-- Event Categories
CREATE TYPE anvisa_event_category AS ENUM (
    'product_related',
    'procedure_related',
    'professional_error',
    'system_failure',
    'patient_factor',
    'environmental_factor'
);

-- Event Outcomes
CREATE TYPE anvisa_event_outcome AS ENUM (
    'recovered_completely',
    'recovered_with_sequelae',
    'ongoing_treatment',
    'hospitalization_required',
    'permanent_disability',
    'death'
);

-- Event Status
CREATE TYPE anvisa_event_status AS ENUM (
    'reported',
    'under_investigation',
    'investigation_completed',
    'anvisa_notified',
    'closed',
    'follow_up_required'
);

-- License Status
CREATE TYPE anvisa_license_status AS ENUM (
    'active',
    'pending_renewal',
    'expired',
    'suspended',
    'revoked',
    'under_review'
);

-- Audit Types
CREATE TYPE anvisa_audit_type AS ENUM (
    'internal_audit',
    'anvisa_inspection',
    'third_party_audit',
    'compliance_review',
    'follow_up_audit',
    'special_investigation'
);

-- Audit Status
CREATE TYPE anvisa_audit_status AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'report_pending',
    'corrective_actions_pending',
    'closed'
);

-- Batch Status
CREATE TYPE anvisa_batch_status AS ENUM (
    'available',
    'in_use',
    'expired',
    'quarantined',
    'recalled',
    'disposed'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Products indexes
CREATE INDEX idx_anvisa_products_clinic_id ON anvisa_products(clinic_id);
CREATE INDEX idx_anvisa_products_registration_number ON anvisa_products(anvisa_registration_number);
CREATE INDEX idx_anvisa_products_category ON anvisa_products(product_category);
CREATE INDEX idx_anvisa_products_expiry_date ON anvisa_products(registration_expiry_date);
CREATE INDEX idx_anvisa_products_status ON anvisa_products(regulatory_status);

-- Procedures indexes
CREATE INDEX idx_anvisa_procedures_clinic_id ON anvisa_procedures(clinic_id);
CREATE INDEX idx_anvisa_procedures_code ON anvisa_procedures(procedure_code);
CREATE INDEX idx_anvisa_procedures_category ON anvisa_procedures(procedure_category);
CREATE INDEX idx_anvisa_procedures_risk_level ON anvisa_procedures(risk_level);

-- Adverse events indexes
CREATE INDEX idx_anvisa_adverse_events_clinic_id ON anvisa_adverse_events(clinic_id);
CREATE INDEX idx_anvisa_adverse_events_patient_id ON anvisa_adverse_events(patient_id);
CREATE INDEX idx_anvisa_adverse_events_procedure_id ON anvisa_adverse_events(procedure_id);
CREATE INDEX idx_anvisa_adverse_events_product_id ON anvisa_adverse_events(product_id);
CREATE INDEX idx_anvisa_adverse_events_onset_date ON anvisa_adverse_events(onset_date_time);
CREATE INDEX idx_anvisa_adverse_events_severity ON anvisa_adverse_events(severity_level);
CREATE INDEX idx_anvisa_adverse_events_status ON anvisa_adverse_events(status);

-- Professionals indexes
CREATE INDEX idx_anvisa_professionals_clinic_id ON anvisa_professionals(clinic_id);
CREATE INDEX idx_anvisa_professionals_user_id ON anvisa_professionals(user_id);
CREATE INDEX idx_anvisa_professionals_cfm ON anvisa_professionals(cfm_registration);
CREATE INDEX idx_anvisa_professionals_status ON anvisa_professionals(license_status);

-- Audits indexes
CREATE INDEX idx_anvisa_audits_clinic_id ON anvisa_audits(clinic_id);
CREATE INDEX idx_anvisa_audits_audit_date ON anvisa_audits(audit_date);
CREATE INDEX idx_anvisa_audits_type ON anvisa_audits(audit_type);
CREATE INDEX idx_anvisa_audits_status ON anvisa_audits(status);

-- Product batches indexes
CREATE INDEX idx_anvisa_product_batches_product_id ON anvisa_product_batches(product_id);
CREATE INDEX idx_anvisa_product_batches_clinic_id ON anvisa_product_batches(clinic_id);
CREATE INDEX idx_anvisa_product_batches_expiry_date ON anvisa_product_batches(expiry_date);
CREATE INDEX idx_anvisa_product_batches_batch_number ON anvisa_product_batches(batch_number);
CREATE INDEX idx_anvisa_product_batches_status ON anvisa_product_batches(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all ANVISA tables
ALTER TABLE anvisa_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_adverse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_product_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anvisa_products
CREATE POLICY "Users can only access products from their clinic" ON anvisa_products
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for anvisa_procedures
CREATE POLICY "Users can only access procedures from their clinic" ON anvisa_procedures
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for anvisa_adverse_events
CREATE POLICY "Users can only access adverse events from their clinic" ON anvisa_adverse_events
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for anvisa_professionals
CREATE POLICY "Users can only access professionals from their clinic" ON anvisa_professionals
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for anvisa_audits
CREATE POLICY "Users can only access audits from their clinic" ON anvisa_audits
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for anvisa_product_batches
CREATE POLICY "Users can only access product batches from their clinic" ON anvisa_product_batches
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all ANVISA tables
CREATE TRIGGER update_anvisa_products_updated_at BEFORE UPDATE ON anvisa_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_procedures_updated_at BEFORE UPDATE ON anvisa_procedures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_adverse_events_updated_at BEFORE UPDATE ON anvisa_adverse_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_professionals_updated_at BEFORE UPDATE ON anvisa_professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_audits_updated_at BEFORE UPDATE ON anvisa_audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_product_batches_updated_at BEFORE UPDATE ON anvisa_product_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();