-- scripts/03-appointment-procedures.sql
-- Enhanced Appointment CRUD Operations - Stored Procedures
-- Story 1.1: Stored procedures for appointment booking with validation

-- 1. Main appointment booking stored procedure with comprehensive validation
CREATE OR REPLACE FUNCTION sp_book_appointment(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_professional_id UUID,
    p_service_type_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_notes TEXT DEFAULT NULL,
    p_internal_notes TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_change_reason TEXT DEFAULT 'New appointment booking'
)
RETURNS TABLE(
    success BOOLEAN,
    appointment_id UUID,
    error_code TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_appointment_id UUID;
    v_conflict_exists BOOLEAN;
    v_business_hours_ok BOOLEAN;
    v_professional_available BOOLEAN;
    v_service_duration INTEGER;
    v_calculated_end_time TIMESTAMPTZ;
BEGIN
    -- Initialize return values
    success := FALSE;
    appointment_id := NULL;
    error_code := NULL;
    error_message := NULL;
    
    -- Begin transaction
    BEGIN
        -- Validate input parameters
        IF p_clinic_id IS NULL THEN
            error_code := 'INVALID_CLINIC';
            error_message := 'Clinic ID is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF p_patient_id IS NULL THEN
            error_code := 'INVALID_PATIENT';
            error_message := 'Patient ID is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF p_professional_id IS NULL THEN
            error_code := 'INVALID_PROFESSIONAL';
            error_message := 'Professional ID is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF p_service_type_id IS NULL THEN
            error_code := 'INVALID_SERVICE';
            error_message := 'Service type ID is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF p_start_time IS NULL THEN
            error_code := 'INVALID_START_TIME';
            error_message := 'Start time is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Validate that start time is in the future
        IF p_start_time <= NOW() THEN
            error_code := 'INVALID_TIME_PAST';
            error_message := 'Appointment start time must be in the future';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Get service duration and calculate end time if not provided
        SELECT duration_minutes INTO v_service_duration
        FROM public.service_types
        WHERE id = p_service_type_id AND deleted_at IS NULL;
        
        IF v_service_duration IS NULL THEN
            error_code := 'SERVICE_NOT_FOUND';
            error_message := 'Service type not found or has been deleted';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Calculate end time if not provided
        IF p_end_time IS NULL THEN
            v_calculated_end_time := p_start_time + (v_service_duration || ' minutes')::INTERVAL;
        ELSE
            v_calculated_end_time := p_end_time;
            
            -- Validate that end time is after start time
            IF p_end_time <= p_start_time THEN
                error_code := 'INVALID_END_TIME';
                error_message := 'End time must be after start time';
                RETURN NEXT;
                RETURN;
            END IF;
        END IF;
        
        -- Validate that all entities belong to the same clinic
        IF NOT EXISTS (
            SELECT 1 FROM public.patients 
            WHERE id = p_patient_id AND clinic_id = p_clinic_id AND deleted_at IS NULL
        ) THEN
            error_code := 'PATIENT_CLINIC_MISMATCH';
            error_message := 'Patient does not belong to the specified clinic';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM public.professionals 
            WHERE id = p_professional_id AND clinic_id = p_clinic_id AND deleted_at IS NULL
        ) THEN
            error_code := 'PROFESSIONAL_CLINIC_MISMATCH';
            error_message := 'Professional does not belong to the specified clinic';
            RETURN NEXT;
            RETURN;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM public.service_types 
            WHERE id = p_service_type_id AND clinic_id = p_clinic_id AND deleted_at IS NULL
        ) THEN
            error_code := 'SERVICE_CLINIC_MISMATCH';
            error_message := 'Service type does not belong to the specified clinic';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Check for appointment conflicts
        SELECT check_appointment_conflict(
            p_professional_id, 
            p_start_time, 
            v_calculated_end_time
        ) INTO v_conflict_exists;
        
        IF v_conflict_exists THEN
            error_code := 'APPOINTMENT_CONFLICT';
            error_message := 'The professional already has an appointment at this time';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Check business hours
        SELECT is_within_business_hours(
            p_clinic_id,
            p_start_time,
            v_calculated_end_time
        ) INTO v_business_hours_ok;
        
        IF NOT v_business_hours_ok THEN
            error_code := 'OUTSIDE_BUSINESS_HOURS';
            error_message := 'Appointment is outside clinic business hours';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Check professional availability
        SELECT is_professional_available(
            p_professional_id,
            p_start_time,
            v_calculated_end_time
        ) INTO v_professional_available;
        
        IF NOT v_professional_available THEN
            error_code := 'PROFESSIONAL_UNAVAILABLE';
            error_message := 'Professional is not available at this time';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Generate new appointment ID
        v_appointment_id := gen_random_uuid();
        
        -- Create the appointment
        INSERT INTO public.appointments (
            id,
            clinic_id,
            patient_id,
            professional_id,
            service_type_id,
            appointment_time,
            start_time,
            end_time,
            status,
            notes,
            internal_notes,
            created_by,
            change_reason
        ) VALUES (
            v_appointment_id,
            p_clinic_id,
            p_patient_id,
            p_professional_id,
            p_service_type_id,
            tstzrange(p_start_time, v_calculated_end_time, '[)'),
            p_start_time,
            v_calculated_end_time,
            'scheduled',
            p_notes,
            p_internal_notes,
            COALESCE(p_created_by, auth.uid()),
            p_change_reason
        );
        
        -- Success
        success := TRUE;
        appointment_id := v_appointment_id;
        error_code := NULL;
        error_message := 'Appointment booked successfully';
        
        RETURN NEXT;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Handle any unexpected errors
            success := FALSE;
            appointment_id := NULL;
            error_code := 'UNEXPECTED_ERROR';
            error_message := 'An unexpected error occurred: ' || SQLERRM;
            RETURN NEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Stored procedure for updating appointments with validation
