-- LGPD Compliance System Functions and Triggers
-- Advanced automation functions for LGPD compliance management

-- Function to automatically expire consents based on retention period
CREATE OR REPLACE FUNCTION expire_old_consents()
RETURNS void AS $$
BEGIN
  UPDATE lgpd_user_consents 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'given' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
  -- Log the expiration events
  INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
  SELECT 
    'consent_updated',
    'Automatic consent expiration',
    'Expired ' || COUNT(*) || ' consents due to retention period',
    jsonb_build_object('expired_count', COUNT(*))
  FROM lgpd_user_consents 
  WHERE status = 'expired' AND updated_at > NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Function to automatically process data subject requests based on due dates
CREATE OR REPLACE FUNCTION process_overdue_requests()
RETURNS void AS $$
DECLARE
  overdue_count INTEGER;
BEGIN
  -- Count overdue requests
  SELECT COUNT(*) INTO overdue_count
  FROM lgpd_data_subject_requests
  WHERE status IN ('pending', 'in_progress')
    AND due_date < NOW();
    
  -- Update priority for overdue requests
  UPDATE lgpd_data_subject_requests
  SET priority = GREATEST(priority + 1, 5),
      updated_at = NOW()
  WHERE status IN ('pending', 'in_progress')
    AND due_date < NOW();
    
  -- Log overdue requests
  IF overdue_count > 0 THEN
    INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
    VALUES (
      'system_access',
      'Overdue data subject requests detected',
      'Found ' || overdue_count || ' overdue requests, priority increased',
      jsonb_build_object('overdue_count', overdue_count)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically detect potential data breaches
CREATE OR REPLACE FUNCTION detect_potential_breaches()
RETURNS void AS $$
DECLARE
  suspicious_activity RECORD;
  breach_id UUID;
BEGIN
  -- Detect multiple failed login attempts from same IP
  FOR suspicious_activity IN
    SELECT 
      ip_address,
      COUNT(*) as failed_attempts,
      MAX(timestamp) as last_attempt
    FROM lgpd_audit_events
    WHERE event_type = 'user_login'
      AND description LIKE '%failed%'
      AND timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY ip_address
    HAVING COUNT(*) >= 10
  LOOP
    -- Create breach incident
    INSERT INTO lgpd_breach_incidents (
      title,
      description,
      type,
      severity,
      status,
      discovered_at,
      metadata
    ) VALUES (
      'Suspicious Login Activity Detected',
      'Multiple failed login attempts from IP: ' || suspicious_activity.ip_address,
      'unauthorized_access',
      'medium',
      'detected',
      NOW(),
      jsonb_build_object(
        'ip_address', suspicious_activity.ip_address,
        'failed_attempts', suspicious_activity.failed_attempts,
        'detection_method', 'automated'
      )
    ) RETURNING id INTO breach_id;
    
    -- Log the detection
    INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
    VALUES (
      'breach_detected',
      'Potential breach detected and incident created',
      'Breach ID: ' || breach_id || ' for IP: ' || suspicious_activity.ip_address,
      jsonb_build_object('breach_id', breach_id, 'ip_address', suspicious_activity.ip_address)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate compliance assessment automatically
CREATE OR REPLACE FUNCTION generate_compliance_assessment()
RETURNS UUID AS $$
DECLARE
  assessment_id UUID;
  consent_score DECIMAL;
  request_score DECIMAL;
  breach_score DECIMAL;
  audit_score DECIMAL;
  total_score DECIMAL;
BEGIN
  -- Calculate consent management score (0-25 points)
  SELECT 
    CASE 
      WHEN total_consents = 0 THEN 0
      ELSE LEAST(25, (active_consents::DECIMAL / total_consents) * 25)
    END INTO consent_score
  FROM (
    SELECT 
      COUNT(*) as total_consents,
      COUNT(*) FILTER (WHERE status = 'given') as active_consents
    FROM lgpd_user_consents
    WHERE created_at > NOW() - INTERVAL '30 days'
  ) consent_stats;
  
  -- Calculate data subject request score (0-25 points)
  SELECT 
    CASE 
      WHEN total_requests = 0 THEN 25
      ELSE LEAST(25, ((total_requests - overdue_requests)::DECIMAL / total_requests) * 25)
    END INTO request_score
  FROM (
    SELECT 
      COUNT(*) as total_requests,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue_requests
    FROM lgpd_data_subject_requests
    WHERE created_at > NOW() - INTERVAL '30 days'
  ) request_stats;
  
  -- Calculate breach management score (0-25 points)
  SELECT 
    CASE 
      WHEN total_breaches = 0 THEN 25
      WHEN total_breaches <= 2 THEN 20
      WHEN total_breaches <= 5 THEN 15
      ELSE 10
    END INTO breach_score
  FROM (
    SELECT COUNT(*) as total_breaches
    FROM lgpd_breach_incidents
    WHERE discovered_at > NOW() - INTERVAL '30 days'
  ) breach_stats;
  
  -- Calculate audit trail score (0-25 points)
  SELECT 
    CASE 
      WHEN audit_events > 1000 THEN 25
      WHEN audit_events > 500 THEN 20
      WHEN audit_events > 100 THEN 15
      ELSE 10
    END INTO audit_score
  FROM (
    SELECT COUNT(*) as audit_events
    FROM lgpd_audit_events
    WHERE timestamp > NOW() - INTERVAL '30 days'
  ) audit_stats;
  
  -- Calculate total score
  total_score := COALESCE(consent_score, 0) + COALESCE(request_score, 0) + 
                 COALESCE(breach_score, 0) + COALESCE(audit_score, 0);
  
  -- Create assessment record
  INSERT INTO lgpd_compliance_assessments (
    name,
    description,
    status,
    score,
    max_score,
    compliance_percentage,
    areas_assessed,
    findings,
    recommendations,
    assessor_id,
    started_at,
    completed_at
  ) VALUES (
    'Automated Monthly Assessment - ' || TO_CHAR(NOW(), 'YYYY-MM'),
    'Automated compliance assessment based on system metrics',
    'completed',
    total_score,
    100.00,
    (total_score / 100.00) * 100,
    ARRAY['consent_management', 'data_subject_rights', 'breach_management', 'audit_trail'],
    jsonb_build_array(
      jsonb_build_object(
        'area', 'consent_management',
        'score', consent_score,
        'status', CASE WHEN consent_score >= 20 THEN 'good' WHEN consent_score >= 15 THEN 'fair' ELSE 'poor' END
      ),
      jsonb_build_object(
        'area', 'data_subject_rights',
        'score', request_score,
        'status', CASE WHEN request_score >= 20 THEN 'good' WHEN request_score >= 15 THEN 'fair' ELSE 'poor' END
      ),
      jsonb_build_object(
        'area', 'breach_management',
        'score', breach_score,
        'status', CASE WHEN breach_score >= 20 THEN 'good' WHEN breach_score >= 15 THEN 'fair' ELSE 'poor' END
      ),
      jsonb_build_object(
        'area', 'audit_trail',
        'score', audit_score,
        'status', CASE WHEN audit_score >= 20 THEN 'good' WHEN audit_score >= 15 THEN 'fair' ELSE 'poor' END
      )
    ),
    jsonb_build_array(
      CASE WHEN consent_score < 15 THEN 
        jsonb_build_object('area', 'consent_management', 'recommendation', 'Improve consent collection and management processes')
      END,
      CASE WHEN request_score < 15 THEN 
        jsonb_build_object('area', 'data_subject_rights', 'recommendation', 'Reduce response time for data subject requests')
      END,
      CASE WHEN breach_score < 15 THEN 
        jsonb_build_object('area', 'breach_management', 'recommendation', 'Implement stronger security measures to prevent breaches')
      END,
      CASE WHEN audit_score < 15 THEN 
        jsonb_build_object('area', 'audit_trail', 'recommendation', 'Increase audit logging coverage and retention')
      END
    ),
    NULL, -- No specific assessor for automated assessments
    NOW(),
    NOW()
  ) RETURNING id INTO assessment_id;
  
  -- Insert detailed metrics
  INSERT INTO lgpd_compliance_metrics (assessment_id, metric_name, metric_category, current_value, target_value, unit, status)
  VALUES 
    (assessment_id, 'Consent Management Score', 'consent', consent_score, 25.00, 'points', 
     CASE WHEN consent_score >= 20 THEN 'good' WHEN consent_score >= 15 THEN 'fair' ELSE 'poor' END),
    (assessment_id, 'Data Subject Rights Score', 'rights', request_score, 25.00, 'points',
     CASE WHEN request_score >= 20 THEN 'good' WHEN request_score >= 15 THEN 'fair' ELSE 'poor' END),
    (assessment_id, 'Breach Management Score', 'security', breach_score, 25.00, 'points',
     CASE WHEN breach_score >= 20 THEN 'good' WHEN breach_score >= 15 THEN 'fair' ELSE 'poor' END),
    (assessment_id, 'Audit Trail Score', 'audit', audit_score, 25.00, 'points',
     CASE WHEN audit_score >= 20 THEN 'good' WHEN audit_score >= 15 THEN 'fair' ELSE 'poor' END),
    (assessment_id, 'Overall Compliance Score', 'overall', total_score, 100.00, 'points',
     CASE WHEN total_score >= 80 THEN 'good' WHEN total_score >= 60 THEN 'fair' ELSE 'poor' END);
  
  -- Log the assessment creation
  INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
  VALUES (
    'system_access',
    'Automated compliance assessment completed',
    'Assessment ID: ' || assessment_id || ', Score: ' || total_score || '/100',
    jsonb_build_object('assessment_id', assessment_id, 'score', total_score)
  );
  
  RETURN assessment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data based on retention policies
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
DECLARE
  policy RECORD;
  cleanup_count INTEGER;
BEGIN
  FOR policy IN
    SELECT * FROM lgpd_retention_policies WHERE active = true AND auto_delete = true
  LOOP
    CASE policy.data_category
      WHEN 'user_data' THEN
        -- Clean up inactive user data
        DELETE FROM lgpd_user_consents
        WHERE updated_at < NOW() - policy.retention_period
          AND status IN ('withdrawn', 'expired');
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
      WHEN 'audit_logs' THEN
        -- Clean up old audit logs (keep partitions)
        DELETE FROM lgpd_audit_events
        WHERE timestamp < NOW() - policy.retention_period;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
      WHEN 'session_data' THEN
        -- This would clean up session data if we had such a table
        cleanup_count := 0;
        
      WHEN 'consent_data' THEN
        -- Clean up very old consent records
        DELETE FROM lgpd_user_consents
        WHERE created_at < NOW() - policy.retention_period
          AND status = 'expired';
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
      ELSE
        cleanup_count := 0;
    END CASE;
    
    -- Log cleanup activity
    IF cleanup_count > 0 THEN
      INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
      VALUES (
        'system_access',
        'Data cleanup completed',
        'Cleaned up ' || cleanup_count || ' records for category: ' || policy.data_category,
        jsonb_build_object(
          'policy_id', policy.id,
          'data_category', policy.data_category,
          'records_cleaned', cleanup_count
        )
      );
      
      -- Create cleanup job record
      INSERT INTO lgpd_data_cleanup_jobs (
        policy_id,
        table_name,
        condition_sql,
        records_affected,
        status,
        started_at,
        completed_at
      ) VALUES (
        policy.id,
        CASE policy.data_category
          WHEN 'user_data' THEN 'lgpd_user_consents'
          WHEN 'audit_logs' THEN 'lgpd_audit_events'
          WHEN 'consent_data' THEN 'lgpd_user_consents'
          ELSE 'unknown'
        END,
        'Retention period: ' || policy.retention_period,
        cleanup_count,
        'completed',
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to notify users before data deletion
CREATE OR REPLACE FUNCTION notify_before_deletion()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- Find users whose data will be deleted soon
  FOR user_record IN
    SELECT DISTINCT u.id, u.email, uc.updated_at
    FROM auth.users u
    JOIN lgpd_user_consents uc ON u.id = uc.user_id
    WHERE uc.status IN ('withdrawn', 'expired')
      AND uc.updated_at < NOW() - INTERVAL '2 years 11 months' -- 1 month before 3-year deletion
      AND uc.updated_at > NOW() - INTERVAL '3 years'
  LOOP
    -- Log notification requirement (actual email sending would be handled by application)
    INSERT INTO lgpd_audit_events (event_type, user_id, description, details, metadata)
    VALUES (
      'communication',
      user_record.id,
      'Data deletion notification required',
      'User data scheduled for deletion in 30 days due to retention policy',
      jsonb_build_object(
        'user_email', user_record.email,
        'deletion_date', (user_record.updated_at + INTERVAL '3 years')::date,
        'notification_type', 'data_deletion_warning'
      )
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  -- Log summary if notifications were created
  IF notification_count > 0 THEN
    INSERT INTO lgpd_audit_events (event_type, description, details, metadata)
    VALUES (
      'system_access',
      'Data deletion notifications generated',
      'Generated ' || notification_count || ' deletion warning notifications',
      jsonb_build_object('notification_count', notification_count)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO lgpd_audit_events (event_type, user_id, description, details, old_values, new_values)
    VALUES (
      'consent_given',
      NEW.user_id,
      'New consent recorded',
      'Consent given for purpose: ' || NEW.purpose,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO lgpd_audit_events (event_type, user_id, description, details, old_values, new_values)
      VALUES (
        CASE NEW.status
          WHEN 'withdrawn' THEN 'consent_withdrawn'
          WHEN 'expired' THEN 'consent_updated'
          ELSE 'consent_updated'
        END,
        NEW.user_id,
        'Consent status changed from ' || OLD.status || ' to ' || NEW.status,
        'Purpose: ' || NEW.purpose,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO lgpd_audit_events (event_type, user_id, description, details, old_values)
    VALUES (
      'data_deletion',
      OLD.user_id,
      'Consent record deleted',
      'Purpose: ' || OLD.purpose,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to log data subject request changes
CREATE OR REPLACE FUNCTION log_request_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO lgpd_audit_events (event_type, user_id, description, details, new_values)
    VALUES (
      'data_access',
      NEW.user_id,
      'New data subject request created',
      'Request type: ' || NEW.request_type || ', Status: ' || NEW.status,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO lgpd_audit_events (event_type, user_id, description, details, old_values, new_values)
      VALUES (
        'data_access',
        NEW.user_id,
        'Data subject request status changed',
        'Request type: ' || NEW.request_type || ', Status: ' || OLD.status || ' → ' || NEW.status,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER lgpd_consent_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON lgpd_user_consents
  FOR EACH ROW EXECUTE FUNCTION log_consent_changes();

CREATE TRIGGER lgpd_request_audit_trigger
  AFTER INSERT OR UPDATE ON lgpd_data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION log_request_changes();

-- Create scheduled jobs using pg_cron (if available)
-- Note: These would need to be enabled manually after deployment

-- Schedule consent expiration check (daily at 2 AM)
-- SELECT cron.schedule('expire-consents', '0 2 * * *', 'SELECT expire_old_consents();');

-- Schedule overdue request processing (every 4 hours)
-- SELECT cron.schedule('process-overdue-requests', '0 */4 * * *', 'SELECT process_overdue_requests();');

-- Schedule breach detection (every hour)
-- SELECT cron.schedule('detect-breaches', '0 * * * *', 'SELECT detect_potential_breaches();');

-- Schedule monthly compliance assessment (1st day of month at 3 AM)
-- SELECT cron.schedule('monthly-assessment', '0 3 1 * *', 'SELECT generate_compliance_assessment();');

-- Schedule data cleanup (weekly on Sunday at 1 AM)
-- SELECT cron.schedule('cleanup-old-data', '0 1 * * 0', 'SELECT cleanup_old_data();');

-- Schedule deletion notifications (daily at 9 AM)
-- SELECT cron.schedule('deletion-notifications', '0 9 * * *', 'SELECT notify_before_deletion();');

-- Create view for LGPD dashboard metrics
CREATE OR REPLACE VIEW lgpd_dashboard_metrics AS
SELECT 
  -- Consent metrics
  (
    SELECT COUNT(*) 
    FROM lgpd_user_consents 
    WHERE status = 'given' AND created_at > NOW() - INTERVAL '30 days'
  ) as active_consents_30d,
  
  (
    SELECT COUNT(*) 
    FROM lgpd_user_consents 
    WHERE status = 'withdrawn' AND updated_at > NOW() - INTERVAL '30 days'
  ) as withdrawn_consents_30d,
  
  -- Data subject request metrics
  (
    SELECT COUNT(*) 
    FROM lgpd_data_subject_requests 
    WHERE created_at > NOW() - INTERVAL '30 days'
  ) as total_requests_30d,
  
  (
    SELECT COUNT(*) 
    FROM lgpd_data_subject_requests 
    WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '30 days'
  ) as completed_requests_30d,
  
  (
    SELECT COUNT(*) 
    FROM lgpd_data_subject_requests 
    WHERE status IN ('pending', 'in_progress') AND due_date < NOW()
  ) as overdue_requests,
  
  -- Breach metrics
  (
    SELECT COUNT(*) 
    FROM lgpd_breach_incidents 
    WHERE discovered_at > NOW() - INTERVAL '30 days'
  ) as total_breaches_30d,
  
  (
    SELECT COUNT(*) 
    FROM lgpd_breach_incidents 
    WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '30 days'
  ) as resolved_breaches_30d,
  
  -- Audit metrics
  (
    SELECT COUNT(*) 
    FROM lgpd_audit_events 
    WHERE timestamp > NOW() - INTERVAL '24 hours'
  ) as audit_events_24h,
  
  -- Compliance score from latest assessment
  (
    SELECT compliance_percentage 
    FROM lgpd_compliance_assessments 
    WHERE status = 'completed' 
    ORDER BY completed_at DESC 
    LIMIT 1
  ) as latest_compliance_score;

-- Grant permissions for the view
GRANT SELECT ON lgpd_dashboard_metrics TO authenticated;

COMMIT;