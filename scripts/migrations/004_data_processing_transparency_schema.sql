-- 🔍 Data Processing Transparency Schema Extension
-- NeonPro - Sistema de Automação de Compliance LGPD - Phase 3 Task 3.2
-- Quality Standard: ≥9.5/10 (BMad Enhanced)

-- Privacy Impact Assessment Tables
CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_activity_id UUID NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessor_id UUID REFERENCES auth.users(id),
    
    -- Data Analysis Section
    data_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    sensitivity_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_volume_estimate TEXT,
    affected_data_subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
    retention_period_analysis TEXT,
    
    -- Risk Assessment Section
    overall_risk_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')) DEFAULT 'low',
    identified_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
    impact_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    likelihood_assessment TEXT,
    
    -- Legal Basis Analysis
    primary_legal_basis TEXT NOT NULL,
    secondary_legal_bases TEXT[] DEFAULT ARRAY[]::TEXT[],
    compliance_gaps JSONB DEFAULT '[]'::jsonb,
    legal_recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Mitigation Measures
    technical_measures JSONB DEFAULT '[]'::jsonb,
    organizational_measures JSONB DEFAULT '[]'::jsonb,
    implementation_timeframe TEXT,
    responsible_party TEXT,
    
    -- Conclusions
    proceed_with_processing BOOLEAN DEFAULT false,
    processing_conditions JSONB DEFAULT '[]'::jsonb,
    review_date DATE,
    approval_required BOOLEAN DEFAULT false,
    dpo_approval_status TEXT CHECK (dpo_approval_status IN ('pending', 'approved', 'rejected', 'not_required')) DEFAULT 'not_required',
    
    -- Metadata
    version INTEGER DEFAULT 1,
    automated_generation BOOLEAN DEFAULT true,
    manual_review_required BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Processing Activity Registry
CREATE TABLE IF NOT EXISTS data_processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name TEXT NOT NULL,
    activity_description TEXT,
    
    -- Processing Details
    controller_name TEXT NOT NULL DEFAULT 'NeonPro Clinical System',
    processor_names TEXT[] DEFAULT ARRAY[]::TEXT[],
    joint_controllers TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Purpose and Legal Basis
    processing_purpose TEXT NOT NULL,
    purpose_description TEXT,
    legal_basis TEXT NOT NULL,
    legal_basis_details TEXT,
    
    -- Data Categories and Subjects
    data_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    data_subject_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    special_category_data BOOLEAN DEFAULT false,
    criminal_data BOOLEAN DEFAULT false,
    
    -- Recipients and Transfers
    recipient_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    third_country_transfers BOOLEAN DEFAULT false,
    transfer_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
    transfer_safeguards TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Retention and Security
    retention_period TEXT,
    retention_criteria TEXT,
    security_measures JSONB DEFAULT '{}'::jsonb,
    
    -- Technical and Organizational Measures
    technical_measures JSONB DEFAULT '[]'::jsonb,
    organizational_measures JSONB DEFAULT '[]'::jsonb,
    
    -- Compliance Status
    pia_required BOOLEAN DEFAULT false,
    pia_completed BOOLEAN DEFAULT false,
    pia_assessment_id UUID REFERENCES privacy_impact_assessments(id),
    
    last_review_date DATE,
    next_review_date DATE,
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'under_review', 'non_compliant', 'needs_attention')) DEFAULT 'under_review',
    
    -- Activity Status
    activity_status TEXT CHECK (activity_status IN ('active', 'suspended', 'terminated', 'planned')) DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Data Processing Log (Enhanced)
CREATE TABLE IF NOT EXISTS data_processing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Processing Context
    patient_id UUID NOT NULL REFERENCES patients(id),
    processing_activity_id UUID REFERENCES data_processing_activities(id),
    processing_type TEXT NOT NULL CHECK (processing_type IN ('access', 'create', 'update', 'delete', 'share', 'export')),
    processing_purpose TEXT NOT NULL,
    
    -- User and System Context
    user_id UUID REFERENCES auth.users(id),
    user_role TEXT,
    system_component TEXT NOT NULL,
    client_ip INET,
    user_agent TEXT,
    
    -- Data Context
    data_fields TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    data_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    data_sensitivity_level TEXT CHECK (data_sensitivity_level IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'confidential',
    
    -- Legal and Compliance
    legal_basis TEXT NOT NULL,
    consent_reference UUID,
    legitimate_interest_assessment TEXT,
    
    -- Processing Details
    processing_method TEXT,
    automated_decision_making BOOLEAN DEFAULT false,
    profiling_involved BOOLEAN DEFAULT false,
    
    -- Compliance Validation
    authorization_validated BOOLEAN DEFAULT false,
    consent_status TEXT CHECK (consent_status IN ('valid', 'expired', 'withdrawn', 'not_required', 'invalid')),
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'warning', 'violation')) DEFAULT 'compliant',
    compliance_issues JSONB DEFAULT '[]'::jsonb,
    
    -- Result and Impact
    operation_result TEXT CHECK (operation_result IN ('success', 'failure', 'partial')) DEFAULT 'success',
    error_details TEXT,
    records_affected INTEGER DEFAULT 1,
    
    -- Audit and Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    request_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Third-Party Data Sharing Registry
