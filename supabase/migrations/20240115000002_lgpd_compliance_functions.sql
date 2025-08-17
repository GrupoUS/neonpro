-- LGPD Compliance Helper Functions
-- NeonPro Healthcare Clinic Management System
-- Created: 2024-01-15

-- ============================================================================
-- HELPER FUNCTIONS FOR LGPD COMPLIANCE
-- ============================================================================

-- Function to get user role (used in RLS policies)
CREATE OR REPLACE FUNCTION user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has valid consent for a purpose
CREATE OR REPLACE FUNCTION has_valid_consent(
  p_user_id UUID,
  p_purpose_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  consent_record RECORD;
BEGIN
  SELECT uc.* 
  INTO consent_record
  FROM user_consents uc
  JOIN consent_purposes cp ON uc.purpose_id = cp.id
  WHERE uc.user_id = p_user_id
    AND cp.name = p_purpose_name
    AND uc.granted = true
    AND uc.withdrawn_at IS NULL
    AND (uc.expiry_date IS NULL OR uc.expiry_date > NOW())
  ORDER BY uc.granted_at DESC
  LIMIT 1;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically grant required consents for new users
CREATE OR REPLACE FUNCTION grant_required_consents(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  purpose_record RECORD;
BEGIN
  FOR purpose_record IN 
    SELECT * FROM consent_purposes WHERE required = true AND active = true
  LOOP
    INSERT INTO user_consents (
      user_id,
      purpose_id,
      granted,
      legal_basis,
      consent_version,
      ip_address,
      user_agent
    ) VALUES (
      p_user_id,
      purpose_record.id,
      true,
      purpose_record.legal_basis,
      purpose_record.version,
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent'
    )
    ON CONFLICT (user_id, purpose_id, consent_version) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to withdraw consent
CREATE OR REPLACE FUNCTION withdraw_consent(
  p_user_id UUID,
  p_purpose_name TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  purpose_id UUID;
  updated_count INTEGER;
BEGIN
  -- Get purpose ID
  SELECT id INTO purpose_id
  FROM consent_purposes
  WHERE name = p_purpose_name AND active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid consent purpose: %', p_purpose_name;
  END IF;
  
  -- Update consent record
  UPDATE user_consents
  SET 
    withdrawn_at = NOW(),
    withdrawal_reason = p_reason,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND purpose_id = purpose_id
    AND granted = true
    AND withdrawn_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the withdrawal
  INSERT INTO lgpd_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    timestamp
  ) VALUES (
    p_user_id,
    'consent_withdrawn',
    'consent',
    purpose_id::text,
    jsonb_build_object('purpose', p_purpose_name, 'reason', p_reason),
    NOW()
  );
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate data export for user
CREATE OR REPLACE FUNCTION generate_user_data_export(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
  export_data JSONB;
BEGIN
  -- Build comprehensive user data export
  SELECT jsonb_build_object(
    'personal_data', (
      SELECT jsonb_build_object(
        'id', id,
        'email', email,
        'name', name,
        'phone', phone,
        'created_at', created_at,
        'updated_at', updated_at
      )
      FROM users WHERE id = p_user_id
    ),
    'consents', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'purpose', cp.name,
          'granted', uc.granted,
          'granted_at', uc.granted_at,
          'withdrawn_at', uc.withdrawn_at,
          'legal_basis', uc.legal_basis,
          'version', uc.consent_version
        )
      )
      FROM user_consents uc
      JOIN consent_purposes cp ON uc.purpose_id = cp.id
      WHERE uc.user_id = p_user_id
    ),
    'data_requests', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'type', request_type,
          'status', status,
          'requested_at', requested_at,
          'completed_at', completed_at
        )
      )
      FROM data_subject_requests
      WHERE user_id = p_user_id
    ),
    'audit_logs', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'action', action,
          'resource_type', resource_type,
          'timestamp', timestamp
        )
      )
      FROM lgpd_audit_logs
      WHERE user_id = p_user_id
      ORDER BY timestamp DESC
      LIMIT 100
    ),
    'export_metadata', jsonb_build_object(
      'generated_at', NOW(),
      'format_version', '1.0',
      'data_controller', 'NeonPro Healthcare',
      'retention_notice', 'This export will be automatically deleted after 30 days'
    )
  ) INTO export_data;
  
  RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data (for LGPD compliance)
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  anonymized_email TEXT;
  anonymized_name TEXT;
