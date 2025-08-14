-- Migration: Create Additional Compliance Documentation Tables (Fixed)
-- Date: 2025-01-27
-- Description: Adds remaining compliance tables for consent forms, legal documents, metrics, and training

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create consent_forms table (templates for consent)
CREATE TABLE IF NOT EXISTS consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    form_name VARCHAR(255) NOT NULL,
    form_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    consent_type VARCHAR(100) NOT NULL CHECK (consent_type IN (
        'data_processing', 'medical_treatment', 'marketing', 'research', 
        'data_sharing', 'telehealth', 'photography', 'communication'
    )),
    form_template TEXT NOT NULL,
    html_template TEXT,
    legal_basis VARCHAR(100) CHECK (legal_basis IN (
        'consent', 'legitimate_interest', 'vital_interests', 
        'legal_obligation', 'public_task', 'contract'
    )),
    required_fields JSONB DEFAULT '[]',
    optional_fields JSONB DEFAULT '[]',
    retention_period_days INTEGER,
    auto_expire BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    regulatory_requirements JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT consent_forms_clinic_name_version_unique UNIQUE (clinic_id, form_name, form_version)
);

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
        'privacy_policy', 'terms_of_service', 'consent_template', 
        'data_processing_agreement', 'regulatory_compliance', 
        'patient_rights', 'incident_response_plan', 'audit_report'
    )),
    title VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    document_content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text/plain',
    file_url TEXT,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN (
        'draft', 'under_review', 'approved', 'published', 'archived', 'expired'
    )),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    regulatory_body VARCHAR(255),
    compliance_framework VARCHAR(255),
    tags JSONB DEFAULT '[]',
    access_level VARCHAR(50) DEFAULT 'internal' CHECK (access_level IN (
        'public', 'internal', 'restricted', 'confidential'
    )),
    digital_signature JSONB,
    checksum VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT legal_documents_clinic_title_version_unique UNIQUE (clinic_id, title, version)
);

-- Create compliance_metrics table
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN (
        'consent_rate', 'data_retention_compliance', 'breach_incidents', 
        'audit_score', 'training_completion', 'policy_adherence',
        'data_subject_requests', 'incident_response_time'
    )),
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    target_value DECIMAL(15,4),
    threshold_min DECIMAL(15,4),
    threshold_max DECIMAL(15,4),
    measurement_period VARCHAR(50) DEFAULT 'monthly' CHECK (measurement_period IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    measurement_date DATE NOT NULL,
    data_source VARCHAR(255),
    calculation_method TEXT,
    status VARCHAR(50) DEFAULT 'normal' CHECK (status IN (
        'normal', 'warning', 'critical', 'unknown'
    )),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT compliance_metrics_clinic_name_date_unique UNIQUE (clinic_id, metric_name, measurement_date)
);

-- Create compliance_training table
CREATE TABLE IF NOT EXISTS compliance_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    training_name VARCHAR(255) NOT NULL,
    training_type VARCHAR(100) NOT NULL CHECK (training_type IN (
        'data_protection', 'patient_privacy', 'security_awareness', 
        'lgpd_compliance', 'hipaa_compliance', 'clinical_documentation',
        'incident_response', 'ethics', 'regulatory_updates'
    )),
    description TEXT,
    content_url TEXT,
    training_material JSONB DEFAULT '{}',
    duration_minutes INTEGER,
    mandatory BOOLEAN DEFAULT true,
    recurring BOOLEAN DEFAULT false,
    recurrence_period_days INTEGER,
    certification_required BOOLEAN DEFAULT false,
    passing_score INTEGER,
    regulatory_requirement VARCHAR(255),
    target_roles JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    learning_objectives JSONB DEFAULT '[]',
    assessment_questions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Create training_completions table
