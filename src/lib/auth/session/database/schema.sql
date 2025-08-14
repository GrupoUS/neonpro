-- ============================================================================
-- Session Management System - Database Schema
-- NeonPro - Session Management & Security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Session status enum
CREATE TYPE session_status AS ENUM (
  'active',
  'expired',
  'terminated',
  'suspended'
);

-- Device type enum
CREATE TYPE device_type_enum AS ENUM (
  'desktop',
  'mobile',
  'tablet',
  'unknown'
);

-- Verification method enum
CREATE TYPE verification_method_enum AS ENUM (
  'email',
  'sms',
  'admin',
  'biometric',
  'totp'
);

-- Audit event type enum
CREATE TYPE audit_event_type AS ENUM (
  'session',
  'security',
  'device',
  'lgpd',
  'system'
);

-- Audit severity enum
CREATE TYPE audit_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Threat level enum
CREATE TYPE threat_level_enum AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Security event type enum
CREATE TYPE security_event_type AS ENUM (
  'suspicious_login',
  'multiple_failed_attempts',
  'unusual_location',
  'device_fingerprint_change',
  'session_hijacking',
  'privilege_escalation',
  'data_breach_attempt',
  'malicious_activity'
);

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  
  -- Session metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Device and location info
  device_fingerprint JSONB NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  location JSONB,
  
  -- Session state
  status session_status NOT NULL DEFAULT 'active',
  termination_reason TEXT,
  
  -- Security flags
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  security_score INTEGER NOT NULL DEFAULT 100,
  
  -- LGPD compliance
  consent_version TEXT,
  data_processing_purposes TEXT[],
  
  -- Constraints
  CONSTRAINT valid_expires_at CHECK (expires_at > created_at),
  CONSTRAINT valid_security_score CHECK (security_score >= 0 AND security_score <= 100)
);

-- ============================================================================
-- DEVICE REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  
  -- Device identification
  device_fingerprint JSONB NOT NULL,
  device_name TEXT,
  device_type device_type_enum NOT NULL DEFAULT 'unknown',
  
  -- Registration info
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registration_ip INET NOT NULL,
  registration_user_agent TEXT NOT NULL,
  
  -- Trust and security
  is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  trust_level INTEGER NOT NULL DEFAULT 0,
  verification_method verification_method_enum,
  verified_at TIMESTAMPTZ,
  
  -- Usage statistics
  session_count INTEGER NOT NULL DEFAULT 0,
  last_location JSONB,
  
  -- Security events
  security_events_count INTEGER NOT NULL DEFAULT 0,
  last_security_event_at TIMESTAMPTZ,
  
  -- LGPD compliance
  consent_given_at TIMESTAMPTZ,
  data_retention_until TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_trust_level CHECK (trust_level >= 0 AND trust_level <= 100),
  CONSTRAINT valid_session_count CHECK (session_count >= 0),
  CONSTRAINT unique_device_per_user UNIQUE (user_id, device_fingerprint)
);

-- ============================================================================
-- SESSION AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event identification
  event_type audit_event_type NOT NULL,
  action TEXT NOT NULL,
  
  -- Context
  session_id UUID,
  user_id UUID,
  clinic_id UUID NOT NULL,
  
  -- Event details
  severity audit_severity NOT NULL DEFAULT 'low',
  threat_level threat_level_enum,
  details JSONB NOT NULL DEFAULT '{}',
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  device_fingerprint JSONB,
  location JSONB,
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- LGPD compliance
  contains_personal_data BOOLEAN NOT NULL DEFAULT FALSE,
  data_subject_id UUID,
  legal_basis TEXT,
  retention_until TIMESTAMPTZ,
  
  -- Indexing hints
  search_vector TSVECTOR
);

