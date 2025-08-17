-- LGPD Compliance Database Schema
-- NeonPro Healthcare Clinic Management System
-- Created: 2024-01-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for LGPD compliance
CREATE TYPE consent_category AS ENUM (
  'essential',    -- Required for service operation
  'analytics',    -- Usage analytics and performance
  'marketing',    -- Marketing communications
  'research',     -- Medical research participation
  'third_party'   -- Third-party service integration
);

CREATE TYPE legal_basis_type AS ENUM (
  'consent',           -- Art. 7, I - User consent
  'contract',          -- Art. 7, V - Contract performance
  'legal_obligation',  -- Art. 7, II - Legal obligation
  'vital_interests',   -- Art. 7, IV - Vital interests
  'public_task',       -- Art. 7, III - Public interest
  'legitimate_interests' -- Art. 7, IX - Legitimate interests
);

CREATE TYPE data_subject_request_type AS ENUM (
  'access',        -- Right to access (Art. 15)
  'rectification', -- Right to rectification (Art. 16)
  'erasure',       -- Right to erasure (Art. 18)
  'restriction',   -- Right to restrict processing (Art. 18)
  'portability',   -- Right to data portability (Art. 18)
  'objection'      -- Right to object (Art. 18)
);

CREATE TYPE request_status AS ENUM (
  'pending',       -- Request submitted, awaiting processing
  'in_progress',   -- Request being processed
  'completed',     -- Request completed successfully
  'rejected',      -- Request rejected with reason
  'cancelled'      -- Request cancelled by user
);

CREATE TYPE breach_severity AS ENUM (
  'low',           -- No risk to data subjects
  'medium',        -- Limited risk to data subjects
  'high',          -- Significant risk to data subjects
  'critical'       -- High risk to data subjects
);

-- ============================================================================
-- CONSENT MANAGEMENT TABLES
-- ============================================================================

-- Consent purposes definition
CREATE TABLE consent_purposes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category consent_category NOT NULL,
  required BOOLEAN DEFAULT false,
  processing_purpose TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  retention_period INTERVAL,
  legal_basis legal_basis_type NOT NULL DEFAULT 'consent',
  third_party_sharing BOOLEAN DEFAULT false,
  international_transfer BOOLEAN DEFAULT false,
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- User consent tracking
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose_id UUID NOT NULL REFERENCES consent_purposes(id),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  legal_basis legal_basis_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  consent_version VARCHAR(50) NOT NULL,
  proof_hash VARCHAR(255),
  withdrawal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_consent_dates CHECK (
    withdrawn_at IS NULL OR withdrawn_at >= granted_at
  ),
  CONSTRAINT valid_expiry CHECK (
    expiry_date IS NULL OR expiry_date > granted_at
  ),
  UNIQUE(user_id, purpose_id, consent_version)
);

-- Consent form versions
CREATE TABLE consent_form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose_id UUID NOT NULL REFERENCES consent_purposes(id),
  version VARCHAR(50) NOT NULL,
  form_content TEXT NOT NULL,
  plain_language_summary TEXT NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  effective_until TIMESTAMP WITH TIME ZONE,
  legal_review_date TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(purpose_id, version)
);

-- ============================================================================
-- DATA SUBJECT RIGHTS TABLES
-- ============================================================================

-- Data subject rights requests
CREATE TABLE data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type data_subject_request_type NOT NULL,
  status request_status DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL, -- 15 days from request
  request_details JSONB,
  response_data JSONB,
  data_export_url VARCHAR(500),
  verification_token VARCHAR(255) UNIQUE,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  processing_notes TEXT,
  assigned_to UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_completion CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

-- Data export packages
CREATE TABLE data_export_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES data_subject_requests(id) ON DELETE CASCADE,
  export_format VARCHAR(50) NOT NULL DEFAULT 'json',
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  checksum VARCHAR(255),
  encryption_key VARCHAR(500),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- DATA PROCESSING ACTIVITIES REGISTER
-- ============================================================================

-- Data processing activities (LGPD Art. 37)
CREATE TABLE data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  legal_basis legal_basis_type NOT NULL,
  purpose TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  data_subjects_categories TEXT[] NOT NULL,
  retention_period INTERVAL,
  security_measures TEXT[] NOT NULL,
  third_party_recipients TEXT[],
  international_transfers BOOLEAN DEFAULT false,
  transfer_safeguards TEXT,
  dpo_contact VARCHAR(255),
  controller_contact VARCHAR(255),
  processor_contact VARCHAR(255),
  risk_level VARCHAR(50) DEFAULT 'medium',
  dpia_required BOOLEAN DEFAULT false,
  dpia_completed_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- AUDIT LOGGING TABLES
