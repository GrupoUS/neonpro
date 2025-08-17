-- =============================================
-- Audit Trail System Functions
-- Story 3.3: Security Hardening & Audit
-- Created: 2024-01-15
-- =============================================

-- =============================================
-- AUDIT LOGGING FUNCTIONS
-- =============================================

-- Enhanced audit log creation with automatic context detection
CREATE OR REPLACE FUNCTION create_enhanced_audit_log(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_compliance_flags TEXT[] DEFAULT '{}',
    p_risk_level TEXT DEFAULT 'low',
    p_additional_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
    v_user_id UUID;
    v_session_id TEXT;
    v_ip_address INET;
    v_user_agent TEXT;
    v_endpoint TEXT;
    v_http_method TEXT;
    v_changed_fields TEXT[];
    v_metadata JSONB;
    v_checksum TEXT;
BEGIN
    -- Get current user context
    v_user_id := auth.uid();
    
    -- Get request context from settings
    v_session_id := current_setting('app.session_id', true);
    v_ip_address := current_setting('app.ip_address', true)::INET;
    v_user_agent := current_setting('app.user_agent', true);
    v_endpoint := current_setting('app.endpoint', true);
    v_http_method := current_setting('app.http_method', true);
    
    -- Calculate changed fields if both old and new values provided
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT array_agg(key) INTO v_changed_fields
        FROM (
            SELECT key FROM jsonb_each(p_old_values)
            EXCEPT
            SELECT key FROM jsonb_each(p_new_values)
            UNION
            SELECT key FROM jsonb_each(p_new_values)
            EXCEPT
            SELECT key FROM jsonb_each(p_old_values)
        ) AS changed;
    END IF;
    
    -- Build comprehensive metadata
    v_metadata := jsonb_build_object(
        'timestamp', NOW(),
        'application', 'neonpro',
        'version', '1.0',
        'environment', current_setting('app.environment', true),
        'user_role', get_user_role(v_user_id),
        'clinic_id', get_user_clinic_id(v_user_id)
    ) || COALESCE(p_additional_metadata, '{}');
    
    -- Generate checksum for integrity
    v_checksum := encode(
        sha256(
            (COALESCE(v_user_id::text, '') || 
             p_action || 
             p_resource_type || 
             COALESCE(p_resource_id, '') ||
             COALESCE(p_old_values::text, '') ||
             COALESCE(p_new_values::text, '') ||
             NOW()::text)::bytea
        ), 
        'hex'
    );
    
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
        endpoint,
        http_method,
        old_values,
        new_values,
        changed_fields,
        compliance_flags,
        risk_level,
        metadata,
        checksum
    ) VALUES (
        v_user_id,
        v_session_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_table_name,
        v_ip_address,
        v_user_agent,
        v_endpoint,
        v_http_method,
        p_old_values,
        p_new_values,
        v_changed_fields,
        p_compliance_flags,
        p_risk_level,
        v_metadata,
        v_checksum
    ) RETURNING id INTO v_audit_id;
    
    -- Check for high-risk actions and create security events
    IF p_risk_level IN ('high', 'critical') THEN
        PERFORM create_security_event(
            'high_risk_action',
            p_risk_level,
            'High-risk action detected: ' || p_action,
            'Action: ' || p_action || ' on ' || p_resource_type,
            jsonb_build_object(
                'audit_log_id', v_audit_id,
                'action', p_action,
                'resource_type', p_resource_type,
                'resource_id', p_resource_id
            )
        );
    END IF;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch audit log creation for bulk operations
CREATE OR REPLACE FUNCTION create_batch_audit_logs(
    p_entries JSONB
) RETURNS UUID[] AS $$
DECLARE
    v_audit_ids UUID[] := '{}';
    v_entry JSONB;
    v_audit_id UUID;
BEGIN
    -- Process each entry in the batch
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_audit_id := create_enhanced_audit_log(
            (v_entry->>'action')::TEXT,
            (v_entry->>'resource_type')::TEXT,
            (v_entry->>'resource_id')::TEXT,
            (v_entry->>'table_name')::TEXT,
            (v_entry->'old_values')::JSONB,
            (v_entry->'new_values')::JSONB,
            ARRAY(SELECT jsonb_array_elements_text(v_entry->'compliance_flags')),
            COALESCE((v_entry->>'risk_level')::TEXT, 'low'),
            (v_entry->'metadata')::JSONB
        );
        
        v_audit_ids := v_audit_ids || v_audit_id;
    END LOOP;
    
    RETURN v_audit_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SECURITY EVENT FUNCTIONS