CREATE TABLE IF NOT EXISTS third_party_sharing_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sharing_agreement_id TEXT UNIQUE NOT NULL,
    
    -- Recipient Information
    recipient_name TEXT NOT NULL,
    recipient_type TEXT CHECK (recipient_type IN ('processor', 'controller', 'joint_controller', 'government', 'healthcare_provider')) NOT NULL,
    recipient_contact_info JSONB,
    recipient_location TEXT,
    recipient_country TEXT,
    
    -- Legal and Compliance
    legal_basis_for_sharing TEXT NOT NULL,
    data_processing_agreement_url TEXT,
    privacy_policy_url TEXT,
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Data Sharing Details
    data_categories_shared TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    sharing_purpose TEXT NOT NULL,
    purpose_description TEXT,
    data_format TEXT DEFAULT 'encrypted_json',
    
    -- Safeguards
    technical_safeguards JSONB DEFAULT '[]'::jsonb,
    organizational_safeguards JSONB DEFAULT '[]'::jsonb,
    legal_safeguards JSONB DEFAULT '[]'::jsonb,
    contractual_safeguards JSONB DEFAULT '[]'::jsonb,
    
    -- Patient Rights
    patient_opt_out_available BOOLEAN DEFAULT true,
    patient_access_rights BOOLEAN DEFAULT true,
    patient_correction_rights BOOLEAN DEFAULT true,
    patient_deletion_rights BOOLEAN DEFAULT true,
    
    -- Transfer Details
    transfer_mechanism TEXT,
    transfer_frequency TEXT,
    data_retention_period TEXT,
    encryption_enabled BOOLEAN DEFAULT true,
    
    -- Monitoring and Compliance
    last_data_sharing_date TIMESTAMP WITH TIME ZONE,
    total_records_shared INTEGER DEFAULT 0,
    compliance_score DECIMAL(3,1) DEFAULT 10.0,
    last_compliance_review DATE,
    next_compliance_review DATE,
    
    -- Status
    sharing_status TEXT CHECK (sharing_status IN ('active', 'suspended', 'terminated', 'under_review')) DEFAULT 'under_review',
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Data Sharing Instances
CREATE TABLE IF NOT EXISTS patient_data_sharing_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    patient_id UUID NOT NULL REFERENCES patients(id),
    sharing_registry_id UUID NOT NULL REFERENCES third_party_sharing_registry(id),
    consent_id UUID REFERENCES patient_consents(id),
    
    -- Sharing Details
    sharing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shared_by UUID REFERENCES auth.users(id),
    data_fields_shared TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    estimated_records INTEGER DEFAULT 1,
    
    -- Purpose and Context
    specific_purpose TEXT,
    sharing_context TEXT,
    emergency_sharing BOOLEAN DEFAULT false,
    
    -- Patient Notification
    patient_notified BOOLEAN DEFAULT false,
    notification_date TIMESTAMP WITH TIME ZONE,
    notification_method TEXT,
    
    -- Tracking and Audit
    sharing_reference TEXT UNIQUE,
    sharing_status TEXT CHECK (sharing_status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    opt_out_deadline DATE,
    patient_opted_out BOOLEAN DEFAULT false,
    opt_out_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Processing Transparency Dashboard
CREATE TABLE IF NOT EXISTS processing_transparency_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Processing Summary
    total_processing_activities INTEGER DEFAULT 0,
    active_purposes TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_activity_date TIMESTAMP WITH TIME ZONE,
    
    -- Third-Party Sharing Summary
    total_sharing_agreements INTEGER DEFAULT 0,
    active_recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_sharing_date TIMESTAMP WITH TIME ZONE,
    
    -- Rights Exercise Summary
    access_requests_count INTEGER DEFAULT 0,
    correction_requests_count INTEGER DEFAULT 0,
    deletion_requests_count INTEGER DEFAULT 0,
    portability_requests_count INTEGER DEFAULT 0,
    objection_requests_count INTEGER DEFAULT 0,
    
    last_rights_exercise DATE,
    
    -- Consent Summary
    active_consents INTEGER DEFAULT 0,
    expired_consents INTEGER DEFAULT 0,
    withdrawn_consents INTEGER DEFAULT 0,
    pending_consent_reviews INTEGER DEFAULT 0,
    
    -- Transparency Score
    transparency_score DECIMAL(3,1) DEFAULT 10.0,
    transparency_level TEXT CHECK (transparency_level IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'excellent',
    
    -- Update Tracking
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculation_frequency TEXT DEFAULT 'daily',
    next_update TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(patient_id)
);

-- Compliance Monitoring Results
CREATE TABLE IF NOT EXISTS compliance_monitoring_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Monitoring Period
    monitoring_period TEXT CHECK (monitoring_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')) NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    monitoring_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Overall Compliance
    overall_compliance_score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    compliance_level TEXT CHECK (compliance_level IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'critical')) DEFAULT 'satisfactory',
    
    -- Category Scores
    consent_compliance_score DECIMAL(4,2) DEFAULT 0.00,
    processing_compliance_score DECIMAL(4,2) DEFAULT 0.00,
    transparency_score DECIMAL(4,2) DEFAULT 0.00,
    rights_compliance_score DECIMAL(4,2) DEFAULT 0.00,
    security_compliance_score DECIMAL(4,2) DEFAULT 0.00,
    
    -- Violations and Issues
    total_violations INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    high_violations INTEGER DEFAULT 0,
    medium_violations INTEGER DEFAULT 0,
    low_violations INTEGER DEFAULT 0,
    
    violations_details JSONB DEFAULT '[]'::jsonb,
    
    -- Patients Affected
    total_patients_monitored INTEGER DEFAULT 0,
    patients_with_issues INTEGER DEFAULT 0,
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]'::jsonb,
    improvement_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    action_items JSONB DEFAULT '[]'::jsonb,
    
    -- Monitoring Metadata
    automated_monitoring BOOLEAN DEFAULT true,
    manual_review_required BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES auth.users(id),
    review_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    monitoring_status TEXT CHECK (monitoring_status IN ('completed', 'in_progress', 'failed', 'under_review')) DEFAULT 'completed',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Privacy Impact Assessments
