-- NeonPro Appointment Management SQL Functions
-- Based on VIBECODE MCP Research for Task 5 Implementation
-- 
-- Context7: React calendar patterns requiring backend support
-- Tavily: Healthcare no-show statistics (27% avg, $150B annual cost)
-- Exa: Cancellation policies (24-48h rules, automated reminders, waitlist management)

-- ============================================================================
-- FUNCTION: cancel_patient_appointment
-- Handles appointment cancellation with policy enforcement
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_patient_appointment(
  appointment_id UUID,
  cancellation_reason TEXT,
  is_emergency BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  fee_applied BOOLEAN,
  fee_amount DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record RECORD;
  policy_record RECORD;
  hours_until_appointment INTEGER;
  fee_applies BOOLEAN DEFAULT FALSE;
  fee_amount DECIMAL(10,2) DEFAULT 0;
  current_user_id UUID;
BEGIN
  -- Get current user from auth context
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Usuário não autenticado'::TEXT, FALSE, 0::DECIMAL(10,2);
    RETURN;
  END IF;

  -- Get appointment details with policy check
  SELECT a.*, 
         EXTRACT(EPOCH FROM (
           (a.appointment_date + a.appointment_time::TIME) - NOW()
         )) / 3600 AS hours_until
  INTO appointment_record
  FROM appointments a
  WHERE a.id = appointment_id
    AND a.patient_id = current_user_id
    AND a.status = 'confirmed';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Agendamento não encontrado ou não pode ser cancelado'::TEXT, FALSE, 0::DECIMAL(10,2);
    RETURN;
  END IF;

  hours_until_appointment := appointment_record.hours_until;

  -- Get cancellation policy
  SELECT config
  INTO policy_record
  FROM clinic_policies
  WHERE policy_type = 'appointment_cancellation'
  LIMIT 1;

  -- Apply policy rules (default: 24h minimum)
  DECLARE
    minimum_hours INTEGER DEFAULT 24;
    policy_fee_amount DECIMAL(10,2) DEFAULT 0;
    policy_fee_applies BOOLEAN DEFAULT FALSE;
  BEGIN
    IF policy_record.config IS NOT NULL THEN
      minimum_hours := COALESCE((policy_record.config->>'minimum_hours')::INTEGER, 24);
      policy_fee_amount := COALESCE((policy_record.config->>'fee_amount')::DECIMAL(10,2), 0);
      policy_fee_applies := COALESCE((policy_record.config->>'fee_applies')::BOOLEAN, FALSE);
    END IF;

    -- Check if cancellation is within policy
    IF hours_until_appointment < minimum_hours AND NOT is_emergency THEN
      -- Late cancellation - apply fee if configured
      IF policy_fee_applies THEN
        fee_applies := TRUE;
        fee_amount := policy_fee_amount;
      END IF;
    END IF;
  END;

  -- Perform cancellation
  UPDATE appointments 
  SET 
    status = 'cancelled',
    cancellation_reason = cancel_patient_appointment.cancellation_reason,
    cancellation_date = NOW(),
    updated_at = NOW()
  WHERE id = appointment_id;

  -- Log cancellation for analytics (based on Tavily research insights)
  INSERT INTO appointment_analytics (
    appointment_id,
    patient_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    appointment_id,
    current_user_id,
    'cancellation',
    jsonb_build_object(
      'reason', cancellation_reason,
      'hours_until', hours_until_appointment,
      'is_emergency', is_emergency,
      'fee_applied', fee_applies,
      'fee_amount', fee_amount
    ),
    NOW()
  );

  -- If fee applies, create billing record
  IF fee_applies AND fee_amount > 0 THEN
    INSERT INTO patient_billing (
      patient_id,
      appointment_id,
      description,
      amount,
      billing_type,
      status,
      created_at
    ) VALUES (
      current_user_id,
      appointment_id,
      'Taxa de cancelamento tardio',
      fee_amount,
      'cancellation_fee',
      'pending',
      NOW()
    );
  END IF;

  -- Try to fill slot from waitlist (based on Exa research on waitlist management)
  PERFORM notify_waitlist_for_available_slot(
    appointment_record.appointment_date,
    appointment_record.appointment_time,
    appointment_record.service_id,
    appointment_record.professional_id
  );

  -- Return success with policy information
  RETURN QUERY SELECT 
    TRUE,
    CASE 
      WHEN fee_applies THEN 'Agendamento cancelado. Taxa de cancelamento tardio aplicada.'
      ELSE 'Agendamento cancelado com sucesso.'
    END::TEXT,
    fee_applies,
    fee_amount;
END;
$$;

-- ============================================================================
-- FUNCTION: get_appointment_cancellation_policies
-- Returns current cancellation policies for frontend display
-- ============================================================================
CREATE OR REPLACE FUNCTION get_appointment_cancellation_policies()
RETURNS TABLE (
  minimum_hours INTEGER,
  fee_amount DECIMAL(10,2),
  fee_applies BOOLEAN,
  emergency_exceptions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_config JSONB;
BEGIN
  SELECT config INTO policy_config
  FROM clinic_policies
  WHERE policy_type = 'appointment_cancellation'
  LIMIT 1;

  IF policy_config IS NULL THEN
    -- Default policy based on Exa research standards
    RETURN QUERY SELECT 
      24::INTEGER,
      0::DECIMAL(10,2),
      FALSE::BOOLEAN,
      ARRAY['medical_emergency', 'family_emergency', 'illness']::TEXT[];
  ELSE
    RETURN QUERY SELECT
      COALESCE((policy_config->>'minimum_hours')::INTEGER, 24),
      COALESCE((policy_config->>'fee_amount')::DECIMAL(10,2), 0),
      COALESCE((policy_config->>'fee_applies')::BOOLEAN, FALSE),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(policy_config->'emergency_exceptions')),
        ARRAY['medical_emergency', 'family_emergency', 'illness']::TEXT[]
      );
  END IF;
