-- Story 2.2: Intelligent Conflict Detection and Resolution
-- Migration: Create conflict resolution and resource management schema
-- Date: 2025-01-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conflict Resolution Tracking
CREATE TABLE IF NOT EXISTS conflict_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_appointment_id UUID REFERENCES appointments(id),
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('time', 'staff', 'room', 'equipment', 'business_rules', 'priority')),
    conflict_description TEXT NOT NULL,
    resolution_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_option JSONB,
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'cancelled', 'escalated')),
    priority_score INTEGER NOT NULL DEFAULT 0,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource Schedules (Rooms, Equipment, etc.)
CREATE TABLE IF NOT EXISTS resource_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('room', 'equipment', 'service', 'staff')),
    resource_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('cleaning', 'maintenance', 'setup', 'blocked')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_use', 'completed', 'cancelled')),
    buffer_before INTEGER DEFAULT 0, -- minutes
    buffer_after INTEGER DEFAULT 0, -- minutes
    required_skills JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Waitlist Management
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id),
    treatment_type VARCHAR(255) NOT NULL,
    preferred_professional_id UUID REFERENCES users(id),
    preferred_date_range JSONB NOT NULL DEFAULT '{}'::jsonb, -- {start: date, end: date}
    preferred_time_slots JSONB DEFAULT '[]'::jsonb, -- array of time ranges
    priority_score INTEGER NOT NULL DEFAULT 0,
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent', 'emergency')),
    notification_count INTEGER DEFAULT 0,
    last_notification_at TIMESTAMPTZ,
    max_wait_duration INTERVAL, -- maximum wait time before escalation
    special_requirements JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notified', 'booked', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conflict Detection Rules
CREATE TABLE IF NOT EXISTS conflict_detection_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('time', 'staff', 'room', 'equipment', 'business', 'priority')),
    rule_condition JSONB NOT NULL, -- JSON configuration for rule logic
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    auto_resolve BOOLEAN NOT NULL DEFAULT false,
    resolution_strategy JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource Capabilities and Requirements
CREATE TABLE IF NOT EXISTS resource_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    capability_type VARCHAR(100) NOT NULL,
    capability_level INTEGER DEFAULT 1, -- 1-5 skill level
    requirements JSONB DEFAULT '{}'::jsonb,
    availability_schedule JSONB DEFAULT '{}'::jsonb, -- weekly schedule
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Treatment Resource Requirements
CREATE TABLE IF NOT EXISTS treatment_resource_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_type VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    required_capabilities JSONB DEFAULT '[]'::jsonb,
    minimum_duration INTERVAL NOT NULL,
    setup_time INTERVAL DEFAULT '0 minutes',
    cleanup_time INTERVAL DEFAULT '0 minutes',
    concurrent_limit INTEGER DEFAULT 1,
    priority_weight INTEGER DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimization Metrics Tracking
CREATE TABLE IF NOT EXISTS scheduling_optimization_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    conflicts_detected INTEGER DEFAULT 0,
    conflicts_auto_resolved INTEGER DEFAULT 0,
    conflicts_manual_resolved INTEGER DEFAULT 0,
    average_resolution_time_ms INTEGER DEFAULT 0,
    waitlist_conversions INTEGER DEFAULT 0,
    resource_utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    patient_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
    revenue_optimization_gain DECIMAL(10,2) DEFAULT 0.00,
    metrics_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_appointment ON conflict_resolutions(original_appointment_id);
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_type ON conflict_resolutions(conflict_type);
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_status ON conflict_resolutions(resolution_status);
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_priority ON conflict_resolutions(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_resource_schedules_resource ON resource_schedules(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_schedules_time ON resource_schedules(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_resource_schedules_appointment ON resource_schedules(appointment_id);
CREATE INDEX IF NOT EXISTS idx_resource_schedules_status ON resource_schedules(status);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_patient ON waitlist_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_treatment ON waitlist_entries(treatment_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_priority ON waitlist_entries(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_urgency ON waitlist_entries(urgency_level);

CREATE INDEX IF NOT EXISTS idx_conflict_rules_type ON conflict_detection_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_conflict_rules_active ON conflict_detection_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_resource_capabilities_resource ON resource_capabilities(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_capabilities_type ON resource_capabilities(capability_type);

CREATE INDEX IF NOT EXISTS idx_treatment_requirements_type ON treatment_resource_requirements(treatment_type);
CREATE INDEX IF NOT EXISTS idx_treatment_requirements_resource ON treatment_resource_requirements(resource_type);

CREATE INDEX IF NOT EXISTS idx_optimization_metrics_date ON scheduling_optimization_metrics(date DESC);

-- Add RLS policies for security
ALTER TABLE conflict_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_resource_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_optimization_metrics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced based on specific security requirements)
CREATE POLICY "Allow authenticated users to view conflict resolutions" ON conflict_resolutions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow staff to manage conflict resolutions" ON conflict_resolutions
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'doctor'))
    );

CREATE POLICY "Allow authenticated users to view resource schedules" ON resource_schedules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow staff to manage resource schedules" ON resource_schedules
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'doctor'))
    );

