-- =============================================
-- NeonPro Conflict Prevention System - Database Extensions
-- Story 1.2: Advanced conflict detection and business rules
-- Version: 1.0
-- Author: James (Full Stack Developer)
-- =============================================

-- Table: professional_schedules
-- Purpose: Store working hours and availability patterns for each professional
CREATE TABLE professional_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES profiles(id),
    
    -- Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    
    -- Working hours
    start_time time NOT NULL,
    end_time time NOT NULL,
    
    -- Break periods
    break_start_time time,
    break_end_time time,
    
    -- Availability settings
    is_available boolean DEFAULT true,
    max_appointments_per_hour integer DEFAULT 4,
    buffer_minutes_between integer DEFAULT 15, -- Buffer between appointments
    
    -- Booking restrictions
    min_booking_notice_hours integer DEFAULT 2, -- Minimum notice required
    max_booking_days_ahead integer DEFAULT 90,  -- Maximum days in advance
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_working_hours CHECK (start_time < end_time),
    CONSTRAINT valid_break_hours CHECK (
        (break_start_time IS NULL AND break_end_time IS NULL) OR 
        (break_start_time IS NOT NULL AND break_end_time IS NOT NULL AND 
         break_start_time < break_end_time AND 
         break_start_time >= start_time AND break_end_time <= end_time)
    ),
    CONSTRAINT unique_professional_day UNIQUE (professional_id, clinic_id, day_of_week)
);