-- ============================================================================

-- LGPD-specific audit logs
CREATE TABLE lgpd_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  table_name VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  legal_basis legal_basis_type,
  purpose VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  INDEX idx_lgpd_audit_user_id ON lgpd_audit_logs(user_id),
  INDEX idx_lgpd_audit_timestamp ON lgpd_audit_logs(timestamp),
  INDEX idx_lgpd_audit_action ON lgpd_audit_logs(action),
  INDEX idx_lgpd_audit_resource ON lgpd_audit_logs(resource_type, resource_id)
);

-- Data breach incidents
CREATE TABLE data_breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_ref VARCHAR(100) NOT NULL UNIQUE,
  severity breach_severity NOT NULL,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE,
  reported_to_anpd BOOLEAN DEFAULT false,
  anpd_notification_date TIMESTAMP WITH TIME ZONE,
  affected_data_subjects INTEGER,
  data_categories_affected TEXT[] NOT NULL,
  description TEXT NOT NULL,
  cause TEXT,
  impact_assessment TEXT,
  mitigation_measures TEXT,
  prevention_measures TEXT,
  investigation_status VARCHAR(50) DEFAULT 'ongoing',
  investigation_completed_at TIMESTAMP WITH TIME ZONE,
  risk_to_subjects TEXT,
  notification_required BOOLEAN,
  subjects_notified_at TIMESTAMP WITH TIME ZONE,
  regulatory_action TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- 72-hour notification constraint
  CONSTRAINT anpd_notification_timing CHECK (
    NOT reported_to_anpd OR anpd_notification_date <= discovered_at + INTERVAL '72 hours'
  )
);

-- ============================================================================
-- DATA RETENTION TABLES
-- ============================================================================

-- Data retention schedules
CREATE TABLE data_retention_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_category VARCHAR(255) NOT NULL,
  legal_basis legal_basis_type NOT NULL,
  retention_period INTERVAL NOT NULL,
  retention_reason TEXT NOT NULL,
  disposal_method VARCHAR(100) NOT NULL DEFAULT 'secure_deletion',
  review_frequency INTERVAL DEFAULT INTERVAL '1 year',
  last_review_date TIMESTAMP WITH TIME ZONE,
  next_review_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Data disposal records
CREATE TABLE data_disposal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retention_schedule_id UUID REFERENCES data_retention_schedules(id),
  data_category VARCHAR(255) NOT NULL,
  disposal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  disposal_method VARCHAR(100) NOT NULL,
  records_count INTEGER,
  disposal_certificate VARCHAR(500),
  disposal_reason VARCHAR(255) NOT NULL,
  authorized_by UUID REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRIVACY IMPACT ASSESSMENTS (DPIA)
-- ============================================================================

-- Data Protection Impact Assessments
CREATE TABLE data_protection_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_activity_id UUID REFERENCES data_processing_activities(id),
  assessment_name VARCHAR(255) NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assessor VARCHAR(255) NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  necessity_proportionality TEXT NOT NULL,
  risk_identification TEXT NOT NULL,
  risk_mitigation TEXT NOT NULL,
  safeguards_implemented TEXT NOT NULL,
  residual_risk TEXT,
  consultation_required BOOLEAN DEFAULT false,
  consultation_completed BOOLEAN DEFAULT false,
  consultation_outcome TEXT,
  approval_status VARCHAR(50) DEFAULT 'pending',
  approved_by VARCHAR(255),
  approval_date TIMESTAMP WITH TIME ZONE,
  review_date TIMESTAMP WITH TIME ZONE,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- COMPLIANCE MONITORING TABLES
-- ============================================================================

-- LGPD compliance monitoring
CREATE TABLE lgpd_compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name VARCHAR(255) NOT NULL,
  check_category VARCHAR(100) NOT NULL,
  compliance_requirement TEXT NOT NULL,
  check_result BOOLEAN NOT NULL,
  check_date TIMESTAMP WITH TIME ZONE NOT NULL,
  evidence_reference TEXT,
  non_compliance_reason TEXT,
  remediation_plan TEXT,
  remediation_due_date TIMESTAMP WITH TIME ZONE,
  remediated_at TIMESTAMP WITH TIME ZONE,
  risk_level VARCHAR(50),
  automated_check BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Consent management indexes
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_purpose_id ON user_consents(purpose_id);
CREATE INDEX idx_user_consents_granted_at ON user_consents(granted_at);
CREATE INDEX idx_user_consents_active ON user_consents(user_id, purpose_id) WHERE withdrawn_at IS NULL;

