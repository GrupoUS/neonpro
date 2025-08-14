-- =====================================================
-- Session Management System Database Schema
-- Story 1.4: Session Management & Security
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff', 'patient');

-- Security levels enum
CREATE TYPE security_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Session activity types enum
CREATE TYPE session_activity_type AS ENUM (
  'page_view',
  'api_call', 
  'user_action',
  'idle',
  'warning_shown'
);

-- Security event types enum
CREATE TYPE security_event_type AS ENUM (
  'suspicious_login',
  'unusual_location',
  'rapid_requests',
  'session_hijack_attempt',
  'concurrent_limit_exceeded',
  'security_violation',
  'device_registration',
  'mfa_bypass_attempt'
);

-- Event severity enum
CREATE TYPE event_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- TABLES
-- =====================================================

-- Session policies configuration table
CREATE TABLE session_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL UNIQUE,
  timeout_minutes INTEGER NOT NULL DEFAULT 30 CHECK (timeout_minutes >= 5 AND timeout_minutes <= 480),
  max_sessions INTEGER NOT NULL DEFAULT 1 CHECK (max_sessions >= 1 AND max_sessions <= 10),
  security_level security_level NOT NULL DEFAULT 'medium',
  require_mfa BOOLEAN NOT NULL DEFAULT false,
  allow_cross_device BOOLEAN NOT NULL DEFAULT false,
  warning_minutes INTEGER[] NOT NULL DEFAULT '{5,1}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Device registrations table
CREATE TABLE device_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  browser_info JSONB,
  trusted BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, device_fingerprint)
);

-- User sessions table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  location JSONB, -- {country, city, timezone, lat, lng}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  security_score INTEGER NOT NULL DEFAULT 100 CHECK (security_score >= 0 AND security_score <= 100),
  metadata JSONB, -- Additional session data
  expired_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session activities table
CREATE TABLE session_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  activity_type session_activity_type NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB, -- Activity-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session security events table
CREATE TABLE session_security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type security_event_type NOT NULL,
  severity event_severity NOT NULL DEFAULT 'medium',
  details JSONB NOT NULL, -- Event-specific data
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session audit logs table
CREATE TABLE session_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session notifications table
CREATE TABLE session_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'warning', 'expiry', 'security_alert'
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Session indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_device_fingerprint ON user_sessions(device_fingerprint);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);

-- Device registration indexes
CREATE INDEX idx_device_registrations_user_id ON device_registrations(user_id);
CREATE INDEX idx_device_registrations_fingerprint ON device_registrations(device_fingerprint);
CREATE INDEX idx_device_registrations_trusted ON device_registrations(trusted);

-- Activity indexes
CREATE INDEX idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX idx_session_activities_timestamp ON session_activities(timestamp);
CREATE INDEX idx_session_activities_type ON session_activities(activity_type);

-- Security event indexes
CREATE INDEX idx_session_security_events_session_id ON session_security_events(session_id);
CREATE INDEX idx_session_security_events_user_id ON session_security_events(user_id);
CREATE INDEX idx_session_security_events_type ON session_security_events(event_type);
CREATE INDEX idx_session_security_events_severity ON session_security_events(severity);
CREATE INDEX idx_session_security_events_timestamp ON session_security_events(timestamp);
CREATE INDEX idx_session_security_events_resolved ON session_security_events(resolved);

-- Audit log indexes
CREATE INDEX idx_session_audit_logs_session_id ON session_audit_logs(session_id);
CREATE INDEX idx_session_audit_logs_user_id ON session_audit_logs(user_id);
CREATE INDEX idx_session_audit_logs_timestamp ON session_audit_logs(timestamp);
CREATE INDEX idx_session_audit_logs_action ON session_audit_logs(action);

-- =====================================================
-- VIEWS
-- =====================================================

-- Active sessions summary view
CREATE VIEW active_sessions_summary AS
SELECT 
  us.id,
  us.user_id,
  p.email,
  p.full_name,
  us.device_fingerprint,
  us.ip_address,
  us.location,
  us.created_at,
  us.last_activity,
  us.expires_at,
  us.security_score,
  dr.device_name,
  dr.trusted as device_trusted,
  EXTRACT(EPOCH FROM (us.expires_at - NOW())) / 60 as minutes_until_expiry
