-- 🔒 LGPD Compliance Automation - Database Schema Extensions
-- NeonPro - Sistema de Automação de Compliance LGPD
-- Quality Standard: ≥9.5/10 (BMad Enhanced)

-- ==================== LGPD CONSENTS TABLE ====================

CREATE TABLE IF NOT EXISTS lgpd_consents (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'withdrawn', 'expired', 'pending_renewal')),
  granted_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  withdrawn_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  granular_permissions JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_patient_id ON lgpd_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_consent_type ON lgpd_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_status ON lgpd_consents(status);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_granted_date ON lgpd_consents(granted_date);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_expiration_date ON lgpd_consents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_withdrawn_date ON lgpd_consents(withdrawn_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_patient_type_status ON lgpd_consents(patient_id, consent_type, status);
CREATE INDEX IF NOT EXISTS idx_lgpd_consents_active ON lgpd_consents(patient_id, consent_type) WHERE withdrawn_date IS NULL;

-- ==================== DATA PROCESSING LOG TABLE ====================

CREATE TABLE IF NOT EXISTS data_processing_log (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  processing_type TEXT NOT NULL CHECK (processing_type IN ('create', 'read', 'update', 'delete', 'export', 'share')),
  purpose TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  system_component TEXT NOT NULL,
  data_fields TEXT[] NOT NULL,
  legal_basis TEXT NOT NULL DEFAULT 'consent' CHECK (legal_basis IN ('consent', 'legitimate_interest', 'legal_obligation', 'vital_interest', 'public_task', 'contract')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance and compliance queries
CREATE INDEX IF NOT EXISTS idx_data_processing_log_patient_id ON data_processing_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_timestamp ON data_processing_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_user_id ON data_processing_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_purpose ON data_processing_log(purpose);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_processing_type ON data_processing_log(processing_type);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_legal_basis ON data_processing_log(legal_basis);

-- Composite indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_data_processing_log_patient_timeframe ON data_processing_log(patient_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_purpose_timeframe ON data_processing_log(purpose, timestamp);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_user_timeframe ON data_processing_log(user_id, timestamp);

-- ==================== PRIVACY RIGHTS REQUESTS TABLE ====================

CREATE TABLE IF NOT EXISTS privacy_rights_requests (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'correction', 'deletion', 'portability', 'objection', 'restriction')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'partially_completed')),
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  response_data JSONB,
  automated BOOLEAN NOT NULL DEFAULT TRUE,
  verification_method TEXT NOT NULL DEFAULT 'email' CHECK (verification_method IN ('email', 'phone', 'in_person', 'digital_signature')),
  processing_notes TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_patient_id ON privacy_rights_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_request_type ON privacy_rights_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_status ON privacy_rights_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_submission_date ON privacy_rights_requests(submission_date);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_completion_date ON privacy_rights_requests(completion_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_patient_type ON privacy_rights_requests(patient_id, request_type);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_status_date ON privacy_rights_requests(status, submission_date);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_requests_pending ON privacy_rights_requests(status, submission_date) WHERE status IN ('pending', 'processing');

-- ==================== COMPLIANCE MONITORING TABLE ====================

CREATE TABLE IF NOT EXISTS compliance_monitoring (
  id SERIAL PRIMARY KEY,
  check_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('compliant', 'non_compliant', 'pending_review', 'requires_action')),
  violations_detected INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[],
  next_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for monitoring and reporting
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_check_date ON compliance_monitoring(check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_patient_id ON compliance_monitoring(patient_id);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_compliance_score ON compliance_monitoring(compliance_score);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_overall_status ON compliance_monitoring(overall_status);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_risk_level ON compliance_monitoring(risk_level);
CREATE INDEX IF NOT EXISTS idx_compliance_monitoring_next_review ON compliance_monitoring(next_review_date);

-- ==================== DATA RETENTION POLICIES TABLE ====================

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id SERIAL PRIMARY KEY,
  data_category TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
  disposal_method TEXT NOT NULL DEFAULT 'delete' CHECK (disposal_method IN ('delete', 'anonymize', 'archive')),
  automatic_enforcement BOOLEAN NOT NULL DEFAULT TRUE,
  exceptions TEXT[],
  legal_basis TEXT NOT NULL,
  review_period_days INTEGER NOT NULL DEFAULT 365,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(data_category, purpose)
);

-- Indexes for policy management
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_data_category ON data_retention_policies(data_category);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_purpose ON data_retention_policies(purpose);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_automatic ON data_retention_policies(automatic_enforcement);

-- ==================== DATA LIFECYCLE EVENTS TABLE ====================

CREATE TABLE IF NOT EXISTS data_lifecycle_events (
  id TEXT PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  data_category TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('retention_check', 'disposal_triggered', 'anonymization_completed', 'deletion_completed', 'archive_completed')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  policy_id INTEGER REFERENCES data_retention_policies(id),
  automated BOOLEAN NOT NULL DEFAULT TRUE,
  result TEXT NOT NULL DEFAULT 'success' CHECK (result IN ('success', 'failure', 'partial')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for lifecycle tracking
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_patient_id ON data_lifecycle_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_data_category ON data_lifecycle_events(data_category);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_event_type ON data_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_timestamp ON data_lifecycle_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_policy_id ON data_lifecycle_events(policy_id);

-- ==================== STAFF COMPLIANCE TRAINING TABLE ====================

CREATE TABLE IF NOT EXISTS staff_compliance_training (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL CHECK (training_type IN ('lgpd_basics', 'data_handling', 'privacy_rights', 'incident_response', 'annual_refresh')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired', 'failed')),
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
  mandatory_refresh_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for training management
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_user_id ON staff_compliance_training(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_training_type ON staff_compliance_training(training_type);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_status ON staff_compliance_training(status);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_completion_date ON staff_compliance_training(completion_date);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_expiration_date ON staff_compliance_training(expiration_date);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_mandatory_refresh ON staff_compliance_training(mandatory_refresh_date);

-- Composite indexes for training queries
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_user_type ON staff_compliance_training(user_id, training_type);
CREATE INDEX IF NOT EXISTS idx_staff_compliance_training_active ON staff_compliance_training(user_id, status, expiration_date) WHERE status = 'completed';

-- ==================== AUDIT REPORTS TABLE ====================

CREATE TABLE IF NOT EXISTS audit_reports (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('compliance_overview', 'privacy_rights_summary', 'data_processing_report', 'violation_report', 'training_report')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  timeframe_start TIMESTAMP WITH TIME ZONE NOT NULL,
  timeframe_end TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'system' CHECK (generated_by IN ('system', 'user')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'pdf', 'csv', 'excel')),
  confidential BOOLEAN NOT NULL DEFAULT TRUE,
  file_path TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for report management
CREATE INDEX IF NOT EXISTS idx_audit_reports_report_type ON audit_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_audit_reports_generated_at ON audit_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_audit_reports_user_id ON audit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_reports_timeframe ON audit_reports(timeframe_start, timeframe_end);
CREATE INDEX IF NOT EXISTS idx_audit_reports_expires_at ON audit_reports(expires_at);

-- ==================== ROW LEVEL SECURITY (RLS) POLICIES ====================

-- Enable RLS on all tables
ALTER TABLE lgpd_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_compliance_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- LGPD Consents Policies
CREATE POLICY "Users can view consents for their clinic patients" ON lgpd_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = lgpd_consents.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage consents for their clinic patients" ON lgpd_consents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = lgpd_consents.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Data Processing Log Policies
CREATE POLICY "Users can view processing logs for their clinic" ON data_processing_log
  FOR SELECT USING (
    patient_id IS NULL OR
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = data_processing_log.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert processing logs" ON data_processing_log
  FOR INSERT WITH CHECK (true);

-- Privacy Rights Requests Policies
CREATE POLICY "Users can view privacy requests for their clinic patients" ON privacy_rights_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = privacy_rights_requests.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage privacy requests for their clinic patients" ON privacy_rights_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = privacy_rights_requests.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Compliance Monitoring Policies
CREATE POLICY "Users can view compliance monitoring for their clinic" ON compliance_monitoring
  FOR SELECT USING (
    patient_id IS NULL OR
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = compliance_monitoring.patient_id
      AND p.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Staff Training Policies
CREATE POLICY "Users can view their own training records" ON staff_compliance_training
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view training records for their clinic staff" ON staff_compliance_training
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u1, users u2
      WHERE u1.id = auth.uid()
      AND u2.id = staff_compliance_training.user_id
      AND u1.clinic_id = u2.clinic_id
      AND u1.role IN ('owner', 'manager')
    )
  );

-- Audit Reports Policies
CREATE POLICY "Users can view audit reports for their clinic" ON audit_reports
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

-- ==================== TRIGGERS FOR AUTOMATIC UPDATES ====================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at column
CREATE TRIGGER update_lgpd_consents_updated_at BEFORE UPDATE ON lgpd_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_privacy_rights_requests_updated_at BEFORE UPDATE ON privacy_rights_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_compliance_training_updated_at BEFORE UPDATE ON staff_compliance_training FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== FUNCTIONS FOR COMPLIANCE AUTOMATION ====================

-- Function to check consent validity
CREATE OR REPLACE FUNCTION check_consent_validity(p_patient_id UUID, p_purpose TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  consent_valid BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM lgpd_consents
    WHERE patient_id = p_patient_id
    AND consent_type = p_purpose
    AND status = 'granted'
    AND withdrawn_date IS NULL
    AND (expiration_date IS NULL OR expiration_date > NOW())
  ) INTO consent_valid;
  
  RETURN consent_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire consents
CREATE OR REPLACE FUNCTION auto_expire_consents()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE lgpd_consents
  SET status = 'expired'
  WHERE status = 'granted'
  AND expiration_date IS NOT NULL
  AND expiration_date < NOW()
  AND withdrawn_date IS NULL;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_patient_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  consent_score INTEGER := 0;
  processing_score INTEGER := 0;
  rights_score INTEGER := 0;
  overall_score INTEGER := 0;
BEGIN
  -- Calculate consent compliance (0-100)
  SELECT CASE 
    WHEN COUNT(*) = 0 THEN 100
    ELSE (COUNT(*) FILTER (WHERE status = 'granted' AND (expiration_date IS NULL OR expiration_date > NOW())) * 100) / COUNT(*)
  END INTO consent_score
  FROM lgpd_consents
  WHERE (p_patient_id IS NULL OR patient_id = p_patient_id)
  AND withdrawn_date IS NULL;
  
  -- Calculate processing compliance (simplified)
  processing_score := 95; -- Base score, would be calculated based on actual violations
  
  -- Calculate rights processing compliance
  SELECT CASE 
    WHEN COUNT(*) = 0 THEN 100
    ELSE (COUNT(*) FILTER (WHERE status = 'completed' AND completion_date <= submission_date + INTERVAL '24 hours') * 100) / COUNT(*)
  END INTO rights_score
  FROM privacy_rights_requests
  WHERE (p_patient_id IS NULL OR patient_id = p_patient_id)
  AND submission_date >= NOW() - INTERVAL '30 days';
  
  -- Calculate weighted overall score
  overall_score := (consent_score * 30 + processing_score * 40 + rights_score * 30) / 100;
  
  RETURN overall_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== SCHEDULED JOBS SETUP ====================

-- Note: These would be set up using cron extension or external scheduler
-- pg_cron examples (if available):

-- Auto-expire consents daily
-- SELECT cron.schedule('auto-expire-consents', '0 2 * * *', 'SELECT auto_expire_consents();');

-- Daily compliance monitoring
-- SELECT cron.schedule('daily-compliance-check', '0 3 * * *', 
--   'INSERT INTO compliance_monitoring (compliance_score, overall_status, details) 
--    SELECT calculate_compliance_score(), 
--           CASE WHEN calculate_compliance_score() >= 99 THEN ''compliant'' 
--                WHEN calculate_compliance_score() >= 85 THEN ''pending_review''
--                ELSE ''non_compliant'' END,
--           ''{}''::jsonb;');

-- ==================== INITIAL DATA SETUP ====================

-- Insert default data retention policies
INSERT INTO data_retention_policies (data_category, purpose, retention_period_days, legal_basis, review_period_days) VALUES
('personal', 'medical_care', 1825, 'Legal obligation for medical records - 5 years', 365),
('sensitive', 'medical_care', 1825, 'Legal obligation for medical records - 5 years', 365),
('medical', 'medical_care', 1825, 'Legal obligation for medical records - 5 years', 365),
('financial', 'billing', 1825, 'Legal obligation for accounting records - 5 years', 365),
('personal', 'marketing', 1095, 'Consent-based marketing - 3 years default', 365),
('behavioral', 'analytics', 730, 'Legitimate interest for service improvement - 2 years', 180),
('biometric', 'medical_care', 1825, 'Legal obligation for medical records - 5 years', 365)
ON CONFLICT (data_category, purpose) DO NOTHING;

-- Create compliance monitoring view for easy reporting
CREATE OR REPLACE VIEW compliance_summary AS
SELECT 
  cm.id,
  cm.check_date,
  cm.patient_id,
  p.name as patient_name,
  cm.compliance_score,
  cm.overall_status,
  cm.risk_level,
  cm.violations_detected,
  cm.next_review_date,
  c.name as clinic_name
FROM compliance_monitoring cm
LEFT JOIN patients p ON cm.patient_id = p.id
LEFT JOIN clinics c ON p.clinic_id = c.id
ORDER BY cm.check_date DESC;

-- Create privacy rights summary view
CREATE OR REPLACE VIEW privacy_rights_summary AS
SELECT 
  prr.id,
  prr.patient_id,
  p.name as patient_name,
  prr.request_type,
  prr.status,
  prr.submission_date,
  prr.completion_date,
  EXTRACT(EPOCH FROM (COALESCE(prr.completion_date, NOW()) - prr.submission_date)) / 3600 as response_time_hours,
  prr.automated,
  c.name as clinic_name
FROM privacy_rights_requests prr
JOIN patients p ON prr.patient_id = p.id
JOIN clinics c ON p.clinic_id = c.id
ORDER BY prr.submission_date DESC;

COMMENT ON TABLE lgpd_consents IS 'Stores patient consent records for LGPD compliance with granular permission tracking';
COMMENT ON TABLE data_processing_log IS 'Comprehensive audit log of all patient data processing activities';
COMMENT ON TABLE privacy_rights_requests IS 'Tracks and manages patient privacy rights requests (access, deletion, etc.)';
COMMENT ON TABLE compliance_monitoring IS 'Regular compliance score monitoring and violation tracking';
COMMENT ON TABLE data_retention_policies IS 'Configurable data retention policies by category and purpose';
COMMENT ON TABLE data_lifecycle_events IS 'Tracks automated data lifecycle events (retention, disposal, etc.)';
COMMENT ON TABLE staff_compliance_training IS 'Staff LGPD compliance training tracking and certification management';
COMMENT ON TABLE audit_reports IS 'Generated compliance and audit reports for regulatory purposes';