-- Data subject requests indexes
CREATE INDEX idx_data_subject_requests_user_id ON data_subject_requests(user_id);
CREATE INDEX idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX idx_data_subject_requests_due_date ON data_subject_requests(due_date);
CREATE INDEX idx_data_subject_requests_type ON data_subject_requests(request_type);

-- Audit logs indexes (already defined inline)

-- Data retention indexes
CREATE INDEX idx_data_retention_schedules_category ON data_retention_schedules(data_category);
CREATE INDEX idx_data_retention_schedules_review ON data_retention_schedules(next_review_date) WHERE active = true;

-- Compliance checks indexes
CREATE INDEX idx_lgpd_compliance_checks_date ON lgpd_compliance_checks(check_date);
CREATE INDEX idx_lgpd_compliance_checks_result ON lgpd_compliance_checks(check_result, check_date);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all LGPD tables
ALTER TABLE consent_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breach_incidents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own consents and requests
CREATE POLICY user_own_consents ON user_consents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_own_requests ON data_subject_requests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Admin and DPO can see all data
CREATE POLICY admin_lgpd_access ON user_consents
  FOR ALL TO authenticated
  USING (user_role() IN ('admin', 'dpo'));

CREATE POLICY admin_requests_access ON data_subject_requests
  FOR ALL TO authenticated
  USING (user_role() IN ('admin', 'dpo'));

-- Audit logs are read-only for users, full access for admin/DPO
CREATE POLICY user_own_audit_logs ON lgpd_audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY admin_audit_logs_access ON lgpd_audit_logs
  FOR ALL TO authenticated
  USING (user_role() IN ('admin', 'dpo'));

-- ============================================================================
-- TRIGGERS FOR AUTOMATED COMPLIANCE
-- ============================================================================

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION lgpd_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for tables containing personal data
  IF TG_TABLE_NAME IN ('users', 'patients', 'appointments', 'medical_records', 'treatments') THEN
    INSERT INTO lgpd_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      table_name,
      old_values,
      new_values,
      timestamp
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id)::text,
      TG_TABLE_NAME,
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for consent expiry check
CREATE OR REPLACE FUNCTION check_consent_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically mark consent as withdrawn if expired
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= NOW() AND NEW.withdrawn_at IS NULL THEN
    NEW.withdrawn_at = NOW();
    NEW.withdrawal_reason = 'Automatic expiry';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER lgpd_audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION lgpd_audit_trigger();

CREATE TRIGGER consent_expiry_check BEFORE INSERT OR UPDATE ON user_consents
  FOR EACH ROW EXECUTE FUNCTION check_consent_expiry();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default consent purposes
INSERT INTO consent_purposes (name, description, category, required, processing_purpose, data_categories, legal_basis) VALUES
('Essential Services', 'Required for basic platform functionality and healthcare services', 'essential', true, 'Provide healthcare services, appointment management, and patient care', ARRAY['identification', 'contact', 'medical'], 'contract'),
('Analytics & Performance', 'Help us improve our services through usage analytics', 'analytics', false, 'Service improvement and performance optimization', ARRAY['usage_data', 'device_info'], 'legitimate_interests'),
('Marketing Communications', 'Receive updates about new services and health tips', 'marketing', false, 'Send relevant health information and service updates', ARRAY['contact', 'preferences'], 'consent'),
('Medical Research', 'Participate in anonymous medical research studies', 'research', false, 'Contribute to medical research and public health studies', ARRAY['medical_anonymized'], 'consent'),
('Third-party Integrations', 'Enable integrations with external healthcare providers', 'third_party', false, 'Integrate with laboratories, insurance providers, and other healthcare services', ARRAY['identification', 'medical'], 'consent');

-- Insert default data retention schedules
INSERT INTO data_retention_schedules (data_category, legal_basis, retention_period, retention_reason) VALUES
('personal_identification', 'contract', INTERVAL '5 years', 'LGPD and tax law requirements'),
('medical_records', 'legal_obligation', INTERVAL '20 years', 'CFM professional standards'),
('appointment_history', 'contract', INTERVAL '5 years', 'Healthcare service continuity'),
('financial_records', 'legal_obligation', INTERVAL '7 years', 'Tax and accounting law requirements'),
('consent_records', 'legal_obligation', INTERVAL '5 years', 'LGPD compliance evidence'),
('audit_logs', 'legal_obligation', INTERVAL '10 years', 'Regulatory compliance and security'),
('marketing_data', 'consent', INTERVAL '2 years', 'Marketing effectiveness and preference management');

COMMIT;