FROM user_sessions us
JOIN auth.users au ON us.user_id = au.id
JOIN profiles p ON us.user_id = p.id
LEFT JOIN device_registrations dr ON us.user_id = dr.user_id AND us.device_fingerprint = dr.device_fingerprint
WHERE us.is_active = true
  AND us.expires_at > NOW();

-- Session security dashboard view
CREATE VIEW session_security_dashboard AS
SELECT 
  DATE_TRUNC('hour', sse.timestamp) as hour,
  sse.event_type,
  sse.severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT sse.user_id) as affected_users,
  COUNT(DISTINCT sse.session_id) as affected_sessions
FROM session_security_events sse
WHERE sse.timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', sse.timestamp), sse.event_type, sse.severity
ORDER BY hour DESC, event_count DESC;

-- User session statistics view
CREATE VIEW user_session_statistics AS
SELECT 
  us.user_id,
  p.email,
  p.full_name,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE us.is_active = true) as active_sessions,
  AVG(us.security_score) as avg_security_score,
  MAX(us.last_activity) as last_activity,
  COUNT(DISTINCT us.device_fingerprint) as unique_devices,
  COUNT(DISTINCT us.ip_address) as unique_ips
FROM user_sessions us
JOIN profiles p ON us.user_id = p.id
WHERE us.created_at >= NOW() - INTERVAL '30 days'
GROUP BY us.user_id, p.email, p.full_name;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get session timeout for user role
CREATE OR REPLACE FUNCTION get_session_timeout_minutes(user_role_param user_role)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT timeout_minutes 
    FROM session_policies 
    WHERE role = user_role_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check concurrent session limits
