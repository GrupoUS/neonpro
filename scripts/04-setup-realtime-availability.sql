-- ============================================================================
-- NeonPro: Real-time Availability System Setup
-- Database schema for Task 4 - Real-time Availability Checking
-- ============================================================================

-- Enable Realtime for all tables
ALTER publication supabase_realtime ADD TABLE time_slots;
ALTER publication supabase_realtime ADD TABLE appointments;
ALTER publication supabase_realtime ADD TABLE professionals;
ALTER publication supabase_realtime ADD TABLE services;

-- Create time_slots table if not exists
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Constraints
  CONSTRAINT time_slots_valid_time CHECK (end_time > start_time),
  CONSTRAINT time_slots_future_date CHECK (date >= CURRENT_DATE),
  
  -- Unique constraint to prevent overlapping slots
  EXCLUDE USING gist (
    professional_id WITH =,
    date WITH =,
    tsrange((date + start_time)::timestamp, (date + end_time)::timestamp) WITH &&
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_slots_professional_date 
  ON time_slots(professional_id, date, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_service_date 
  ON time_slots(service_id, date, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_available 
  ON time_slots(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_time_slots_realtime 
  ON time_slots(updated_at, is_available);

-- Update appointments table to link with time_slots
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS time_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL;

-- Create index for appointments-slots relationship
CREATE INDEX IF NOT EXISTS idx_appointments_time_slot 
  ON appointments(time_slot_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC AVAILABILITY MANAGEMENT
-- ============================================================================

-- Function to automatically update slot availability when appointment is created/cancelled
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is confirmed/scheduled
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('confirmed', 'scheduled')) THEN
    UPDATE time_slots 
    SET is_available = false, updated_at = now()
    WHERE id = NEW.time_slot_id;
    
  -- When appointment is cancelled/completed
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'completed', 'no_show') THEN
    UPDATE time_slots 
    SET is_available = true, updated_at = now()
    WHERE id = NEW.time_slot_id;
    
  -- When appointment is deleted
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE time_slots 
    SET is_available = true, updated_at = now()
    WHERE id = OLD.time_slot_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_slot_availability ON appointments;
CREATE TRIGGER trigger_update_slot_availability
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_availability();

-- Function to update timestamp on time_slots changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_time_slots_updated_at ON time_slots;
CREATE TRIGGER trigger_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on time_slots
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Patients can view available slots
CREATE POLICY "Patients can view available time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Professionals can view their own slots
CREATE POLICY "Professionals can view their own slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

-- Admins can manage all slots
CREATE POLICY "Admins can manage all time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Professionals can manage their own slots
CREATE POLICY "Professionals can manage their own slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- SAMPLE DATA FOR TESTING REAL-TIME AVAILABILITY
-- ============================================================================

-- Function to generate time slots for a professional
CREATE OR REPLACE FUNCTION generate_time_slots(
  prof_id UUID,
  serv_id UUID,
  start_date DATE,
  end_date DATE,
  start_hour TIME DEFAULT '09:00:00',
  end_hour TIME DEFAULT '17:00:00',
  slot_duration INTERVAL DEFAULT '1 hour'
) RETURNS void AS $$
DECLARE
  current_date DATE;
  current_time TIME;
  slot_end_time TIME;
BEGIN
  current_date := start_date;
  
  WHILE current_date <= end_date LOOP
    -- Skip weekends
    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
      current_time := start_hour;
      
      WHILE current_time + slot_duration <= end_hour LOOP
        slot_end_time := current_time + slot_duration;
        
        INSERT INTO time_slots (professional_id, service_id, date, start_time, end_time)
        VALUES (prof_id, serv_id, current_date, current_time, slot_end_time)
        ON CONFLICT DO NOTHING;
        
        current_time := slot_end_time;
      END LOOP;
    END IF;
    
    current_date := current_date + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate sample slots for testing (only if tables exist and have data)
DO $$
DECLARE
  prof_id UUID;
  serv_id UUID;
BEGIN
  -- Get first professional
  SELECT id INTO prof_id FROM professionals LIMIT 1;
  
  -- Get first service
  SELECT id INTO serv_id FROM services LIMIT 1;
  
  -- Only generate if we have data
  IF prof_id IS NOT NULL AND serv_id IS NOT NULL THEN
    -- Generate slots for next 30 days
    PERFORM generate_time_slots(
      prof_id,
      serv_id,
      CURRENT_DATE + 1,
      CURRENT_DATE + 30,
      '09:00:00'::TIME,
      '17:00:00'::TIME,
      '1 hour'::INTERVAL
    );
    
    RAISE NOTICE 'Generated sample time slots for testing';
  END IF;
END $$;

-- ============================================================================
-- FUNCTIONS FOR REAL-TIME AVAILABILITY QUERIES
-- ============================================================================

-- Function to get available slots with professional and service info
CREATE OR REPLACE FUNCTION get_available_slots(
  professional_filter UUID DEFAULT NULL,
  service_filter UUID DEFAULT NULL,
  date_filter DATE DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  professional_id UUID,
  professional_name TEXT,
  service_id UUID,
  service_name TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  is_available BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.professional_id,
    p.name as professional_name,
    ts.service_id,
    s.name as service_name,
    ts.date,
    ts.start_time,
    ts.end_time,
    s.duration as duration_minutes,
    ts.is_available,
    ts.updated_at
  FROM time_slots ts
  JOIN professionals p ON p.id = ts.professional_id
  JOIN services s ON s.id = ts.service_id
  WHERE 
    (professional_filter IS NULL OR ts.professional_id = professional_filter)
    AND (service_filter IS NULL OR ts.service_id = service_filter)
    AND (date_filter IS NULL OR ts.date = date_filter)
    AND ts.is_available = true
    AND ts.date >= CURRENT_DATE
  ORDER BY ts.date, ts.start_time
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for conflicting appointments
CREATE OR REPLACE FUNCTION check_slot_conflicts(
  slot_id UUID,
  patient_id UUID
)
RETURNS TABLE (
  has_conflict BOOLEAN,
  conflict_type TEXT,
  conflict_message TEXT
) AS $$
DECLARE
  slot_record time_slots%ROWTYPE;
  existing_appointment appointments%ROWTYPE;
BEGIN
  -- Get slot details
  SELECT * INTO slot_record FROM time_slots WHERE id = slot_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 'slot_not_found', 'Time slot not found';
    RETURN;
  END IF;
  
  -- Check if slot is still available
  IF NOT slot_record.is_available THEN
    RETURN QUERY SELECT true, 'slot_unavailable', 'Time slot is no longer available';
    RETURN;
  END IF;
  
  -- Check if patient already has appointment on same day
  SELECT * INTO existing_appointment
  FROM appointments a
  JOIN time_slots ts ON ts.id = a.time_slot_id
  WHERE a.patient_id = check_slot_conflicts.patient_id
    AND ts.date = slot_record.date
    AND a.status IN ('confirmed', 'scheduled');
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'patient_double_booking', 'Patient already has an appointment on this date';
    RETURN;
  END IF;
  
  -- No conflicts found
  RETURN QUERY SELECT false, 'no_conflict', 'No conflicts detected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Ensure realtime is enabled for the tables
SELECT cron.schedule('refresh-realtime-config', '*/5 minutes', $$
  SELECT pg_notify('realtime', 'time_slots');
$$);

-- Grant necessary permissions for realtime
GRANT SELECT ON time_slots TO authenticated;
GRANT SELECT ON appointments TO authenticated;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT SELECT ON realtime.messages TO authenticated;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if realtime is properly configured
SELECT schemaname, tablename, hasinserts, hasupdates, hasdeletes
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('time_slots', 'appointments');

-- Check if triggers are active
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid IN (
  'time_slots'::regclass, 
  'appointments'::regclass
);

-- Sample query to test the system
SELECT * FROM get_available_slots() LIMIT 10;