-- ============================================================================
-- SECURITY EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event identification
  event_type security_event_type NOT NULL,
  threat_level threat_level_enum NOT NULL,
  
  -- Context
  session_id UUID,
  user_id UUID,
  clinic_id UUID,
  device_id UUID,
  
  -- Event details
  description TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL DEFAULT 0,
  
  -- Source information
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  
  -- Response
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  -- Timing
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- ============================================================================
-- IP BLACKLIST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ip_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- IP information
  ip_address INET NOT NULL UNIQUE,
  ip_range CIDR,
  
  -- Blocking details
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_by UUID,
  expires_at TIMESTAMPTZ,
  
  -- Statistics
  block_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SESSION POLICIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Policy identification
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Scope
  clinic_id UUID, -- NULL means global policy
  user_role TEXT,
  
  -- Policy configuration
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_priority CHECK (priority >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_clinic_id ON user_sessions(clinic_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at);
CREATE INDEX idx_user_sessions_ip ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_device_fp ON user_sessions USING GIN(device_fingerprint);
CREATE INDEX idx_user_sessions_suspicious ON user_sessions(is_suspicious) WHERE is_suspicious = TRUE;

-- Device Registrations indexes
CREATE INDEX idx_device_registrations_user_id ON device_registrations(user_id);
CREATE INDEX idx_device_registrations_clinic_id ON device_registrations(clinic_id);
CREATE INDEX idx_device_registrations_fingerprint ON device_registrations USING GIN(device_fingerprint);
CREATE INDEX idx_device_registrations_trusted ON device_registrations(is_trusted);
CREATE INDEX idx_device_registrations_blocked ON device_registrations(is_blocked);
CREATE INDEX idx_device_registrations_last_seen ON device_registrations(last_seen_at);
CREATE INDEX idx_device_registrations_trust_level ON device_registrations(trust_level);

-- Session Audit Logs indexes
CREATE INDEX idx_session_audit_logs_event_type ON session_audit_logs(event_type);
CREATE INDEX idx_session_audit_logs_session_id ON session_audit_logs(session_id);
CREATE INDEX idx_session_audit_logs_user_id ON session_audit_logs(user_id);
CREATE INDEX idx_session_audit_logs_clinic_id ON session_audit_logs(clinic_id);
CREATE INDEX idx_session_audit_logs_severity ON session_audit_logs(severity);
CREATE INDEX idx_session_audit_logs_created_at ON session_audit_logs(created_at);
CREATE INDEX idx_session_audit_logs_ip ON session_audit_logs(ip_address);
CREATE INDEX idx_session_audit_logs_search ON session_audit_logs USING GIN(search_vector);
CREATE INDEX idx_session_audit_logs_details ON session_audit_logs USING GIN(details);
CREATE INDEX idx_session_audit_logs_retention ON session_audit_logs(retention_until) WHERE retention_until IS NOT NULL;

-- Security Events indexes
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_threat_level ON security_events(threat_level);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_clinic_id ON security_events(clinic_id);
CREATE INDEX idx_security_events_session_id ON security_events(session_id);
CREATE INDEX idx_security_events_detected_at ON security_events(detected_at);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_resolved ON security_events(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_security_events_risk_score ON security_events(risk_score);

-- IP Blacklist indexes
CREATE INDEX idx_ip_blacklist_ip ON ip_blacklist(ip_address);
CREATE INDEX idx_ip_blacklist_range ON ip_blacklist USING GIST(ip_range) WHERE ip_range IS NOT NULL;
CREATE INDEX idx_ip_blacklist_expires ON ip_blacklist(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_ip_blacklist_active ON ip_blacklist(blocked_at, expires_at) WHERE expires_at IS NULL OR expires_at > NOW();

-- Session Policies indexes
CREATE INDEX idx_session_policies_clinic_id ON session_policies(clinic_id);
CREATE INDEX idx_session_policies_active ON session_policies(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_session_policies_priority ON session_policies(priority);
CREATE INDEX idx_session_policies_effective ON session_policies(effective_from, effective_until);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_registrations_updated_at
  BEFORE UPDATE ON device_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ip_blacklist_updated_at
  BEFORE UPDATE ON ip_blacklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_policies_updated_at
  BEFORE UPDATE ON session_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Search vector update trigger for audit logs
CREATE OR REPLACE FUNCTION update_audit_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese', 
    COALESCE(NEW.action, '') || ' ' ||
    COALESCE(NEW.details::text, '') || ' ' ||
    COALESCE(NEW.user_agent, '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_audit_logs_search_vector
  BEFORE INSERT OR UPDATE ON session_audit_logs
  FOR EACH ROW EXECUTE FUNCTION update_audit_search_vector();

-- Session activity update trigger
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at when session is accessed
  IF TG_OP = 'UPDATE' AND OLD.last_activity_at != NEW.last_activity_at THEN
    -- Update device last_seen_at
    UPDATE device_registrations 
    SET 
      last_seen_at = NEW.last_activity_at,
      session_count = session_count + 1
    WHERE device_fingerprint = NEW.device_fingerprint 
      AND user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_activity
  AFTER UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_policies ENABLE ROW LEVEL SECURITY;

-- User Sessions RLS Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage all sessions" ON user_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Clinic admins can view clinic sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
        AND cu.clinic_id = user_sessions.clinic_id
        AND cu.role IN ('admin', 'owner')
    )
  );

-- Device Registrations RLS Policies
CREATE POLICY "Users can view their own devices" ON device_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON device_registrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage all devices" ON device_registrations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Session Audit Logs RLS Policies
CREATE POLICY "Users can view their own audit logs" ON session_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all audit logs" ON session_audit_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Clinic admins can view clinic audit logs" ON session_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
        AND cu.clinic_id = session_audit_logs.clinic_id
        AND cu.role IN ('admin', 'owner')
    )
  );

-- Security Events RLS Policies
CREATE POLICY "System can manage all security events" ON security_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Clinic admins can view clinic security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
        AND cu.clinic_id = security_events.clinic_id
        AND cu.role IN ('admin', 'owner')
    )
  );

