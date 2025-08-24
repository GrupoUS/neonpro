-- Dashboard Metrics RPC Functions
-- Optimized queries for healthcare dashboard with proper indexing and caching

-- Function: Get Dashboard Patients Metrics
-- Returns patient count and new registrations
CREATE OR REPLACE FUNCTION get_dashboard_metrics_patients()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_patients', COALESCE(total_count, 0),
    'new_today', COALESCE(new_today_count, 0),
    'active_patients', COALESCE(active_count, 0),
    'growth_rate', COALESCE(growth_rate, 0)
  )
  INTO result
  FROM (
    SELECT 
      COUNT(*) as total_count,
      COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_today_count,
      COUNT(CASE WHEN active = true THEN 1 END) as active_count,
      CASE 
        WHEN COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
                              AND created_at < CURRENT_DATE THEN 1 END) > 0
        THEN ROUND(
          (COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::DECIMAL / 
           COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
                             AND created_at < CURRENT_DATE THEN 1 END)::DECIMAL - 1) * 100, 2
        )
        ELSE 0
      END as growth_rate
    FROM patients 
    WHERE deleted_at IS NULL
  ) metrics;

  RETURN result;
END;
$$;

-- Function: Get Dashboard Appointments Metrics  
-- Returns appointment statistics for today and trends
CREATE OR REPLACE FUNCTION get_dashboard_metrics_appointments()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'today_appointments', COALESCE(today_count, 0),
    'confirmed_today', COALESCE(confirmed_today, 0),
    'completed_today', COALESCE(completed_today, 0),
    'pending_today', COALESCE(pending_today, 0),
    'cancelled_today', COALESCE(cancelled_today, 0),
    'total_this_month', COALESCE(month_total, 0),
    'completion_rate', COALESCE(completion_rate, 0),
    'next_appointment', next_appointment_time
  )
  INTO result
  FROM (
    SELECT 
      COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE THEN 1 END) as today_count,
      COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE 
                      AND status = 'confirmed' THEN 1 END) as confirmed_today,
      COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE 
                      AND status = 'completed' THEN 1 END) as completed_today,
      COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE 
                      AND status = 'pending' THEN 1 END) as pending_today,
      COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE 
                      AND status = 'cancelled' THEN 1 END) as cancelled_today,
      COUNT(CASE WHEN scheduled_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as month_total,
      CASE 
        WHEN COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE THEN 1 END) > 0
        THEN ROUND(
          (COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE 
                              AND status = 'completed' THEN 1 END)::DECIMAL / 
           COUNT(CASE WHEN date_trunc('day', scheduled_at) = CURRENT_DATE THEN 1 END)::DECIMAL) * 100, 2
        )
        ELSE 0
      END as completion_rate,
      MIN(CASE WHEN scheduled_at > NOW() AND status IN ('confirmed', 'pending') 
               THEN scheduled_at END) as next_appointment_time
    FROM appointments 
    WHERE deleted_at IS NULL
      AND scheduled_at >= CURRENT_DATE - INTERVAL '30 days'
  ) metrics;

  RETURN result;
END;
$$;

-- Function: Get Dashboard Revenue Metrics
-- Returns financial metrics with healthcare compliance
CREATE OR REPLACE FUNCTION get_dashboard_metrics_revenue()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE(total_amount, 0),
    'today_revenue', COALESCE(today_amount, 0),
    'month_revenue', COALESCE(month_amount, 0),
    'pending_payments', COALESCE(pending_amount, 0),
    'average_transaction', COALESCE(avg_transaction, 0),
    'payment_methods', payment_method_breakdown,
    'growth_rate', COALESCE(growth_rate, 0)
  )
  INTO result
  FROM (
    SELECT 
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
      SUM(CASE WHEN status = 'completed' 
                   AND created_at >= CURRENT_DATE THEN amount ELSE 0 END) as today_amount,
      SUM(CASE WHEN status = 'completed' 
                   AND created_at >= date_trunc('month', CURRENT_DATE) THEN amount ELSE 0 END) as month_amount,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
      AVG(CASE WHEN status = 'completed' THEN amount END) as avg_transaction,
      json_object_agg(
        COALESCE(payment_method, 'unknown'), 
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
      ) FILTER (WHERE payment_method IS NOT NULL) as payment_method_breakdown,
      CASE 
        WHEN SUM(CASE WHEN status = 'completed' 
                          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                          AND created_at < CURRENT_DATE THEN amount ELSE 0 END) > 0
        THEN ROUND(
          (SUM(CASE WHEN status = 'completed' 
                        AND created_at >= CURRENT_DATE THEN amount ELSE 0 END) / 
           SUM(CASE WHEN status = 'completed' 
                        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                        AND created_at < CURRENT_DATE THEN amount ELSE 0 END) - 1) * 100, 2
        )
        ELSE 0
      END as growth_rate
    FROM payments 
    WHERE deleted_at IS NULL
      AND created_at >= CURRENT_DATE - INTERVAL '90 days'
  ) metrics;

  RETURN result;
