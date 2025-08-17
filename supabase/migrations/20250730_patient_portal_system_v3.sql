-- ==========================================
-- PATIENT PORTAL & SELF-SERVICE SYSTEM v3
-- Fixed: Use professionals table for staff clinic relationships
-- ==========================================

-- Drop the existing function first to avoid conflicts
DROP FUNCTION IF EXISTS cleanup_expired_sessions();

-- Create patient portal sessions table
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    session_token varchar(255) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,
    last_accessed_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    access_granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT valid_session_duration CHECK (expires_at > created_at)
);

-- Create patient portal settings table
CREATE TABLE IF NOT EXISTS patient_portal_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
    portal_enabled boolean DEFAULT true,
    session_duration_hours integer DEFAULT 24,
    auto_logout_minutes integer DEFAULT 30,
    allowed_file_types text[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    max_file_size_mb integer DEFAULT 10,
    booking_enabled boolean DEFAULT true,
    progress_tracking_enabled boolean DEFAULT true,
    evaluation_forms_enabled boolean DEFAULT true,
    communication_enabled boolean DEFAULT false,
    privacy_notice_text text,
    terms_conditions_text text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create patient uploads table
CREATE TABLE IF NOT EXISTS patient_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    file_name varchar(255) NOT NULL,
    file_path text NOT NULL,
    file_size_bytes bigint NOT NULL,
    file_type varchar(50) NOT NULL,
    upload_purpose varchar(100) DEFAULT 'general',
    description text,
    is_processed boolean DEFAULT false,
    processed_at timestamptz,
    processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    processing_notes text,
    is_archived boolean DEFAULT false,
    archived_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}',
    CONSTRAINT valid_file_size CHECK (file_size_bytes > 0),
    CONSTRAINT valid_file_type CHECK (file_type ~ '^[a-zA-Z0-9]+$')
);

-- Create patient file permissions table
CREATE TABLE IF NOT EXISTS patient_file_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id uuid REFERENCES patient_uploads(id) ON DELETE CASCADE,
    granted_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
    permission_type varchar(20) DEFAULT 'view' CHECK (permission_type IN ('view', 'download', 'edit', 'delete')),
    granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    notes text,
    UNIQUE(upload_id, granted_to, permission_type)
);

-- Create online booking settings table
CREATE TABLE IF NOT EXISTS online_booking_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
    booking_enabled boolean DEFAULT true,
    advance_booking_days integer DEFAULT 30,
    same_day_booking boolean DEFAULT false,
    booking_buffer_minutes integer DEFAULT 15,
    cancellation_hours_limit integer DEFAULT 24,
    require_deposit boolean DEFAULT false,
    deposit_percentage numeric(5,2) DEFAULT 0,
    available_time_slots jsonb DEFAULT '{}',
    blackout_dates date[],
    booking_instructions text,
    confirmation_message text,
    cancellation_policy text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT valid_percentage CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100)
);

-- Create online bookings table
CREATE TABLE IF NOT EXISTS online_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    professional_id uuid REFERENCES professionals(id) ON DELETE SET NULL,
    service_type varchar(100) NOT NULL,
    preferred_date date NOT NULL,
    preferred_time time NOT NULL,
    alternative_dates jsonb DEFAULT '[]',
    patient_name varchar(255) NOT NULL,
    patient_phone varchar(20),
    special_requests text,
    booking_status varchar(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
    confirmation_code varchar(20) UNIQUE,
    deposit_amount numeric(10,2) DEFAULT 0,
    deposit_paid boolean DEFAULT false,
    deposit_payment_id varchar(255),
    scheduled_appointment_id uuid,
    rejected_reason text,
    cancelled_at timestamptz,
    cancelled_by_patient boolean DEFAULT false,
    confirmed_at timestamptz,
    confirmed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}',
    CONSTRAINT future_date CHECK (preferred_date >= CURRENT_DATE)
);

