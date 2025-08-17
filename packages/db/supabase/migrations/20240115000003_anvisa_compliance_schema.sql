-- Migration: 20240115000003_anvisa_compliance_schema.sql
-- Created: 2024-01-15
-- Purpose: ANVISA (Brazilian Health Regulatory Agency) Compliance System
-- Healthcare Focus: Medical device and procedure tracking for regulatory compliance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ANVISA Device Categories
CREATE TABLE IF NOT EXISTS anvisa_device_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    category_name VARCHAR(255) NOT NULL,
    risk_class VARCHAR(10) NOT NULL, -- I, II, III, IV
    registration_required BOOLEAN DEFAULT true,
    notification_required BOOLEAN DEFAULT false,
    quality_certification_required BOOLEAN DEFAULT false,
    description TEXT,
    regulatory_framework TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANVISA Registered Devices/Products
CREATE TABLE IF NOT EXISTS anvisa_registered_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    manufacturer_country VARCHAR(100),
    responsible_company VARCHAR(255), -- Brazilian responsible company
    responsible_cnpj VARCHAR(18),
    category_id UUID REFERENCES anvisa_device_categories(id),
    risk_class VARCHAR(10) NOT NULL,
    registration_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, canceled, expired
    anvisa_process_number VARCHAR(100),
    technical_description TEXT,
    intended_use TEXT,
    contraindications TEXT,
    special_precautions TEXT,
    regulatory_documents JSONB DEFAULT '{}',
    last_renewal_date DATE,
    next_renewal_due DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, registration_number)
);

-- ANVISA Compliance Tracking for Inventory Items
CREATE TABLE IF NOT EXISTS anvisa_inventory_compliance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    anvisa_product_id UUID REFERENCES anvisa_registered_products(id),
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    import_license_number VARCHAR(100),
    distribution_authorization VARCHAR(100),
    quality_certificate_number VARCHAR(100),
    sterility_certificate VARCHAR(100),
    calibration_certificate VARCHAR(100),
    last_inspection_date DATE,
    next_inspection_due DATE,
    compliance_status VARCHAR(50) DEFAULT 'compliant', -- compliant, non_compliant, pending_review
    compliance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANVISA Procedure Compliance
CREATE TABLE IF NOT EXISTS anvisa_procedure_compliance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    procedure_id UUID NOT NULL,
    anvisa_regulation_code VARCHAR(50),
    regulation_name VARCHAR(255),
    compliance_requirements TEXT[],
    required_certifications TEXT[],
    required_documentation TEXT[],
    professional_qualifications_required TEXT[],
    patient_consent_requirements TEXT[],
    reporting_requirements TEXT[],
    follow_up_requirements TEXT[],
    risk_category VARCHAR(20), -- minimal, low, moderate, high, maximum
    is_experimental BOOLEAN DEFAULT false,
    ethics_committee_approval_required BOOLEAN DEFAULT false,
    anvisa_notification_required BOOLEAN DEFAULT false,
    compliance_checklist JSONB DEFAULT '{}',
    last_compliance_review DATE,
    next_compliance_review DATE,
    compliance_status VARCHAR(50) DEFAULT 'compliant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANVISA Adverse Event Reporting
CREATE TABLE IF NOT EXISTS anvisa_adverse_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID,
    professional_id UUID NOT NULL,
    anvisa_product_id UUID REFERENCES anvisa_registered_products(id),
    procedure_id UUID,
    event_type VARCHAR(50) NOT NULL, -- device_malfunction, patient_injury, death, other
    severity VARCHAR(20) NOT NULL, -- mild, moderate, severe, life_threatening, fatal
    event_date DATE NOT NULL,
    discovery_date DATE NOT NULL,
    event_description TEXT NOT NULL,
    patient_outcome VARCHAR(100),
    corrective_actions_taken TEXT,
    preventive_measures TEXT,
    device_returned_to_manufacturer BOOLEAN DEFAULT false,
    manufacturer_notified_date DATE,
    anvisa_notification_number VARCHAR(100),
    anvisa_notification_date DATE,
    anvisa_response JSONB,
    investigation_status VARCHAR(50) DEFAULT 'pending', -- pending, investigating, completed, closed
    investigation_findings TEXT,
    regulatory_action_required BOOLEAN DEFAULT false,
    regulatory_action_taken TEXT,
    follow_up_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANVISA Inspection Records
CREATE TABLE IF NOT EXISTS anvisa_inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    inspection_type VARCHAR(50) NOT NULL, -- routine, complaint_based, follow_up, pre_market
    inspection_date DATE NOT NULL,
    inspector_name VARCHAR(255),
    inspector_registration VARCHAR(100),
    inspection_scope TEXT,
    areas_inspected TEXT[],
    findings TEXT,
    non_conformities JSONB DEFAULT '[]',
    corrective_actions_required TEXT,
    corrective_action_deadline DATE,
    inspection_result VARCHAR(50), -- satisfactory, satisfactory_with_restrictions, unsatisfactory
    penalties_applied TEXT,
    license_status_affected BOOLEAN DEFAULT false,
    follow_up_inspection_required BOOLEAN DEFAULT false,
    follow_up_inspection_date DATE,
    inspection_report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANVISA Training and Certification Records
