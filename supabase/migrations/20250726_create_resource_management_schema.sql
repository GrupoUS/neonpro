-- =====================================================
-- NeonPro Resource Management Schema
-- Story 2.4: Smart Resource Management
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Resources Table - All clinic resources (rooms, equipment, staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'room', 'equipment', 'staff'
    category VARCHAR(100), -- 'treatment_room', 'consultation_room', 'laser_equipment', 'aesthetic_device'
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'cleaning', 'reserved'
    capacity INTEGER DEFAULT 1,
    
    -- Equipment specific fields
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_interval_days INTEGER,
    
    -- Staff specific fields
    skills JSONB, -- Array of skills/certifications
    availability_schedule JSONB, -- Weekly availability pattern
    hourly_rate DECIMAL(10,2),
    
    -- Room specific fields
    equipment_ids UUID[], -- Array of equipment IDs in this room
    amenities JSONB, -- Room features and amenities
    
    -- Common metadata
    specifications JSONB, -- Technical specifications
    usage_instructions TEXT,
    safety_requirements JSONB,
    cost_per_hour DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- Resource Allocations - Track resource bookings
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    allocated_by UUID NOT NULL REFERENCES auth.users(id),
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'in_use', 'completed', 'cancelled'
    allocation_type VARCHAR(100) NOT NULL, -- 'appointment', 'maintenance', 'cleaning', 'training', 'personal_use'
    
    notes TEXT,
    preparation_time INTEGER DEFAULT 0, -- Minutes needed for prep
    cleanup_time INTEGER DEFAULT 0, -- Minutes needed for cleanup
    
    -- Cost tracking
    hourly_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Maintenance Records - Equipment maintenance tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    maintenance_type VARCHAR(100) NOT NULL, -- 'preventive', 'corrective', 'emergency', 'calibration'
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    technician_name VARCHAR(255),
    vendor_company VARCHAR(255),
    contact_info JSONB,
    
    description TEXT NOT NULL,
    work_performed TEXT,
    parts_replaced JSONB, -- Array of parts with costs
    labor_hours DECIMAL(5,2),
    
    -- Costs
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Results
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    outcome VARCHAR(100), -- 'successful', 'partial', 'failed', 'needs_followup'
    next_maintenance_due DATE,
    
    -- Documentation
    before_photos TEXT[], -- URLs to photos
    after_photos TEXT[], -- URLs to photos
    documentation_urls TEXT[], -- Links to manuals, reports
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- Resource Analytics - Utilization and performance metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Time period
    date DATE NOT NULL,
    hour_slot INTEGER, -- 0-23 for hourly analytics, NULL for daily
    
    -- Utilization metrics
    total_available_minutes INTEGER DEFAULT 0,
    total_allocated_minutes INTEGER DEFAULT 0,
    total_used_minutes INTEGER DEFAULT 0,
    utilization_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Financial metrics
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    maintenance_cost DECIMAL(10,2) DEFAULT 0,
    operational_cost DECIMAL(10,2) DEFAULT 0,
    roi_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    appointment_count INTEGER DEFAULT 0,
    cancellation_count INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0,
    
    -- Status tracking
    downtime_minutes INTEGER DEFAULT 0,
    maintenance_minutes INTEGER DEFAULT 0,
    cleaning_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Resource Conflicts - Track and resolve conflicts
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    conflict_type VARCHAR(100) NOT NULL, -- 'double_booking', 'maintenance_overlap', 'unavailable_staff'
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Conflicting allocations
    primary_allocation_id UUID REFERENCES resource_allocations(id),
    conflicting_allocation_id UUID REFERENCES resource_allocations(id),
    
    description TEXT NOT NULL,
    
    -- Resolution
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'escalated', 'ignored'
    resolution_strategy VARCHAR(100), -- 'reschedule', 'reallocate', 'find_alternative', 'cancel'
    resolution_details JSONB,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Impact assessment
    affected_appointments UUID[],
    impact_score INTEGER DEFAULT 1, -- 1-10 scale
    revenue_impact DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_clinic_type ON resources(clinic_id, type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_next_maintenance ON resources(next_maintenance);
CREATE INDEX IF NOT EXISTS idx_resources_type_category ON resources(type, category);

-- Resource allocations indexes
CREATE INDEX IF NOT EXISTS idx_resource_allocations_resource_time ON resource_allocations(resource_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_appointment ON resource_allocations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_status ON resource_allocations(status);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_time_range ON resource_allocations(start_time, end_time);

-- Maintenance records indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_records_resource ON maintenance_records(resource_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_scheduled ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_resource_analytics_resource_date ON resource_analytics(resource_id, date);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_clinic_date ON resource_analytics(clinic_id, date);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_utilization ON resource_analytics(utilization_percentage);

-- Conflicts indexes
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_resource ON resource_conflicts(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_status ON resource_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_severity ON resource_conflicts(severity);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_conflicts ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Users can view resources from their clinic" ON resources
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage resources" ON resources
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Resource allocations policies
CREATE POLICY "Users can view allocations from their clinic" ON resource_allocations
    FOR SELECT USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage allocations" ON resource_allocations
    FOR ALL USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid() 
            AND cu.role IN ('owner', 'admin', 'manager', 'staff')
        )
    );

-- Maintenance records policies
CREATE POLICY "Users can view maintenance from their clinic" ON maintenance_records
    FOR SELECT USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage maintenance" ON maintenance_records
    FOR ALL USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid() 
            AND cu.role IN ('owner', 'admin', 'manager')
        )
    );

-- Analytics policies
CREATE POLICY "Users can view analytics from their clinic" ON resource_analytics
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics" ON resource_analytics
    FOR INSERT WITH CHECK (true);

-- Conflicts policies
CREATE POLICY "Users can view conflicts from their clinic" ON resource_conflicts
    FOR SELECT USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage conflicts" ON resource_conflicts
    FOR ALL USING (
        resource_id IN (
            SELECT r.id FROM resources r
            JOIN clinic_users cu ON r.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid() 
            AND cu.role IN ('owner', 'admin', 'manager', 'staff')
        )
    );

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_allocations_updated_at BEFORE UPDATE ON resource_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_analytics_updated_at BEFORE UPDATE ON resource_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_conflicts_updated_at BEFORE UPDATE ON resource_conflicts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Resource Utilization Calculation Function
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_resource_utilization(
    p_resource_id UUID,
    p_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    total_available_minutes INTEGER;
    total_allocated_minutes INTEGER;
    utilization_rate DECIMAL;
BEGIN
    -- Get total available minutes (business hours)
    SELECT 480 INTO total_available_minutes; -- 8 hours = 480 minutes (can be made dynamic)
    
    -- Get total allocated minutes for the date
    SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60), 0)
    INTO total_allocated_minutes
    FROM resource_allocations
    WHERE resource_id = p_resource_id
    AND DATE(start_time) = p_date
    AND status NOT IN ('cancelled');
    
    -- Calculate utilization percentage
    IF total_available_minutes > 0 THEN
        utilization_rate := (total_allocated_minutes::DECIMAL / total_available_minutes) * 100;
    ELSE
        utilization_rate := 0;
    END IF;
    
    RETURN ROUND(utilization_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Conflict Detection Function
-- =====================================================
CREATE OR REPLACE FUNCTION detect_resource_conflicts(
    p_resource_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_allocation_id UUID DEFAULT NULL
) RETURNS TABLE(conflict_count INTEGER, conflicting_allocations UUID[]) AS $$
DECLARE
    conflict_count INTEGER;
    conflicting_ids UUID[];
BEGIN
    -- Find overlapping allocations
    SELECT COUNT(*), ARRAY_AGG(id)
    INTO conflict_count, conflicting_ids
    FROM resource_allocations
    WHERE resource_id = p_resource_id
    AND status NOT IN ('cancelled', 'completed')
    AND (id != p_allocation_id OR p_allocation_id IS NULL)
    AND (
        (start_time < p_end_time AND end_time > p_start_time)
    );
    
    RETURN QUERY SELECT conflict_count, COALESCE(conflicting_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE resources IS 'All clinic resources including rooms, equipment, and staff';
COMMENT ON TABLE resource_allocations IS 'Resource bookings and allocations for appointments and maintenance';
COMMENT ON TABLE maintenance_records IS 'Equipment maintenance history and scheduling';
COMMENT ON TABLE resource_analytics IS 'Resource utilization and performance metrics';
COMMENT ON TABLE resource_conflicts IS 'Resource booking conflicts and resolutions';

COMMENT ON FUNCTION calculate_resource_utilization IS 'Calculate daily utilization percentage for a resource';
COMMENT ON FUNCTION detect_resource_conflicts IS 'Detect scheduling conflicts for a resource allocation';