CREATE OR REPLACE FUNCTION sp_update_appointment(
    p_appointment_id UUID,
    p_patient_id UUID DEFAULT NULL,
    p_professional_id UUID DEFAULT NULL,
    p_service_type_id UUID DEFAULT NULL,
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_internal_notes TEXT DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL,
    p_change_reason TEXT DEFAULT 'Appointment updated'
)
RETURNS TABLE(
    success BOOLEAN,
    error_code TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_current_appointment RECORD;
    v_conflict_exists BOOLEAN;
    v_business_hours_ok BOOLEAN;
    v_professional_available BOOLEAN;
    v_new_professional_id UUID;
    v_new_start_time TIMESTAMPTZ;
    v_new_end_time TIMESTAMPTZ;
BEGIN
    -- Initialize return values
    success := FALSE;
    error_code := NULL;
    error_message := NULL;
    
    BEGIN
        -- Get current appointment details
        SELECT * INTO v_current_appointment
        FROM public.appointments
        WHERE id = p_appointment_id AND deleted_at IS NULL;
        
        IF v_current_appointment IS NULL THEN
            error_code := 'APPOINTMENT_NOT_FOUND';
            error_message := 'Appointment not found or has been deleted';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Determine what values to use (new or existing)
        v_new_professional_id := COALESCE(p_professional_id, v_current_appointment.professional_id);
        v_new_start_time := COALESCE(p_start_time, v_current_appointment.start_time);
        v_new_end_time := COALESCE(p_end_time, v_current_appointment.end_time);
        
        -- Validate status if provided
        IF p_status IS NOT NULL AND p_status NOT IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') THEN
            error_code := 'INVALID_STATUS';
            error_message := 'Invalid appointment status';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- If time or professional is changing, validate conflicts
        IF p_professional_id IS NOT NULL OR p_start_time IS NOT NULL OR p_end_time IS NOT NULL THEN
            
            -- Validate that start time is in the future (if changing)
            IF p_start_time IS NOT NULL AND p_start_time <= NOW() THEN
                error_code := 'INVALID_TIME_PAST';
                error_message := 'Appointment start time must be in the future';
                RETURN NEXT;
                RETURN;
            END IF;
            
            -- Validate that end time is after start time
            IF v_new_end_time <= v_new_start_time THEN
                error_code := 'INVALID_END_TIME';
                error_message := 'End time must be after start time';
                RETURN NEXT;
                RETURN;
            END IF;
            
            -- Check for conflicts (excluding current appointment)
            SELECT check_appointment_conflict(
                v_new_professional_id,
                v_new_start_time,
                v_new_end_time,
                p_appointment_id
            ) INTO v_conflict_exists;
            
            IF v_conflict_exists THEN
                error_code := 'APPOINTMENT_CONFLICT';
                error_message := 'The professional already has an appointment at this time';
                RETURN NEXT;
                RETURN;
            END IF;
            
            -- Check business hours
            SELECT is_within_business_hours(
                v_current_appointment.clinic_id,
                v_new_start_time,
                v_new_end_time
            ) INTO v_business_hours_ok;
            
            IF NOT v_business_hours_ok THEN
                error_code := 'OUTSIDE_BUSINESS_HOURS';
                error_message := 'Appointment is outside clinic business hours';
                RETURN NEXT;
                RETURN;
            END IF;
            
            -- Check professional availability
            SELECT is_professional_available(
                v_new_professional_id,
                v_new_start_time,
                v_new_end_time
            ) INTO v_professional_available;
            
            IF NOT v_professional_available THEN
                error_code := 'PROFESSIONAL_UNAVAILABLE';
                error_message := 'Professional is not available at this time';
                RETURN NEXT;
                RETURN;
            END IF;
        END IF;
        
        -- Update the appointment
        UPDATE public.appointments SET
            patient_id = COALESCE(p_patient_id, patient_id),
            professional_id = COALESCE(p_professional_id, professional_id),
            service_type_id = COALESCE(p_service_type_id, service_type_id),
            start_time = v_new_start_time,
            end_time = v_new_end_time,
            appointment_time = tstzrange(v_new_start_time, v_new_end_time, '[)'),
            status = COALESCE(p_status, status),
            notes = COALESCE(p_notes, notes),
            internal_notes = COALESCE(p_internal_notes, internal_notes),
            updated_by = COALESCE(p_updated_by, auth.uid()),
            change_reason = p_change_reason,
            updated_at = NOW()
        WHERE id = p_appointment_id;
        
        -- Success
        success := TRUE;
        error_code := NULL;
        error_message := 'Appointment updated successfully';
        
        RETURN NEXT;
        
    EXCEPTION
        WHEN OTHERS THEN
            success := FALSE;
            error_code := 'UNEXPECTED_ERROR';
            error_message := 'An unexpected error occurred: ' || SQLERRM;
            RETURN NEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Stored procedure for soft deleting appointments
CREATE OR REPLACE FUNCTION sp_delete_appointment(
    p_appointment_id UUID,
    p_deleted_reason TEXT,
    p_deleted_by UUID DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    error_code TEXT,
    error_message TEXT
) AS $$
BEGIN
    -- Initialize return values
    success := FALSE;
    error_code := NULL;
    error_message := NULL;
    
    BEGIN
        -- Check if appointment exists and is not already deleted
        IF NOT EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE id = p_appointment_id AND deleted_at IS NULL
        ) THEN
            error_code := 'APPOINTMENT_NOT_FOUND';
            error_message := 'Appointment not found or has already been deleted';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Validate deleted reason
        IF p_deleted_reason IS NULL OR LENGTH(TRIM(p_deleted_reason)) = 0 THEN
            error_code := 'INVALID_REASON';
            error_message := 'Deletion reason is required';
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Soft delete the appointment
        UPDATE public.appointments SET
            deleted_at = NOW(),
            deleted_reason = p_deleted_reason,
            deleted_by = COALESCE(p_deleted_by, auth.uid()),
            updated_at = NOW()
        WHERE id = p_appointment_id;
        
        -- Success
        success := TRUE;
        error_code := NULL;
        error_message := 'Appointment deleted successfully';
        
        RETURN NEXT;
        
    EXCEPTION
        WHEN OTHERS THEN
            success := FALSE;
            error_code := 'UNEXPECTED_ERROR';
            error_message := 'An unexpected error occurred: ' || SQLERRM;
            RETURN NEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to get available time slots for a professional