BEGIN
  -- Generate anonymized identifiers
  anonymized_email := 'anonymized_' || extract(epoch from now())::bigint || '@deleted.local';
  anonymized_name := 'Anonymized User ' || extract(epoch from now())::bigint;
  
  -- Anonymize user data
  UPDATE users SET
    email = anonymized_email,
    name = anonymized_name,
    phone = NULL,
    cpf = NULL,
    address = NULL,
    birth_date = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Mark as anonymized in audit log
  INSERT INTO lgpd_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    timestamp
  ) VALUES (
    p_user_id,
    'data_anonymized',
    'user',
    p_user_id::text,
    jsonb_build_object('anonymized_at', NOW()),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check data retention compliance
CREATE OR REPLACE FUNCTION check_data_retention_compliance()
RETURNS TABLE(
  category TEXT,
  expired_records_count BIGINT,
  action_required TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH retention_analysis AS (
    SELECT 
      drs.data_category,
      drs.retention_period,
      drs.disposal_method,
      CASE drs.data_category
        WHEN 'personal_identification' THEN (
          SELECT COUNT(*) FROM users 
          WHERE created_at < NOW() - drs.retention_period
            AND updated_at < NOW() - drs.retention_period
        )
        WHEN 'audit_logs' THEN (
          SELECT COUNT(*) FROM lgpd_audit_logs 
          WHERE timestamp < NOW() - drs.retention_period
        )
        WHEN 'consent_records' THEN (
          SELECT COUNT(*) FROM user_consents 
          WHERE created_at < NOW() - drs.retention_period
        )
        ELSE 0
      END as expired_count
    FROM data_retention_schedules drs
    WHERE active = true
  )
  SELECT 
    ra.data_category,
    ra.expired_count,
    CASE 
      WHEN ra.expired_count > 0 THEN 'Schedule for ' || ra.disposal_method
      ELSE 'No action required'
    END
  FROM retention_analysis ra
  WHERE ra.expired_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create data subject request
CREATE OR REPLACE FUNCTION create_data_subject_request(
  p_user_id UUID,
  p_request_type data_subject_request_type,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  request_id UUID;
  verification_token TEXT;
BEGIN
  -- Generate verification token
  verification_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create the request
  INSERT INTO data_subject_requests (
    user_id,
    request_type,
    due_date,
    request_details,
    verification_token,
    verification_expires_at
  ) VALUES (
    p_user_id,
    p_request_type,
    NOW() + INTERVAL '15 days', -- LGPD requires response within 15 days
    p_details,
    verification_token,
    NOW() + INTERVAL '7 days' -- Verification token expires in 7 days
  ) RETURNING id INTO request_id;
  
  -- Log the request creation
  INSERT INTO lgpd_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    timestamp
  ) VALUES (
    p_user_id,
    'data_request_created',
    'data_subject_request',
    request_id::text,
    jsonb_build_object('type', p_request_type, 'details', p_details),
    NOW()
  );
  
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process data erasure request
CREATE OR REPLACE FUNCTION process_erasure_request(p_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
  user_has_medical_data BOOLEAN;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM data_subject_requests
  WHERE id = p_request_id AND request_type = 'erasure';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Erasure request not found: %', p_request_id;
  END IF;
  
  -- Check if user has medical data requiring retention
  SELECT EXISTS(
    SELECT 1 FROM medical_records WHERE patient_id = request_record.user_id
    UNION ALL
    SELECT 1 FROM treatments WHERE patient_id = request_record.user_id
    UNION ALL
    SELECT 1 FROM prescriptions WHERE patient_id = request_record.user_id
  ) INTO user_has_medical_data;
  
  IF user_has_medical_data THEN
    -- Anonymize instead of delete (medical data retention required)
    PERFORM anonymize_user_data(request_record.user_id);
    
    -- Update request status
    UPDATE data_subject_requests
    SET 
      status = 'completed',
      completed_at = NOW(),
      response_data = jsonb_build_object(
        'action_taken', 'data_anonymized',
        'reason', 'Medical data retention required by CFM regulations'
      )
    WHERE id = p_request_id;
    
  ELSE
    -- Complete deletion possible
    DELETE FROM users WHERE id = request_record.user_id;
    
    -- Update request status
    UPDATE data_subject_requests
    SET 
      status = 'completed',
      completed_at = NOW(),
      response_data = jsonb_build_object(
        'action_taken', 'data_deleted',
        'reason', 'Complete account deletion'
      )
    WHERE id = p_request_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify of potential data breach
CREATE OR REPLACE FUNCTION report_potential_breach(
  p_description TEXT,
  p_severity breach_severity,
  p_data_categories TEXT[],
  p_affected_subjects INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  incident_id UUID;
  incident_ref TEXT;
BEGIN
  -- Generate unique incident reference
  incident_ref := 'BREACH-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
                  lpad(nextval('breach_incident_seq')::text, 4, '0');
  
  -- Create breach incident record
  INSERT INTO data_breach_incidents (
    incident_ref,
    severity,
    discovered_at,
    affected_data_subjects,
    data_categories_affected,
    description,
    investigation_status
  ) VALUES (
    incident_ref,
    p_severity,
    NOW(),
    p_affected_subjects,
    p_data_categories,
    p_description,
    'ongoing'
  ) RETURNING id INTO incident_id;
  
  -- If high or critical severity, schedule automatic ANPD notification
  IF p_severity IN ('high', 'critical') THEN
    -- This would trigger external notification system
    PERFORM pg_notify('breach_notification', jsonb_build_object(
      'incident_id', incident_id,
      'severity', p_severity,
      'notification_deadline', NOW() + INTERVAL '72 hours'
    )::text);
  END IF;
  
  RETURN incident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATED COMPLIANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to run daily compliance checks
CREATE OR REPLACE FUNCTION run_daily_compliance_checks()
RETURNS VOID AS $$
DECLARE
  check_date TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Check 1: Ensure all required consents are in place
  INSERT INTO lgpd_compliance_checks (
    check_name,
    check_category,
    compliance_requirement,
    check_result,
    check_date,
    automated_check
  )
  SELECT 
    'Required Consents Coverage',
    'consent_management',
    'All active users must have required consents',
    NOT EXISTS(
      SELECT 1 FROM users u
      WHERE NOT EXISTS(
        SELECT 1 FROM user_consents uc
        JOIN consent_purposes cp ON uc.purpose_id = cp.id
        WHERE uc.user_id = u.id 
          AND cp.required = true 
          AND uc.granted = true 
          AND uc.withdrawn_at IS NULL
      )
    ),
    check_date,
    true;
    
  -- Check 2: Data retention compliance
  INSERT INTO lgpd_compliance_checks (
    check_name,
    check_category,
    compliance_requirement,
    check_result,
    check_date,
    automated_check,
    non_compliance_reason
  )
  SELECT 
    'Data Retention Compliance',
    'data_retention',
    'No data should exceed retention periods',
    (SELECT COUNT(*) FROM check_data_retention_compliance()) = 0,
    check_date,
    true,
    CASE 
      WHEN (SELECT COUNT(*) FROM check_data_retention_compliance()) > 0 
      THEN 'Data exceeding retention periods found'
      ELSE NULL 
    END;
    
  -- Check 3: Outstanding data subject requests
  INSERT INTO lgpd_compliance_checks (
    check_name,
    check_category,
    compliance_requirement,
    check_result,
    check_date,
    automated_check,
    non_compliance_reason
  )
  SELECT 
    'Data Subject Request Timeliness',
    'data_subject_rights',
    'All requests must be processed within 15 days',
    NOT EXISTS(
      SELECT 1 FROM data_subject_requests 
      WHERE status = 'pending' AND due_date < NOW()
    ),
    check_date,
    true,
    CASE 
      WHEN EXISTS(SELECT 1 FROM data_subject_requests WHERE status = 'pending' AND due_date < NOW())
      THEN 'Overdue data subject requests found'
      ELSE NULL 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for breach incident references
CREATE SEQUENCE IF NOT EXISTS breach_incident_seq START 1;

-- ============================================================================
-- TRIGGERS FOR NEW USER REGISTRATION
-- ============================================================================

-- Trigger to automatically grant required consents for new users
CREATE OR REPLACE FUNCTION new_user_lgpd_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant required consents
  PERFORM grant_required_consents(NEW.id);
  
  -- Log user creation for LGPD audit
  INSERT INTO lgpd_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    timestamp
  ) VALUES (
    NEW.id,
    'user_registered',
    'user',
    NEW.id::text,
    jsonb_build_object('email', NEW.email, 'registration_method', 'web'),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS new_user_lgpd_setup_trigger ON users;
CREATE TRIGGER new_user_lgpd_setup_trigger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION new_user_lgpd_setup();

COMMIT;