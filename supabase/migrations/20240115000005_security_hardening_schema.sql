-- =============================================
-- Security Hardening & Audit Trail Schema
-- Story 3.3: Security Hardening & Audit
-- Created: 2024-01-15
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUDIT TRAIL SYSTEM
-- =============================================

-- Comprehensive audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Action details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    table_name TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT,
    http_method TEXT,
    
    -- Data changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Compliance context
    compliance_flags TEXT[] DEFAULT '{}',
    compliance_context JSONB DEFAULT '{}',
    
    -- Security context
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    security_flags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Integrity verification
    checksum TEXT,
    signature TEXT
);

-- Security events log
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) NOT NULL,
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    source_ip INET,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Event context
    event_data JSONB DEFAULT '{}',
    affected_resources JSONB DEFAULT '{}',
    
    -- Response tracking
    status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')) DEFAULT 'open',
    response_time_minutes INTEGER,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- User session tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    
    -- Session details
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    location_country TEXT,
    location_city TEXT,
    
    -- Security context
    is_trusted_device BOOLEAN DEFAULT FALSE,
    mfa_verified BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    
    -- Session lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    terminated_at TIMESTAMPTZ,
    termination_reason TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_session_duration CHECK (expires_at > created_at)
);

-- Authentication attempts log
CREATE TABLE auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User identification
    email TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Attempt details
    attempt_type TEXT NOT NULL, -- 'login', 'mfa', 'password_reset', etc.
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    
    -- Security flags
    is_suspicious BOOLEAN DEFAULT FALSE,
    blocked_by_rate_limit BOOLEAN DEFAULT FALSE,
    threat_score INTEGER DEFAULT 0,
    
    -- Timestamps
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- SECURITY CONFIGURATION
-- =============================================

-- Security policies and configurations
CREATE TABLE security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'authentication', 'authorization', 'encryption', etc.
    
    -- Policy definition
    policy_data JSONB NOT NULL,
    enforcement_level TEXT CHECK (enforcement_level IN ('advisory', 'warning', 'enforced', 'strict')) DEFAULT 'enforced',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Compliance mapping
    compliance_standards TEXT[] DEFAULT '{}', -- 'LGPD', 'ANVISA', 'CFM'
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}'
);

-- API key management
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL, -- First 8 characters for identification
    
    -- Key details
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Permissions
    scopes TEXT[] DEFAULT '{}',
    allowed_ips INET[] DEFAULT '{}',
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    
    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Security
    secret_key_encrypted TEXT, -- Encrypted with app secret
    
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Rate limiting tracking
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identifier (IP, user, API key, etc.)
    identifier_type TEXT NOT NULL, -- 'ip', 'user', 'api_key'
    identifier_value TEXT NOT NULL,
    
    -- Rate limit details
    endpoint_pattern TEXT,
    window_start TIMESTAMPTZ NOT NULL,
    window_duration_minutes INTEGER NOT NULL,
    request_count INTEGER DEFAULT 0,
    limit_exceeded BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(identifier_type, identifier_value, endpoint_pattern, window_start)
);

-- =============================================
-- MULTI-FACTOR AUTHENTICATION
-- =============================================

