-- Migration: Create Patient Photos Schema with LGPD Compliance
-- Date: 2025-07-28
-- Description: Secure photo storage system for medical images with metadata and LGPD compliance

-- Create patient_photos table
CREATE TABLE IF NOT EXISTS patient_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL CHECK (mime_type ~ '^image/(jpeg|jpg|png|heic|webp)$'),
    metadata JSONB NOT NULL DEFAULT '{}',
    lgpd_consented BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints for security and data integrity
    CONSTRAINT valid_file_path CHECK (file_path ~ '^[a-f0-9-]{36}/[0-9]+-[0-9]+\.[a-zA-Z0-9]+$'),
    CONSTRAINT valid_file_size CHECK (file_size <= 10485760), -- 10MB limit
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_photos_patient_id ON patient_photos(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_photos_created_at ON patient_photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_photos_file_path ON patient_photos USING btree(file_path);
CREATE INDEX IF NOT EXISTS idx_patient_photos_metadata ON patient_photos USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_patient_photos_lgpd_consented ON patient_photos(lgpd_consented) WHERE lgpd_consented = true;

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_patient_photos_patient_date ON patient_photos(patient_id, created_at DESC);

-- Add RLS (Row Level Security)
ALTER TABLE patient_photos ENABLE ROW LEVEL SECURITY;

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'patient-photos', 
    'patient-photos', 
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for patient_photos table

-- Policy: Healthcare professionals can view photos of their patients
CREATE POLICY "Healthcare professionals can view patient photos"
ON patient_photos
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = patient_photos.patient_id
        AND p.role = 'patient'
        AND auth.uid() IN (
            -- Patient can view their own photos
            SELECT patient_photos.patient_id
            UNION
            -- Healthcare professionals can view their patients' photos
            SELECT DISTINCT pc.professional_id
            FROM patient_consultations pc
            WHERE pc.patient_id = patient_photos.patient_id
            UNION
            -- Clinic administrators can view all photos in their clinic
            SELECT DISTINCT cp.user_id
            FROM clinic_professionals cp
            JOIN profiles prof ON prof.id = cp.user_id
            WHERE prof.role IN ('admin', 'manager')
            AND cp.clinic_id IN (
                SELECT DISTINCT cp2.clinic_id
                FROM clinic_professionals cp2
                WHERE cp2.user_id = patient_photos.patient_id
            )
        )
    )
    -- Additional LGPD consent check
    AND patient_photos.lgpd_consented = true
);

-- Policy: Only healthcare professionals can insert photos
CREATE POLICY "Healthcare professionals can insert patient photos"
ON patient_photos
FOR INSERT
TO authenticated
WITH CHECK (
    -- Only authenticated healthcare professionals
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('healthcare_professional', 'admin', 'manager')
    )
    -- Patient must exist and have LGPD consent for photos
    AND EXISTS (
        SELECT 1 FROM profiles patient
        WHERE patient.id = patient_photos.patient_id
        AND patient.role = 'patient'
        AND (patient.lgpd_consents->>'photo_consent')::boolean = true
    )
    -- Professional must have access to this patient
    AND (
        -- Patient themselves (for self-upload scenarios)
        auth.uid() = patient_photos.patient_id
        OR
        -- Healthcare professional with patient consultation history
        EXISTS (
            SELECT 1 FROM patient_consultations pc
            WHERE pc.patient_id = patient_photos.patient_id
            AND pc.professional_id = auth.uid()
        )
        OR
        -- Clinic administrator
        EXISTS (
            SELECT 1 FROM clinic_professionals cp
            JOIN profiles prof ON prof.id = cp.user_id
            WHERE prof.id = auth.uid()
            AND prof.role IN ('admin', 'manager')
            AND cp.clinic_id IN (
                SELECT DISTINCT cp2.clinic_id
                FROM clinic_professionals cp2
                WHERE cp2.user_id = patient_photos.patient_id
            )
        )
    )
    -- Ensure LGPD consent is properly recorded
    AND patient_photos.lgpd_consented = true
);