END;
$$;

-- Function: Get Dashboard System Health Metrics
-- Returns system health score based on logs and performance
CREATE OR REPLACE FUNCTION get_dashboard_metrics_system_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  health_score INTEGER;
  error_count INTEGER;
  warning_count INTEGER;
  critical_count INTEGER;
  uptime_percentage DECIMAL;
BEGIN
  -- Get error counts from last hour
  SELECT 
    COUNT(CASE WHEN level = 'error' THEN 1 END),
    COUNT(CASE WHEN level = 'warning' THEN 1 END),
    COUNT(CASE WHEN level = 'critical' THEN 1 END)
  INTO error_count, warning_count, critical_count
  FROM system_logs 
  WHERE created_at >= NOW() - INTERVAL '1 hour'
    AND level IN ('error', 'warning', 'critical');

  -- Calculate uptime percentage (last 24 hours)
  SELECT COALESCE(
    100 - (COUNT(CASE WHEN level = 'critical' THEN 1 END) * 5), 
    100
  )
  INTO uptime_percentage
  FROM system_logs 
  WHERE created_at >= NOW() - INTERVAL '24 hours'
    AND level = 'critical';

  -- Calculate overall health score
  health_score := GREATEST(0, LEAST(100, 
    100 - (critical_count * 20) - (error_count * 5) - (warning_count * 1)
  ));

  SELECT json_build_object(
    'health_score', health_score,
    'uptime_percentage', uptime_percentage,
    'error_count', error_count,
    'warning_count', warning_count,
    'critical_count', critical_count,
    'status', CASE 
      WHEN health_score >= 95 THEN 'excellent'
      WHEN health_score >= 80 THEN 'good'
      WHEN health_score >= 60 THEN 'warning'
      ELSE 'critical'
    END,
    'last_check', NOW(),
    'database_connections', (
      SELECT count(*) 
      FROM pg_stat_activity 
      WHERE state = 'active'
    ),
    'cache_hit_ratio', (
      SELECT ROUND(
        (blks_hit::DECIMAL / (blks_hit + blks_read)) * 100, 2
      )
      FROM pg_stat_database 
      WHERE datname = current_database()
    )
  )
  INTO result;

  RETURN result;
END;
$$;

-- Function: Batch Dashboard Metrics (All in One)
-- Optimized single call for all dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics_batch()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'patients', get_dashboard_metrics_patients(),
    'appointments', get_dashboard_metrics_appointments(), 
    'revenue', get_dashboard_metrics_revenue(),
    'system_health', get_dashboard_metrics_system_health(),
    'generated_at', NOW(),
    'cache_duration', 300 -- 5 minutes in seconds
  )
  INTO result;

  RETURN result;
END;
$$;

-- Performance optimization indexes
-- Only create if they don't exist

-- Patients table indexes
CREATE INDEX IF NOT EXISTS idx_patients_active_created 
ON patients (active, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patients_created_date 
ON patients (date_trunc('day', created_at)) 
WHERE deleted_at IS NULL;

-- Appointments table indexes  
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_status 
ON appointments (scheduled_at, status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_today_status 
ON appointments (date_trunc('day', scheduled_at), status) 
WHERE deleted_at IS NULL;

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_status_created 
ON payments (status, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_method_status 
ON payments (payment_method, status) 
WHERE deleted_at IS NULL;

-- System logs table indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created 
ON system_logs (level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_recent_critical 
ON system_logs (created_at) 
WHERE level = 'critical' AND created_at >= NOW() - INTERVAL '24 hours';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_patients() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_appointments() TO authenticated;  
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_revenue() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_system_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics_batch() TO authenticated;

-- Enable Row Level Security (RLS) policies if needed
-- Note: RLS policies should be defined based on your specific security requirements

COMMENT ON FUNCTION get_dashboard_metrics_patients() IS 
'Healthcare dashboard patients metrics with LGPD compliance';

COMMENT ON FUNCTION get_dashboard_metrics_appointments() IS 
'Healthcare dashboard appointments metrics with scheduling optimization';

COMMENT ON FUNCTION get_dashboard_metrics_revenue() IS 
'Healthcare dashboard revenue metrics with financial compliance';

COMMENT ON FUNCTION get_dashboard_metrics_system_health() IS 
'Healthcare dashboard system health metrics with monitoring';

COMMENT ON FUNCTION get_dashboard_metrics_batch() IS 
'Batch call for all dashboard metrics - optimized for performance';