CREATE OR REPLACE FUNCTION check_concurrent_session_limit(
  user_id_param UUID,
  user_role_param user_role
) RETURNS BOOLEAN AS $$
DECLARE
  active_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current active session count
  SELECT COUNT(*) INTO active_count
  FROM user_sessions
  WHERE user_id = user_id_param
    AND is_active = true
    AND expires_at > NOW();
  
  -- Get max allowed sessions for role
  SELECT max_sessions INTO max_allowed
  FROM session_policies
  WHERE role = user_role_param;
  
  RETURN active_count < COALESCE(max_allowed, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to terminate oldest sessions when limit exceeded
CREATE OR REPLACE FUNCTION enforce_session_limits(
  user_id_param UUID,
  user_role_param user_role
) RETURNS INTEGER AS $$
DECLARE
  max_allowed INTEGER;
  sessions_to_terminate UUID[];
  terminated_count INTEGER := 0;
BEGIN
  -- Get max allowed sessions for role
  SELECT max_sessions INTO max_allowed
  FROM session_policies
  WHERE role = user_role_param;
  
  -- Get sessions that exceed the limit (oldest first)
  SELECT ARRAY(
    SELECT id
    FROM user_sessions
    WHERE user_id = user_id_param
      AND is_active = true
      AND expires_at > NOW()
    ORDER BY created_at ASC
    OFFSET GREATEST(0, max_allowed - 1)
  ) INTO sessions_to_terminate;
  
  -- Terminate excess sessions
  IF array_length(sessions_to_terminate, 1) > 0 THEN
    UPDATE user_sessions
    SET 
      is_active = false,
      terminated_at = NOW(),
      termination_reason = 'concurrent_limit_exceeded'
    WHERE id = ANY(sessions_to_terminate);
    
    GET DIAGNOSTICS terminated_count = ROW_COUNT;
    
    -- Log security event
    INSERT INTO session_security_events (
      user_id,
      event_type,
      severity,
      details
    ) VALUES (
      user_id_param,
      'concurrent_limit_exceeded',
      'medium',
      jsonb_build_object(
        'terminated_sessions', sessions_to_terminate,
        'max_allowed', max_allowed,
        'terminated_count', terminated_count
      )
    );
  END IF;
  
  RETURN terminated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate session security score
CREATE OR REPLACE FUNCTION calculate_session_security_score(
  user_id_param UUID,
  device_fingerprint_param TEXT,
  ip_address_param INET,
  location_param JSONB DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 100;
  device_trusted BOOLEAN := false;
  recent_location_match BOOLEAN := false;
BEGIN
  -- Check if device is known and trusted
  SELECT trusted INTO device_trusted
  FROM device_registrations
  WHERE user_id = user_id_param
    AND device_fingerprint = device_fingerprint_param;
  
  IF NOT FOUND THEN
    score := score - 20; -- New device penalty
  ELSIF device_trusted = false THEN
    score := score - 10; -- Known but untrusted device
  END IF;
  
  -- Check for recent location match
  IF location_param IS NOT NULL AND location_param ? 'country' THEN
    SELECT EXISTS(
      SELECT 1
      FROM user_sessions
      WHERE user_id = user_id_param
        AND created_at >= NOW() - INTERVAL '7 days'
        AND location ? 'country'
        AND location->>'country' = location_param->>'country'
    ) INTO recent_location_match;
    
    IF NOT recent_location_match THEN
      score := score - 15; -- Unusual location penalty
    END IF;
  END IF;
  
  -- Check for rapid login attempts
  IF EXISTS(
    SELECT 1
    FROM user_sessions
    WHERE user_id = user_id_param
      AND created_at >= NOW() - INTERVAL '5 minutes'
      AND ip_address = ip_address_param
    HAVING COUNT(*) > 3
  ) THEN
    score := score - 25; -- Rapid login attempts penalty
  END IF;
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER := 0;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE user_sessions
  SET 
    is_active = false,
    expired_at = NOW()
  WHERE is_active = true
    AND expires_at <= NOW();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Delete old inactive sessions (older than 30 days)
  DELETE FROM user_sessions
  WHERE is_active = false
    AND created_at < NOW() - INTERVAL '30 days';
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session analytics
CREATE OR REPLACE FUNCTION get_session_analytics(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_sessions'::TEXT,
    COUNT(*)::NUMERIC,
    jsonb_build_object('period', jsonb_build_object('start', start_date, 'end', end_date))
  FROM user_sessions
  WHERE created_at BETWEEN start_date AND end_date
  
  UNION ALL
  
  SELECT 
    'active_sessions'::TEXT,
    COUNT(*)::NUMERIC,
    jsonb_build_object('timestamp', NOW())
  FROM user_sessions
  WHERE is_active = true AND expires_at > NOW()
  
  UNION ALL
  
  SELECT 
    'avg_session_duration_minutes'::TEXT,
    AVG(EXTRACT(EPOCH FROM (COALESCE(expired_at, terminated_at, NOW()) - created_at)) / 60)::NUMERIC,
    jsonb_build_object('period', jsonb_build_object('start', start_date, 'end', end_date))
  FROM user_sessions
  WHERE created_at BETWEEN start_date AND end_date
  
  UNION ALL
  
  SELECT 
    'security_events'::TEXT,
    COUNT(*)::NUMERIC,
    jsonb_build_object(
      'period', jsonb_build_object('start', start_date, 'end', end_date),
      'by_severity', (
        SELECT jsonb_object_agg(severity, count)
        FROM (
          SELECT severity, COUNT(*) as count
          FROM session_security_events
          WHERE timestamp BETWEEN start_date AND end_date
          GROUP BY severity
        ) t
      )
    )
  FROM session_security_events
  WHERE timestamp BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_session_policies_updated_at
  BEFORE UPDATE ON session_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_registrations_updated_at
  BEFORE UPDATE ON device_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_security_events_updated_at
  BEFORE UPDATE ON session_security_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session audit trigger
CREATE OR REPLACE FUNCTION log_session_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO session_audit_logs (
      session_id,
      user_id,
      action,
      details,
      ip_address
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'session_created',
      jsonb_build_object(
        'device_fingerprint', NEW.device_fingerprint,
        'security_score', NEW.security_score,
        'expires_at', NEW.expires_at
      ),
      NEW.ip_address
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = true AND NEW.is_active = false THEN
      INSERT INTO session_audit_logs (
        session_id,
        user_id,
        action,
        details,
        ip_address
      ) VALUES (
        NEW.id,
        NEW.user_id,
        'session_terminated',
        jsonb_build_object(
          'reason', COALESCE(NEW.termination_reason, 'expired'),
          'duration_minutes', EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60
        ),
        NEW.ip_address
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER session_audit_trigger
  AFTER INSERT OR UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION log_session_changes();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE session_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notifications ENABLE ROW LEVEL SECURITY;

-- Session policies: Only admins can manage
CREATE POLICY "Admin can manage session policies" ON session_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- Device registrations: Users can manage their own devices
CREATE POLICY "Users can manage own devices" ON device_registrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all devices" ON device_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- User sessions: Users can view their own sessions, admins can view all
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Admins can manage all sessions" ON user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- Session activities: Users can view their own, admins can view all
CREATE POLICY "Users can view own session activities" ON session_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_sessions
      WHERE user_sessions.id = session_activities.session_id
      AND user_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create session activities" ON session_activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all session activities" ON session_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- Security events: Users can view their own, admins can view all
CREATE POLICY "Users can view own security events" ON session_security_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create security events" ON session_security_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all security events" ON session_security_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- Audit logs: Users can view their own, admins can view all
CREATE POLICY "Users can view own audit logs" ON session_audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create audit logs" ON session_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" ON session_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

-- Session notifications: Users can view their own
CREATE POLICY "Users can manage own notifications" ON session_notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON session_notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default session policies
INSERT INTO session_policies (role, timeout_minutes, max_sessions, security_level, require_mfa, allow_cross_device, warning_minutes)
VALUES 
  ('owner', 60, 5, 'high', true, true, '{10,5,1}'),
  ('manager', 45, 3, 'high', true, true, '{5,1}'),
  ('staff', 30, 2, 'medium', false, false, '{5,1}'),
  ('patient', 20, 1, 'medium', false, false, '{5,1}')
ON CONFLICT (role) DO UPDATE SET
  timeout_minutes = EXCLUDED.timeout_minutes,
  max_sessions = EXCLUDED.max_sessions,
  security_level = EXCLUDED.security_level,
  require_mfa = EXCLUDED.require_mfa,
  allow_cross_device = EXCLUDED.allow_cross_device,
  warning_minutes = EXCLUDED.warning_minutes,
  updated_at = NOW();

-- =====================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =====================================================

-- Note: These would require pg_cron extension
-- Cleanup expired sessions every 5 minutes
-- SELECT cron.schedule('cleanup-expired-sessions', '*/5 * * * *', 'SELECT cleanup_expired_sessions();');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE session_policies IS 'Configuration policies for session management by user role';
COMMENT ON TABLE device_registrations IS 'Registered devices for users with trust levels';
COMMENT ON TABLE user_sessions IS 'Active and historical user sessions with security tracking';
COMMENT ON TABLE session_activities IS 'Detailed activity log for user sessions';
COMMENT ON TABLE session_security_events IS 'Security events and alerts related to sessions';
COMMENT ON TABLE session_audit_logs IS 'Comprehensive audit trail for session management';
COMMENT ON TABLE session_notifications IS 'Session-related notifications sent to users';

COMMENT ON FUNCTION get_session_timeout_minutes(user_role) IS 'Get session timeout in minutes for a specific user role';
COMMENT ON FUNCTION check_concurrent_session_limit(UUID, user_role) IS 'Check if user can create a new session within role limits';
COMMENT ON FUNCTION enforce_session_limits(UUID, user_role) IS 'Terminate oldest sessions when concurrent limit is exceeded';
COMMENT ON FUNCTION calculate_session_security_score(UUID, TEXT, INET, JSONB) IS 'Calculate security score for a new session based on various factors';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Clean up expired and old session data';
COMMENT ON FUNCTION get_session_analytics(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Get comprehensive session analytics for a time period';

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions for session management
GRANT INSERT, UPDATE ON user_sessions TO authenticated;
GRANT INSERT ON session_activities TO authenticated;
GRANT INSERT ON session_security_events TO authenticated;
GRANT INSERT ON session_audit_logs TO authenticated;
GRANT INSERT, UPDATE ON device_registrations TO authenticated;
GRANT INSERT, UPDATE ON session_notifications TO authenticated;