-- =============================================

-- Create security event with automatic escalation
CREATE OR REPLACE FUNCTION create_security_event(
    p_event_type TEXT,
    p_severity TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}',
    p_affected_resources JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_user_id UUID;
    v_session_id TEXT;
    v_ip_address INET;
    v_should_alert BOOLEAN := FALSE;
BEGIN
    -- Get current context
    v_user_id := auth.uid();
    v_session_id := current_setting('app.session_id', true);
    v_ip_address := current_setting('app.ip_address', true)::INET;
    
    -- Insert security event
    INSERT INTO security_events (
        event_type,
        severity,
        title,
        description,
        source_ip,
        user_id,
        session_id,
        event_data,
        affected_resources
    ) VALUES (
        p_event_type,
        p_severity,
        p_title,
        p_description,
        v_ip_address,
        v_user_id,
        v_session_id,
        p_event_data,
        p_affected_resources
    ) RETURNING id INTO v_event_id;
    
    -- Check if we should create an alert
    v_should_alert := p_severity IN ('error', 'critical') OR 
                     p_event_type IN ('authentication_failure', 'privilege_escalation', 'data_breach');
    
    -- Create security alert if needed
    IF v_should_alert THEN
        PERFORM create_security_alert(
            p_event_type,
            p_title,
            p_description,
            p_severity,
            'automated',
            v_event_id::text,
            v_user_id,
            p_event_data
        );
    END IF;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update security event status
