-- scripts/02-setup-appointments.sql
-- Enhanced Appointment CRUD Operations - Database Schema
-- Story 1.1: Create appointments table with conflict prevention, audit logging, and soft delete

-- Enable necessary extensions for conflict detection
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Create clinics table if it doesn't exist (for multi-tenant support)
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_hours JSONB NOT NULL DEFAULT '{"monday":{"start":"09:00","end":"18:00","enabled":true},"tuesday":{"start":"09:00","end":"18:00","enabled":true},"wednesday":{"start":"09:00","end":"18:00","enabled":true},"thursday":{"start":"09:00","end":"18:00","enabled":true},"friday":{"start":"09:00","end":"18:00","enabled":true},"saturday":{"start":"09:00","end":"12:00","enabled":false},"sunday":{"start":"09:00","end":"12:00","enabled":false}}',
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- 2. Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    deleted_reason TEXT
);

-- Enable RLS for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 3. Create professionals table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT,
    license_number TEXT,
    availability JSONB NOT NULL DEFAULT '{"monday":{"start":"09:00","end":"18:00","enabled":true},"tuesday":{"start":"09:00","end":"18:00","enabled":true},"wednesday":{"start":"09:00","end":"18:00","enabled":true},"thursday":{"start":"09:00","end":"18:00","enabled":true},"friday":{"start":"09:00","end":"18:00","enabled":true},"saturday":{"start":"09:00","end":"12:00","enabled":false},"sunday":{"start":"09:00","end":"12:00","enabled":false}}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    deleted_reason TEXT
);

-- Enable RLS for professionals
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- 4. Create service_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2),
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    deleted_reason TEXT
);

-- Enable RLS for service_types
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- 5. Create appointments table with enhanced features
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    service_type_id UUID NOT NULL REFERENCES public.service_types(id) ON DELETE CASCADE,
    
    -- Appointment timing using tstzrange for conflict detection
    appointment_time TSTZRANGE NOT NULL,
    
    -- Traditional start/end times for easier querying
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    -- Status management
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    
    -- Additional information
    notes TEXT,
    internal_notes TEXT, -- Only visible to staff
    
    -- Audit trail fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    
    -- Soft delete support
    deleted_at TIMESTAMPTZ NULL,
    deleted_reason TEXT,
    deleted_by UUID REFERENCES auth.users(id),
    
    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure start_time and end_time match the tstzrange
    CONSTRAINT appointment_time_consistency 
        CHECK (appointment_time = tstzrange(start_time, end_time, '[)'))
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 6. Create exclusion constraint to prevent appointment conflicts
-- This prevents overlapping appointments for the same professional
ALTER TABLE public.appointments
ADD CONSTRAINT prevent_professional_conflicts
EXCLUDE USING GIST (
    professional_id WITH =,
    appointment_time WITH &&
) WHERE (deleted_at IS NULL);

-- 7. Create indexes for performance optimization

-- Index for appointment queries by professional and date range
CREATE INDEX IF NOT EXISTS idx_appointments_professional_time 
ON public.appointments USING GIST (professional_id, appointment_time) 
WHERE deleted_at IS NULL;

-- Index for appointment queries by patient
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id 
ON public.appointments (patient_id) 
WHERE deleted_at IS NULL;

-- Index for appointment queries by clinic and date
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date 
ON public.appointments (clinic_id, start_time) 
WHERE deleted_at IS NULL;

-- Index for appointment status queries
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON public.appointments (status) 
WHERE deleted_at IS NULL;

-- Index for soft-deleted appointments
CREATE INDEX IF NOT EXISTS idx_appointments_deleted 
ON public.appointments (deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Partial index for active appointments
CREATE INDEX IF NOT EXISTS idx_appointments_active 
ON public.appointments (clinic_id, professional_id, start_time) 
WHERE deleted_at IS NULL;

-- 8. Create trigger functions for updated_at timestamps

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables
CREATE TRIGGER update_clinics_updated_at 
    BEFORE UPDATE ON public.clinics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at 
    BEFORE UPDATE ON public.professionals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at 
    BEFORE UPDATE ON public.service_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS Policies for multi-tenant isolation

-- Clinics policies
CREATE POLICY "Users can view their clinic" ON public.clinics
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff WHERE clinic_id = clinics.id
        )
    );

CREATE POLICY "Admins can manage their clinic" ON public.clinics
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff 
            WHERE clinic_id = clinics.id AND role IN ('admin', 'owner')
        )
    );

-- Patients policies  
CREATE POLICY "Clinic staff can view patients" ON public.patients
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff WHERE clinic_id = patients.clinic_id
        )
    );

CREATE POLICY "Clinic staff can manage patients" ON public.patients
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff 
            WHERE clinic_id = patients.clinic_id 
            AND role IN ('admin', 'owner', 'receptionist')
        )
    );

-- Professionals policies
CREATE POLICY "Clinic staff can view professionals" ON public.professionals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff WHERE clinic_id = professionals.clinic_id
        )
    );

CREATE POLICY "Admins can manage professionals" ON public.professionals
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff 
            WHERE clinic_id = professionals.clinic_id 
            AND role IN ('admin', 'owner')
        )
    );

-- Service types policies
CREATE POLICY "Clinic staff can view service types" ON public.service_types
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff WHERE clinic_id = service_types.clinic_id
        )
    );