CREATE INDEX IF NOT EXISTS idx_pia_processing_activity ON privacy_impact_assessments(processing_activity_id);
CREATE INDEX IF NOT EXISTS idx_pia_risk_score ON privacy_impact_assessments(overall_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_pia_approval_status ON privacy_impact_assessments(dpo_approval_status);
CREATE INDEX IF NOT EXISTS idx_pia_review_date ON privacy_impact_assessments(review_date);

-- Data Processing Activities
CREATE INDEX IF NOT EXISTS idx_processing_activities_purpose ON data_processing_activities(processing_purpose);
CREATE INDEX IF NOT EXISTS idx_processing_activities_status ON data_processing_activities(activity_status);
CREATE INDEX IF NOT EXISTS idx_processing_activities_compliance ON data_processing_activities(compliance_status);
CREATE INDEX IF NOT EXISTS idx_processing_activities_review ON data_processing_activities(next_review_date);

-- Data Processing Log (Enhanced)
CREATE INDEX IF NOT EXISTS idx_processing_log_patient ON data_processing_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_processing_log_timestamp ON data_processing_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_processing_log_user ON data_processing_log(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_log_purpose ON data_processing_log(processing_purpose);
CREATE INDEX IF NOT EXISTS idx_processing_log_compliance ON data_processing_log(compliance_status);
CREATE INDEX IF NOT EXISTS idx_processing_log_type ON data_processing_log(processing_type);

-- Third-Party Sharing
CREATE INDEX IF NOT EXISTS idx_sharing_registry_status ON third_party_sharing_registry(sharing_status);
CREATE INDEX IF NOT EXISTS idx_sharing_registry_recipient ON third_party_sharing_registry(recipient_name);
CREATE INDEX IF NOT EXISTS idx_sharing_instances_patient ON patient_data_sharing_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_sharing_instances_date ON patient_data_sharing_instances(sharing_date DESC);

-- Transparency Dashboard
CREATE INDEX IF NOT EXISTS idx_transparency_dashboard_patient ON processing_transparency_dashboard(patient_id);
CREATE INDEX IF NOT EXISTS idx_transparency_dashboard_score ON processing_transparency_dashboard(transparency_score DESC);
CREATE INDEX IF NOT EXISTS idx_transparency_dashboard_update ON processing_transparency_dashboard(next_update);

-- Compliance Monitoring
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_period ON compliance_monitoring_results(monitoring_period, period_end_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_score ON compliance_monitoring_results(overall_compliance_score DESC);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE privacy_impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_sharing_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_data_sharing_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_transparency_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring_results ENABLE ROW LEVEL SECURITY;

-- Privacy Impact Assessments Policies
CREATE POLICY "Privacy Impact Assessments - Admin Full Access" ON privacy_impact_assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Privacy Impact Assessments - View by Assessor" ON privacy_impact_assessments
    FOR SELECT USING (assessor_id = auth.uid());

-- Data Processing Activities Policies
CREATE POLICY "Data Processing Activities - Admin Full Access" ON data_processing_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Data Processing Activities - Staff Read Access" ON data_processing_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('healthcare_professional', 'receptionist')
        )
    );

-- Data Processing Log Policies
CREATE POLICY "Data Processing Log - Admin Full Access" ON data_processing_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Data Processing Log - User Own Actions" ON data_processing_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Data Processing Log - Patient Access Own Data" ON data_processing_log
    FOR SELECT USING (
        patient_id IN (
            SELECT p.id FROM patients p 
            WHERE p.email = auth.email()
        )
    );

-- Third-Party Sharing Policies
CREATE POLICY "Third Party Sharing Registry - Admin Full Access" ON third_party_sharing_registry
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Patient Data Sharing - Admin Full Access" ON patient_data_sharing_instances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Patient Data Sharing - Patient Own Data" ON patient_data_sharing_instances
    FOR SELECT USING (
        patient_id IN (
            SELECT p.id FROM patients p 
            WHERE p.email = auth.email()
        )
    );

-- Transparency Dashboard Policies
CREATE POLICY "Transparency Dashboard - Admin Full Access" ON processing_transparency_dashboard
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

CREATE POLICY "Transparency Dashboard - Patient Own Data" ON processing_transparency_dashboard
    FOR SELECT USING (
        patient_id IN (
            SELECT p.id FROM patients p 
            WHERE p.email = auth.email()
        )
    );

-- Compliance Monitoring Policies
CREATE POLICY "Compliance Monitoring - Admin Full Access" ON compliance_monitoring_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'compliance_officer', 'dpo')
        )
    );

