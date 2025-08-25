-- LGPD Healthcare Compliance Tables
-- Creates missing tables for LGPD compliance and healthcare audit

-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Consent Records Table (LGPD Art. 8º)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawal_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'expired')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_consent_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Data Subject Rights Requests Table (LGPD Art. 18-22)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'completed', 'rejected', 'under_review')),
    submitted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ NOT NULL,
    response TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_request_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Activity Logs Table (General System Activity)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_activity_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Data Access Logs Table (LGPD Data Access Audit)
CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_subject_id UUID NOT NULL,
    access_type TEXT NOT NULL,
    data_accessed TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    access_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    clinic_id UUID,
    CONSTRAINT fk_access_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Security Events Table (Security Incident Tracking)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_security_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_resolved_by FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Compliance Checks Table (Automated Compliance Monitoring)
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type TEXT NOT NULL,
    framework TEXT NOT NULL, -- 'LGPD', 'ANVISA', 'CFM'
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'pending')),
    description TEXT,
    details JSONB DEFAULT '{}',
    check_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_check_date TIMESTAMPTZ,
    clinic_id UUID,
    automated BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_compliance_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Data Retention Policies Table (LGPD Art. 16)
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID,
    data_type TEXT NOT NULL,
    retention_period_years INTEGER NOT NULL,
    legal_basis TEXT NOT NULL,
    scheduled_deletion_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_retention_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_retention_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_subject_purpose ON consent_records(data_subject_id, purpose);
CREATE INDEX IF NOT EXISTS idx_consent_records_status ON consent_records(status);
CREATE INDEX IF NOT EXISTS idx_consent_records_date ON consent_records(consent_date);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_subject ON data_subject_requests(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_deadline ON data_subject_requests(response_deadline);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_clinic ON activity_logs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_timestamp ON data_access_logs(user_id, access_timestamp);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_subject ON data_access_logs(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_clinic ON data_access_logs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_security_events_type_severity ON security_events(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_clinic ON security_events(clinic_id);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_type_framework ON compliance_checks(check_type, framework);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_date ON compliance_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_next_check ON compliance_checks(next_check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_clinic ON compliance_checks(clinic_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_subject ON data_retention_policies(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_deletion_date ON data_retention_policies(scheduled_deletion_date);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_status ON data_retention_policies(status);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_clinic ON data_retention_policies(clinic_id);

-- Enable RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_records
CREATE POLICY "consent_records_clinic_access" ON consent_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = consent_records.data_subject_id
        AND p.clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    )
);

-- RLS Policies for data_subject_requests
CREATE POLICY "data_subject_requests_clinic_access" ON data_subject_requests
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = data_subject_requests.data_subject_id
        AND p.clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    )
);

-- RLS Policies for activity_logs
CREATE POLICY "activity_logs_clinic_access" ON activity_logs
FOR SELECT USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY "activity_logs_system_insert" ON activity_logs
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for data_access_logs
CREATE POLICY "data_access_logs_clinic_access" ON data_access_logs
FOR SELECT USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY "data_access_logs_system_insert" ON data_access_logs
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for security_events
CREATE POLICY "security_events_clinic_access" ON security_events
FOR SELECT USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    OR (auth.jwt() ->> 'role') = 'admin'
);

CREATE POLICY "security_events_system_insert" ON security_events
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for compliance_checks
CREATE POLICY "compliance_checks_clinic_access" ON compliance_checks
FOR ALL USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    OR (auth.jwt() ->> 'role') = 'admin'
);

-- RLS Policies for data_retention_policies
CREATE POLICY "data_retention_policies_clinic_access" ON data_retention_policies
FOR ALL USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_subject_requests_updated_at
    BEFORE UPDATE ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE consent_records IS 'LGPD consent management - tracks user consent for data processing';
COMMENT ON TABLE data_subject_requests IS 'LGPD data subject rights requests (Articles 18-22)';
COMMENT ON TABLE activity_logs IS 'General system activity logging for audit purposes';
COMMENT ON TABLE data_access_logs IS 'LGPD-specific data access logging for compliance';
COMMENT ON TABLE security_events IS 'Security incident tracking and monitoring';
COMMENT ON TABLE compliance_checks IS 'Automated compliance monitoring for LGPD, ANVISA, CFM';
COMMENT ON TABLE data_retention_policies IS 'Data retention policy management per LGPD Article 16';

-- Insert initial compliance check records
INSERT INTO compliance_checks (check_type, framework, status, description, details, next_check_date) VALUES
('consent_records_audit', 'LGPD', 'passed', 'Verify consent records are properly maintained', '{"tables": ["consent_records"], "check_frequency": "monthly"}', NOW() + INTERVAL '1 month'),
('data_retention_compliance', 'LGPD', 'passed', 'Check data retention policy compliance', '{"tables": ["data_retention_policies"], "check_frequency": "quarterly"}', NOW() + INTERVAL '3 months'),
('access_log_audit', 'LGPD', 'passed', 'Audit data access logs for compliance', '{"tables": ["data_access_logs"], "check_frequency": "monthly"}', NOW() + INTERVAL '1 month'),
('security_incident_review', 'LGPD', 'passed', 'Review security incidents and response', '{"tables": ["security_events"], "check_frequency": "weekly"}', NOW() + INTERVAL '1 week');
