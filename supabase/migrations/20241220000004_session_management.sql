-- Session Management System Migration
-- Creates tables for session management, security monitoring, and device tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  security_score INTEGER DEFAULT 100 CHECK (security_score >= 0 AND security_score <= 100),
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  session_data JSONB DEFAULT '{}',
  
  -- Indexes
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- User Devices Table
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN')),
  operating_system TEXT,
  browser TEXT,
  ip_address INET,
  user_agent TEXT,
  trusted BOOLEAN DEFAULT false,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  device_metadata JSONB DEFAULT '{}',
  
  -- Unique constraint for user + device fingerprint
  UNIQUE(user_id, device_fingerprint)
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'SESSION_CREATED', 'SESSION_VALIDATED', 'SESSION_REFRESHED', 
    'SESSION_EXTENDED', 'SESSION_TERMINATED', 'SESSION_EXPIRED',
    'SESSION_VALIDATION_FAILED', 'SUSPICIOUS_ACTIVITY_DETECTED',
    'DEVICE_REGISTERED', 'DEVICE_TRUSTED', 'DEVICE_UNTRUSTED', 'DEVICE_REMOVED',
    'IP_ADDRESS_CHANGED', 'USER_AGENT_CHANGED', 'CONCURRENT_SESSION_LIMIT_EXCEEDED',
    'BULK_SESSION_TERMINATION', 'EMERGENCY_SESSION_TERMINATION'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Session Policies Table
CREATE TABLE IF NOT EXISTS session_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  max_concurrent_sessions INTEGER DEFAULT 5 CHECK (max_concurrent_sessions > 0),
  session_timeout_minutes INTEGER DEFAULT 30 CHECK (session_timeout_minutes > 0),
  require_device_trust BOOLEAN DEFAULT false,
  allow_concurrent_same_device BOOLEAN DEFAULT true,
  ip_restriction_enabled BOOLEAN DEFAULT false,
  allowed_ip_ranges INET[],
  force_logout_on_ip_change BOOLEAN DEFAULT false,
  enable_suspicious_activity_detection BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Unique constraint for user + policy name
  UNIQUE(user_id, policy_name)
);

-- Suspicious Activities Table
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'MULTIPLE_FAILED_VALIDATIONS', 'RAPID_IP_CHANGES', 'UNUSUAL_DEVICE_ACCESS',
    'CONCURRENT_SESSIONS_EXCEEDED', 'SUSPICIOUS_USER_AGENT', 'GEOLOCATION_ANOMALY',
    'TIME_PATTERN_ANOMALY', 'BRUTE_FORCE_ATTEMPT'
  )),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actions_taken JSONB DEFAULT '[]'
);

-- Session Sync Table (for cross-device synchronization)
CREATE TABLE IF NOT EXISTS session_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_key TEXT NOT NULL,
  sync_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Unique constraint for user + sync key
  UNIQUE(user_id, sync_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_trusted ON user_devices(user_id, trusted) WHERE trusted = true;
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(user_id, resolved) WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_type ON suspicious_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_risk ON suspicious_activities(risk_score);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_status ON suspicious_activities(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_detected ON suspicious_activities(detected_at);

CREATE INDEX IF NOT EXISTS idx_session_sync_user_id ON session_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_session_sync_key ON session_sync(sync_key);
CREATE INDEX IF NOT EXISTS idx_session_sync_expires ON session_sync(expires_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_session_policies_updated_at 
    BEFORE UPDATE ON session_policies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_sync_updated_at 
    BEFORE UPDATE ON session_sync 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup event
    INSERT INTO security_events (
        session_id, event_type, severity, description, metadata
    ) VALUES (
        'system-cleanup', 
        'SESSION_EXPIRED', 
        'LOW', 
        'Automatic cleanup of expired sessions',
        jsonb_build_object('expired_sessions_count', deleted_count, 'cleanup_time', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate session health score
CREATE OR REPLACE FUNCTION calculate_session_health_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 100;
    security_events_count INTEGER;
    suspicious_activities_count INTEGER;
    untrusted_devices_count INTEGER;
    recent_failures_count INTEGER;
BEGIN
    -- Count recent security events (last 24 hours)
    SELECT COUNT(*) INTO security_events_count
    FROM security_events 
    WHERE user_id = p_user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND severity IN ('HIGH', 'CRITICAL');
    
    -- Count recent suspicious activities
    SELECT COUNT(*) INTO suspicious_activities_count
    FROM suspicious_activities 
    WHERE user_id = p_user_id 
    AND detected_at > NOW() - INTERVAL '24 hours'
    AND status = 'PENDING';
    
    -- Count untrusted devices
    SELECT COUNT(*) INTO untrusted_devices_count
    FROM user_devices 
    WHERE user_id = p_user_id 
    AND trusted = false 
    AND is_active = true;
    
    -- Count recent validation failures
    SELECT COUNT(*) INTO recent_failures_count
    FROM security_events 
    WHERE user_id = p_user_id 
    AND event_type = 'SESSION_VALIDATION_FAILED'
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Calculate score deductions
    base_score := base_score - (security_events_count * 10);
    base_score := base_score - (suspicious_activities_count * 15);
    base_score := base_score - (untrusted_devices_count * 5);
    base_score := base_score - (recent_failures_count * 20);
    
    -- Ensure score is within bounds
    IF base_score < 0 THEN
        base_score := 0;
    END IF;
    
    RETURN base_score;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_sync ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own devices
CREATE POLICY "Users can view own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON user_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON user_devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON user_devices
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own security events
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert security events" ON security_events
    FOR INSERT WITH CHECK (true); -- Allow service to insert events

-- Users can only access their own session policies
CREATE POLICY "Users can view own session policies" ON session_policies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session policies" ON session_policies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session policies" ON session_policies
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own suspicious activities
CREATE POLICY "Users can view own suspicious activities" ON suspicious_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert suspicious activities" ON suspicious_activities
    FOR INSERT WITH CHECK (true); -- Allow service to insert activities

-- Users can only access their own session sync data
CREATE POLICY "Users can view own session sync" ON session_sync
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session sync" ON session_sync
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session sync" ON session_sync
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own session sync" ON session_sync
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a view for session analytics
CREATE OR REPLACE VIEW session_analytics AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.is_active THEN s.id END) as active_sessions,
    COUNT(DISTINCT d.id) as total_devices,
    COUNT(DISTINCT CASE WHEN d.trusted THEN d.id END) as trusted_devices,
    COUNT(DISTINCT se.id) as security_events,
    COUNT(DISTINCT sa.id) as suspicious_activities,
    AVG(s.security_score) as avg_security_score,
    MAX(s.last_activity) as last_activity
FROM auth.users u
LEFT JOIN user_sessions s ON u.id = s.user_id
LEFT JOIN user_devices d ON u.id = d.user_id
LEFT JOIN security_events se ON u.id = se.user_id AND se.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN suspicious_activities sa ON u.id = sa.user_id AND sa.detected_at > NOW() - INTERVAL '30 days'
GROUP BY u.id;

-- Grant access to the view
GRANT SELECT ON session_analytics TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view own analytics" ON session_analytics
    FOR SELECT USING (auth.uid() = user_id);