-- ==================== FUNCTIONS AND TRIGGERS ====================

-- Function to update processing transparency dashboard
CREATE OR REPLACE FUNCTION update_processing_transparency_dashboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert transparency dashboard record
    INSERT INTO processing_transparency_dashboard (
        patient_id,
        last_activity_date,
        last_calculated
    )
    VALUES (
        NEW.patient_id,
        NEW.timestamp,
        NOW()
    )
    ON CONFLICT (patient_id) 
    DO UPDATE SET
        last_activity_date = GREATEST(processing_transparency_dashboard.last_activity_date, NEW.timestamp),
        last_calculated = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for processing log updates
CREATE TRIGGER update_transparency_dashboard_on_processing
    AFTER INSERT ON data_processing_log
    FOR EACH ROW
    EXECUTE FUNCTION update_processing_transparency_dashboard();

-- Function to validate processing authorization
CREATE OR REPLACE FUNCTION validate_processing_authorization(
    p_patient_id UUID,
    p_purpose TEXT,
    p_data_fields TEXT[]
)
RETURNS JSONB AS $$
DECLARE
    consent_valid BOOLEAN := false;
    legal_basis TEXT;
    validation_result JSONB;
BEGIN
    -- Check if consent is required and valid
    SELECT 
        CASE 
            WHEN p_purpose IN ('marketing', 'research', 'analytics') THEN
                EXISTS (
                    SELECT 1 FROM patient_consents pc
                    WHERE pc.patient_id = p_patient_id
                    AND pc.consent_type = p_purpose
                    AND pc.consent_status = 'active'
                    AND (pc.expiry_date IS NULL OR pc.expiry_date > NOW())
                )
            ELSE true
        END,
        CASE 
            WHEN p_purpose = 'medical_care' THEN 'vital_interests'
            WHEN p_purpose = 'billing' THEN 'legal_obligation'
            WHEN p_purpose = 'appointment_scheduling' THEN 'contract'
            ELSE 'consent'
        END
    INTO consent_valid, legal_basis;

    validation_result := jsonb_build_object(
        'authorized', consent_valid,
        'legal_basis', legal_basis,
        'consent_required', p_purpose IN ('marketing', 'research', 'analytics'),
        'consent_valid', consent_valid,
        'timestamp', NOW()
    );

    RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate transparency score
