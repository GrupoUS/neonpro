-- =============================================
-- NeonPro Conflict Override Stored Procedure
-- Story 1.2: Handle conflict override with audit trail
-- =============================================

-- Create the conflict override handler function
CREATE OR REPLACE FUNCTION handle_conflict_override(
    p_appointment_id UUID DEFAULT NULL,
    p_professional_id UUID,
    p_clinic_id UUID,
    p_patient_id UUID,
    p_service_type_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_override_reason TEXT,
    p_conflicts JSONB,
    p_manager_id UUID,
    p_manager_email TEXT
)
RETURNS TABLE (
    appointment_id UUID,
    override_id UUID,
    warnings TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_appointment_id UUID;
    v_override_id UUID;
    v_warnings TEXT[] := ARRAY[]::TEXT[];
    v_existing_appointment RECORD;
    v_conflict_count INTEGER;
BEGIN
    -- Start transaction
    BEGIN
        -- Check if this is an update or new appointment
        IF p_appointment_id IS NOT NULL THEN
            -- Update existing appointment
            SELECT * INTO v_existing_appointment
            FROM appointments 
            WHERE id = p_appointment_id AND clinic_id = p_clinic_id;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Appointment not found';
            END IF;
            
            -- Update the appointment
            UPDATE appointments 
            SET 
                professional_id = p_professional_id,
                patient_id = p_patient_id,
                service_type_id = p_service_type_id,
                start_time = p_start_time,
                end_time = p_end_time,
                status = 'confirmed',
                updated_at = NOW()
            WHERE id = p_appointment_id;
            
            v_appointment_id := p_appointment_id;
            v_warnings := array_append(v_warnings, 'Agendamento existente atualizado com override');
            
        ELSE
            -- Create new appointment
            INSERT INTO appointments (
                professional_id,
                clinic_id,
                patient_id,
                service_type_id,
                start_time,
                end_time,
                status,
                notes
            ) VALUES (
                p_professional_id,
                p_clinic_id,
                p_patient_id,
                p_service_type_id,
                p_start_time,
                p_end_time,
                'confirmed',
                'Agendamento criado com override de conflitos por gestor'
            )
            RETURNING id INTO v_appointment_id;
            
            v_warnings := array_append(v_warnings, 'Novo agendamento criado com override');
        END IF;
        
        -- Create override record
        INSERT INTO appointment_conflict_overrides (
            appointment_id,
            manager_id,
            manager_email,
            override_reason,
            conflicts,
            override_timestamp,
            is_active
        ) VALUES (
            v_appointment_id,
            p_manager_id,
            p_manager_email,
            p_override_reason,
            p_conflicts,
            NOW(),
            true
        )
        RETURNING id INTO v_override_id;
        
        -- Log the override action
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id,
            clinic_id,
            ip_address,
            user_agent,
            metadata
        ) VALUES (
            'appointments',
            v_appointment_id,
            CASE WHEN p_appointment_id IS NOT NULL THEN 'conflict_override_update' ELSE 'conflict_override_create' END,
            CASE WHEN p_appointment_id IS NOT NULL THEN row_to_json(v_existing_appointment) ELSE NULL END,
            json_build_object(
                'professional_id', p_professional_id,
                'patient_id', p_patient_id,
                'service_type_id', p_service_type_id,
                'start_time', p_start_time,
                'end_time', p_end_time,
                'status', 'confirmed'
            ),
            p_manager_id,
            p_clinic_id,
            NULL, -- IP will be filled by trigger if available
            NULL, -- User agent will be filled by trigger if available
            json_build_object(
                'override_reason', p_override_reason,
                'conflicts_count', jsonb_array_length(p_conflicts),
                'override_id', v_override_id,
                'manager_email', p_manager_email
            )
        );
        
        -- Count total conflicts for warning
        SELECT jsonb_array_length(p_conflicts) INTO v_conflict_count;
        IF v_conflict_count > 3 THEN
            v_warnings := array_append(v_warnings, format('Agendamento possui %s conflitos - monitorar de perto', v_conflict_count));
        END IF;
        
        -- Check for high-severity conflicts
        IF EXISTS (
            SELECT 1 FROM jsonb_array_elements(p_conflicts) AS conflict
            WHERE conflict->>'severity' = 'error'
        ) THEN
            v_warnings := array_append(v_warnings, 'Agendamento possui conflitos de alta severidade');
        END IF;
        
        -- Return results
        RETURN QUERY SELECT v_appointment_id, v_override_id, v_warnings;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- Rollback and re-raise
            RAISE EXCEPTION 'Erro ao processar override: %', SQLERRM;
    END;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_conflict_overrides_appointment 
ON appointment_conflict_overrides(appointment_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_appointment_conflict_overrides_manager 
ON appointment_conflict_overrides(manager_id, override_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_conflict_overrides_clinic_date 
ON appointment_conflict_overrides(
    (conflicts->0->>'clinic_id'), 
    DATE(override_timestamp)
) WHERE is_active = true;

-- Create trigger to automatically deactivate old overrides when appointment is cancelled
CREATE OR REPLACE FUNCTION deactivate_overrides_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE appointment_conflict_overrides
        SET is_active = false,
            updated_at = NOW()
        WHERE appointment_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_deactivate_overrides_on_cancel'
    ) THEN
        CREATE TRIGGER trigger_deactivate_overrides_on_cancel
            AFTER UPDATE ON appointments
            FOR EACH ROW
            WHEN (OLD.status IS DISTINCT FROM NEW.status)
            EXECUTE FUNCTION deactivate_overrides_on_cancel();
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_conflict_override TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_conflict_override IS 
'Handles appointment conflict overrides with full audit trail and notification support';

COMMENT ON COLUMN appointment_conflict_overrides.conflicts IS 
'JSONB array containing the conflicts that were overridden';

COMMENT ON COLUMN appointment_conflict_overrides.override_reason IS 
'Manager-provided reason for overriding the conflicts';

COMMENT ON COLUMN appointment_conflict_overrides.is_active IS 
'Whether this override is still active (false if appointment was cancelled)';
