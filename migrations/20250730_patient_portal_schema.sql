-- Migration: Patient Portal Schema
-- Created: 2025-07-30
-- Description: Database schema for patient portal functionality
-- Story: 4.3 - Patient Portal & Self-Service

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Patient portal sessions table
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_patient_id ON patient_portal_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_expires ON patient_portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_activity ON patient_portal_sessions(last_activity);

-- Patient uploads table
CREATE TABLE IF NOT EXISTS patient_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('exam', 'document', 'progress_photo', 'prescription', 'insurance')),
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient uploads
CREATE INDEX IF NOT EXISTS idx_patient_uploads_patient_id ON patient_uploads(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_category ON patient_uploads(category);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_clinic_id ON patient_uploads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_upload_date ON patient_uploads(upload_date);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_processed ON patient_uploads(is_processed);

-- Patient evaluations table
CREATE TABLE IF NOT EXISTS patient_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    treatment_id UUID, -- Reference to treatments table when available
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    qualitative_feedback TEXT,
    would_recommend BOOLEAN,
    feedback_categories TEXT[] DEFAULT '{}', -- ['punctuality', 'cleanliness', 'communication', 'professionalism']
    improvement_suggestions TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    response_from_clinic TEXT,
    responded_by UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient evaluations
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_patient_id ON patient_evaluations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_appointment_id ON patient_evaluations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_clinic_id ON patient_evaluations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_overall_rating ON patient_evaluations(overall_rating);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_nps_score ON patient_evaluations(nps_score);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_created_at ON patient_evaluations(created_at);

-- Treatment progress table
CREATE TABLE IF NOT EXISTS treatment_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL, -- Reference to treatments table
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    session_number INTEGER NOT NULL CHECK (session_number > 0),
    progress_percentage DECIMAL(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    notes TEXT,
    professional_notes TEXT, -- Notes visible only to professionals
    measurements JSONB DEFAULT '{}',
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs/paths
    before_photos TEXT[] DEFAULT '{}',
    after_photos TEXT[] DEFAULT '{}',
    next_session_date TIMESTAMP WITH TIME ZONE,
    next_session_notes TEXT,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 5),
    side_effects TEXT,
    recommendations TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for treatment progress
CREATE INDEX IF NOT EXISTS idx_treatment_progress_patient_id ON treatment_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_treatment_id ON treatment_progress(treatment_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_session_number ON treatment_progress(session_number);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_clinic_id ON treatment_progress(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_created_at ON treatment_progress(created_at);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_next_session ON treatment_progress(next_session_date);

-- Online bookings table
CREATE TABLE IF NOT EXISTS online_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    requested_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (requested_date + requested_time) STORED,
    service_type VARCHAR(100) NOT NULL,
    service_id UUID, -- Reference to services table when available
    preferred_staff_id UUID REFERENCES auth.users(id),
    alternative_staff_ids UUID[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    special_requests TEXT,
    accessibility_needs TEXT,
    insurance_info JSONB DEFAULT '{}',
    estimated_duration INTEGER, -- in minutes
    estimated_cost DECIMAL(10,2),
    confirmation_sent BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    rescheduled_from UUID REFERENCES online_bookings(id),
    rescheduled_to UUID REFERENCES online_bookings(id),
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for online bookings
CREATE INDEX IF NOT EXISTS idx_online_bookings_patient_id ON online_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_online_bookings_requested_datetime ON online_bookings(requested_datetime);
CREATE INDEX IF NOT EXISTS idx_online_bookings_status ON online_bookings(status);
CREATE INDEX IF NOT EXISTS idx_online_bookings_clinic_id ON online_bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_online_bookings_staff_id ON online_bookings(preferred_staff_id);
CREATE INDEX IF NOT EXISTS idx_online_bookings_service_type ON online_bookings(service_type);

-- Patient login attempts table (for security)
CREATE TABLE IF NOT EXISTS patient_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    failure_reason VARCHAR(100),
    blocked BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for login attempts
CREATE INDEX IF NOT EXISTS idx_patient_login_attempts_email ON patient_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_patient_login_attempts_ip ON patient_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_patient_login_attempts_timestamp ON patient_login_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_patient_login_attempts_success ON patient_login_attempts(success);

-- Patient security events table
CREATE TABLE IF NOT EXISTS patient_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('login', 'logout', 'session_expired', 'suspicious_activity', 'password_change', 'data_access', 'file_upload')),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES patient_portal_sessions(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for security events
CREATE INDEX IF NOT EXISTS idx_patient_security_events_patient_id ON patient_security_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_security_events_type ON patient_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_patient_security_events_severity ON patient_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_patient_security_events_timestamp ON patient_security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_patient_security_events_resolved ON patient_security_events(resolved);

-- Patient portal preferences table
CREATE TABLE IF NOT EXISTS patient_portal_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications JSONB DEFAULT '{
        "email": true,
        "sms": true,
        "push": true,
        "appointment_reminders": true,
        "treatment_updates": true,
        "promotional": false
    }',
    accessibility JSONB DEFAULT '{
        "high_contrast": false,
        "large_text": false,
        "screen_reader": false,
        "reduced_motion": false
    }',
    privacy_settings JSONB DEFAULT '{
        "share_progress_photos": false,
        "allow_testimonials": false,
        "marketing_consent": false,
        "data_sharing_consent": false
    }',
    dashboard_layout JSONB DEFAULT '{}',
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, clinic_id)
);

