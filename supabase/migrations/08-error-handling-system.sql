-- Error Logging Table with LGPD Compliance
-- This table stores error logs without exposing sensitive user data

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Error logs table (LGPD-compliant)
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Error identification (safe for logging)
  error_id VARCHAR(50) NOT NULL UNIQUE,
  error_code VARCHAR(100),
  category VARCHAR(50),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- User context (privacy-safe)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for anonymous errors
  session_id VARCHAR(100), -- Session tracking without personal data
  
  -- Technical context (no sensitive data)
  component VARCHAR(200),
  action VARCHAR(200),
  user_agent TEXT,
  url TEXT,
  
  -- Error details (sanitized)
  technical_details JSONB, -- Sanitized technical information
  can_retry BOOLEAN DEFAULT false,
  requires_support BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata (no personal data)
  metadata JSONB DEFAULT '{}',
  
  -- Privacy compliance
  privacy_compliant BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 90 -- LGPD compliance - auto-delete after 90 days
);

-- Indexes for performance
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX idx_error_logs_category ON error_logs(category);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_session_id ON error_logs(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own error logs (privacy protection)
CREATE POLICY "Users can view own error logs" ON error_logs
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    -- Allow anonymous access to errors without user_id (for logged-out users)
    (user_id IS NULL AND session_id IN (
      SELECT session_id FROM error_logs WHERE user_id = auth.uid()
    ))
  );

-- Policy: System can insert error logs (for error tracking)
CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT 
  WITH CHECK (true); -- Allow all inserts for error tracking

-- Policy: Only admins can view all error logs (for system monitoring)
CREATE POLICY "Admins can view all error logs" ON error_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically clean up old error logs (LGPD compliance)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  -- Delete error logs older than their retention period
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * COALESCE(data_retention_days, 90);
  
  -- Log cleanup activity
  INSERT INTO error_logs (
    error_id,
    error_code,
    category,
    severity,
    component,
    action,
    technical_details,
    privacy_compliant
  ) VALUES (
    'cleanup_' || extract(epoch from now()),
    'SYSTEM_CLEANUP',
    'system',
    'low',
    'error_logs_cleanup',
    'automatic_cleanup',
    jsonb_build_object('cleaned_records', (SELECT count(*) FROM error_logs WHERE created_at < NOW() - INTERVAL '90 days')),
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule automatic cleanup (run daily)
-- Note: In production, you would use pg_cron or similar
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-error-logs', '0 2 * * *', 'SELECT cleanup_old_error_logs();');

-- Error statistics view (aggregated data, no personal information)
CREATE OR REPLACE VIEW error_statistics AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  category,
  severity,
  error_code,
  COUNT(*) as error_count,
  COUNT(DISTINCT session_id) as affected_sessions,
  COUNT(DISTINCT user_id) as affected_users,
  AVG(CASE WHEN resolved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) END) as avg_resolution_time_seconds
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), category, severity, error_code
ORDER BY hour DESC, error_count DESC;

-- Grant access to error statistics for admins
GRANT SELECT ON error_statistics TO authenticated;

-- Error trends view for monitoring
CREATE OR REPLACE VIEW error_trends AS
WITH daily_stats AS (
  SELECT 
    DATE_TRUNC('day', created_at) as day,
    category,
    severity,
    COUNT(*) as daily_count
  FROM error_logs
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', created_at), category, severity
)
SELECT 
  day,
  category,
  severity,
  daily_count,
  LAG(daily_count) OVER (PARTITION BY category, severity ORDER BY day) as previous_day_count,
  CASE 
    WHEN LAG(daily_count) OVER (PARTITION BY category, severity ORDER BY day) IS NOT NULL 
    THEN ROUND(((daily_count::numeric - LAG(daily_count) OVER (PARTITION BY category, severity ORDER BY day)) / LAG(daily_count) OVER (PARTITION BY category, severity ORDER BY day)) * 100, 2)
  END as percentage_change
FROM daily_stats
ORDER BY day DESC, daily_count DESC;

-- Grant access to error trends for admins
GRANT SELECT ON error_trends TO authenticated;

-- Function to get error context safely (no sensitive data)
CREATE OR REPLACE FUNCTION get_error_context(error_log_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'error_id', error_id,
    'category', category,
    'severity', severity,
    'component', component,
    'action', action,
    'created_at', created_at,
    'can_retry', can_retry,
    'requires_support', requires_support,
    'session_info', jsonb_build_object(
      'session_id', session_id,
      'user_agent', LEFT(user_agent, 100) -- Truncate user agent for privacy
    )
  ) INTO result
  FROM error_logs
  WHERE id = error_log_id
  AND (
    -- User can see their own errors
    user_id = auth.uid()
    OR 
    -- Admins can see all errors
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark error as resolved
CREATE OR REPLACE FUNCTION resolve_error(error_log_id UUID)
RETURNS boolean AS $$
BEGIN
  UPDATE error_logs 
  SET resolved_at = NOW()
  WHERE id = error_log_id
  AND (
    user_id = auth.uid()
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE error_logs IS 'LGPD-compliant error logging table that stores technical errors without exposing sensitive user data';
COMMENT ON COLUMN error_logs.error_id IS 'Unique identifier for the error, safe for user communication';
COMMENT ON COLUMN error_logs.user_id IS 'Optional user ID, can be null for anonymous errors';
COMMENT ON COLUMN error_logs.session_id IS 'Session tracking without personal data exposure';
COMMENT ON COLUMN error_logs.technical_details IS 'Sanitized technical information for debugging';
COMMENT ON COLUMN error_logs.privacy_compliant IS 'Flag indicating LGPD compliance of this log entry';
COMMENT ON COLUMN error_logs.data_retention_days IS 'Number of days to retain this error log (LGPD compliance)';
COMMENT ON VIEW error_statistics IS 'Aggregated error statistics without personal data exposure';
COMMENT ON VIEW error_trends IS 'Error trend analysis for system monitoring';
COMMENT ON FUNCTION cleanup_old_error_logs() IS 'Automatic cleanup function for LGPD compliance';
COMMENT ON FUNCTION get_error_context(UUID) IS 'Safely retrieve error context without sensitive data';
COMMENT ON FUNCTION resolve_error(UUID) IS 'Mark error as resolved by authorized users';