-- IP Blacklist RLS Policies
CREATE POLICY "System can manage IP blacklist" ON ip_blacklist
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view IP blacklist" ON ip_blacklist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = 'admin'
    )
  );

-- Session Policies RLS Policies
CREATE POLICY "System can manage session policies" ON session_policies
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Clinic admins can view clinic policies" ON session_policies
  FOR SELECT USING (
    clinic_id IS NULL OR
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
        AND cu.clinic_id = session_policies.clinic_id
        AND cu.role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Update expired sessions
  UPDATE user_sessions 
  SET 
    status = 'expired',
    termination_reason = 'expired'
  WHERE status = 'active' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_statistics(clinic_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_sessions', (
      SELECT COUNT(*) FROM user_sessions 
      WHERE status = 'active' 
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    ),
    'total_users', (
      SELECT COUNT(DISTINCT user_id) FROM user_sessions 
      WHERE clinic_id_param IS NULL OR clinic_id = clinic_id_param
    ),
    'sessions_today', (
      SELECT COUNT(*) FROM user_sessions 
      WHERE created_at >= CURRENT_DATE 
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    ),
    'avg_session_duration', (
      SELECT EXTRACT(EPOCH FROM AVG(COALESCE(updated_at, NOW()) - created_at))
      FROM user_sessions 
      WHERE status != 'active'
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    ),
    'suspicious_sessions', (
      SELECT COUNT(*) FROM user_sessions 
      WHERE is_suspicious = TRUE 
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if IP is blacklisted
CREATE OR REPLACE FUNCTION is_ip_blacklisted(ip_to_check INET)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ip_blacklist 
    WHERE (
      ip_address = ip_to_check OR 
      (ip_range IS NOT NULL AND ip_to_check <<= ip_range)
    )
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get device statistics
CREATE OR REPLACE FUNCTION get_device_statistics(clinic_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_devices', (
      SELECT COUNT(*) FROM device_registrations 
      WHERE clinic_id_param IS NULL OR clinic_id = clinic_id_param
    ),
    'trusted_devices', (
      SELECT COUNT(*) FROM device_registrations 
      WHERE is_trusted = TRUE 
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    ),
    'blocked_devices', (
      SELECT COUNT(*) FROM device_registrations 
      WHERE is_blocked = TRUE 
        AND (clinic_id_param IS NULL OR clinic_id = clinic_id_param)
    ),
    'devices_by_type', (
      SELECT json_object_agg(device_type, count) 
      FROM (
        SELECT device_type, COUNT(*) as count 
        FROM device_registrations 
        WHERE clinic_id_param IS NULL OR clinic_id = clinic_id_param
        GROUP BY device_type
      ) t
    ),
    'avg_trust_level', (
      SELECT AVG(trust_level) FROM device_registrations 
      WHERE clinic_id_param IS NULL OR clinic_id = clinic_id_param
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default session policies
INSERT INTO session_policies (name, description, config, created_by) VALUES
(
  'default_session_policy',
  'Default session management policy',
  '{
    "sessionTimeout": 1800000,
    "renewalThreshold": 0.25,
    "maxConcurrentSessions": 3,
    "requireDeviceVerification": false,
    "enableLocationTracking": true
  }',
  '00000000-0000-0000-0000-000000000000'
),
(
  'high_security_policy',
  'High security session policy for sensitive operations',
  '{
    "sessionTimeout": 900000,
    "renewalThreshold": 0.5,
    "maxConcurrentSessions": 1,
    "requireDeviceVerification": true,
    "enableLocationTracking": true,
    "requireTrustedDevice": true
  }',
  '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_sessions IS 'Stores active user sessions with security metadata';
COMMENT ON TABLE device_registrations IS 'Tracks registered devices and their trust levels';
COMMENT ON TABLE session_audit_logs IS 'Comprehensive audit trail for session activities';
COMMENT ON TABLE security_events IS 'Security events and threat detection logs';
COMMENT ON TABLE ip_blacklist IS 'Blocked IP addresses and ranges';
COMMENT ON TABLE session_policies IS 'Configurable session management policies';

COMMENT ON COLUMN user_sessions.security_score IS 'Security score from 0-100, lower means more suspicious';
COMMENT ON COLUMN device_registrations.trust_level IS 'Device trust level from 0-100';
COMMENT ON COLUMN security_events.risk_score IS 'Risk assessment score from 0-100';