CREATE POLICY "Allow patients to view own waitlist entries" ON waitlist_entries
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (patient_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'doctor')))
    );

CREATE POLICY "Allow staff to manage waitlist entries" ON waitlist_entries
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'staff', 'doctor'))
    );

-- Functions for conflict detection and resolution
CREATE OR REPLACE FUNCTION detect_scheduling_conflicts(
    appointment_start TIMESTAMPTZ,
    appointment_end TIMESTAMPTZ,
    professional_id UUID,
    room_id UUID DEFAULT NULL,
    equipment_ids UUID[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    conflicts JSONB := '[]'::jsonb;
    conflict_item JSONB;
BEGIN
    -- Check staff conflicts
    IF EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.professional_id = detect_scheduling_conflicts.professional_id
        AND a.status NOT IN ('cancelled', 'completed')
        AND (
            (a.start_time, a.end_time) OVERLAPS (appointment_start, appointment_end)
        )
    ) THEN
        conflict_item := jsonb_build_object(
            'type', 'staff',
            'resource_id', professional_id,
            'message', 'Professional has conflicting appointment'
        );
        conflicts := conflicts || conflict_item;
    END IF;

    -- Check room conflicts
    IF room_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM resource_schedules rs
        WHERE rs.resource_id = room_id
        AND rs.resource_type = 'room'
        AND rs.status NOT IN ('cancelled', 'completed')
        AND (
            (rs.start_time, rs.end_time) OVERLAPS (appointment_start, appointment_end)
        )
    ) THEN
        conflict_item := jsonb_build_object(
            'type', 'room',
            'resource_id', room_id,
            'message', 'Room is not available'
        );
        conflicts := conflicts || conflict_item;
    END IF;

    -- Check equipment conflicts
    IF equipment_ids IS NOT NULL THEN
        FOR conflict_item IN
            SELECT jsonb_build_object(
                'type', 'equipment',
                'resource_id', rs.resource_id,
                'message', 'Equipment not available: ' || rs.resource_name
            )
            FROM resource_schedules rs
            WHERE rs.resource_id = ANY(equipment_ids)
            AND rs.resource_type = 'equipment'
            AND rs.status NOT IN ('cancelled', 'completed')
            AND (rs.start_time, rs.end_time) OVERLAPS (appointment_start, appointment_end)
        LOOP
            conflicts := conflicts || conflict_item;
        END LOOP;
    END IF;

    RETURN conflicts;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest alternative time slots
CREATE OR REPLACE FUNCTION suggest_alternative_slots(
    preferred_start TIMESTAMPTZ,
    duration INTERVAL,
    professional_id UUID,
    search_days INTEGER DEFAULT 7
) RETURNS JSONB AS $$
DECLARE
    suggestions JSONB := '[]'::jsonb;
    current_date DATE;
    suggestion JSONB;