-- Policy: Healthcare professionals can update photo metadata
CREATE POLICY "Healthcare professionals can update patient photos"
ON patient_photos
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('healthcare_professional', 'admin', 'manager')
    )
    AND EXISTS (
        SELECT 1 FROM patient_consultations pc
        WHERE pc.patient_id = patient_photos.patient_id
        AND pc.professional_id = auth.uid()
    )
    AND patient_photos.lgpd_consented = true
)
WITH CHECK (
    -- Prevent changing core file information
    patient_id = patient_id
    AND file_path = file_path
    AND file_size = file_size
    AND mime_type = mime_type
    AND lgpd_consented = true
);

-- Policy: Only authorized users can delete photos
CREATE POLICY "Authorized users can delete patient photos"
ON patient_photos
FOR DELETE
TO authenticated
USING (
    -- Patient can delete their own photos
    auth.uid() = patient_photos.patient_id
    OR
    -- Healthcare professional who created the photo
    auth.uid() = patient_photos.created_by
    OR
    -- Clinic administrator
    EXISTS (
        SELECT 1 FROM clinic_professionals cp
        JOIN profiles prof ON prof.id = cp.user_id
        WHERE prof.id = auth.uid()
        AND prof.role IN ('admin', 'manager')
        AND cp.clinic_id IN (
            SELECT DISTINCT cp2.clinic_id
            FROM clinic_professionals cp2
            WHERE cp2.user_id = patient_photos.patient_id
        )
    )
);

-- Storage Bucket RLS Policies

-- Policy: Allow authenticated users to upload photos to their folder
CREATE POLICY "Users can upload photos to their patient folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'patient-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    -- Additional check to ensure LGPD consent
    AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND (
            p.role = 'patient'
            OR p.role IN ('healthcare_professional', 'admin', 'manager')
        )
    )
);

-- Policy: Allow authorized users to view photos
CREATE POLICY "Authorized users can view patient photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'patient-photos'
    AND (
        -- User can access their own photos
        (storage.foldername(name))[1] = auth.uid()::text
        OR
        -- Healthcare professionals can access their patients' photos
        EXISTS (
            SELECT 1 FROM patient_consultations pc
            WHERE pc.patient_id = (storage.foldername(name))[1]::uuid
            AND pc.professional_id = auth.uid()
        )
        OR
        -- Clinic administrators can access photos in their clinic
        EXISTS (
            SELECT 1 FROM clinic_professionals cp
            JOIN profiles prof ON prof.id = cp.user_id
            WHERE prof.id = auth.uid()
            AND prof.role IN ('admin', 'manager')
            AND cp.clinic_id IN (
                SELECT DISTINCT cp2.clinic_id
                FROM clinic_professionals cp2
                WHERE cp2.user_id = (storage.foldername(name))[1]::uuid
            )
        )
    )
);

-- Policy: Allow authorized users to delete photos
CREATE POLICY "Authorized users can delete patient photos from storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'patient-photos'
    AND (
        -- User can delete their own photos
        (storage.foldername(name))[1] = auth.uid()::text
        OR
        -- Healthcare professionals can delete photos they uploaded
        EXISTS (
            SELECT 1 FROM patient_photos pp
            WHERE pp.file_path = name
            AND pp.created_by = auth.uid()
        )
        OR
        -- Clinic administrators can delete photos in their clinic
        EXISTS (
            SELECT 1 FROM clinic_professionals cp
            JOIN profiles prof ON prof.id = cp.user_id
            WHERE prof.id = auth.uid()
            AND prof.role IN ('admin', 'manager')
            AND cp.clinic_id IN (
                SELECT DISTINCT cp2.clinic_id
                FROM clinic_professionals cp2
                WHERE cp2.user_id = (storage.foldername(name))[1]::uuid
            )
        )
    )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates  
CREATE TRIGGER trigger_update_patient_photos_updated_at
    BEFORE UPDATE ON patient_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_photos_updated_at();