END;
$$;

-- ============================================================================
-- FUNCTION: notify_waitlist_for_available_slot
-- Notifies patients on waitlist when a slot becomes available
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_waitlist_for_available_slot(
  slot_date DATE,
  slot_time TIME,
  service_id UUID,
  professional_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  waitlist_record RECORD;
BEGIN
  -- Find patients on waitlist for this service and time range
  SELECT w.*, p.email, p.phone
  INTO waitlist_record
  FROM appointment_waitlist w
  JOIN profiles p ON p.id = w.patient_id
  WHERE w.service_id = notify_waitlist_for_available_slot.service_id
    AND w.status = 'active'
    AND (w.preferred_professional_id IS NULL OR w.preferred_professional_id = professional_id)
    AND w.preferred_date_start <= slot_date
    AND w.preferred_date_end >= slot_date
  ORDER BY w.created_at ASC
  LIMIT 1;

  IF FOUND THEN
    -- Create notification
    INSERT INTO patient_notifications (
      patient_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      waitlist_record.patient_id,
      'waitlist_availability',
      'Vaga Disponível!',
      'Uma vaga abriu para o serviço que você está aguardando. Agende agora!',
      jsonb_build_object(
        'date', slot_date,
        'time', slot_time,
        'service_id', service_id,
        'professional_id', professional_id
      ),
      NOW()
    );

    -- Update waitlist status
    UPDATE appointment_waitlist
    SET 
      status = 'notified',
      notified_at = NOW(),
      updated_at = NOW()
    WHERE id = waitlist_record.id;
  END IF;
END;
$$;

-- ============================================================================
-- FUNCTION: get_patient_appointment_analytics
-- Returns analytics data for patient engagement tracking
-- Based on Tavily research: 27% avg no-show rate, patterns analysis
-- ============================================================================
CREATE OR REPLACE FUNCTION get_patient_appointment_analytics(patient_id UUID)
RETURNS TABLE (
  total_appointments INTEGER,
  completed_appointments INTEGER,
  cancelled_appointments INTEGER,
  no_show_appointments INTEGER,
  attendance_rate DECIMAL(5,2),
  cancellation_rate DECIMAL(5,2),
  no_show_rate DECIMAL(5,2),
  common_cancellation_reasons JSONB,
  engagement_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  cancelled_count INTEGER;
  no_show_count INTEGER;
  attendance_pct DECIMAL(5,2);
  cancellation_pct DECIMAL(5,2);
  no_show_pct DECIMAL(5,2);
  engagement INTEGER;
BEGIN
  -- Get appointment counts
  SELECT COUNT(*) INTO total_count
  FROM appointments 
  WHERE appointments.patient_id = get_patient_appointment_analytics.patient_id;

  SELECT COUNT(*) INTO completed_count
  FROM appointments 
  WHERE appointments.patient_id = get_patient_appointment_analytics.patient_id 
    AND status = 'completed';

  SELECT COUNT(*) INTO cancelled_count
  FROM appointments 
  WHERE appointments.patient_id = get_patient_appointment_analytics.patient_id 
    AND status = 'cancelled';

  SELECT COUNT(*) INTO no_show_count
  FROM appointments 
  WHERE appointments.patient_id = get_patient_appointment_analytics.patient_id 
    AND status = 'no_show';

  -- Calculate percentages
  IF total_count > 0 THEN
    attendance_pct := ROUND((completed_count::DECIMAL / total_count) * 100, 2);
    cancellation_pct := ROUND((cancelled_count::DECIMAL / total_count) * 100, 2);
    no_show_pct := ROUND((no_show_count::DECIMAL / total_count) * 100, 2);
  ELSE
    attendance_pct := 0;
    cancellation_pct := 0;
    no_show_pct := 0;
  END IF;

  -- Calculate engagement score (based on Exa research patterns)
  engagement := 100;
  
  -- Penalty for high no-show rate (industry avg: 27%)
  IF no_show_pct > 27 THEN
    engagement := engagement - ROUND((no_show_pct - 27) * 2);
  END IF;
  
  -- Penalty for high cancellation rate
  IF cancellation_pct > 20 THEN
    engagement := engagement - ROUND((cancellation_pct - 20) * 1.5);
  END IF;
  
  -- Bonus for consistency (multiple appointments)
  IF total_count > 5 THEN
    engagement := engagement + LEAST(10, FLOOR(total_count / 5));
  END IF;
  
  engagement := GREATEST(0, LEAST(100, engagement));

  RETURN QUERY SELECT
    total_count,
    completed_count,
    cancelled_count,
    no_show_count,
    attendance_pct,
    cancellation_pct,
    no_show_pct,
    (
      SELECT jsonb_object_agg(
        cancellation_reason,
        reason_count
      )
      FROM (
        SELECT 
          cancellation_reason,
          COUNT(*) as reason_count
        FROM appointments 
        WHERE appointments.patient_id = get_patient_appointment_analytics.patient_id
          AND status = 'cancelled'
          AND cancellation_reason IS NOT NULL
        GROUP BY cancellation_reason
        ORDER BY reason_count DESC
        LIMIT 5
      ) reasons
    ),
    engagement;
END;
$$;

-- ============================================================================
-- FUNCTION: create_reschedule_request
-- Creates a rescheduling request for staff review
-- ============================================================================
CREATE OR REPLACE FUNCTION create_reschedule_request(
  appointment_id UUID,
  requested_date DATE,
  requested_time TIME,
  reason TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  request_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record RECORD;
  hours_until_appointment INTEGER;
  new_request_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Usuário não autenticado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verify appointment exists and belongs to user
  SELECT a.*, 
         EXTRACT(EPOCH FROM (
           (a.appointment_date + a.appointment_time::TIME) - NOW()
         )) / 3600 AS hours_until
  INTO appointment_record
  FROM appointments a
  WHERE a.id = appointment_id
    AND a.patient_id = current_user_id
    AND a.status = 'confirmed';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Agendamento não encontrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  hours_until_appointment := appointment_record.hours_until;

  -- Check 48h policy for reschedule requests
  IF hours_until_appointment < 48 THEN
    RETURN QUERY SELECT FALSE, 'Solicitações de reagendamento devem ser feitas com 48h de antecedência'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Create reschedule request
  new_request_id := gen_random_uuid();
  
  INSERT INTO reschedule_requests (
    id,
    appointment_id,
    patient_id,
    current_date,
    current_time,
    requested_date,
    requested_time,
    reason,
    status,
    created_at
  ) VALUES (
    new_request_id,
    appointment_id,
    current_user_id,
    appointment_record.appointment_date,
    appointment_record.appointment_time,
    requested_date,
    requested_time,
    reason,
    'pending',
    NOW()
  );

  -- Log analytics event
  INSERT INTO appointment_analytics (
    appointment_id,
    patient_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    appointment_id,
    current_user_id,
    'reschedule_request',
    jsonb_build_object(
      'requested_date', requested_date,
      'requested_time', requested_time,
      'reason', reason,
      'hours_until_original', hours_until_appointment
    ),
    NOW()
  );

  -- Notify staff
  INSERT INTO staff_notifications (
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    'reschedule_request',
    'Nova Solicitação de Reagendamento',
    'Paciente solicitou reagendamento de consulta',
    jsonb_build_object(
      'request_id', new_request_id,
      'appointment_id', appointment_id,
      'patient_id', current_user_id
    ),
    NOW()
  );

  RETURN QUERY SELECT TRUE, 'Solicitação enviada com sucesso'::TEXT, new_request_id;
END;
$$;

-- ============================================================================
-- Additional tables needed for the appointment management system
-- ============================================================================

-- Reschedule requests table
CREATE TABLE IF NOT EXISTS reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_date DATE NOT NULL,
  current_time TIME NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  response_message TEXT,
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointment analytics for tracking patterns
CREATE TABLE IF NOT EXISTS appointment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointment waitlist for slot management
CREATE TABLE IF NOT EXISTS appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  preferred_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  preferred_date_start DATE NOT NULL,
  preferred_date_end DATE NOT NULL,
  preferred_times TIME[] NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notified', 'fulfilled', 'expired')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient billing for cancellation fees
CREATE TABLE IF NOT EXISTS patient_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient notifications
CREATE TABLE IF NOT EXISTS patient_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff notifications  
CREATE TABLE IF NOT EXISTS staff_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  assigned_to UUID REFERENCES profiles(id),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinic policies configuration
CREATE TABLE IF NOT EXISTS clinic_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type VARCHAR(100) NOT NULL UNIQUE,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default cancellation policy based on research
INSERT INTO clinic_policies (policy_type, config) 
VALUES (
  'appointment_cancellation',
  '{
    "minimum_hours": 24,
    "fee_amount": 0,
    "fee_applies": false,
    "emergency_exceptions": ["medical_emergency", "family_emergency", "illness"]
  }'::jsonb
) ON CONFLICT (policy_type) DO NOTHING;

-- RLS Policies
ALTER TABLE reschedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
CREATE POLICY "Patients can view own reschedule requests" ON reschedule_requests
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create reschedule requests" ON reschedule_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view own analytics" ON appointment_analytics
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can view own waitlist" ON appointment_waitlist
  FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Patients can view own billing" ON patient_billing
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can view own notifications" ON patient_notifications
  FOR ALL USING (auth.uid() = patient_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_patient_status ON reschedule_requests(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_appointment_analytics_patient_type ON appointment_analytics(patient_id, event_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_service_status ON appointment_waitlist(service_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_billing_patient_status ON patient_billing(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient_read ON patient_notifications(patient_id, read_at);