CREATE TABLE IF NOT EXISTS training_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES compliance_training(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    score INTEGER,
    passed BOOLEAN,
    time_spent_minutes INTEGER,
    attempts INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'failed', 'expired'
    )),
    certification_issued BOOLEAN DEFAULT false,
    certification_number VARCHAR(255),
    certification_expiry DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT training_completions_unique UNIQUE (training_id, profile_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consent_forms_clinic_type ON consent_forms(clinic_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_forms_active ON consent_forms(is_active, clinic_id);

CREATE INDEX IF NOT EXISTS idx_legal_documents_clinic_type ON legal_documents(clinic_id, document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON legal_documents(approval_status, clinic_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_effective ON legal_documents(effective_date, expiry_date);

CREATE INDEX IF NOT EXISTS idx_compliance_metrics_clinic_type ON compliance_metrics(clinic_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_compliance_metrics_date ON compliance_metrics(measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_metrics_status ON compliance_metrics(status, clinic_id);

CREATE INDEX IF NOT EXISTS idx_compliance_training_clinic_type ON compliance_training(clinic_id, training_type);
CREATE INDEX IF NOT EXISTS idx_compliance_training_mandatory ON compliance_training(mandatory, is_active);

CREATE INDEX IF NOT EXISTS idx_training_completions_profile ON training_completions(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_training_completions_training ON training_completions(training_id, completed_at);

-- Enable RLS on all tables
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- consent_forms policies
    DROP POLICY IF EXISTS "Users can view consent forms from their clinic" ON consent_forms;
    DROP POLICY IF EXISTS "Users can insert consent forms for their clinic" ON consent_forms;
    DROP POLICY IF EXISTS "Users can update consent forms from their clinic" ON consent_forms;
    
    -- legal_documents policies
    DROP POLICY IF EXISTS "Users can view legal documents from their clinic" ON legal_documents;
    DROP POLICY IF EXISTS "Users can insert legal documents for their clinic" ON legal_documents;
    DROP POLICY IF EXISTS "Users can update legal documents from their clinic" ON legal_documents;
    
    -- compliance_metrics policies
    DROP POLICY IF EXISTS "Users can view compliance metrics from their clinic" ON compliance_metrics;
    DROP POLICY IF EXISTS "Users can insert compliance metrics for their clinic" ON compliance_metrics;
    
    -- compliance_training policies
    DROP POLICY IF EXISTS "Users can view compliance training from their clinic" ON compliance_training;
    DROP POLICY IF EXISTS "Users can insert compliance training for their clinic" ON compliance_training;
    DROP POLICY IF EXISTS "Users can update compliance training from their clinic" ON compliance_training;
    
    -- training_completions policies
    DROP POLICY IF EXISTS "Users can view their own training completions" ON training_completions;
    DROP POLICY IF EXISTS "Users can insert their own training completions" ON training_completions;
    DROP POLICY IF EXISTS "Users can update their own training completions" ON training_completions;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create RLS policies for consent_forms
CREATE POLICY "Users can view consent forms from their clinic" ON consent_forms
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert consent forms for their clinic" ON consent_forms
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update consent forms from their clinic" ON consent_forms
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Create RLS policies for legal_documents
CREATE POLICY "Users can view legal documents from their clinic" ON legal_documents
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
        OR access_level = 'public'
    );

CREATE POLICY "Users can insert legal documents for their clinic" ON legal_documents
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update legal documents from their clinic" ON legal_documents
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Create RLS policies for compliance_metrics
CREATE POLICY "Users can view compliance metrics from their clinic" ON compliance_metrics
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert compliance metrics for their clinic" ON compliance_metrics
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Create RLS policies for compliance_training
CREATE POLICY "Users can view compliance training from their clinic" ON compliance_training
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert compliance training for their clinic" ON compliance_training
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update compliance training from their clinic" ON compliance_training
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Create RLS policies for training_completions
CREATE POLICY "Users can view their own training completions" ON training_completions
    FOR SELECT USING (
        profile_id = auth.uid()
        OR clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Users can insert their own training completions" ON training_completions
    FOR INSERT WITH CHECK (
        profile_id = auth.uid()
        AND clinic_id IN (
            SELECT clinic_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own training completions" ON training_completions
    FOR UPDATE USING (
        profile_id = auth.uid()
    );

-- Insert sample consent forms
INSERT INTO consent_forms (clinic_id, form_name, form_version, consent_type, form_template, legal_basis, required_fields, retention_period_days)
SELECT 
    c.id,
    'Formulário de Consentimento LGPD',
    '1.0',
    'data_processing',
    'Eu, {{patient_name}}, autorizo o processamento dos meus dados pessoais para os fins de tratamento médico e cumprimento de obrigações legais, conforme a Lei Geral de Proteção de Dados (LGPD).',
    'consent',
    '["patient_name", "cpf", "signature", "date"]'::jsonb,
    3650
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM consent_forms cf 
    WHERE cf.clinic_id = c.id AND cf.form_name = 'Formulário de Consentimento LGPD'
)
LIMIT 1;

INSERT INTO consent_forms (clinic_id, form_name, form_version, consent_type, form_template, legal_basis, required_fields, retention_period_days)
SELECT 
    c.id,
    'Termo de Consentimento para Fotografias',
    '1.0',
    'photography',
    'Autorizo a captura e uso de fotografias durante o tratamento para fins de documentação médica e acompanhamento do progresso do tratamento.',
    'consent',
    '["patient_name", "treatment_type", "photo_usage", "signature", "date"]'::jsonb,
    1825
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM consent_forms cf 
    WHERE cf.clinic_id = c.id AND cf.form_name = 'Termo de Consentimento para Fotografias'
)
LIMIT 1;

-- Insert sample compliance training
INSERT INTO compliance_training (clinic_id, training_name, training_type, description, duration_minutes, mandatory, recurring, recurrence_period_days, regulatory_requirement, target_roles, learning_objectives, effective_date)
SELECT 
    c.id,
    'Treinamento LGPD para Profissionais de Saúde',
    'lgpd_compliance',
    'Curso obrigatório sobre Lei Geral de Proteção de Dados aplicada ao ambiente clínico e tratamento de dados de pacientes.',
    120,
    true,
    true,
    365,
    'LGPD - Lei 13.709/2018',
    '["doctor", "nurse", "staff", "admin"]'::jsonb,
    '["Compreender os princípios da LGPD", "Identificar dados pessoais sensíveis", "Aplicar medidas de segurança", "Gerenciar consentimentos"]'::jsonb,
    CURRENT_DATE
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM compliance_training ct 
    WHERE ct.clinic_id = c.id AND ct.training_name = 'Treinamento LGPD para Profissionais de Saúde'
)
LIMIT 1;

-- Create audit trigger for consent_forms
CREATE OR REPLACE FUNCTION audit_consent_forms() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('consent_forms', NEW.id::text, 'INSERT', auth.uid(), NULL, row_to_json(NEW), NEW.clinic_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('consent_forms', NEW.id::text, 'UPDATE', auth.uid(), row_to_json(OLD), row_to_json(NEW), NEW.clinic_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('consent_forms', OLD.id::text, 'DELETE', auth.uid(), row_to_json(OLD), NULL, OLD.clinic_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_consent_forms ON consent_forms;
CREATE TRIGGER trigger_audit_consent_forms
    AFTER INSERT OR UPDATE OR DELETE ON consent_forms
    FOR EACH ROW EXECUTE FUNCTION audit_consent_forms();

-- Create audit trigger for legal_documents
CREATE OR REPLACE FUNCTION audit_legal_documents() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('legal_documents', NEW.id::text, 'INSERT', auth.uid(), NULL, row_to_json(NEW), NEW.clinic_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('legal_documents', NEW.id::text, 'UPDATE', auth.uid(), row_to_json(OLD), row_to_json(NEW), NEW.clinic_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_events (table_name, record_id, operation, user_id, old_values, new_values, clinic_id)
        VALUES ('legal_documents', OLD.id::text, 'DELETE', auth.uid(), row_to_json(OLD), NULL, OLD.clinic_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_legal_documents ON legal_documents;
CREATE TRIGGER trigger_audit_legal_documents
    AFTER INSERT OR UPDATE OR DELETE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION audit_legal_documents();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_consent_forms_updated_at ON consent_forms;
CREATE TRIGGER update_consent_forms_updated_at
    BEFORE UPDATE ON consent_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER update_legal_documents_updated_at
    BEFORE UPDATE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_metrics_updated_at ON compliance_metrics;
CREATE TRIGGER update_compliance_metrics_updated_at
    BEFORE UPDATE ON compliance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_training_updated_at ON compliance_training;
CREATE TRIGGER update_compliance_training_updated_at
    BEFORE UPDATE ON compliance_training
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_completions_updated_at ON training_completions;
CREATE TRIGGER update_training_completions_updated_at
    BEFORE UPDATE ON training_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE consent_forms IS 'Templates for patient consent forms with LGPD compliance';
COMMENT ON TABLE legal_documents IS 'Legal documents and policies for clinic compliance';
COMMENT ON TABLE compliance_metrics IS 'Metrics tracking for compliance monitoring';
COMMENT ON TABLE compliance_training IS 'Compliance training programs and courses';
COMMENT ON TABLE training_completions IS 'Records of completed compliance training by staff';