-- MFA devices and methods
CREATE TABLE mfa_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Device details
    device_type TEXT CHECK (device_type IN ('totp', 'sms', 'email', 'hardware_key')) NOT NULL,
    device_name TEXT NOT NULL,
    
    -- Device configuration
    secret_encrypted TEXT, -- TOTP secret, phone number, etc. (encrypted)
    backup_codes_encrypted TEXT[], -- Encrypted backup codes
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT one_primary_per_user UNIQUE(user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- MFA verification attempts
CREATE TABLE mfa_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mfa_devices(id) ON DELETE SET NULL,
    
    -- Verification details
    code_entered TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Timestamps
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- ENCRYPTION KEY MANAGEMENT
-- =============================================

-- Encryption keys registry
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id TEXT UNIQUE NOT NULL,
    
    -- Key details
    key_type TEXT CHECK (key_type IN ('data_encryption', 'signing', 'api_key_encryption')) NOT NULL,
    algorithm TEXT NOT NULL, -- 'AES-256-GCM', 'RSA-2048', etc.
    
    -- Key material (encrypted with master key)
    encrypted_key_material TEXT NOT NULL,
    public_key TEXT, -- For asymmetric keys
    
    -- Key lifecycle
    status TEXT CHECK (status IN ('active', 'rotated', 'revoked', 'compromised')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    rotated_at TIMESTAMPTZ,
    
    -- Usage tracking
    usage_count BIGINT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    purpose TEXT,
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_key_lifecycle CHECK (
        (status = 'active' AND activated_at IS NOT NULL) OR
        (status IN ('rotated', 'revoked', 'compromised'))
    )
);

-- Key rotation history
CREATE TABLE key_rotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    old_key_id UUID REFERENCES encryption_keys(id) ON DELETE SET NULL,
    new_key_id UUID REFERENCES encryption_keys(id) ON DELETE SET NULL,
    
    -- Rotation details
    rotation_reason TEXT,
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed')) DEFAULT 'initiated',
    
    -- Timestamps
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Progress tracking
    items_processed INTEGER DEFAULT 0,
    total_items INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- THREAT DETECTION & MONITORING
-- =============================================

-- Threat intelligence data
CREATE TABLE threat_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Indicator details
    indicator_type TEXT CHECK (indicator_type IN ('ip', 'domain', 'hash', 'pattern')) NOT NULL,
    indicator_value TEXT NOT NULL,
    
    -- Threat classification
    threat_type TEXT[], -- 'malware', 'phishing', 'bot', 'scanner'
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Source information
    source TEXT NOT NULL, -- 'internal', 'commercial_feed', 'open_source'
    source_reference TEXT,
    
    -- Lifecycle
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    false_positive BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(indicator_type, indicator_value)
);

-- Security alerts
CREATE TABLE security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Alert details
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')) NOT NULL,
    
    -- Alert source
    source_type TEXT NOT NULL, -- 'automated', 'manual', 'external'
    source_reference TEXT,
    
    -- Affected resources
    affected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    affected_resource_type TEXT,
    affected_resource_id TEXT,
    
    -- Alert data
    alert_data JSONB DEFAULT '{}',
    indicators JSONB DEFAULT '{}',
    
    -- Response tracking
    status TEXT CHECK (status IN ('new', 'acknowledged', 'investigating', 'resolved', 'false_positive')) DEFAULT 'new',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    escalation_level INTEGER DEFAULT 1,
    
    -- Timestamps
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Metrics
    response_time_minutes INTEGER,
    resolution_time_minutes INTEGER,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- COMPLIANCE AUDIT TRACKING
-- =============================================

-- Compliance audit schedules
CREATE TABLE compliance_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Audit details
    audit_type TEXT CHECK (audit_type IN ('LGPD', 'ANVISA', 'CFM', 'internal', 'external')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Scope
    scope_areas TEXT[] NOT NULL, -- 'data_protection', 'authentication', 'audit_trails'
    audit_criteria JSONB DEFAULT '{}',
    
    -- Schedule
    scheduled_date DATE,
    frequency TEXT CHECK (frequency IN ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Status
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    
    -- Results
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    findings JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    
    -- Personnel
    auditor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Documentation
    report_path TEXT,
    evidence_paths TEXT[] DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Compliance findings and issues
CREATE TABLE compliance_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES compliance_audits(id) ON DELETE CASCADE,
    
    -- Finding details
    finding_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Compliance context
    compliance_standard TEXT NOT NULL, -- 'LGPD', 'ANVISA', 'CFM'
    requirement_reference TEXT,
    
    -- Affected areas
    affected_systems TEXT[] DEFAULT '{}',
    affected_data_types TEXT[] DEFAULT '{}',
    
    -- Risk assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    potential_impact TEXT,
    
    -- Remediation
    recommendation TEXT,
    remediation_steps JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    
    -- Status
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive')) DEFAULT 'open',
    
    -- Timestamps
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Evidence
    evidence JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_compliance ON audit_logs USING GIN(compliance_flags);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);

-- Security events indexes
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_status ON security_events(status);
CREATE INDEX idx_security_events_detected_at ON security_events(detected_at);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX idx_user_sessions_ip ON user_sessions(ip_address);

-- Authentication attempts indexes
CREATE INDEX idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX idx_auth_attempts_ip ON auth_attempts(ip_address);
CREATE INDEX idx_auth_attempts_attempted_at ON auth_attempts(attempted_at);
CREATE INDEX idx_auth_attempts_success ON auth_attempts(success);

-- Rate limits indexes
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier_type, identifier_value);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start, window_duration_minutes);