CREATE POLICY "Admins can manage service types" ON public.service_types
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff 
            WHERE clinic_id = service_types.clinic_id 
            AND role IN ('admin', 'owner')
        )
    );

-- Appointments policies
CREATE POLICY "Clinic staff can view appointments" ON public.appointments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff WHERE clinic_id = appointments.clinic_id
        )
    );

CREATE POLICY "Professionals can view their appointments" ON public.appointments
    FOR SELECT USING (
        professional_id IN (
            SELECT id FROM public.professionals 
            WHERE clinic_id IN (
                SELECT clinic_id FROM public.clinic_staff 
                WHERE user_id = auth.uid() AND role = 'professional'
            )
        )
    );

CREATE POLICY "Clinic staff can manage appointments" ON public.appointments
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.clinic_staff 
            WHERE clinic_id = appointments.clinic_id 
            AND role IN ('admin', 'owner', 'receptionist')
        )
    );-- Continue scripts/02-setup-appointments.sql
-- Create clinic_staff table for RLS policies and multi-tenant support

-- 10. Create clinic_staff table for user-clinic relationships
CREATE TABLE IF NOT EXISTS public.clinic_staff (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'receptionist', 'professional')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique user-clinic combination
    UNIQUE(clinic_id, user_id)
);

-- Enable RLS for clinic_staff
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_clinic_staff_updated_at 
    BEFORE UPDATE ON public.clinic_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clinic staff policies
CREATE POLICY "Users can view their clinic relationships" ON public.clinic_staff
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage clinic staff" ON public.clinic_staff
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_staff 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- 11. Create appointment_history table for audit logging
CREATE TABLE IF NOT EXISTS public.appointment_history (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'cancelled', 'completed', 'deleted')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for appointment_history
ALTER TABLE public.appointment_history ENABLE ROW LEVEL SECURITY;

-- Index for appointment history queries
CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id 
ON public.appointment_history (appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointment_history_created_at 
ON public.appointment_history (created_at DESC);

-- Appointment history policies
CREATE POLICY "Clinic staff can view appointment history" ON public.appointment_history
    FOR SELECT USING (
        appointment_id IN (
            SELECT id FROM public.appointments a
            WHERE a.clinic_id IN (
                SELECT clinic_id FROM public.clinic_staff 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 12. Create trigger function for appointment audit logging
CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change
    INSERT INTO public.appointment_history (
        appointment_id,
        action,
        old_values,
        new_values,
        changed_by,
        change_reason
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN 'deleted'
            WHEN TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN 'cancelled'
            WHEN TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN 'completed'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
        COALESCE(NEW.updated_by, OLD.updated_by, auth.uid()),
        COALESCE(NEW.change_reason, OLD.change_reason)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the audit trigger to appointments
CREATE TRIGGER appointment_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION log_appointment_changes();

-- 13. Create helper functions for appointment management

-- Function to check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_professional_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM public.appointments
    WHERE professional_id = p_professional_id
        AND deleted_at IS NULL
        AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
        AND appointment_time && tstzrange(p_start_time, p_end_time, '[)');
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check business hours
CREATE OR REPLACE FUNCTION is_within_business_hours(
    p_clinic_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
    business_hours JSONB;
    day_name TEXT;
    day_config JSONB;
    start_time TIME;
    end_time TIME;
    appointment_start_time TIME;
    appointment_end_time TIME;
BEGIN
    -- Get business hours for the clinic
    SELECT c.business_hours INTO business_hours
    FROM public.clinics c
    WHERE c.id = p_clinic_id;
    
    -- Get day of week (lowercase)
    day_name := LOWER(TO_CHAR(p_start_time, 'FMDay'));
    
    -- Get configuration for this day
    day_config := business_hours->day_name;
    
    -- Check if the day is enabled
    IF NOT (day_config->>'enabled')::BOOLEAN THEN
        RETURN FALSE;
    END IF;
    
    -- Extract times
    start_time := (day_config->>'start')::TIME;
    end_time := (day_config->>'end')::TIME;
    appointment_start_time := p_start_time::TIME;
    appointment_end_time := p_end_time::TIME;
    
    -- Check if appointment is within business hours
    RETURN appointment_start_time >= start_time AND appointment_end_time <= end_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check professional availability
CREATE OR REPLACE FUNCTION is_professional_available(
    p_professional_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
    availability JSONB;
    day_name TEXT;
    day_config JSONB;
    start_time TIME;
    end_time TIME;
    appointment_start_time TIME;
    appointment_end_time TIME;
BEGIN
    -- Get professional availability
    SELECT p.availability INTO availability
    FROM public.professionals p
    WHERE p.id = p_professional_id;
    
    -- Get day of week (lowercase)
    day_name := LOWER(TO_CHAR(p_start_time, 'FMDay'));
    
    -- Get configuration for this day
    day_config := availability->day_name;
    
    -- Check if the professional is available this day
    IF NOT (day_config->>'enabled')::BOOLEAN THEN
        RETURN FALSE;
    END IF;
    
    -- Extract times
    start_time := (day_config->>'start')::TIME;
    end_time := (day_config->>'end')::TIME;
    appointment_start_time := p_start_time::TIME;
    appointment_end_time := p_end_time::TIME;
    
    -- Check if appointment is within availability hours
    RETURN appointment_start_time >= start_time AND appointment_end_time <= end_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;