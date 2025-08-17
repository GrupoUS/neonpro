-- =====================================================================================
-- EQUIPMENT MAINTENANCE MANAGEMENT SYSTEM
-- Epic 6 - Story 6.4: Equipment Maintenance Scheduling + Alerts
-- Migration: 20240130_equipment_maintenance_system.sql
-- =====================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- EQUIPMENT REGISTRY
-- =====================================================================================

-- Main equipment registry table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL,
    
    -- Basic equipment information
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE,
    equipment_type VARCHAR(100) NOT NULL, -- medical_device, diagnostic, surgical, laboratory, office, it
    category VARCHAR(100), -- x_ray, ultrasound, lab_analyzer, sterilizer, etc.
    
    -- Location and ownership
    location VARCHAR(255),
    department VARCHAR(100),
    room_number VARCHAR(50),
    
    -- Purchase and warranty information
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    warranty_start_date DATE,
    warranty_end_date DATE,
    vendor_id UUID, -- References suppliers
    
    -- Operational status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, maintenance, out_of_service, decommissioned
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 10),
    criticality_level VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
    
    -- Usage tracking
    usage_hours DECIMAL(10,2) DEFAULT 0,
    usage_cycles INTEGER DEFAULT 0,
    last_usage_date TIMESTAMP WITH TIME ZONE,
    estimated_lifespan_years INTEGER,
    
    -- Maintenance specifications
    maintenance_frequency_days INTEGER, -- Base maintenance interval
    usage_based_maintenance BOOLEAN DEFAULT false,
    usage_threshold_hours DECIMAL(10,2), -- Hours-based maintenance trigger
    usage_threshold_cycles INTEGER, -- Cycles-based maintenance trigger
    
    -- Regulatory and compliance
    requires_calibration BOOLEAN DEFAULT false,
    calibration_frequency_days INTEGER,
    regulatory_requirements TEXT[],
    
    -- Documentation
    manual_url VARCHAR(500),
    specifications JSONB,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================================================
-- MAINTENANCE SCHEDULES
-- =====================================================================================

CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Schedule information
    maintenance_type VARCHAR(50) NOT NULL, -- preventive, predictive, corrective, emergency, calibration
    schedule_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Frequency and timing
    frequency_type VARCHAR(20) NOT NULL, -- fixed_interval, usage_based, condition_based
    frequency_days INTEGER, -- For fixed interval
    frequency_hours DECIMAL(10,2), -- For usage-based
    frequency_cycles INTEGER, -- For cycle-based
    
    -- Next scheduled maintenance
    next_due_date DATE,
    next_due_usage_hours DECIMAL(10,2),
    next_due_cycles INTEGER,
    
    -- Scheduling preferences
    preferred_time_slot VARCHAR(20), -- morning, afternoon, evening, night
    estimated_duration_minutes INTEGER,
    required_skills TEXT[],
    required_tools TEXT[],
    required_parts TEXT[],
    
    -- Cost planning
    estimated_cost DECIMAL(10,2),
    budget_code VARCHAR(50),
    
    -- Notification settings
    alert_days_before INTEGER DEFAULT 7,
    critical_alert_days_before INTEGER DEFAULT 3,
    notification_recipients UUID[], -- User IDs
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_completed_date DATE,
    times_completed INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================================================
-- MAINTENANCE TASKS AND WORK ORDERS
-- =====================================================================================

CREATE TABLE maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    clinic_id UUID NOT NULL,
    
    -- Work order information
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    maintenance_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- emergency, high, medium, low
    
    -- Scheduling
    scheduled_date DATE,
    scheduled_start_time TIME,
    estimated_duration_minutes INTEGER,
    
    -- Assignment
    assigned_technician_id UUID,
    assigned_team_ids UUID[],
    external_vendor_id UUID, -- Reference to suppliers
    
    -- Status tracking
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, on_hold
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,
    
    -- Completion details
    completion_notes TEXT,
    issues_found TEXT,
    actions_taken TEXT,
    parts_used JSONB,
    materials_cost DECIMAL(10,2),
    labor_hours DECIMAL(6,2),
    total_cost DECIMAL(10,2),
    
    -- Quality and compliance
    quality_check_passed BOOLEAN,
    calibration_performed BOOLEAN,
    calibration_results JSONB,
    certification_updated BOOLEAN,
    
    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Documentation
    photos_urls TEXT[],
    documents_urls TEXT[],
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- =====================================================================================
-- MAINTENANCE ALERTS AND NOTIFICATIONS
-- =====================================================================================