-- Index for portal preferences
CREATE INDEX IF NOT EXISTS idx_patient_portal_preferences_patient_id ON patient_portal_preferences(patient_id);

-- Patient portal activity log
CREATE TABLE IF NOT EXISTS patient_portal_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES patient_portal_sessions(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_patient_id ON patient_portal_activity(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_type ON patient_portal_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_timestamp ON patient_portal_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_patient_portal_activity_clinic_id ON patient_portal_activity(clinic_id);

-- Add columns to existing patients table if they don't exist
DO $$
BEGIN
    -- Add password-related columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'password_hash') THEN
        ALTER TABLE patients ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE patients ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE patients ADD COLUMN two_factor_secret VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'last_login') THEN
        ALTER TABLE patients ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'failed_login_attempts') THEN
        ALTER TABLE patients ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'account_locked_until') THEN
        ALTER TABLE patients ADD COLUMN account_locked_until TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'portal_access_enabled') THEN
        ALTER TABLE patients ADD COLUMN portal_access_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'terms_accepted_at') THEN
        ALTER TABLE patients ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'privacy_policy_accepted_at') THEN
        ALTER TABLE patients ADD COLUMN privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE patient_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_portal_sessions
CREATE POLICY "Patients can view their own sessions" ON patient_portal_sessions
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own sessions" ON patient_portal_sessions
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own sessions" ON patient_portal_sessions
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Patients can delete their own sessions" ON patient_portal_sessions
    FOR DELETE USING (patient_id = auth.uid());

-- Staff can view sessions for their clinic
CREATE POLICY "Staff can view clinic sessions" ON patient_portal_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            JOIN user_clinic_roles ucr ON p.clinic_id = ucr.clinic_id 
            WHERE p.id = patient_id AND ucr.user_id = auth.uid()
        )
    );

-- RLS Policies for patient_uploads
CREATE POLICY "Patients can view their own uploads" ON patient_uploads
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own uploads" ON patient_uploads
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own uploads" ON patient_uploads
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Staff can view clinic uploads" ON patient_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can update clinic uploads" ON patient_uploads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

-- RLS Policies for patient_evaluations
CREATE POLICY "Patients can view their own evaluations" ON patient_evaluations
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own evaluations" ON patient_evaluations
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own evaluations" ON patient_evaluations
    FOR UPDATE USING (patient_id = auth.uid() AND responded_by IS NULL);

CREATE POLICY "Staff can view clinic evaluations" ON patient_evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can respond to evaluations" ON patient_evaluations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

-- RLS Policies for treatment_progress
CREATE POLICY "Patients can view their own progress" ON treatment_progress
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Staff can view clinic progress" ON treatment_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

-- RLS Policies for online_bookings
CREATE POLICY "Patients can manage their own bookings" ON online_bookings
    FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Staff can manage clinic bookings" ON online_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

-- RLS Policies for patient_portal_preferences
CREATE POLICY "Patients can manage their own preferences" ON patient_portal_preferences
    FOR ALL USING (patient_id = auth.uid());

-- RLS Policies for patient_portal_activity (read-only for patients)
CREATE POLICY "Patients can view their own activity" ON patient_portal_activity
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "System can insert activity" ON patient_portal_activity
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view clinic activity" ON patient_portal_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clinic_roles ucr 
            WHERE ucr.clinic_id = clinic_id AND ucr.user_id = auth.uid()
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_patient_portal_sessions_updated_at BEFORE UPDATE ON patient_portal_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_uploads_updated_at BEFORE UPDATE ON patient_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_evaluations_updated_at BEFORE UPDATE ON patient_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_progress_updated_at BEFORE UPDATE ON treatment_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_online_bookings_updated_at BEFORE UPDATE ON online_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_portal_preferences_updated_at BEFORE UPDATE ON patient_portal_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_portal_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM patient_portal_sessions 
    WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 minutes';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get patient portal statistics