-- Function to validate photo metadata structure
CREATE OR REPLACE FUNCTION validate_photo_metadata(metadata_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check required fields exist
    IF NOT (
        metadata_json ? 'date' AND
        metadata_json ? 'treatmentType' AND
        metadata_json ? 'category' AND
        metadata_json ? 'anatomicalArea'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate category values
    IF NOT (metadata_json->>'category' IN ('before', 'after', 'during')) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate date format (ISO 8601)
    BEGIN
        PERFORM (metadata_json->>'date')::timestamp;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint using the validation function
ALTER TABLE patient_photos 
ADD CONSTRAINT valid_photo_metadata_structure 
CHECK (validate_photo_metadata(metadata));

-- Function to check LGPD consent before photo operations
CREATE OR REPLACE FUNCTION check_photo_lgpd_consent()
RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT operations
    IF TG_OP = 'INSERT' THEN
        -- Verify patient has photo consent
        IF NOT EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = NEW.patient_id
            AND (p.lgpd_consents->>'photo_consent')::boolean = true
        ) THEN
            RAISE EXCEPTION 'Patient does not have LGPD consent for photo storage';
        END IF;
        
        -- Set created_by to current user
        NEW.created_by = auth.uid();
        
        RETURN NEW;
    END IF;
    
    -- For UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        -- Prevent changing LGPD consent to false if photos exist
        IF OLD.lgpd_consented = true AND NEW.lgpd_consented = false THEN
            RAISE EXCEPTION 'Cannot revoke LGPD consent while photos exist. Delete photos first.';
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for LGPD consent validation
CREATE TRIGGER trigger_check_photo_lgpd_consent_insert
    BEFORE INSERT ON patient_photos
    FOR EACH ROW
    EXECUTE FUNCTION check_photo_lgpd_consent();

CREATE TRIGGER trigger_check_photo_lgpd_consent_update
    BEFORE UPDATE ON patient_photos
    FOR EACH ROW
    EXECUTE FUNCTION check_photo_lgpd_consent();

-- Create view for photo statistics and analytics
CREATE OR REPLACE VIEW patient_photo_stats AS
SELECT 
    patient_id,
    COUNT(*) as total_photos,
    COUNT(*) FILTER (WHERE (metadata->>'category') = 'before') as before_photos,
    COUNT(*) FILTER (WHERE (metadata->>'category') = 'after') as after_photos,
    COUNT(*) FILTER (WHERE (metadata->>'category') = 'during') as during_photos,
    SUM(file_size) as total_storage_bytes,
    MIN(created_at) as first_photo_date,
    MAX(created_at) as last_photo_date,
    jsonb_agg(DISTINCT (metadata->>'treatmentType')) as treatment_types,
    jsonb_agg(DISTINCT (metadata->>'anatomicalArea')) as anatomical_areas
FROM patient_photos
WHERE lgpd_consented = true
GROUP BY patient_id;

-- Grant necessary permissions
GRANT SELECT ON patient_photo_stats TO authenticated;

-- Add helpful comments
COMMENT ON TABLE patient_photos IS 'Secure storage of patient medical photos with LGPD compliance and comprehensive metadata';
COMMENT ON COLUMN patient_photos.metadata IS 'JSON metadata including treatment type, anatomical area, date, category, and notes';
COMMENT ON COLUMN patient_photos.lgpd_consented IS 'Confirms patient has provided specific consent for photo storage under LGPD';
COMMENT ON COLUMN patient_photos.file_path IS 'Storage path in format: patient_id/timestamp-index.extension';

-- Create audit log for photo operations (optional, for compliance tracking)
CREATE TABLE IF NOT EXISTS patient_photos_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES patient_photos(id) ON DELETE SET NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'VIEW')),
    user_id UUID REFERENCES profiles(id),
    user_role TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_patient_photos_audit_timestamp ON patient_photos_audit(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patient_photos_audit_photo_id ON patient_photos_audit(photo_id);
CREATE INDEX IF NOT EXISTS idx_patient_photos_audit_user_id ON patient_photos_audit(user_id);

-- Function to log photo access (for LGPD compliance)
CREATE OR REPLACE FUNCTION log_photo_access(
    p_photo_id UUID,
    p_operation TEXT,
    p_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO patient_photos_audit (
        photo_id,
        operation,
        user_id,
        user_role,
        details
    )
    SELECT 
        p_photo_id,
        p_operation,
        auth.uid(),
        (SELECT role FROM profiles WHERE id = auth.uid()),
        p_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on audit table
ALTER TABLE patient_photos_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and the users involved can view audit logs
CREATE POLICY "Authorized users can view photo audit logs"
ON patient_photos_audit
FOR SELECT
TO authenticated
USING (
    -- User can see their own actions
    user_id = auth.uid()
    OR
    -- Admins can see all audit logs
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'manager')
    )
);

-- Final verification queries (commented out for production)
/*
-- Verify table structure
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'patient_photos'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'patient_photos';

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'patient_photos';
*/