CREATE TABLE maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES maintenance_work_orders(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Alert information
    alert_type VARCHAR(30) NOT NULL, -- scheduled_maintenance, overdue_maintenance, emergency, calibration_due, warranty_expiring
    severity VARCHAR(20) NOT NULL, -- critical, high, medium, low, info
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Timing
    trigger_date DATE NOT NULL,
    due_date DATE,
    days_until_due INTEGER,
    
    -- Notification status
    is_active BOOLEAN DEFAULT true,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery tracking
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    notification_recipients UUID[],
    delivery_methods VARCHAR(20)[], -- email, sms, push, dashboard
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- EQUIPMENT USAGE TRACKING
-- =====================================================================================

CREATE TABLE equipment_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Usage session
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    usage_type VARCHAR(50), -- normal_operation, calibration, maintenance, testing
    
    -- Usage metrics
    cycles_performed INTEGER DEFAULT 0,
    power_consumption_kwh DECIMAL(8,4),
    performance_metrics JSONB,
    
    -- Operator information
    operated_by UUID,
    department VARCHAR(100),
    patient_id UUID, -- If applicable
    procedure_type VARCHAR(100),
    
    -- Conditions and environment
    ambient_temperature DECIMAL(5,2),
    humidity_percentage DECIMAL(5,2),
    environmental_conditions JSONB,
    
    -- Performance and issues
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
    issues_reported TEXT,
    anomalies_detected JSONB,
    
    -- Auto-generated tracking
    auto_logged BOOLEAN DEFAULT false,
    data_source VARCHAR(50), -- manual, iot_sensor, system_integration, maintenance_software
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- MAINTENANCE HISTORY AND DOCUMENTATION
-- =====================================================================================

CREATE TABLE maintenance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES maintenance_work_orders(id) ON DELETE SET NULL,
    clinic_id UUID NOT NULL,
    
    -- Maintenance event
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    
    -- Personnel
    performed_by VARCHAR(255),
    technician_id UUID,
    vendor_name VARCHAR(255),
    vendor_id UUID,
    
    -- Work performed
    work_performed TEXT,
    parts_replaced JSONB,
    adjustments_made TEXT,
    issues_resolved TEXT,
    
    -- Results and metrics
    pre_maintenance_condition INTEGER CHECK (pre_maintenance_condition >= 1 AND pre_maintenance_condition <= 10),
    post_maintenance_condition INTEGER CHECK (post_maintenance_condition >= 1 AND post_maintenance_condition <= 10),
    performance_improvement DECIMAL(5,2),
    downtime_hours DECIMAL(6,2),
    
    -- Costs
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Compliance and certification
    compliance_standards_met VARCHAR(255)[],
    certifications_updated VARCHAR(255)[],
    calibration_certificates_urls TEXT[],
    
    -- Documentation
    maintenance_report_url VARCHAR(500),
    photos_urls TEXT[],
    documentation_urls TEXT[],
    
    -- Next maintenance planning
    next_maintenance_recommended_date DATE,
    recommendations TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- =====================================================================================
-- EQUIPMENT PERFORMANCE ANALYTICS
-- =====================================================================================

CREATE TABLE equipment_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Reporting period
    metric_date DATE NOT NULL,
    reporting_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly
    
    -- Availability metrics
    total_scheduled_hours DECIMAL(8,2),
    actual_operational_hours DECIMAL(8,2),
    downtime_hours DECIMAL(8,2),
    availability_percentage DECIMAL(5,2),
    
    -- Reliability metrics
    mean_time_between_failures DECIMAL(10,2), -- MTBF in hours
    mean_time_to_repair DECIMAL(8,2), -- MTTR in hours
    failure_rate DECIMAL(8,4), -- Failures per hour
    reliability_score DECIMAL(5,2),
    
    -- Performance metrics
    performance_efficiency DECIMAL(5,2),
    throughput_metrics JSONB,
    quality_metrics JSONB,
    energy_efficiency DECIMAL(8,4),
    
    -- Maintenance metrics
    scheduled_maintenance_hours DECIMAL(8,2),
    unscheduled_maintenance_hours DECIMAL(8,2),
    maintenance_cost DECIMAL(10,2),
    cost_per_operational_hour DECIMAL(8,2),
    
    -- Usage patterns
    peak_usage_hours VARCHAR(20)[],
    utilization_rate DECIMAL(5,2),
    usage_pattern_analysis JSONB,
    
    -- Predictive indicators
    condition_trend VARCHAR(20), -- improving, stable, degrading
    predicted_failure_risk DECIMAL(5,2),
    recommended_actions TEXT[],
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- VENDOR SERVICE INTEGRATION
-- =====================================================================================

CREATE TABLE vendor_service_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL, -- References suppliers
    clinic_id UUID NOT NULL,
    
    -- Contract information
    contract_number VARCHAR(100),
    contract_type VARCHAR(50) NOT NULL, -- warranty, service_agreement, maintenance_contract
    service_level VARCHAR(50), -- basic, standard, premium, full_service
    
    -- Coverage and scope
    coverage_type VARCHAR(30) NOT NULL, -- parts_only, labor_only, parts_and_labor, full_coverage
    covered_services TEXT[],
    excluded_services TEXT[],
    response_time_hours INTEGER,
    resolution_time_hours INTEGER,
    
    -- Contract terms
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT false,
    contract_value DECIMAL(12,2),
    payment_schedule VARCHAR(20), -- monthly, quarterly, annually, one_time
    
    -- Performance guarantees
    uptime_guarantee_percentage DECIMAL(5,2),
    performance_penalties JSONB,
    service_credits JSONB,
    
    -- Contact information
    vendor_contact_name VARCHAR(255),
    vendor_contact_phone VARCHAR(20),
    vendor_contact_email VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    
    -- Status and tracking
    contract_status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled, pending_renewal
    last_service_date DATE,
    service_calls_used INTEGER DEFAULT 0,
    service_calls_remaining INTEGER,
    
    -- Documentation
    contract_document_url VARCHAR(500),
    terms_and_conditions_url VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================================================
-- REGULATORY COMPLIANCE TRACKING
-- =====================================================================================

CREATE TABLE equipment_compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Compliance requirement
    regulation_name VARCHAR(255) NOT NULL,
    regulation_body VARCHAR(100), -- FDA, CE, ANVISA, ISO, etc.
    requirement_type VARCHAR(50), -- calibration, inspection, testing, certification
    compliance_standard VARCHAR(100),
    
    -- Compliance status
    compliance_status VARCHAR(30) NOT NULL, -- compliant, non_compliant, pending, expired
    last_compliance_date DATE,
    next_compliance_due_date DATE,
    compliance_frequency_days INTEGER,
    
    -- Documentation
    certificate_number VARCHAR(100),
    certificate_url VARCHAR(500),
    compliance_report_url VARCHAR(500),
    test_results JSONB,
    
    -- Responsible parties
    compliance_officer_id UUID,
    testing_organization VARCHAR(255),
    certified_by VARCHAR(255),
    
    -- Notifications
    reminder_days_before INTEGER DEFAULT 30,
    critical_reminder_days_before INTEGER DEFAULT 7,
    notification_recipients UUID[],
    
    -- Audit and tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================================================
-- INDICES FOR PERFORMANCE
-- =====================================================================================

-- Equipment indices
CREATE INDEX idx_equipment_clinic_id ON equipment(clinic_id);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX idx_equipment_criticality ON equipment(criticality_level);
CREATE INDEX idx_equipment_warranty_end ON equipment(warranty_end_date);

-- Maintenance schedules indices
CREATE INDEX idx_maintenance_schedules_equipment_id ON maintenance_schedules(equipment_id);
CREATE INDEX idx_maintenance_schedules_clinic_id ON maintenance_schedules(clinic_id);
CREATE INDEX idx_maintenance_schedules_next_due ON maintenance_schedules(next_due_date);
CREATE INDEX idx_maintenance_schedules_active ON maintenance_schedules(is_active);

-- Work orders indices
CREATE INDEX idx_work_orders_equipment_id ON maintenance_work_orders(equipment_id);
CREATE INDEX idx_work_orders_clinic_id ON maintenance_work_orders(clinic_id);
CREATE INDEX idx_work_orders_status ON maintenance_work_orders(status);
CREATE INDEX idx_work_orders_scheduled_date ON maintenance_work_orders(scheduled_date);
CREATE INDEX idx_work_orders_assigned_technician ON maintenance_work_orders(assigned_technician_id);
CREATE INDEX idx_work_orders_number ON maintenance_work_orders(work_order_number);

-- Alerts indices
CREATE INDEX idx_maintenance_alerts_equipment_id ON maintenance_alerts(equipment_id);
CREATE INDEX idx_maintenance_alerts_clinic_id ON maintenance_alerts(clinic_id);
CREATE INDEX idx_maintenance_alerts_active ON maintenance_alerts(is_active);
CREATE INDEX idx_maintenance_alerts_trigger_date ON maintenance_alerts(trigger_date);
CREATE INDEX idx_maintenance_alerts_severity ON maintenance_alerts(severity);

-- Usage logs indices
CREATE INDEX idx_usage_logs_equipment_id ON equipment_usage_logs(equipment_id);
CREATE INDEX idx_usage_logs_clinic_id ON equipment_usage_logs(clinic_id);
CREATE INDEX idx_usage_logs_session_start ON equipment_usage_logs(session_start);

-- Performance metrics indices
CREATE INDEX idx_performance_metrics_equipment_id ON equipment_performance_metrics(equipment_id);
CREATE INDEX idx_performance_metrics_clinic_id ON equipment_performance_metrics(clinic_id);
CREATE INDEX idx_performance_metrics_date ON equipment_performance_metrics(metric_date);
CREATE INDEX idx_performance_metrics_period ON equipment_performance_metrics(reporting_period);

-- Compliance records indices
CREATE INDEX idx_compliance_records_equipment_id ON equipment_compliance_records(equipment_id);
CREATE INDEX idx_compliance_records_clinic_id ON equipment_compliance_records(clinic_id);
CREATE INDEX idx_compliance_records_status ON equipment_compliance_records(compliance_status);
CREATE INDEX idx_compliance_records_due_date ON equipment_compliance_records(next_compliance_due_date);

-- =====================================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================================

-- Function to update equipment usage from logs
CREATE OR REPLACE FUNCTION update_equipment_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_end IS NOT NULL AND NEW.duration_minutes IS NOT NULL THEN
        UPDATE equipment 
        SET 
            usage_hours = usage_hours + (NEW.duration_minutes / 60.0),
            usage_cycles = usage_cycles + COALESCE(NEW.cycles_performed, 0),
            last_usage_date = NEW.session_end,
            updated_at = NOW()
        WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for equipment usage updates
CREATE TRIGGER trigger_update_equipment_usage
    AFTER INSERT OR UPDATE ON equipment_usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_usage();

-- Function to generate maintenance alerts
CREATE OR REPLACE FUNCTION generate_maintenance_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if maintenance is due soon
    IF NEW.next_due_date IS NOT NULL AND 
       NEW.next_due_date <= CURRENT_DATE + INTERVAL '7 days' AND
       NEW.is_active = true THEN
        
        INSERT INTO maintenance_alerts (
            equipment_id,
            schedule_id,
            clinic_id,
            alert_type,
            severity,
            title,
            message,
            trigger_date,
            due_date,
            days_until_due,
            notification_recipients
        ) VALUES (
            NEW.equipment_id,
            NEW.id,
            NEW.clinic_id,
            'scheduled_maintenance',
            CASE 
                WHEN NEW.next_due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'high'
                WHEN NEW.next_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'medium'
                ELSE 'low'
            END,
            'Manutenção Programada Pendente',
            'Equipamento requer manutenção em ' || TO_CHAR(NEW.next_due_date, 'DD/MM/YYYY'),
            CURRENT_DATE,
            NEW.next_due_date,
            NEW.next_due_date - CURRENT_DATE,
            NEW.notification_recipients
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for maintenance alert generation
CREATE TRIGGER trigger_generate_maintenance_alerts
    AFTER INSERT OR UPDATE ON maintenance_schedules
    FOR EACH ROW
    EXECUTE FUNCTION generate_maintenance_alerts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER trigger_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_maintenance_schedules_updated_at
    BEFORE UPDATE ON maintenance_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_work_orders_updated_at
    BEFORE UPDATE ON maintenance_work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_maintenance_alerts_updated_at
    BEFORE UPDATE ON maintenance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- INITIAL DATA AND SAMPLE RECORDS
-- =====================================================================================

-- Sample equipment types for reference
COMMENT ON COLUMN equipment.equipment_type IS 
'Equipment categories: medical_device, diagnostic, surgical, laboratory, office, it';

COMMENT ON COLUMN equipment.category IS 
'Specific equipment categories: x_ray, ultrasound, ct_scan, mri, lab_analyzer, autoclave, surgical_table, etc.';

COMMENT ON COLUMN maintenance_schedules.maintenance_type IS 
'Maintenance types: preventive, predictive, corrective, emergency, calibration';

COMMENT ON COLUMN maintenance_work_orders.priority IS 
'Priority levels: emergency, high, medium, low';

COMMENT ON COLUMN maintenance_alerts.alert_type IS 
'Alert types: scheduled_maintenance, overdue_maintenance, emergency, calibration_due, warranty_expiring';

-- =====================================================================================
-- COMPLETION CONFIRMATION
-- =====================================================================================

-- Confirm migration completion
DO $$
BEGIN
    RAISE NOTICE 'Equipment Maintenance Management System migration completed successfully!';
    RAISE NOTICE 'Tables created: equipment, maintenance_schedules, maintenance_work_orders, maintenance_alerts, equipment_usage_logs, maintenance_history, equipment_performance_metrics, vendor_service_contracts, equipment_compliance_records';
    RAISE NOTICE 'Indices created for optimal query performance';
    RAISE NOTICE 'Triggers and functions implemented for automated workflows';
END $$;
