-- Migration: Create audit_logs table for healthcare compliance
-- Created: 2024-01-28
-- Description: Comprehensive audit logging system for healthcare data compliance

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and session information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    
    -- Action details
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    resource_name VARCHAR(255),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    
    -- Response details
    status_code INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    duration_ms INTEGER,
    
    -- Error information
    error_message TEXT,
    
    -- Additional context (JSONB for flexibility)
    details JSONB DEFAULT '{}',
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Compliance fields
    retention_until TIMESTAMPTZ,
    archived BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN (
        'create', 'read', 'update', 'delete',
        'login', 'logout', 'password_change',
        'permission_change', 'role_change',
        'export', 'import', 'backup', 'restore',
        'report_generate', 'data_access',
        'system_config', 'file_upload', 'file_download'
    )),
    
    CONSTRAINT valid_resource_type CHECK (resource_type IN (
        'patient', 'appointment', 'professional', 'payment',
        'treatment', 'medical_record', 'user', 'role',
        'permission', 'report', 'backup', 'configuration',
        'audit_log', 'file', 'system'
    )),
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    CONSTRAINT valid_method CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD')),
    
    CONSTRAINT positive_duration CHECK (duration_ms >= 0),
    
    CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_code ON audit_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_timestamp ON audit_logs(resource_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp ON audit_logs(severity, timestamp DESC);

-- Partial indexes for specific use cases
CREATE INDEX IF NOT EXISTS idx_audit_logs_errors ON audit_logs(timestamp DESC) WHERE error_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_critical ON audit_logs(timestamp DESC) WHERE severity = 'critical';
CREATE INDEX IF NOT EXISTS idx_audit_logs_failed_auth ON audit_logs(timestamp DESC) WHERE action IN ('login', 'logout') AND status_code >= 400;
CREATE INDEX IF NOT EXISTS idx_audit_logs_data_access ON audit_logs(timestamp DESC) WHERE resource_type IN ('patient', 'medical_record');

-- JSONB indexes for details field
CREATE INDEX IF NOT EXISTS idx_audit_logs_details_gin ON audit_logs USING GIN(details);

-- Create audit_log_stats materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS audit_log_stats AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    action,
    resource_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(duration_ms) as avg_duration_ms,
    COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
    COUNT(*) FILTER (WHERE status_code >= 500) as server_error_count
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY 
    DATE_TRUNC('hour', timestamp),
    action,
    resource_type,
    severity;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_log_stats_unique 
ON audit_log_stats(hour, action, resource_type, severity);

-- Create function to refresh stats automatically
CREATE OR REPLACE FUNCTION refresh_audit_log_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY audit_log_stats;
END;
$$;

-- Create function for automatic retention policy
CREATE OR REPLACE FUNCTION apply_audit_retention_policy()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Archive logs older than 7 years (healthcare compliance requirement)
    UPDATE audit_logs 
    SET archived = TRUE,
        retention_until = NOW() + INTERVAL '3 years'
    WHERE timestamp < NOW() - INTERVAL '7 years'
      AND archived = FALSE;
    
    -- Delete archived logs that have passed retention period
    DELETE FROM audit_logs 
    WHERE archived = TRUE 
      AND retention_until < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Create function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    total_events BIGINT,
    unique_users BIGINT,
    error_rate NUMERIC,
    avg_duration_ms NUMERIC,
    top_actions JSONB,
    top_resources JSONB,
    severity_distribution JSONB,
    hourly_distribution JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT user_id) as users,
            COUNT(*) FILTER (WHERE status_code >= 400) as errors,
            AVG(duration_ms) as avg_duration
        FROM audit_logs
        WHERE timestamp BETWEEN start_date AND end_date
    ),
    actions AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'action', action,
                'count', count
            ) ORDER BY count DESC
        ) as top_actions
        FROM (
            SELECT action, COUNT(*) as count
            FROM audit_logs
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        ) t
    ),
    resources AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'resource_type', resource_type,
                'count', count
            ) ORDER BY count DESC
        ) as top_resources
        FROM (
            SELECT resource_type, COUNT(*) as count
            FROM audit_logs
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY resource_type
            ORDER BY count DESC
            LIMIT 10
        ) t
    ),
    severity AS (
        SELECT jsonb_object_agg(severity, count) as severity_dist
        FROM (
            SELECT severity, COUNT(*) as count
            FROM audit_logs
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY severity
        ) t
    ),
    hourly AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'hour', hour,
                'count', count
            ) ORDER BY hour
        ) as hourly_dist
        FROM (
            SELECT 
                DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as count
            FROM audit_logs
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY hour
        ) t
    )
    SELECT 
        s.total,
        s.users,
        CASE WHEN s.total > 0 THEN ROUND((s.errors::NUMERIC / s.total::NUMERIC) * 100, 2) ELSE 0 END,
        ROUND(s.avg_duration, 2),
        a.top_actions,
        r.top_resources,
        sv.severity_dist,
        h.hourly_dist
    FROM stats s
    CROSS JOIN actions a
    CROSS JOIN resources r
    CROSS JOIN severity sv
    CROSS JOIN hourly h;
END;
$$;

-- Create RLS policies for audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own audit logs
CREATE POLICY "Users can read own audit logs" ON audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admin users can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'compliance_officer')
        )
    );

-- Policy: Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy: No updates allowed (audit logs are immutable)
CREATE POLICY "No updates allowed" ON audit_logs
    FOR UPDATE
    USING (false);

-- Policy: Only admin can delete old archived logs
CREATE POLICY "Admins can delete archived logs" ON audit_logs
    FOR DELETE
    USING (
        archived = TRUE 
        AND retention_until < NOW()
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Create trigger to automatically set retention_until
CREATE OR REPLACE FUNCTION set_audit_retention()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Set retention period based on resource type and severity
    CASE 
        WHEN NEW.resource_type IN ('patient', 'medical_record') THEN
            NEW.retention_until := NEW.timestamp + INTERVAL '10 years';
        WHEN NEW.severity = 'critical' THEN
            NEW.retention_until := NEW.timestamp + INTERVAL '7 years';
        WHEN NEW.action IN ('login', 'logout', 'permission_change') THEN
            NEW.retention_until := NEW.timestamp + INTERVAL '5 years';
        ELSE
            NEW.retention_until := NEW.timestamp + INTERVAL '3 years';
    END CASE;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_audit_retention
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_retention();

-- Create scheduled job to refresh stats (requires pg_cron extension)
-- SELECT cron.schedule('refresh-audit-stats', '0 * * * *', 'SELECT refresh_audit_log_stats();');

-- Create scheduled job for retention policy (daily at 2 AM)
-- SELECT cron.schedule('audit-retention-cleanup', '0 2 * * *', 'SELECT apply_audit_retention_policy();');

-- Grant necessary permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON audit_log_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_audit_log_stats TO service_role;
GRANT EXECUTE ON FUNCTION apply_audit_retention_policy TO service_role;

-- Create comment for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for healthcare compliance. Tracks all user actions, system events, and data access for regulatory compliance (LGPD, ANVISA, etc.)';
COMMENT ON COLUMN audit_logs.retention_until IS 'Automatic retention policy based on resource type and severity. Medical records: 10 years, Critical events: 7 years, Auth events: 5 years, Others: 3 years';
COMMENT ON FUNCTION get_audit_statistics IS 'Returns comprehensive audit statistics for dashboard and compliance reporting';
COMMENT ON FUNCTION apply_audit_retention_policy IS 'Applies automatic retention and archival policies for compliance';