CREATE TABLE IF NOT EXISTS anvisa_training_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    training_type VARCHAR(100) NOT NULL,
    training_provider VARCHAR(255),
    certification_number VARCHAR(100),
    certification_date DATE NOT NULL,
    expiry_date DATE,
    renewal_required BOOLEAN DEFAULT true,
    training_hours INTEGER,
    training_content TEXT,
    competency_validated BOOLEAN DEFAULT false,
    validation_date DATE,
    validator_id UUID,
    anvisa_recognition VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT false,
    compliance_requirement VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE anvisa_device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_registered_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_inventory_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_procedure_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_adverse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_training_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY "anvisa_device_categories_public_read" ON anvisa_device_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "anvisa_registered_products_tenant_access" ON anvisa_registered_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_registered_products.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "anvisa_inventory_compliance_tenant_access" ON anvisa_inventory_compliance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_inventory_compliance.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "anvisa_procedure_compliance_tenant_access" ON anvisa_procedure_compliance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_procedure_compliance.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "anvisa_adverse_events_tenant_access" ON anvisa_adverse_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_adverse_events.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "anvisa_inspections_tenant_access" ON anvisa_inspections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_inspections.tenant_id
            AND is_active = true
        )
    );

CREATE POLICY "anvisa_training_records_tenant_access" ON anvisa_training_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_tenants 
            WHERE user_id = auth.uid() 
            AND tenant_id = anvisa_training_records.tenant_id
            AND is_active = true
        )
    );

-- Create indexes for performance
CREATE INDEX idx_anvisa_registered_products_tenant_id ON anvisa_registered_products(tenant_id);
CREATE INDEX idx_anvisa_registered_products_registration_number ON anvisa_registered_products(registration_number);
CREATE INDEX idx_anvisa_registered_products_status ON anvisa_registered_products(status);
CREATE INDEX idx_anvisa_inventory_compliance_item_id ON anvisa_inventory_compliance(inventory_item_id);
CREATE INDEX idx_anvisa_adverse_events_patient_id ON anvisa_adverse_events(patient_id);
CREATE INDEX idx_anvisa_adverse_events_severity ON anvisa_adverse_events(severity);
CREATE INDEX idx_anvisa_training_records_professional_id ON anvisa_training_records(professional_id);
CREATE INDEX idx_anvisa_training_records_expiry_date ON anvisa_training_records(expiry_date);

-- Add triggers for updated_at
CREATE TRIGGER update_anvisa_device_categories_updated_at BEFORE UPDATE ON anvisa_device_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_registered_products_updated_at BEFORE UPDATE ON anvisa_registered_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_inventory_compliance_updated_at BEFORE UPDATE ON anvisa_inventory_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_procedure_compliance_updated_at BEFORE UPDATE ON anvisa_procedure_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_adverse_events_updated_at BEFORE UPDATE ON anvisa_adverse_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_inspections_updated_at BEFORE UPDATE ON anvisa_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anvisa_training_records_updated_at BEFORE UPDATE ON anvisa_training_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default ANVISA device categories
INSERT INTO anvisa_device_categories (category_code, category_name, risk_class, registration_required, description) VALUES
('DEV01', 'Equipamentos de Diagnóstico por Imagem', 'II', true, 'Equipamentos para diagnóstico médico por imagem'),
('DEV02', 'Instrumentos Cirúrgicos', 'II', true, 'Instrumentos utilizados em procedimentos cirúrgicos'),
('DEV03', 'Materiais de Consumo Médico', 'I', false, 'Materiais descartáveis para uso médico'),
('DEV04', 'Equipamentos de Monitoramento', 'II', true, 'Equipamentos para monitoramento de sinais vitais'),
('DEV05', 'Dispositivos Implantáveis', 'III', true, 'Dispositivos médicos implantáveis'),
('DEV06', 'Equipamentos de Terapia', 'II', true, 'Equipamentos para tratamento terapêutico'),
('DEV07', 'Produtos para Diagnóstico In Vitro', 'II', true, 'Produtos para diagnóstico laboratorial'),
('DEV08', 'Equipamentos de Suporte à Vida', 'III', true, 'Equipamentos críticos para suporte à vida'),
('COSM01', 'Produtos Cosméticos Grau 1', 'I', false, 'Cosméticos de baixo risco'),
('COSM02', 'Produtos Cosméticos Grau 2', 'II', true, 'Cosméticos de risco moderado com ativos regulamentados');