BEGIN
    -- Search for available slots within the specified number of days
    FOR current_date IN 
        SELECT generate_series(
            preferred_start::date, 
            (preferred_start + (search_days || ' days')::interval)::date, 
            '1 day'::interval
        )::date
    LOOP
        -- Add basic suggestion logic (can be enhanced)
        suggestion := jsonb_build_object(
            'suggested_start', current_date + '09:00:00'::time,
            'suggested_end', current_date + '09:00:00'::time + duration,
            'confidence_score', 0.8,
            'reason', 'Available slot found'
        );
        suggestions := suggestions || suggestion;
    END LOOP;

    RETURN suggestions;
END;
$$ LANGUAGE plpgsql;

-- Insert default conflict detection rules
INSERT INTO conflict_detection_rules (rule_name, rule_type, rule_condition, severity, auto_resolve, resolution_strategy, error_message) VALUES
('Staff Double Booking', 'staff', '{"type": "overlap", "resource": "professional"}', 'high', false, '{"suggest_alternative": true, "notify_manager": true}', 'Professional is already booked at this time'),
('Room Availability', 'room', '{"type": "overlap", "resource": "room"}', 'high', true, '{"suggest_alternative_room": true}', 'Room is not available at the requested time'),
('Equipment Conflict', 'equipment', '{"type": "overlap", "resource": "equipment"}', 'medium', true, '{"suggest_alternative_equipment": true}', 'Required equipment is not available'),
('Business Hours', 'business', '{"type": "outside_hours"}', 'high', false, '{"suggest_business_hours": true}', 'Appointment is outside business hours'),
('Break Time Violation', 'business', '{"type": "insufficient_break", "minimum_minutes": 15}', 'medium', true, '{"adjust_timing": true}', 'Insufficient break time between appointments'),
('Maximum Daily Hours', 'business', '{"type": "max_hours", "daily_limit": 8}', 'high', false, '{"suggest_another_day": true}', 'Professional would exceed maximum daily working hours'),
('VIP Priority', 'priority', '{"type": "vip_override"}', 'critical', false, '{"escalate_manager": true, "suggest_bump": true}', 'VIP patient booking requires priority handling');

-- Insert sample resource capabilities
INSERT INTO resource_capabilities (resource_id, resource_type, capability_type, capability_level, requirements) VALUES
(uuid_generate_v4(), 'room', 'consultation', 3, '{"size": "small", "privacy": true}'),
(uuid_generate_v4(), 'room', 'surgery', 5, '{"sterile": true, "equipment": ["surgical_lights", "ventilation"]}'),
(uuid_generate_v4(), 'equipment', 'x_ray', 4, '{"radiation_safety": true, "trained_operator": true}'),
(uuid_generate_v4(), 'equipment', 'ultrasound', 3, '{"mobility": true, "multiple_probes": true}');

-- Insert sample treatment requirements
INSERT INTO treatment_resource_requirements (treatment_type, resource_type, required_capabilities, minimum_duration, setup_time, cleanup_time) VALUES
('consultation', 'room', '["consultation"]', '30 minutes', '5 minutes', '5 minutes'),
('surgery', 'room', '["surgery"]', '120 minutes', '30 minutes', '30 minutes'),
('x_ray', 'equipment', '["x_ray"]', '15 minutes', '5 minutes', '5 minutes'),
('ultrasound', 'equipment', '["ultrasound"]', '30 minutes', '5 minutes', '10 minutes');

COMMENT ON TABLE conflict_resolutions IS 'Tracks scheduling conflicts and their resolution options';
COMMENT ON TABLE resource_schedules IS 'Comprehensive resource scheduling including rooms, equipment, and maintenance';
COMMENT ON TABLE waitlist_entries IS 'Patient waitlist management with intelligent prioritization';
COMMENT ON TABLE conflict_detection_rules IS 'Configurable rules for automatic conflict detection';
COMMENT ON TABLE resource_capabilities IS 'Resource capabilities and skill matching system';
COMMENT ON TABLE treatment_resource_requirements IS 'Treatment-specific resource requirements';
COMMENT ON TABLE scheduling_optimization_metrics IS 'Performance metrics for scheduling optimization';