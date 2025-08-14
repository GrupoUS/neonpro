-- ============================================================================
-- Session Management & Security Migration
-- Story 1.4: Session Management & Security
-- 
-- Creates tables and policies for comprehensive session management,
-- security monitoring, and device tracking with LGPD compliance.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SESSION DEVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT,
    device_type TEXT NOT NULL,
    os TEXT,
    browser TEXT,
    fingerprint TEXT NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'suspicious')),
    trust_level TEXT NOT NULL DEFAULT 'unknown' CHECK (trust_level IN ('trusted', 'unknown', 'suspicious')),
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session_devices
CREATE INDEX idx_session_devices_user_id ON session_devices(user_id);
CREATE INDEX idx_session_devices_fingerprint ON session_devices(fingerprint);
CREATE INDEX idx_session_devices_ip_address ON session_devices(ip_address);
CREATE INDEX idx_session_devices_status ON session_devices(status);
CREATE INDEX idx_session_devices_trust_level ON session_devices(trust_level);
CREATE INDEX idx_session_devices_last_seen ON session_devices(last_seen);

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES session_devices(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activity_count INTEGER NOT NULL DEFAULT 0,
    security_flags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_device_id ON user_sessions(device_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);

-- ============================================================================
-- SESSION SECURITY EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    device_id UUID REFERENCES session_devices(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'unusual_location',
        'device_change',
        'rapid_requests',
        'session_hijack_attempt',
        'suspicious_user_agent',
        'concurrent_session_limit',
        'failed_authentication',
        'privilege_escalation'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    details JSONB DEFAULT '{}',
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session_security_events
CREATE INDEX idx_session_security_events_user_id ON session_security_events(user_id);
CREATE INDEX idx_session_security_events_session_id ON session_security_events(session_id);
CREATE INDEX idx_session_security_events_device_id ON session_security_events(device_id);
CREATE INDEX idx_session_security_events_event_type ON session_security_events(event_type);
CREATE INDEX idx_session_security_events_severity ON session_security_events(severity);
CREATE INDEX idx_session_security_events_resolved ON session_security_events(resolved);
CREATE INDEX idx_session_security_events_timestamp ON session_security_events(timestamp);
CREATE INDEX idx_session_security_events_ip_address ON session_security_events(ip_address);

-- ============================================================================
-- SESSION AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    device_id UUID REFERENCES session_devices(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    details JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session_audit_log
CREATE INDEX idx_session_audit_log_user_id ON session_audit_log(user_id);
CREATE INDEX idx_session_audit_log_session_id ON session_audit_log(session_id);
CREATE INDEX idx_session_audit_log_device_id ON session_audit_log(device_id);
CREATE INDEX idx_session_audit_log_action ON session_audit_log(action);
CREATE INDEX idx_session_audit_log_timestamp ON session_audit_log(timestamp);
CREATE INDEX idx_session_audit_log_success ON session_audit_log(success);

-- ============================================================================
-- SESSION POLICIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'session_timeout',
        'concurrent_sessions',
        'device_trust',
        'location_restriction',
        'security_monitoring'
    )),
    rules JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session_policies
CREATE INDEX idx_session_policies_policy_type ON session_policies(policy_type);
CREATE INDEX idx_session_policies_is_active ON session_policies(is_active);
CREATE INDEX idx_session_policies_priority ON session_policies(priority);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_session_devices_updated_at
    BEFORE UPDATE ON session_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_policies_updated_at
    BEFORE UPDATE ON session_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE session_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_policies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SESSION DEVICES POLICIES
-- ============================================================================

-- Users can view their own devices
CREATE POLICY "Users can view own devices" ON session_devices
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own devices
CREATE POLICY "Users can insert own devices" ON session_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users can update own devices" ON session_devices
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all devices
CREATE POLICY "Admins can view all devices" ON session_devices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage all devices
CREATE POLICY "Admins can manage all devices" ON session_devices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- USER SESSIONS POLICIES
-- ============================================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- SECURITY EVENTS POLICIES
-- ============================================================================

-- Users can view their own security events
CREATE POLICY "Users can view own security events" ON session_security_events
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert security events
CREATE POLICY "System can insert security events" ON session_security_events
    FOR INSERT WITH CHECK (true);

-- Admins can view all security events
CREATE POLICY "Admins can view all security events" ON session_security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage all security events
CREATE POLICY "Admins can manage all security events" ON session_security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- AUDIT LOG POLICIES
-- ============================================================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON session_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON session_audit_log
    FOR INSERT WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON session_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- SESSION POLICIES POLICIES
-- ============================================================================

-- Only admins can manage session policies
CREATE POLICY "Only admins can manage session policies" ON session_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- FUNCTIONS FOR SESSION MANAGEMENT
-- ============================================================================

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR (is_active = false AND updated_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO session_audit_log (user_id, action, details, timestamp)
    VALUES (
        NULL,
        'session_cleanup',
        jsonb_build_object('deleted_sessions', deleted_count),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_user_id UUID,
    p_ip_address INET,
    p_user_agent TEXT,
    p_location JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    recent_ips INTEGER;
    recent_locations INTEGER;
    rapid_requests INTEGER;
    suspicious BOOLEAN := false;
BEGIN
    -- Check for multiple IP addresses in short time
    SELECT COUNT(DISTINCT ip_address) INTO recent_ips
    FROM user_sessions
    WHERE user_id = p_user_id
    AND last_activity > NOW() - INTERVAL '1 hour';
    
    -- Check for multiple locations in short time
    IF p_location IS NOT NULL THEN
        SELECT COUNT(DISTINCT location->>'country') INTO recent_locations
        FROM user_sessions
        WHERE user_id = p_user_id
        AND last_activity > NOW() - INTERVAL '1 hour'
        AND location IS NOT NULL;
    END IF;
    
    -- Check for rapid requests from same IP
    SELECT COUNT(*) INTO rapid_requests
    FROM session_audit_log
    WHERE ip_address = p_ip_address
    AND timestamp > NOW() - INTERVAL '5 minutes';
    
    -- Determine if activity is suspicious
    IF recent_ips > 3 OR recent_locations > 2 OR rapid_requests > 100 THEN
        suspicious := true;
        
        -- Log security event
        INSERT INTO session_security_events (
            user_id,
            event_type,
            severity,
            ip_address,
            user_agent,
            location,
            details
        ) VALUES (
            p_user_id,
            CASE 
                WHEN recent_ips > 3 THEN 'rapid_requests'
                WHEN recent_locations > 2 THEN 'unusual_location'
                ELSE 'suspicious_user_agent'
            END,
            'high',
            p_ip_address,
            p_user_agent,
            p_location,
            jsonb_build_object(
                'recent_ips', recent_ips,
                'recent_locations', recent_locations,
                'rapid_requests', rapid_requests
            )
        );
    END IF;
    
    RETURN suspicious;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT SESSION POLICIES
-- ============================================================================

-- Insert default session policies
INSERT INTO session_policies (name, description, policy_type, rules, priority) VALUES
(
    'Default Session Timeout',
    'Default session timeout policy for all users',
    'session_timeout',
    '{
        "idle_timeout": 1800,
        "max_session_duration": 28800,
        "extend_on_activity": true
    }',
    100
),
(
    'Concurrent Session Limit',
    'Limit number of concurrent sessions per user',
    'concurrent_sessions',
    '{
        "max_sessions": 5,
        "terminate_oldest": true,
        "notify_user": true
    }',
    200
),
(
    'Device Trust Policy',
    'Policy for managing device trust levels',
    'device_trust',
    '{
        "auto_trust_duration": 2592000,
        "require_verification": true,
        "trust_on_successful_auth": false
    }',
    300
),
(
    'Security Monitoring',
    'Real-time security monitoring and alerting',
    'security_monitoring',
    '{
        "monitor_location_changes": true,
        "monitor_device_changes": true,
        "monitor_rapid_requests": true,
        "alert_threshold": "medium"
    }',
    400
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE session_devices IS 'Stores information about user devices for session management and security';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions with security metadata';
COMMENT ON TABLE session_security_events IS 'Logs security events and suspicious activities';
COMMENT ON TABLE session_audit_log IS 'Comprehensive audit trail for all session-related activities';
COMMENT ON TABLE session_policies IS 'Configurable policies for session management and security';

COMMENT ON FUNCTION clean_expired_sessions() IS 'Cleans up expired and inactive sessions';
COMMENT ON FUNCTION detect_suspicious_activity(UUID, INET, TEXT, JSONB) IS 'Detects and logs suspicious user activity';