CREATE OR REPLACE FUNCTION get_available_slots(
    p_professional_id UUID,
    p_date DATE,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
) AS $$
DECLARE
    v_professional RECORD;
    v_clinic RECORD;
    v_day_name TEXT;
    v_availability JSONB;
    v_business_hours JSONB;
    v_start_time TIME;
    v_end_time TIME;
    v_current_slot TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_is_conflict BOOLEAN;
    v_interval INTERVAL;
BEGIN
    -- Get professional and clinic info
    SELECT p.*, c.business_hours, c.timezone
    INTO v_professional, v_business_hours
    FROM public.professionals p
    JOIN public.clinics c ON p.clinic_id = c.id
    WHERE p.id = p_professional_id AND p.deleted_at IS NULL;
    
    IF v_professional IS NULL THEN
        RETURN;
    END IF;
    
    -- Get day of week name
    v_day_name := LOWER(TO_CHAR(p_date, 'FMDay'));
    
    -- Get availability for this day
    v_availability := v_professional.availability->v_day_name;
    
    -- Check if professional is available this day
    IF NOT (v_availability->>'enabled')::BOOLEAN THEN
        RETURN;
    END IF;
    
    -- Get working hours
    v_start_time := (v_availability->>'start')::TIME;
    v_end_time := (v_availability->>'end')::TIME;
    
    -- Convert duration to interval
    v_interval := (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Generate time slots (every 15 minutes)
    v_current_slot := (p_date + v_start_time)::TIMESTAMPTZ;
    
    WHILE v_current_slot + v_interval <= (p_date + v_end_time)::TIMESTAMPTZ LOOP
        v_slot_end := v_current_slot + v_interval;
        
        -- Check for conflicts
        SELECT check_appointment_conflict(
            p_professional_id,
            v_current_slot,
            v_slot_end
        ) INTO v_is_conflict;
        
        -- Return the slot
        slot_start := v_current_slot;
        slot_end := v_slot_end;
        is_available := NOT v_is_conflict;
        
        RETURN NEXT;
        
        -- Move to next slot (15-minute intervals)
        v_current_slot := v_current_slot + INTERVAL '15 minutes';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;