-- MFA devices indexes
CREATE INDEX idx_mfa_devices_user_id ON mfa_devices(user_id);
CREATE INDEX idx_mfa_devices_active ON mfa_devices(is_active, user_id);

-- Security alerts indexes
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_triggered_at ON security_alerts(triggered_at);

-- Compliance audits indexes
CREATE INDEX idx_compliance_audits_type ON compliance_audits(audit_type);
CREATE INDEX idx_compliance_audits_status ON compliance_audits(status);
CREATE INDEX idx_compliance_audits_scheduled_date ON compliance_audits(scheduled_date);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all security tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_findings ENABLE ROW LEVEL SECURITY;

-- Audit logs policies (admin and security staff only)
CREATE POLICY "audit_logs_admin_access" ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer')
            AND cs.status = 'active'
        )
    );

-- User sessions policies (users can see their own sessions, admins see all)
CREATE POLICY "user_sessions_own_access" ON user_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer')
            AND cs.status = 'active'
        )
    );

-- MFA devices policies (users can manage their own, admins can assist)
CREATE POLICY "mfa_devices_own_access" ON mfa_devices
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer')
            AND cs.status = 'active'
        )
    );

-- API keys policies (users can manage their own, admins see all)
CREATE POLICY "api_keys_own_access" ON api_keys
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer')
            AND cs.status = 'active'
        )
    );

-- Security events and alerts (security staff and admins only)
CREATE POLICY "security_events_staff_access" ON security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer', 'compliance_officer')
            AND cs.status = 'active'
        )
    );

CREATE POLICY "security_alerts_staff_access" ON security_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer', 'compliance_officer')
            AND cs.status = 'active'
        )
    );

-- Compliance audits (compliance and security staff only)
CREATE POLICY "compliance_audits_staff_access" ON compliance_audits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer', 'compliance_officer', 'quality_manager')
            AND cs.status = 'active'
        )
    );

CREATE POLICY "compliance_findings_staff_access" ON compliance_findings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.role IN ('admin', 'security_officer', 'compliance_officer', 'quality_manager')
            AND cs.status = 'active'
        )
    );

-- =============================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- =============================================

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_compliance_flags TEXT[] DEFAULT '{}',
    p_risk_level TEXT DEFAULT 'low'
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
    v_user_id UUID;
    v_session_id TEXT;
    v_ip_address INET;
    v_user_agent TEXT;
BEGIN
    -- Get current user context
    v_user_id := auth.uid();
    v_session_id := current_setting('app.session_id', true);
    v_ip_address := current_setting('app.ip_address', true)::INET;
    v_user_agent := current_setting('app.user_agent', true);
    
    -- Insert audit log entry
    INSERT INTO audit_logs (
        user_id,
        session_id,
        action,
        resource_type,
        resource_id,
        table_name,
        ip_address,
        user_agent,
        old_values,
        new_values,
        compliance_flags,
        risk_level,
        metadata
    ) VALUES (
        v_user_id,
        v_session_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_table_name,
        v_ip_address,
        v_user_agent,
        p_old_values,
        p_new_values,
        p_compliance_flags,
        p_risk_level,
        jsonb_build_object(
            'timestamp', NOW(),
            'application', 'neonpro',
            'version', '1.0'
        )
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system operations';
COMMENT ON TABLE security_events IS 'Security-related events and incidents';
COMMENT ON TABLE user_sessions IS 'Active user session tracking';
COMMENT ON TABLE auth_attempts IS 'Authentication attempt logging';
COMMENT ON TABLE security_policies IS 'Security policy configurations';
COMMENT ON TABLE api_keys IS 'API key management and tracking';
COMMENT ON TABLE mfa_devices IS 'Multi-factor authentication devices';
COMMENT ON TABLE encryption_keys IS 'Encryption key management';
COMMENT ON TABLE threat_indicators IS 'Threat intelligence indicators';
COMMENT ON TABLE security_alerts IS 'Security alerts and incidents';
COMMENT ON TABLE compliance_audits IS 'Compliance audit tracking';
COMMENT ON TABLE compliance_findings IS 'Compliance audit findings';

-- Mark migration as complete
SELECT 'Security hardening schema created successfully' as result;