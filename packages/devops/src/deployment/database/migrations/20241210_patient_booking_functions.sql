-- Patient Appointment Booking Functions
-- Story 1.3 Task 3: Build appointment booking interface

-- Function to get available time slots for patients
CREATE OR REPLACE FUNCTION get_patient_available_slots(
  p_service_id UUID,
  p_professional_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW(),
  p_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
)
RETURNS TABLE (
  datetime TIMESTAMPTZ,
  is_available BOOLEAN,
  professional_id UUID,
  professional_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return available time slots based on professional schedules and existing appointments
  RETURN QUERY
  WITH professional_schedules AS (
    SELECT 
      ps.professional_id,
      p.name as professional_name,
      ps.day_of_week,
      ps.start_time,
      ps.end_time,
      s.duration_minutes
    FROM professional_schedules ps
    JOIN professionals p ON ps.professional_id = p.id
    JOIN professional_services pserv ON p.id = pserv.professional_id
    JOIN services s ON pserv.service_id = s.id
    WHERE s.id = p_service_id
      AND ps.is_active = TRUE
      AND p.is_active = TRUE
      AND (p_professional_id IS NULL OR p.id = p_professional_id)
  ),
  time_slots AS (
    SELECT 
      ps.professional_id,
      ps.professional_name,
      generate_series(
        date_trunc('day', p_start_date) + ps.start_time,
        date_trunc('day', p_end_date) + ps.end_time - (ps.duration_minutes * INTERVAL '1 minute'),
        INTERVAL '30 minutes'
      ) AS slot_datetime
    FROM professional_schedules ps
    WHERE EXTRACT(DOW FROM generate_series(
      date_trunc('day', p_start_date),
      date_trunc('day', p_end_date),
      INTERVAL '1 day'
    )) = ps.day_of_week
  ),
  existing_appointments AS (
    SELECT 
      professional_id,
      datetime,
      datetime + (duration_minutes * INTERVAL '1 minute') AS end_datetime
    FROM appointments
    WHERE datetime >= p_start_date 
      AND datetime <= p_end_date
      AND status IN ('confirmed', 'checked_in')
  )
  SELECT 
    ts.slot_datetime,
    CASE 
      WHEN ea.datetime IS NULL 
        AND ts.slot_datetime > NOW() + INTERVAL '2 hours'
      THEN TRUE 
      ELSE FALSE 
    END as is_available,
    ts.professional_id,
    ts.professional_name
  FROM time_slots ts
  LEFT JOIN existing_appointments ea ON (
    ts.professional_id = ea.professional_id AND
    ts.slot_datetime >= ea.datetime AND 
    ts.slot_datetime < ea.end_datetime
  )
  ORDER BY ts.slot_datetime, ts.professional_name;
END;
$$;

-- Function to get professionals who can perform a service
CREATE OR REPLACE FUNCTION get_professionals_for_service(p_service_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  specialties TEXT[],
  bio TEXT,
  avatar_url TEXT,
  is_available BOOLEAN,
  rating NUMERIC,
  location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    COALESCE(p.specialties, ARRAY[]::TEXT[]) as specialties,
    p.bio,
    p.avatar_url,
    p.is_active as is_available,
    pr.average_rating as rating,
    p.location
  FROM professionals p
  JOIN professional_services ps ON p.id = ps.professional_id
  LEFT JOIN (
    SELECT 
      professional_id,
      AVG(rating)::NUMERIC(3,2) as average_rating
    FROM appointment_ratings ar
    JOIN appointments a ON ar.appointment_id = a.id
    WHERE ar.created_at > NOW() - INTERVAL '12 months'
    GROUP BY professional_id
  ) pr ON p.id = pr.professional_id
  WHERE ps.service_id = p_service_id
    AND p.is_active = TRUE
    AND ps.is_active = TRUE
  ORDER BY pr.average_rating DESC NULLS LAST, p.name;
END;
$$;

-- Function to check slot availability (race condition protection)
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_datetime TIMESTAMPTZ,
  p_service_id UUID,
  p_professional_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflict_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration_minutes INTEGER;
  v_end_datetime TIMESTAMPTZ;
  v_conflict_count INTEGER;
BEGIN
  -- Get service duration
  SELECT duration_minutes INTO v_duration_minutes
  FROM services WHERE id = p_service_id;
  
  v_end_datetime := p_datetime + (v_duration_minutes * INTERVAL '1 minute');
  
  -- Check for conflicts
  SELECT COUNT(*) INTO v_conflict_count
  FROM appointments a
  WHERE a.status IN ('confirmed', 'checked_in')
    AND (
      (p_professional_id IS NULL) OR 
      (a.professional_id = p_professional_id)
    )
    AND (
      -- Overlapping appointments
      (a.datetime < v_end_datetime AND 
       (a.datetime + (a.duration_minutes * INTERVAL '1 minute')) > p_datetime)
    );
  
  -- Return availability status
  RETURN QUERY
  SELECT 
    CASE 
      WHEN v_conflict_count > 0 THEN FALSE
      WHEN p_datetime <= NOW() + INTERVAL '2 hours' THEN FALSE
      ELSE TRUE
    END as is_available,
    CASE 
      WHEN v_conflict_count > 0 THEN 'Horário já ocupado'
      WHEN p_datetime <= NOW() + INTERVAL '2 hours' THEN 'Horário muito próximo'
      ELSE NULL
    END as conflict_reason;
END;
$$;

-- Create patient_appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  special_requests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for patient appointments
ALTER TABLE patient_appointments ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own appointments
CREATE POLICY "Patients can view own appointments" ON patient_appointments
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can create their own appointments
CREATE POLICY "Patients can create own appointments" ON patient_appointments
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own appointments (limited fields)
CREATE POLICY "Patients can update own appointments" ON patient_appointments
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (
    auth.uid() = patient_id AND
    -- Only allow updating notes and status to cancelled
    (OLD.service_id = NEW.service_id) AND
    (OLD.professional_id = NEW.professional_id) AND
    (OLD.datetime = NEW.datetime) AND
    (OLD.duration_minutes = NEW.duration_minutes)
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_appointments_patient_id ON patient_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_datetime ON patient_appointments(datetime);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_professional_id ON patient_appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_service_id ON patient_appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_status ON patient_appointments(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_patient_appointments_updated_at ON patient_appointments;
CREATE TRIGGER update_patient_appointments_updated_at
  BEFORE UPDATE ON patient_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON services TO authenticated;
GRANT SELECT ON professionals TO authenticated;
GRANT SELECT ON professional_services TO authenticated;
GRANT SELECT ON professional_schedules TO authenticated;
GRANT ALL ON patient_appointments TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_available_slots TO authenticated;
GRANT EXECUTE ON FUNCTION get_professionals_for_service TO authenticated;
GRANT EXECUTE ON FUNCTION check_slot_availability TO authenticated;