CREATE OR REPLACE FUNCTION get_patient_portal_stats(clinic_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_sessions', (
            SELECT COUNT(*) FROM patient_portal_sessions pps
            JOIN patients p ON pps.patient_id = p.id
            WHERE pps.expires_at > NOW() 
            AND (clinic_id_param IS NULL OR p.clinic_id = clinic_id_param)
        ),
        'total_uploads', (
            SELECT COUNT(*) FROM patient_uploads pu
            WHERE clinic_id_param IS NULL OR pu.clinic_id = clinic_id_param
        ),
        'pending_bookings', (
            SELECT COUNT(*) FROM online_bookings ob
            WHERE ob.status = 'pending'
            AND (clinic_id_param IS NULL OR ob.clinic_id = clinic_id_param)
        ),
        'average_rating', (
            SELECT ROUND(AVG(overall_rating), 2) FROM patient_evaluations pe
            WHERE pe.overall_rating IS NOT NULL
            AND (clinic_id_param IS NULL OR pe.clinic_id = clinic_id_param)
        ),
        'nps_score', (
            SELECT ROUND(AVG(nps_score), 2) FROM patient_evaluations pe
            WHERE pe.nps_score IS NOT NULL
            AND (clinic_id_param IS NULL OR pe.clinic_id = clinic_id_param)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a view for patient dashboard data
CREATE OR REPLACE VIEW patient_dashboard_view AS
SELECT 
    p.id as patient_id,
    p.name,
    p.email,
    p.phone,
    p.clinic_id,
    -- Recent appointments
    (
        SELECT json_agg(json_build_object(
            'id', a.id,
            'date', a.appointment_date,
            'time', a.appointment_time,
            'status', a.status,
            'service', a.service_type
        ) ORDER BY a.appointment_date DESC)
        FROM appointments a 
        WHERE a.patient_id = p.id 
        AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        LIMIT 5
    ) as recent_appointments,
    -- Upcoming appointments
    (
        SELECT json_agg(json_build_object(
            'id', a.id,
            'date', a.appointment_date,
            'time', a.appointment_time,
            'status', a.status,
            'service', a.service_type
        ) ORDER BY a.appointment_date ASC)
        FROM appointments a 
        WHERE a.patient_id = p.id 
        AND a.appointment_date >= CURRENT_DATE
        LIMIT 5
    ) as upcoming_appointments,
    -- Recent uploads
    (
        SELECT json_agg(json_build_object(
            'id', pu.id,
            'filename', pu.original_filename,
            'category', pu.category,
            'upload_date', pu.upload_date,
            'is_processed', pu.is_processed
        ) ORDER BY pu.upload_date DESC)
        FROM patient_uploads pu 
        WHERE pu.patient_id = p.id
        LIMIT 5
    ) as recent_uploads,
    -- Treatment progress
    (
        SELECT json_agg(json_build_object(
            'id', tp.id,
            'treatment_id', tp.treatment_id,
            'session_number', tp.session_number,
            'progress_percentage', tp.progress_percentage,
            'created_at', tp.created_at
        ) ORDER BY tp.created_at DESC)
        FROM treatment_progress tp 
        WHERE tp.patient_id = p.id
        LIMIT 5
    ) as treatment_progress,
    -- Portal preferences
    (
        SELECT json_build_object(
            'language', ppp.language,
            'theme', ppp.theme,
            'notifications', ppp.notifications,
            'accessibility', ppp.accessibility
        )
        FROM patient_portal_preferences ppp 
        WHERE ppp.patient_id = p.id
        LIMIT 1
    ) as preferences
FROM patients p
WHERE p.is_active = true AND p.portal_access_enabled = true;

-- Grant necessary permissions
GRANT SELECT ON patient_dashboard_view TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_portal_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_portal_stats(UUID) TO authenticated;

-- Insert default portal preferences for existing patients
INSERT INTO patient_portal_preferences (patient_id, clinic_id)
SELECT p.id, p.clinic_id 
FROM patients p 
WHERE p.is_active = true 
AND NOT EXISTS (
    SELECT 1 FROM patient_portal_preferences ppp 
    WHERE ppp.patient_id = p.id
)
ON CONFLICT (patient_id, clinic_id) DO NOTHING;

-- Create indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_patients_portal_access ON patients(portal_access_enabled) WHERE portal_access_enabled = true;
CREATE INDEX IF NOT EXISTS idx_patients_last_login ON patients(last_login);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date);

COMMIT;