CREATE OR REPLACE FUNCTION calculate_patient_transparency_score(p_patient_id UUID)
RETURNS DECIMAL(3,1) AS $$
DECLARE
    base_score DECIMAL(3,1) := 10.0;
    processing_activities_count INTEGER;
    consent_compliance_rate DECIMAL(3,2);
    rights_exercise_rate DECIMAL(3,2);
    sharing_transparency DECIMAL(3,2);
BEGIN
    -- Count active processing activities
    SELECT COUNT(*) INTO processing_activities_count
    FROM data_processing_log
    WHERE patient_id = p_patient_id
    AND timestamp > NOW() - INTERVAL '30 days';

    -- Calculate consent compliance rate
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 1.0
            ELSE COUNT(*) FILTER (WHERE consent_status = 'valid') / COUNT(*)::DECIMAL
        END
    INTO consent_compliance_rate
    FROM data_processing_log
    WHERE patient_id = p_patient_id
    AND processing_purpose IN ('marketing', 'research', 'analytics');

    -- Calculate rights exercise accessibility (placeholder)
    rights_exercise_rate := 1.0;

    -- Calculate sharing transparency
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 1.0
            ELSE COUNT(*) FILTER (WHERE patient_notified = true) / COUNT(*)::DECIMAL
        END
    INTO sharing_transparency
    FROM patient_data_sharing_instances
    WHERE patient_id = p_patient_id;

    -- Calculate weighted score
    base_score := base_score * (
        consent_compliance_rate * 0.4 +
        rights_exercise_rate * 0.3 +
        sharing_transparency * 0.3
    );

    RETURN LEAST(10.0, GREATEST(0.0, base_score));
END;
$$ LANGUAGE plpgsql;

-- ==================== INITIAL DATA ====================

-- Insert default processing activities
INSERT INTO data_processing_activities (
    activity_name,
    activity_description,
    processing_purpose,
    purpose_description,
    legal_basis,
    data_categories,
    data_subject_categories,
    special_category_data,
    retention_period,
    security_measures,
    activity_status
) VALUES 
(
    'Cuidados Médicos e Estéticos',
    'Processamento de dados para fornecimento de cuidados médicos e procedimentos estéticos',
    'medical_care',
    'Diagnóstico, tratamento e acompanhamento de pacientes em procedimentos estéticos e de saúde',
    'vital_interests',
    ARRAY['personal', 'medical', 'sensitive'],
    ARRAY['patients'],
    true,
    '20_years',
    '{"encryption": true, "access_controls": true, "audit_logging": true}',
    'active'
),
(
    'Agendamento de Consultas',
    'Processamento de dados para agendamento e gestão de consultas médicas',
    'appointment_scheduling',
    'Organização e confirmação de agendamentos de consultas e procedimentos',
    'contract',
    ARRAY['personal', 'contact'],
    ARRAY['patients'],
    false,
    '5_years',
    '{"encryption": true, "access_controls": true}',
    'active'
),
(
    'Faturamento e Cobrança',
    'Processamento de dados financeiros para faturamento de serviços médicos',
    'billing',
    'Emissão de faturas, controle de pagamentos e gestão financeira de tratamentos',
    'legal_obligation',
    ARRAY['personal', 'financial'],
    ARRAY['patients'],
    false,
    '10_years',
    '{"encryption": true, "access_controls": true, "financial_security": true}',
    'active'
);

-- Create audit log entry
INSERT INTO lgpd_audit_trail (
    event_type,
    entity_type,
    entity_id,
    details,
    user_id,
    ip_address,
    user_agent
) VALUES (
    'schema_update',
    'database',
    'data_processing_transparency',
    'Data Processing Transparency schema created with privacy impact assessments, processing activities registry, third-party sharing controls, and automated compliance monitoring',
    (SELECT id FROM auth.users WHERE email = 'system@neonpro.com.br' LIMIT 1),
    '127.0.0.1',
    'NeonPro LGPD Compliance System'
);

COMMIT;