-- Table: clinic_holidays
-- Purpose: Store clinic closure dates and holiday periods
CREATE TABLE clinic_holidays (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid NOT NULL REFERENCES profiles(id),
    
    -- Holiday details
    name varchar(255) NOT NULL,
    description text,
    
    -- Date range
    start_date date NOT NULL,
    end_date date NOT NULL,
    
    -- Time range (for partial day closures)
    start_time time,
    end_time time,
    
    -- Recurrence settings
    is_recurring boolean DEFAULT false,
    recurrence_type varchar(20) CHECK (recurrence_type IN ('yearly', 'monthly', 'weekly')),
    
    -- Status
    is_active boolean DEFAULT true,
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (start_date <= end_date),
    CONSTRAINT valid_time_range CHECK (
        (start_time IS NULL AND end_time IS NULL) OR 
        (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Table: service_type_rules
-- Purpose: Service-specific scheduling rules and buffer requirements  
CREATE TABLE service_type_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_type_id uuid NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES profiles(id),
    
    -- Buffer time requirements
    pre_service_buffer_minutes integer DEFAULT 10,
    post_service_buffer_minutes integer DEFAULT 15,
    
    -- Scheduling restrictions
    min_booking_notice_hours integer DEFAULT 2,
    max_booking_days_ahead integer DEFAULT 60,
    
    -- Capacity settings
    allow_simultaneous_bookings boolean DEFAULT false,
    max_simultaneous_count integer DEFAULT 1,
    
    -- Booking rules
    requires_deposit boolean DEFAULT false,
    cancellation_hours_notice integer DEFAULT 24,
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT unique_service_clinic UNIQUE (service_type_id, clinic_id)
);
-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Professional schedules indexes
CREATE INDEX idx_professional_schedules_professional_clinic 
ON professional_schedules(professional_id, clinic_id);

CREATE INDEX idx_professional_schedules_day_available 
ON professional_schedules(day_of_week, is_available);

CREATE INDEX idx_professional_schedules_working_hours 
ON professional_schedules(start_time, end_time) WHERE is_available = true;

-- Clinic holidays indexes
CREATE INDEX idx_clinic_holidays_clinic_active 
ON clinic_holidays(clinic_id, is_active);

CREATE INDEX idx_clinic_holidays_date_range 
ON clinic_holidays(start_date, end_date) WHERE is_active = true;

CREATE INDEX idx_clinic_holidays_recurring 
ON clinic_holidays(is_recurring, recurrence_type) WHERE is_active = true;

-- Service type rules indexes
CREATE INDEX idx_service_type_rules_service_clinic 
ON service_type_rules(service_type_id, clinic_id);

CREATE INDEX idx_service_type_rules_buffer_times 
ON service_type_rules(pre_service_buffer_minutes, post_service_buffer_minutes);

-- Enhanced appointment indexes for conflict detection
CREATE INDEX idx_appointments_professional_time_status 
ON appointments(professional_id, start_time, end_time, status) 
WHERE status NOT IN ('cancelled', 'no_show') AND deleted_at IS NULL;

CREATE INDEX idx_appointments_clinic_time_conflict 
ON appointments(clinic_id, start_time, end_time) 
WHERE status NOT IN ('cancelled', 'no_show') AND deleted_at IS NULL;

CREATE INDEX idx_appointments_conflict_detection 
ON appointments(professional_id, clinic_id, start_time, end_time, status, deleted_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Professional schedules RLS
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY professional_schedules_clinic_isolation ON professional_schedules
FOR ALL USING (clinic_id = (current_setting('request.jwt.claims', true)::json->>'clinic_id')::uuid);

-- Clinic holidays RLS  
ALTER TABLE clinic_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_holidays_clinic_isolation ON clinic_holidays
FOR ALL USING (clinic_id = (current_setting('request.jwt.claims', true)::json->>'clinic_id')::uuid);

-- Service type rules RLS
ALTER TABLE service_type_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_type_rules_clinic_isolation ON service_type_rules
FOR ALL USING (clinic_id = (current_setting('request.jwt.claims', true)::json->>'clinic_id')::uuid);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professional_schedules_updated_at
    BEFORE UPDATE ON professional_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_holidays_updated_at
    BEFORE UPDATE ON clinic_holidays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_type_rules_updated_at
    BEFORE UPDATE ON service_type_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DEFAULT DATA INSERTION
-- =============================================

-- Insert default professional schedules (Monday to Friday, 8AM to 6PM)
-- This will be populated by the application when professionals are created
-- Example template for reference:

-- INSERT INTO professional_schedules (professional_id, clinic_id, day_of_week, start_time, end_time, break_start_time, break_end_time)
-- SELECT 
--     p.id as professional_id,
--     p.clinic_id,
--     generate_series(1, 5) as day_of_week, -- Monday to Friday
--     '08:00'::time as start_time,
--     '18:00'::time as end_time,
--     '12:00'::time as break_start_time,
--     '13:00'::time as break_end_time
-- FROM profiles p 
-- WHERE p.role = 'professional' AND p.deleted_at IS NULL;

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to check if a date/time falls within professional working hours
CREATE OR REPLACE FUNCTION is_within_working_hours(
    p_professional_id uuid,
    p_clinic_id uuid,
    p_appointment_time timestamp with time zone
) RETURNS boolean AS $$
DECLARE
    v_day_of_week integer;
    v_appointment_time time;
    v_schedule record;
BEGIN
    -- Extract day of week and time
    v_day_of_week := EXTRACT(dow FROM p_appointment_time);
    v_appointment_time := p_appointment_time::time;
    
    -- Find matching schedule
    SELECT * INTO v_schedule
    FROM professional_schedules
    WHERE professional_id = p_professional_id 
    AND clinic_id = p_clinic_id 
    AND day_of_week = v_day_of_week 
    AND is_available = true;
    
    -- Return false if no schedule found
    IF v_schedule IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if within working hours (excluding break)
    IF v_appointment_time >= v_schedule.start_time AND v_appointment_time <= v_schedule.end_time THEN
        -- Check if not during break
        IF v_schedule.break_start_time IS NOT NULL AND v_schedule.break_end_time IS NOT NULL THEN
            IF v_appointment_time >= v_schedule.break_start_time AND v_appointment_time <= v_schedule.break_end_time THEN
                RETURN false; -- During break
            END IF;
        END IF;
        RETURN true; -- Within working hours
    END IF;
    
    RETURN false; -- Outside working hours
END;
$$ LANGUAGE plpgsql;

-- Function to check if a date falls on a clinic holiday
CREATE OR REPLACE FUNCTION is_clinic_holiday(
    p_clinic_id uuid,
    p_date date,
    p_time time DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
    v_holiday record;
BEGIN
    -- Check for holidays on this date
    FOR v_holiday IN
        SELECT * FROM clinic_holidays
        WHERE clinic_id = p_clinic_id 
        AND is_active = true
        AND p_date >= start_date 
        AND p_date <= end_date
    LOOP
        -- If no specific time range, entire day is blocked
        IF v_holiday.start_time IS NULL AND v_holiday.end_time IS NULL THEN
            RETURN true;
        END IF;
        
        -- If time specified, check if within blocked time range
        IF p_time IS NOT NULL AND 
           v_holiday.start_time IS NOT NULL AND 
           v_holiday.end_time IS NOT NULL THEN
            IF p_time >= v_holiday.start_time AND p_time <= v_holiday.end_time THEN
                RETURN true;
            END IF;
        END IF;
    END LOOP;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;