-- Create booking waitlist table
CREATE TABLE IF NOT EXISTS booking_waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    professional_id uuid REFERENCES professionals(id) ON DELETE SET NULL,
    service_type varchar(100) NOT NULL,
    preferred_date_range daterange NOT NULL,
    preferred_times time[] DEFAULT ARRAY[]::time[],
    patient_name varchar(255) NOT NULL,
    patient_phone varchar(20),
    priority_score integer DEFAULT 0,
    is_active boolean DEFAULT true,
    notified_count integer DEFAULT 0,
    last_notification_at timestamptz,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '30 days'),
    notes text,
    metadata jsonb DEFAULT '{}'
);

-- Create patient evaluations table
CREATE TABLE IF NOT EXISTS patient_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    evaluation_type varchar(50) NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    is_mandatory boolean DEFAULT false,
    is_anonymous boolean DEFAULT false,
    available_from timestamptz DEFAULT now(),
    available_until timestamptz,
    max_responses integer DEFAULT 1,
    current_responses integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT valid_availability CHECK (available_until IS NULL OR available_until > available_from)
);

-- Create evaluation questions table
CREATE TABLE IF NOT EXISTS evaluation_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid REFERENCES patient_evaluations(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    question_type varchar(20) DEFAULT 'text' CHECK (question_type IN ('text', 'number', 'scale', 'single_choice', 'multiple_choice', 'boolean')),
    question_order integer NOT NULL,
    is_required boolean DEFAULT false,
    options jsonb DEFAULT '[]',
    scale_min integer DEFAULT 1,
    scale_max integer DEFAULT 10,
    scale_labels jsonb DEFAULT '{}',
    validation_rules jsonb DEFAULT '{}',
    help_text text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_scale CHECK (scale_max > scale_min),
    CONSTRAINT valid_order CHECK (question_order > 0)
);

-- Create evaluation responses table
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid REFERENCES patient_evaluations(id) ON DELETE CASCADE,
    question_id uuid REFERENCES evaluation_questions(id) ON DELETE CASCADE,
    patient_email varchar(255) NOT NULL,
    response_value text,
    response_number numeric,
    response_json jsonb DEFAULT '{}',
    submitted_at timestamptz DEFAULT now(),
    session_id varchar(255),
    is_final boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    UNIQUE(evaluation_id, question_id, patient_email, session_id)
);