CREATE OR REPLACE FUNCTION update_security_event_status(
    p_event_id UUID,
    p_status TEXT,
    p_assigned_to UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_response_time INTEGER;
BEGIN
    -- Get the event creation time for response time calculation
    SELECT detected_at INTO v_start_time
    FROM security_events
    WHERE id = p_event_id;
    
    IF v_start_time IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate response time if resolving
    IF p_status = 'resolved' THEN
        v_response_time := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;
    END IF;
    
    -- Update the event
    UPDATE security_events SET
        status = p_status,
        assigned_to = p_assigned_to,
        updated_at = NOW(),
        resolved_at = CASE WHEN p_status = 'resolved' THEN NOW() ELSE resolved_at END,
        response_time_minutes = COALESCE(v_response_time, response_time_minutes),
        metadata = metadata || jsonb_build_object(
            'status_updated_at', NOW(),
            'status_updated_by', auth.uid(),
            'notes', p_notes
        )
    WHERE id = p_event_id;
    
    -- Create audit log for status change
    PERFORM create_enhanced_audit_log(
        'security_event_status_change',
        'security_event',
        p_event_id::text,
        'security_events',
        NULL,
        jsonb_build_object('status', p_status, 'assigned_to', p_assigned_to),
        ARRAY['security'],
        'medium'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SECURITY ALERT FUNCTIONS
-- =============================================

-- Create security alert
CREATE OR REPLACE FUNCTION create_security_alert(
    p_alert_type TEXT,
    p_title TEXT,
    p_description TEXT,
    p_severity TEXT,
    p_source_type TEXT DEFAULT 'automated',
    p_source_reference TEXT DEFAULT NULL,
    p_affected_user_id UUID DEFAULT NULL,
    p_alert_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
    v_escalation_level INTEGER := 1;
BEGIN
    -- Determine escalation level based on severity
    v_escalation_level := CASE p_severity
        WHEN 'critical' THEN 3
        WHEN 'high' THEN 2
        ELSE 1
    END;
    
    -- Insert security alert
    INSERT INTO security_alerts (
        alert_type,
        title,
        description,
        severity,
        source_type,
        source_reference,
        affected_user_id,
        alert_data,
        escalation_level
    ) VALUES (
        p_alert_type,
        p_title,
        p_description,
        p_severity,
        p_source_type,
        p_source_reference,
        p_affected_user_id,
        p_alert_data,
        v_escalation_level
    ) RETURNING id INTO v_alert_id;
    
    -- Send notifications for high-priority alerts
    IF p_severity IN ('high', 'critical') THEN
        PERFORM send_security_notification(v_alert_id);
    END IF;
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security alert acknowledgment
CREATE OR REPLACE FUNCTION acknowledge_security_alert(
    p_alert_id UUID,
    p_assigned_to UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE security_alerts SET
        status = 'acknowledged',
        assigned_to = COALESCE(p_assigned_to, auth.uid()),
        acknowledged_at = NOW()
    WHERE id = p_alert_id AND status = 'new';
    
    IF FOUND THEN
        -- Create audit log
        PERFORM create_enhanced_audit_log(
            'security_alert_acknowledged',
            'security_alert',
            p_alert_id::text,
            'security_alerts',
            NULL,
            jsonb_build_object('acknowledged_by', COALESCE(p_assigned_to, auth.uid())),
            ARRAY['security'],
            'low'
        );
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SESSION MANAGEMENT FUNCTIONS
-- =============================================

-- Create user session with security checks
CREATE OR REPLACE FUNCTION create_user_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_expires_at TIMESTAMPTZ,
    p_device_fingerprint TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_is_trusted BOOLEAN := FALSE;
    v_risk_score INTEGER := 0;
    v_location_data JSONB;
BEGIN
    -- Check if device is trusted (has been used before successfully)
    SELECT TRUE INTO v_is_trusted
    FROM user_sessions
    WHERE user_id = p_user_id 
      AND device_fingerprint = p_device_fingerprint
      AND terminated_at IS NULL
    LIMIT 1;
    
    v_is_trusted := COALESCE(v_is_trusted, FALSE);
    
    -- Calculate risk score based on various factors
    v_risk_score := calculate_session_risk_score(p_user_id, p_ip_address, p_user_agent, v_is_trusted);
    
    -- Get location data (simplified - in real implementation, use GeoIP service)
    v_location_data := get_ip_location_data(p_ip_address);
    
    -- Insert session
    INSERT INTO user_sessions (
        user_id,
        session_token,
        ip_address,
        user_agent,
        device_fingerprint,
        location_country,
        location_city,
        is_trusted_device,
        risk_score,
        expires_at
    ) VALUES (
        p_user_id,
        p_session_token,
        p_ip_address,
        p_user_agent,
        p_device_fingerprint,
        v_location_data->>'country',
        v_location_data->>'city',
        v_is_trusted,
        v_risk_score,
        p_expires_at
    ) RETURNING id INTO v_session_id;
    
    -- Create security event for high-risk sessions
    IF v_risk_score > 70 THEN
        PERFORM create_security_event(
            'high_risk_session',
            'warning',
            'High-risk session detected',
            'Session created with risk score: ' || v_risk_score,
            jsonb_build_object(
                'session_id', v_session_id,
                'risk_score', v_risk_score,
                'is_trusted', v_is_trusted,
                'ip_address', p_ip_address,
                'user_agent', p_user_agent
            )
        );
    END IF;
    
    -- Create audit log
    PERFORM create_enhanced_audit_log(
        'session_created',
        'user_session',
        v_session_id::text,
        'user_sessions',
        NULL,
        jsonb_build_object(
            'user_id', p_user_id,
            'ip_address', p_ip_address,
            'risk_score', v_risk_score,
            'is_trusted', v_is_trusted
        ),
        ARRAY['authentication'],
        CASE WHEN v_risk_score > 70 THEN 'high' ELSE 'low' END
    );
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Terminate user session
CREATE OR REPLACE FUNCTION terminate_user_session(
    p_session_token TEXT,
    p_reason TEXT DEFAULT 'manual_logout'
) RETURNS BOOLEAN AS $$
DECLARE
    v_session_record RECORD;
BEGIN
    -- Get session details and mark as terminated
    UPDATE user_sessions SET
        is_active = FALSE,
        terminated_at = NOW(),
        termination_reason = p_reason
    WHERE session_token = p_session_token 
      AND is_active = TRUE
    RETURNING * INTO v_session_record;
    
    IF FOUND THEN
        -- Create audit log
        PERFORM create_enhanced_audit_log(
            'session_terminated',
            'user_session',
            v_session_record.id::text,
            'user_sessions',
            NULL,
            jsonb_build_object(
                'reason', p_reason,
                'duration_minutes', EXTRACT(EPOCH FROM (NOW() - v_session_record.created_at)) / 60
            ),
            ARRAY['authentication'],
            'low'
        );
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
    p_session_token TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_sessions SET
        last_activity = NOW()
    WHERE session_token = p_session_token 
      AND is_active = TRUE
      AND expires_at > NOW();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUTHENTICATION TRACKING FUNCTIONS
-- =============================================

-- Log authentication attempt
CREATE OR REPLACE FUNCTION log_auth_attempt(
    p_email TEXT,
    p_attempt_type TEXT,
    p_success BOOLEAN,
    p_failure_reason TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_attempt_id UUID;
    v_user_id UUID;
    v_is_suspicious BOOLEAN := FALSE;
    v_blocked_by_rate_limit BOOLEAN := FALSE;
    v_threat_score INTEGER := 0;
    v_recent_failures INTEGER;
BEGIN
    -- Try to get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    -- Check for suspicious activity
    IF NOT p_success THEN
        -- Count recent failures from this IP
        SELECT COUNT(*) INTO v_recent_failures
        FROM auth_attempts
        WHERE ip_address = p_ip_address
          AND success = FALSE
          AND attempted_at > NOW() - INTERVAL '1 hour';
        
        v_is_suspicious := v_recent_failures >= 3;
        v_threat_score := LEAST(v_recent_failures * 20, 100);
        
        -- Check if this should be blocked by rate limiting
        v_blocked_by_rate_limit := check_rate_limit('auth_ip', p_ip_address::text, 'auth', 5, 15);
    END IF;
    
    -- Insert authentication attempt
    INSERT INTO auth_attempts (
        email,
        user_id,
        attempt_type,
        success,
        failure_reason,
        ip_address,
        user_agent,
        is_suspicious,
        blocked_by_rate_limit,
        threat_score
    ) VALUES (
        p_email,
        v_user_id,
        p_attempt_type,
        p_success,
        p_failure_reason,
        p_ip_address,
        p_user_agent,
        v_is_suspicious,
        v_blocked_by_rate_limit,
        v_threat_score
    ) RETURNING id INTO v_attempt_id;
    
    -- Create security events for suspicious activity
    IF v_is_suspicious OR v_blocked_by_rate_limit THEN
        PERFORM create_security_event(
            'suspicious_auth_activity',
            CASE WHEN v_blocked_by_rate_limit THEN 'error' ELSE 'warning' END,
            'Suspicious authentication activity detected',
            'Multiple failed attempts from IP: ' || p_ip_address || ' for email: ' || p_email,
            jsonb_build_object(
                'attempt_id', v_attempt_id,
                'recent_failures', v_recent_failures,
                'threat_score', v_threat_score,
                'blocked', v_blocked_by_rate_limit
            )
        );
    END IF;
    
    RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RATE LIMITING FUNCTIONS
-- =============================================

-- Check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier_type TEXT,
    p_identifier_value TEXT,
    p_endpoint_pattern TEXT,
    p_limit INTEGER,
    p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER := 0;
    v_is_exceeded BOOLEAN := FALSE;
BEGIN
    -- Calculate window start time
    v_window_start := date_trunc('minute', NOW()) - 
                     (EXTRACT(minute FROM NOW())::INTEGER % p_window_minutes) * INTERVAL '1 minute';
    
    -- Insert or update rate limit record
    INSERT INTO rate_limits (
        identifier_type,
        identifier_value,
        endpoint_pattern,
        window_start,
        window_duration_minutes,
        request_count
    ) VALUES (
        p_identifier_type,
        p_identifier_value,
        p_endpoint_pattern,
        v_window_start,
        p_window_minutes,
        1
    )
    ON CONFLICT (identifier_type, identifier_value, endpoint_pattern, window_start)
    DO UPDATE SET
        request_count = rate_limits.request_count + 1,
        updated_at = NOW()
    RETURNING request_count, limit_exceeded INTO v_current_count, v_is_exceeded;
    
    -- Check if limit is exceeded
    v_is_exceeded := v_current_count > p_limit;
    
    -- Update exceeded flag if necessary
    IF v_is_exceeded AND NOT COALESCE((SELECT limit_exceeded FROM rate_limits 
                                      WHERE identifier_type = p_identifier_type 
                                        AND identifier_value = p_identifier_value 
                                        AND endpoint_pattern = p_endpoint_pattern 
                                        AND window_start = v_window_start), FALSE) THEN
        UPDATE rate_limits SET
            limit_exceeded = TRUE
        WHERE identifier_type = p_identifier_type 
          AND identifier_value = p_identifier_value 
          AND endpoint_pattern = p_endpoint_pattern 
          AND window_start = v_window_start;
    END IF;
    
    RETURN v_is_exceeded;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Calculate session risk score
CREATE OR REPLACE FUNCTION calculate_session_risk_score(
    p_user_id UUID,
    p_ip_address INET,
    p_user_agent TEXT,
    p_is_trusted_device BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
    v_risk_score INTEGER := 0;
    v_ip_reputation INTEGER;
    v_unusual_time BOOLEAN;
    v_new_location BOOLEAN;
BEGIN
    -- Base risk for untrusted devices
    IF NOT p_is_trusted_device THEN
        v_risk_score := v_risk_score + 30;
    END IF;
    
    -- Check IP reputation (simplified - would use threat intelligence)
    SELECT COALESCE(confidence_score, 0) INTO v_ip_reputation
    FROM threat_indicators
    WHERE indicator_type = 'ip' 
      AND indicator_value = p_ip_address::text
      AND is_active = TRUE
    ORDER BY confidence_score DESC
    LIMIT 1;
    
    v_risk_score := v_risk_score + COALESCE(v_ip_reputation, 0);
    
    -- Check if login is at unusual time (simplified)
    v_unusual_time := EXTRACT(hour FROM NOW()) NOT BETWEEN 6 AND 22;
    IF v_unusual_time THEN
        v_risk_score := v_risk_score + 20;
    END IF;
    
    -- Check if IP is from new location (simplified)
    SELECT NOT EXISTS(
        SELECT 1 FROM user_sessions
        WHERE user_id = p_user_id
          AND ip_address = p_ip_address
          AND created_at > NOW() - INTERVAL '30 days'
    ) INTO v_new_location;
    
    IF v_new_location THEN
        v_risk_score := v_risk_score + 25;
    END IF;
    
    RETURN LEAST(v_risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get IP location data (stub - would integrate with GeoIP service)
CREATE OR REPLACE FUNCTION get_ip_location_data(
    p_ip_address INET
) RETURNS JSONB AS $$
BEGIN
    -- In a real implementation, this would call a GeoIP service
    -- For now, return mock data
    RETURN jsonb_build_object(
        'country', 'BR',
        'city', 'São Paulo',
        'latitude', -23.5505,
        'longitude', -46.6333
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM clinic_staff
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;
    
    RETURN COALESCE(v_role, 'patient');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user clinic ID
CREATE OR REPLACE FUNCTION get_user_clinic_id(
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_clinic_id UUID;
BEGIN
    SELECT clinic_id INTO v_clinic_id
    FROM clinic_staff
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;
    
    IF v_clinic_id IS NULL THEN
        SELECT clinic_id INTO v_clinic_id
        FROM patients
        WHERE user_id = p_user_id AND status = 'active'
        LIMIT 1;
    END IF;
    
    RETURN v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send security notification (stub)
CREATE OR REPLACE FUNCTION send_security_notification(
    p_alert_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- In a real implementation, this would integrate with notification services
    -- For now, just log the notification request
    INSERT INTO audit_logs (
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        'security_notification_sent',
        'security_alert',
        p_alert_id::text,
        jsonb_build_object(
            'notification_type', 'security_alert',
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMPLIANCE AUDIT FUNCTIONS
-- =============================================

-- Create compliance audit
CREATE OR REPLACE FUNCTION create_compliance_audit(
    p_audit_type TEXT,
    p_title TEXT,
    p_scope_areas TEXT[],
    p_scheduled_date DATE DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO compliance_audits (
        audit_type,
        title,
        description,
        scope_areas,
        scheduled_date,
        created_by
    ) VALUES (
        p_audit_type,
        p_title,
        p_description,
        p_scope_areas,
        COALESCE(p_scheduled_date, CURRENT_DATE),
        auth.uid()
    ) RETURNING id INTO v_audit_id;
    
    -- Create audit log
    PERFORM create_enhanced_audit_log(
        'compliance_audit_created',
        'compliance_audit',
        v_audit_id::text,
        'compliance_audits',
        NULL,
        jsonb_build_object(
            'audit_type', p_audit_type,
            'scope_areas', p_scope_areas
        ),
        ARRAY['compliance', p_audit_type],
        'medium'
    );
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete compliance audit
CREATE OR REPLACE FUNCTION complete_compliance_audit(
    p_audit_id UUID,
    p_compliance_score INTEGER,
    p_findings JSONB DEFAULT '{}',
    p_recommendations JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE compliance_audits SET
        status = 'completed',
        compliance_score = p_compliance_score,
        findings = p_findings,
        recommendations = p_recommendations,
        completed_at = NOW()
    WHERE id = p_audit_id;
    
    IF FOUND THEN
        -- Create audit log
        PERFORM create_enhanced_audit_log(
            'compliance_audit_completed',
            'compliance_audit',
            p_audit_id::text,
            'compliance_audits',
            NULL,
            jsonb_build_object(
                'compliance_score', p_compliance_score,
                'findings_count', jsonb_array_length(p_findings),
                'recommendations_count', jsonb_array_length(p_recommendations)
            ),
            ARRAY['compliance'],
            'medium'
        );
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ENCRYPTION KEY MANAGEMENT FUNCTIONS
-- =============================================

-- Create encryption key
CREATE OR REPLACE FUNCTION create_encryption_key(
    p_key_id TEXT,
    p_key_type TEXT,
    p_algorithm TEXT,
    p_purpose TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_key_uuid UUID;
    v_encrypted_material TEXT;
BEGIN
    -- Generate key material (in real implementation, use proper key generation)
    v_encrypted_material := encode(gen_random_bytes(32), 'base64');
    
    INSERT INTO encryption_keys (
        key_id,
        key_type,
        algorithm,
        encrypted_key_material,
        purpose,
        usage_count
    ) VALUES (
        p_key_id,
        p_key_type,
        p_algorithm,
        v_encrypted_material,
        p_purpose,
        0
    ) RETURNING id INTO v_key_uuid;
    
    -- Create audit log
    PERFORM create_enhanced_audit_log(
        'encryption_key_created',
        'encryption_key',
        v_key_uuid::text,
        'encryption_keys',
        NULL,
        jsonb_build_object(
            'key_id', p_key_id,
            'key_type', p_key_type,
            'algorithm', p_algorithm
        ),
        ARRAY['security', 'encryption'],
        'high'
    );
    
    RETURN v_key_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rotate encryption key
CREATE OR REPLACE FUNCTION rotate_encryption_key(
    p_old_key_id TEXT,
    p_new_key_id TEXT
) RETURNS UUID AS $$
DECLARE
    v_rotation_id UUID;
    v_old_key_uuid UUID;
    v_new_key_uuid UUID;
BEGIN
    -- Get old key UUID
    SELECT id INTO v_old_key_uuid FROM encryption_keys WHERE key_id = p_old_key_id AND status = 'active';
    IF v_old_key_uuid IS NULL THEN
        RAISE EXCEPTION 'Old key not found or not active';
    END IF;
    
    -- Create new key
    v_new_key_uuid := create_encryption_key(
        p_new_key_id,
        (SELECT key_type FROM encryption_keys WHERE id = v_old_key_uuid),
        (SELECT algorithm FROM encryption_keys WHERE id = v_old_key_uuid),
        (SELECT purpose FROM encryption_keys WHERE id = v_old_key_uuid)
    );
    
    -- Mark old key as rotated
    UPDATE encryption_keys SET
        status = 'rotated',
        rotated_at = NOW()
    WHERE id = v_old_key_uuid;
    
    -- Create rotation record
    INSERT INTO key_rotations (
        old_key_id,
        new_key_id,
        initiated_by,
        status
    ) VALUES (
        v_old_key_uuid,
        v_new_key_uuid,
        auth.uid(),
        'initiated'
    ) RETURNING id INTO v_rotation_id;
    
    RETURN v_rotation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Clean up old audit logs (keep for compliance period)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_retention_days INTEGER DEFAULT 2555 -- 7 years for healthcare compliance
) RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
      AND risk_level = 'low'
      AND NOT ('LGPD' = ANY(compliance_flags) OR 'ANVISA' = ANY(compliance_flags) OR 'CFM' = ANY(compliance_flags));
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    PERFORM create_enhanced_audit_log(
        'audit_log_cleanup',
        'system',
        NULL,
        'audit_logs',
        NULL,
        jsonb_build_object('deleted_count', v_deleted_count),
        ARRAY['maintenance'],
        'low'
    );
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    v_cleaned_count INTEGER;
BEGIN
    UPDATE user_sessions SET
        is_active = FALSE,
        terminated_at = NOW(),
        termination_reason = 'expired'
    WHERE is_active = TRUE 
      AND expires_at < NOW();
    
    GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;
    
    RETURN v_cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark migration as complete
SELECT 'Audit trail system functions created successfully' as result;