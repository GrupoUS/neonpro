-- Session Security Tables for NeonPro
-- Creates all necessary tables for comprehensive session security

-- CSRF Tokens Table
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  session_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for CSRF tokens
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_session_id ON csrf_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token_hash ON csrf_tokens(token_hash);

-- Session Fingerprints Table
CREATE TABLE IF NOT EXISTS session_fingerprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_hash VARCHAR(64) NOT NULL,
  fingerprint_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for session fingerprints
CREATE INDEX IF NOT EXISTS idx_session_fingerprints_user_id ON session_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_session_fingerprints_session_id ON session_fingerprints(session_id);
CREATE INDEX IF NOT EXISTS idx_session_fingerprints_last_seen ON session_fingerprints(last_seen);
CREATE INDEX IF NOT EXISTS idx_session_fingerprints_fingerprint_hash ON session_fingerprints(fingerprint_hash);

-- Session Timeouts Table
CREATE TABLE IF NOT EXISTS session_timeouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timeout_at TIMESTAMP WITH TIME ZONE NOT NULL,
  warnings_sent INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for session timeouts
CREATE INDEX IF NOT EXISTS idx_session_timeouts_user_id ON session_timeouts(user_id);
CREATE INDEX IF NOT EXISTS idx_session_timeouts_session_id ON session_timeouts(session_id);
CREATE INDEX IF NOT EXISTS idx_session_timeouts_timeout_at ON session_timeouts(timeout_at);
CREATE INDEX IF NOT EXISTS idx_session_timeouts_is_active ON session_timeouts(is_active);
CREATE INDEX IF NOT EXISTS idx_session_timeouts_last_activity ON session_timeouts(last_activity);

-- Session Activities Table
CREATE TABLE IF NOT EXISTS session_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'page_view', 'api_call', 'form_interaction', 'mouse_move', 'keyboard'
  )),
  path TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for session activities
CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_user_id ON session_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_timestamp ON session_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_session_activities_activity_type ON session_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_session_activities_is_sensitive ON session_activities(is_sensitive);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'login', 'suspicious_activity', 'hijack_attempt', 'concurrent_session',
    'csrf_violation', 'rate_limit_exceeded', 'session_timeout'
  )),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 10),
  fingerprint_data JSONB,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Session Security Configs Table
CREATE TABLE IF NOT EXISTS session_security_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for session security configs
CREATE INDEX IF NOT EXISTS idx_session_security_configs_session_id ON session_security_configs(session_id);

-- Rate Limiting Table (if not exists)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP, user_id, or combination
  endpoint VARCHAR(255) NOT NULL,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for rate limiting
  UNIQUE(identifier, endpoint, window_start)
);

-- Create indexes for rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON rate_limits(window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until);

-- Trusted IPs Table
CREATE TABLE IF NOT EXISTS trusted_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  description TEXT,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trusted IPs
CREATE INDEX IF NOT EXISTS idx_trusted_ips_ip_address ON trusted_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_trusted_ips_is_active ON trusted_ips(is_active);
CREATE INDEX IF NOT EXISTS idx_trusted_ips_expires_at ON trusted_ips(expires_at);

-- Session Blacklist Table
CREATE TABLE IF NOT EXISTS session_blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for session blacklist
CREATE INDEX IF NOT EXISTS idx_session_blacklist_session_id ON session_blacklist(session_id);
CREATE INDEX IF NOT EXISTS idx_session_blacklist_user_id ON session_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_session_blacklist_is_active ON session_blacklist(is_active);
CREATE INDEX IF NOT EXISTS idx_session_blacklist_expires_at ON session_blacklist(expires_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_timeouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_security_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_blacklist ENABLE ROW LEVEL SECURITY;

-- CSRF Tokens Policies
CREATE POLICY "Users can manage their own CSRF tokens" ON csrf_tokens
  FOR ALL USING (session_id IN (
    SELECT session_id FROM session_fingerprints WHERE user_id = auth.uid()
  ));

-- Session Fingerprints Policies
CREATE POLICY "Users can view their own session fingerprints" ON session_fingerprints
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage session fingerprints" ON session_fingerprints
  FOR ALL USING (true); -- Service role access

-- Session Timeouts Policies
CREATE POLICY "Users can view their own session timeouts" ON session_timeouts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage session timeouts" ON session_timeouts
  FOR ALL USING (true); -- Service role access

-- Session Activities Policies
CREATE POLICY "Users can view their own session activities" ON session_activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert session activities" ON session_activities
  FOR INSERT WITH CHECK (true); -- Service role access

-- Security Events Policies
CREATE POLICY "Admins can view all security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'security_admin')
    )
  );

CREATE POLICY "Users can view their own security events" ON security_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert security events" ON security_events
  FOR INSERT WITH CHECK (true); -- Service role access

-- Session Security Configs Policies
CREATE POLICY "System can manage security configs" ON session_security_configs
  FOR ALL USING (true); -- Service role access

-- Rate Limits Policies
CREATE POLICY "System can manage rate limits" ON rate_limits
  FOR ALL USING (true); -- Service role access

-- Trusted IPs Policies
CREATE POLICY "Admins can manage trusted IPs" ON trusted_ips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'security_admin')
    )
  );

-- Session Blacklist Policies
CREATE POLICY "Admins can manage session blacklist" ON session_blacklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'security_admin')
    )
  );

CREATE POLICY "Users can view their own blacklist status" ON session_blacklist
  FOR SELECT USING (user_id = auth.uid());

-- Functions for cleanup and maintenance

-- Function to cleanup expired CSRF tokens
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM csrf_tokens WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old session activities
CREATE OR REPLACE FUNCTION cleanup_old_session_activities(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM session_activities 
  WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_events 
  WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user session security summary
CREATE OR REPLACE FUNCTION get_user_session_security_summary(target_user_id UUID)
RETURNS TABLE (
  active_sessions INTEGER,
  recent_security_events INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM session_fingerprints 
     WHERE user_id = target_user_id 
     AND last_seen > NOW() - INTERVAL '24 hours') as active_sessions,
    (SELECT COUNT(*)::INTEGER FROM security_events 
     WHERE user_id = target_user_id 
     AND timestamp > NOW() - INTERVAL '7 days') as recent_security_events,
    (SELECT MAX(last_seen) FROM session_fingerprints 
     WHERE user_id = target_user_id) as last_activity,
    (SELECT COALESCE(MAX(risk_score), 0)::INTEGER FROM security_events 
     WHERE user_id = target_user_id 
     AND timestamp > NOW() - INTERVAL '24 hours') as risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic cleanup

-- Trigger to automatically cleanup expired rate limits
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_end < NOW() - INTERVAL '1 hour';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON rate_limits
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_expired_rate_limits();

-- Comments for documentation
COMMENT ON TABLE csrf_tokens IS 'Stores CSRF tokens for request validation';
COMMENT ON TABLE session_fingerprints IS 'Stores session fingerprints for hijacking detection';
COMMENT ON TABLE session_timeouts IS 'Manages session timeout configurations and states';
COMMENT ON TABLE session_activities IS 'Logs user session activities for security monitoring';
COMMENT ON TABLE security_events IS 'Logs security-related events and incidents';
COMMENT ON TABLE session_security_configs IS 'Stores per-session security configurations';
COMMENT ON TABLE rate_limits IS 'Tracks rate limiting for endpoints and users';
COMMENT ON TABLE trusted_ips IS 'Manages trusted IP addresses that bypass certain security checks';
COMMENT ON TABLE session_blacklist IS 'Manages blocked sessions and users';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION get_user_session_security_summary TO authenticated;