-- Create treatment progress table
CREATE TABLE IF NOT EXISTS treatment_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_email varchar(255) NOT NULL,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    treatment_type varchar(100) NOT NULL,
    stage varchar(50) NOT NULL,
    stage_description text,
    progress_percentage integer DEFAULT 0,
    milestone_reached boolean DEFAULT false,
    milestone_date date,
    next_appointment_date date,
    professional_notes text,
    patient_feedback text,
    photos_before jsonb DEFAULT '[]',
    photos_after jsonb DEFAULT '[]',
    measurements_before jsonb DEFAULT '{}',
    measurements_after jsonb DEFAULT '{}',
    complications text,
    side_effects text,
    patient_satisfaction_score integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT valid_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT valid_satisfaction CHECK (patient_satisfaction_score IS NULL OR (patient_satisfaction_score >= 1 AND patient_satisfaction_score <= 10))
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Patient portal sessions indexes
CREATE INDEX IF NOT EXISTS idx_portal_sessions_patient_email ON patient_portal_sessions(patient_email);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_clinic_active ON patient_portal_sessions(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON patient_portal_sessions(expires_at) WHERE is_active = true;

-- Patient uploads indexes
CREATE INDEX IF NOT EXISTS idx_uploads_patient_email ON patient_uploads(patient_email);
CREATE INDEX IF NOT EXISTS idx_uploads_clinic_id ON patient_uploads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_uploads_processed ON patient_uploads(is_processed, processed_at);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON patient_uploads(created_at);

-- Online bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_patient_email ON online_bookings(patient_email);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON online_bookings(clinic_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON online_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation ON online_bookings(confirmation_code) WHERE confirmation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_professional ON online_bookings(professional_id, preferred_date);

-- Waitlist indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_clinic_active ON booking_waitlist(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON booking_waitlist(priority_score DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_expires ON booking_waitlist(expires_at) WHERE is_active = true;

-- Evaluation indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_clinic_type ON patient_evaluations(clinic_id, evaluation_type);
CREATE INDEX IF NOT EXISTS idx_evaluations_patient_email ON patient_evaluations(patient_email);
CREATE INDEX IF NOT EXISTS idx_responses_evaluation ON evaluation_responses(evaluation_id, patient_email);

-- Treatment progress indexes
CREATE INDEX IF NOT EXISTS idx_progress_patient_treatment ON treatment_progress(patient_email, treatment_type);
CREATE INDEX IF NOT EXISTS idx_progress_clinic_stage ON treatment_progress(clinic_id, stage);
CREATE INDEX IF NOT EXISTS idx_progress_updated ON treatment_progress(updated_at);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update to relevant tables
DROP TRIGGER IF EXISTS trigger_patient_portal_settings_updated_at ON patient_portal_settings;
CREATE TRIGGER trigger_patient_portal_settings_updated_at
    BEFORE UPDATE ON patient_portal_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_online_booking_settings_updated_at ON online_booking_settings;
CREATE TRIGGER trigger_online_booking_settings_updated_at
    BEFORE UPDATE ON online_booking_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_online_bookings_updated_at ON online_bookings;
CREATE TRIGGER trigger_online_bookings_updated_at
    BEFORE UPDATE ON online_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_patient_evaluations_updated_at ON patient_evaluations;
CREATE TRIGGER trigger_patient_evaluations_updated_at
    BEFORE UPDATE ON patient_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_treatment_progress_updated_at ON treatment_progress;
CREATE TRIGGER trigger_treatment_progress_updated_at
    BEFORE UPDATE ON treatment_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate confirmation codes for bookings
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.confirmation_code IS NULL AND NEW.booking_status = 'confirmed' THEN
        NEW.confirmation_code = 'NP' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_booking_confirmation_code ON online_bookings;
CREATE TRIGGER trigger_booking_confirmation_code
    BEFORE INSERT OR UPDATE ON online_bookings
    FOR EACH ROW EXECUTE FUNCTION generate_confirmation_code();

-- Cleanup expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE patient_portal_sessions 
    SET is_active = false 
    WHERE expires_at < now() AND is_active = true;
    
    DELETE FROM patient_portal_sessions 
    WHERE expires_at < (now() - interval '7 days');
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE patient_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_progress ENABLE ROW LEVEL SECURITY;

-- Policies for patient_portal_sessions
CREATE POLICY "Patients can view their own sessions" ON patient_portal_sessions
    FOR SELECT USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can view all sessions in their clinic" ON patient_portal_sessions
    FOR SELECT USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

-- Policies for patient_uploads
CREATE POLICY "Patients can view their own uploads" ON patient_uploads
    FOR SELECT USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Patients can create their own uploads" ON patient_uploads
    FOR INSERT WITH CHECK (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can view uploads in their clinic" ON patient_uploads
    FOR SELECT USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can update uploads in their clinic" ON patient_uploads
    FOR UPDATE USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

-- Policies for online_bookings
CREATE POLICY "Patients can view their own bookings" ON online_bookings
    FOR SELECT USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Patients can create bookings" ON online_bookings
    FOR INSERT WITH CHECK (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Patients can update their own bookings" ON online_bookings
    FOR UPDATE USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can view bookings in their clinic" ON online_bookings
    FOR SELECT USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can update bookings in their clinic" ON online_bookings
    FOR UPDATE USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

-- Policies for patient_evaluations
CREATE POLICY "Patients can view evaluations assigned to them" ON patient_evaluations
    FOR SELECT USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can manage evaluations in their clinic" ON patient_evaluations
    FOR ALL USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

-- Policies for evaluation_responses
CREATE POLICY "Patients can manage their own responses" ON evaluation_responses
    FOR ALL USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can view responses for their clinic evaluations" ON evaluation_responses
    FOR SELECT USING (
        evaluation_id IN (
            SELECT e.id FROM patient_evaluations e 
            WHERE e.clinic_id IN (
                SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
            )
        )
    );

-- Policies for treatment_progress
CREATE POLICY "Patients can view their own progress" ON treatment_progress
    FOR SELECT USING (patient_email = current_setting('request.headers')::json->>'patient-email');

CREATE POLICY "Staff can manage progress in their clinic" ON treatment_progress
    FOR ALL USING (
        clinic_id IN (
            SELECT prof.clinic_id FROM professionals prof WHERE prof.user_id = auth.uid()
        )
    );

-- ==========================================
-- VIEWS FOR EASY DATA ACCESS
-- ==========================================

-- Patient portal dashboard view
CREATE OR REPLACE VIEW patient_portal_dashboard AS
SELECT 
    ps.patient_email,
    ps.clinic_id,
    c.clinic_name,
    ps.session_token,
    ps.expires_at,
    ps.last_accessed_at,
    pps.portal_enabled,
    pps.booking_enabled,
    pps.progress_tracking_enabled,
    pps.evaluation_forms_enabled,
    pps.communication_enabled,
    COUNT(pu.id) as uploaded_files_count,
    COUNT(ob.id) as pending_bookings_count,
    COUNT(pe.id) as available_evaluations_count,
    COUNT(tp.id) as active_treatments_count
FROM patient_portal_sessions ps
JOIN clinics c ON c.id = ps.clinic_id
LEFT JOIN patient_portal_settings pps ON pps.clinic_id = ps.clinic_id
LEFT JOIN patient_uploads pu ON pu.patient_email = ps.patient_email AND pu.clinic_id = ps.clinic_id
LEFT JOIN online_bookings ob ON ob.patient_email = ps.patient_email AND ob.clinic_id = ps.clinic_id AND ob.booking_status = 'pending'
LEFT JOIN patient_evaluations pe ON pe.patient_email = ps.patient_email AND pe.clinic_id = ps.clinic_id AND pe.is_active = true
LEFT JOIN treatment_progress tp ON tp.patient_email = ps.patient_email AND tp.clinic_id = ps.clinic_id
WHERE ps.is_active = true AND ps.expires_at > now()
GROUP BY ps.patient_email, ps.clinic_id, c.clinic_name, ps.session_token, ps.expires_at, ps.last_accessed_at, 
         pps.portal_enabled, pps.booking_enabled, pps.progress_tracking_enabled, pps.evaluation_forms_enabled, pps.communication_enabled;

-- Booking analytics view
CREATE OR REPLACE VIEW booking_analytics AS
SELECT 
    clinic_id,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'rejected') as rejected_bookings,
    AVG(CASE WHEN confirmed_at IS NOT NULL THEN 
        EXTRACT(hours FROM (confirmed_at - created_at)) 
    END) as avg_confirmation_hours,
    COUNT(*) FILTER (WHERE deposit_paid = true) as bookings_with_deposit
FROM online_bookings
GROUP BY clinic_id, DATE_TRUNC('month', created_at);

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Insert default portal settings for existing clinics
INSERT INTO patient_portal_settings (clinic_id, portal_enabled, session_duration_hours, auto_logout_minutes)
SELECT 
    c.id,
    true,
    24,
    30
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM patient_portal_settings pps 
    WHERE pps.clinic_id = c.id
)
ON CONFLICT (clinic_id) DO NOTHING;

-- Insert default booking settings for existing clinics
INSERT INTO online_booking_settings (clinic_id, booking_enabled, advance_booking_days, same_day_booking)
SELECT 
    c.id,
    true,
    30,
    false
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM online_booking_settings obs 
    WHERE obs.clinic_id = c.id
)
ON CONFLICT (clinic_id) DO NOTHING;