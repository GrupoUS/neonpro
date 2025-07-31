-- ==========================================
-- PATIENT PORTAL & SELF-SERVICE SYSTEM
-- Epic 4 - Story 4.3 Database Schema
-- ==========================================

-- Drop function if exists to avoid conflicts
DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;

-- Patient Portal Sessions (secure session management)
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    login_method VARCHAR(50) DEFAULT 'password', -- password, email_link, sms, social
    security_flags JSONB DEFAULT '{}', -- suspicious_activity, geo_anomaly, etc
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Portal Settings (per-clinic configuration)
CREATE TABLE IF NOT EXISTS patient_portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    portal_name VARCHAR(255) DEFAULT 'Portal do Paciente',
    portal_logo_url TEXT,
    portal_theme_colors JSONB DEFAULT '{}',
    session_timeout_minutes INTEGER DEFAULT 30,
    max_concurrent_sessions INTEGER DEFAULT 3,
    require_email_verification BOOLEAN DEFAULT true,
    require_phone_verification BOOLEAN DEFAULT false,
    enable_biometric_login BOOLEAN DEFAULT false,
    enable_sms_notifications BOOLEAN DEFAULT true,
    enable_email_notifications BOOLEAN DEFAULT true,
    enable_file_uploads BOOLEAN DEFAULT true,
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    enable_online_booking BOOLEAN DEFAULT true,
    enable_treatment_tracking BOOLEAN DEFAULT true,
    enable_satisfaction_surveys BOOLEAN DEFAULT true,
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(20),
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    UNIQUE(clinic_id)
);

-- Patient File Uploads (documents, images, forms)
CREATE TABLE IF NOT EXISTS patient_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_category VARCHAR(100) DEFAULT 'general', -- medical_records, insurance, identification, consent_forms, photos
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    encryption_key_id UUID, -- For sensitive files
    upload_source VARCHAR(50) DEFAULT 'portal', -- portal, mobile_app, email, staff
    processing_status VARCHAR(50) DEFAULT 'completed', -- uploading, processing, completed, failed
    virus_scan_status VARCHAR(50) DEFAULT 'pending', -- pending, clean, infected, error
    virus_scan_result JSONB DEFAULT '{}',
    ocr_text TEXT, -- Extracted text from documents
    metadata JSONB DEFAULT '{}',
    access_level VARCHAR(50) DEFAULT 'patient_only', -- patient_only, staff_accessible, public
    retention_until DATE,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Patient File Permissions (granular access control)
CREATE TABLE IF NOT EXISTS patient_file_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES patient_uploads(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id), -- Specific user permission
    role VARCHAR(100), -- Role-based permission
    permission_type VARCHAR(50) NOT NULL, -- view, download, edit, delete, share
    granted_by UUID REFERENCES profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    access_conditions JSONB DEFAULT '{}', -- IP restrictions, time restrictions, etc
    is_active BOOLEAN DEFAULT true
);

-- Online Booking Settings (per-clinic booking configuration)
CREATE TABLE IF NOT EXISTS online_booking_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    advance_booking_days INTEGER DEFAULT 30,
    same_day_booking BOOLEAN DEFAULT true,
    booking_window_start TIME DEFAULT '09:00',
    booking_window_end TIME DEFAULT '18:00',
    slot_duration_minutes INTEGER DEFAULT 60,
    buffer_time_minutes INTEGER DEFAULT 15,
    max_bookings_per_day INTEGER DEFAULT 20,
    max_bookings_per_patient_month INTEGER DEFAULT 4,
    require_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    cancellation_window_hours INTEGER DEFAULT 24,
    no_show_policy TEXT,
    booking_confirmation_template TEXT,
    booking_reminder_template TEXT,
    cancellation_template TEXT,
    available_services JSONB DEFAULT '[]',
    blocked_dates DATE[] DEFAULT '{}',
    special_dates JSONB DEFAULT '{}', -- holidays, special hours, etc
    auto_confirm_bookings BOOLEAN DEFAULT false,
    waitlist_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    UNIQUE(clinic_id)
);

-- Online Bookings (patient self-service appointments)
CREATE TABLE IF NOT EXISTS online_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    service_details JSONB DEFAULT '{}',
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
    priority_level VARCHAR(50) DEFAULT 'normal', -- urgent, high, normal, low
    special_requests TEXT,
    contact_preferences JSONB DEFAULT '{}', -- preferred contact method, language, etc
    booking_source VARCHAR(50) DEFAULT 'portal', -- portal, mobile_app, phone, walk_in
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES profiles(id),
    appointment_id UUID, -- Link to actual appointment when confirmed
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    no_show_reported_at TIMESTAMPTZ,
    no_show_reported_by UUID REFERENCES profiles(id),
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_payment_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Waitlist (for fully booked slots)
CREATE TABLE IF NOT EXISTS booking_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    preferred_dates DATE[] NOT NULL,
    preferred_times TIME[] NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_wait_days INTEGER DEFAULT 14,
    priority_score INTEGER DEFAULT 0,
    contact_when_available BOOLEAN DEFAULT true,
    contact_preferences JSONB DEFAULT '{}',
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, notified, converted, expired, cancelled
    notified_at TIMESTAMPTZ,
    converted_to_booking_id UUID REFERENCES online_bookings(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Evaluations (satisfaction and feedback)
CREATE TABLE IF NOT EXISTS patient_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(100) NOT NULL, -- treatment_satisfaction, service_quality, facility_rating, overall_experience
    treatment_id UUID, -- Reference to specific treatment if applicable
    appointment_id UUID, -- Reference to specific appointment
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    would_recommend BOOLEAN,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    completion_status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    completion_percentage INTEGER DEFAULT 0,
    time_to_complete_minutes INTEGER,
    response_data JSONB DEFAULT '{}', -- All responses stored as JSON
    calculated_scores JSONB DEFAULT '{}', -- Calculated metrics and scores
    improvement_suggestions TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    consent_to_share BOOLEAN DEFAULT false,
    language_code VARCHAR(10) DEFAULT 'pt-BR',
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Evaluation Questions (dynamic questionnaire system)
CREATE TABLE IF NOT EXISTS evaluation_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    question_code VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- rating, multiple_choice, text, yes_no, scale
    question_category VARCHAR(100), -- service, facility, staff, treatment, overall
    response_options JSONB DEFAULT '[]', -- For multiple choice questions
    scale_min INTEGER DEFAULT 1,
    scale_max INTEGER DEFAULT 5,
    scale_labels JSONB DEFAULT '{}', -- Labels for scale endpoints
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    condition_logic JSONB DEFAULT '{}', -- Show question based on previous answers
    weight_factor DECIMAL(3,2) DEFAULT 1.0, -- For scoring calculations
    applicable_evaluation_types TEXT[] DEFAULT '{}',
    language_code VARCHAR(10) DEFAULT 'pt-BR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    UNIQUE(clinic_id, question_code, language_code)
);

-- Evaluation Responses (individual question responses)
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES patient_evaluations(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES evaluation_questions(id) ON DELETE CASCADE,
    question_code VARCHAR(100) NOT NULL,
    response_value TEXT,
    response_numeric INTEGER,
    response_date DATE,
    response_time TIME,
    response_metadata JSONB DEFAULT '{}',
    skipped BOOLEAN DEFAULT false,
    skip_reason VARCHAR(255),
    time_spent_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(evaluation_id, question_id)
);

-- Treatment Progress Tracking
CREATE TABLE IF NOT EXISTS treatment_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    treatment_plan_id UUID, -- Reference to treatment plan
    session_number INTEGER NOT NULL,
    session_date DATE NOT NULL,
    progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    progress_notes TEXT,
    patient_reported_status VARCHAR(100), -- excellent, good, fair, poor, experiencing_issues
    session_satisfaction INTEGER CHECK (session_satisfaction >= 1 AND session_satisfaction <= 5),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    side_effects TEXT,
    photos_before JSONB DEFAULT '[]', -- File references
    photos_after JSONB DEFAULT '[]', -- File references
    measurements JSONB DEFAULT '{}', -- Objective measurements
    next_session_date DATE,
    recommendations TEXT,
    patient_questions TEXT,
    is_milestone BOOLEAN DEFAULT false,
    milestone_description TEXT,
    provider_notes TEXT,
    provider_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treatment Goals and Outcomes
CREATE TABLE IF NOT EXISTS treatment_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    treatment_plan_id UUID, -- Reference to treatment plan
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT,
    goal_type VARCHAR(100), -- aesthetic, functional, wellness, maintenance
    target_metric VARCHAR(255), -- What we're measuring
    baseline_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    measurement_unit VARCHAR(50),
    target_date DATE,
    priority_level VARCHAR(50) DEFAULT 'medium', -- high, medium, low
    is_primary_goal BOOLEAN DEFAULT false,
    is_achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    achievement_notes TEXT,
    progress_photos JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_patient_sessions_patient_id ON patient_portal_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_clinic_id ON patient_portal_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_active ON patient_portal_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_activity ON patient_portal_sessions(last_activity);

-- File uploads indexes
CREATE INDEX IF NOT EXISTS idx_patient_uploads_patient_id ON patient_uploads(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_clinic_id ON patient_uploads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_category ON patient_uploads(file_category);
CREATE INDEX IF NOT EXISTS idx_patient_uploads_created_at ON patient_uploads(created_at);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_online_bookings_patient_id ON online_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_online_bookings_clinic_id ON online_bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_online_bookings_date ON online_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_online_bookings_status ON online_bookings(status);
CREATE INDEX IF NOT EXISTS idx_online_bookings_number ON online_bookings(booking_number);

-- Evaluations indexes
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_patient_id ON patient_evaluations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_clinic_id ON patient_evaluations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_type ON patient_evaluations(evaluation_type);
CREATE INDEX IF NOT EXISTS idx_patient_evaluations_date ON patient_evaluations(evaluation_date);

-- Treatment progress indexes
CREATE INDEX IF NOT EXISTS idx_treatment_progress_patient_id ON treatment_progress(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_clinic_id ON treatment_progress(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_plan_id ON treatment_progress(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_progress_date ON treatment_progress(session_date);

-- ==========================================
-- TRIGGERS for Automatic Updates
-- ==========================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_patient_portal_sessions_updated_at BEFORE UPDATE ON patient_portal_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_portal_settings_updated_at BEFORE UPDATE ON patient_portal_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_uploads_updated_at BEFORE UPDATE ON patient_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_online_booking_settings_updated_at BEFORE UPDATE ON online_booking_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_online_bookings_updated_at BEFORE UPDATE ON online_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_waitlist_updated_at BEFORE UPDATE ON booking_waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_evaluations_updated_at BEFORE UPDATE ON patient_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluation_questions_updated_at BEFORE UPDATE ON evaluation_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_progress_updated_at BEFORE UPDATE ON treatment_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_goals_updated_at BEFORE UPDATE ON treatment_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session cleanup function (corrected)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
    DELETE FROM patient_portal_sessions 
    WHERE expires_at < NOW() 
    AND last_activity < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VIEWS for Complex Queries
-- ==========================================

-- Patient Portal Activity Summary
CREATE OR REPLACE VIEW patient_portal_activity AS
SELECT 
    p.id as patient_id,
    p.clinic_id,
    p.full_name,
    p.email,
    COUNT(pps.id) as total_sessions,
    MAX(pps.last_activity) as last_portal_access,
    COUNT(pu.id) as uploaded_files,
    COUNT(ob.id) as online_bookings,
    COUNT(pe.id) as completed_evaluations,
    AVG(pe.overall_rating) as avg_satisfaction_rating
FROM patients p
LEFT JOIN patient_portal_sessions pps ON pps.patient_id = p.id AND pps.is_active = true
LEFT JOIN patient_uploads pu ON pu.patient_id = p.id
LEFT JOIN online_bookings ob ON ob.patient_id = p.id
LEFT JOIN patient_evaluations pe ON pe.patient_id = p.id AND pe.completion_status = 'completed'
GROUP BY p.id, p.clinic_id, p.full_name, p.email;

-- Treatment Progress Overview
CREATE OR REPLACE VIEW treatment_progress_overview AS
SELECT 
    tp.patient_id,
    tp.clinic_id,
    tp.treatment_plan_id,
    COUNT(*) as total_sessions,
    MAX(tp.session_number) as current_session,
    MAX(tp.progress_percentage) as current_progress,
    AVG(tp.session_satisfaction) as avg_satisfaction,
    MAX(tp.session_date) as last_session_date,
    MIN(tp.next_session_date) as next_session_date,
    COUNT(*) FILTER (WHERE tp.is_milestone = true) as milestones_reached,
    ARRAY_AGG(DISTINCT tg.goal_title) FILTER (WHERE tg.is_achieved = true) as achieved_goals,
    ARRAY_AGG(DISTINCT tg.goal_title) FILTER (WHERE tg.is_achieved = false AND tg.is_active = true) as pending_goals
FROM treatment_progress tp
LEFT JOIN treatment_goals tg ON tg.patient_id = tp.patient_id AND tg.treatment_plan_id = tp.treatment_plan_id
GROUP BY tp.patient_id, tp.clinic_id, tp.treatment_plan_id;

-- ==========================================
-- FUNCTIONS for Business Logic
-- ==========================================

-- Function: Check booking availability
CREATE OR REPLACE FUNCTION check_booking_availability(
    p_clinic_id UUID,
    p_date DATE,
    p_time TIME,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    booking_settings RECORD;
    conflicts INTEGER;
    is_blocked BOOLEAN;
BEGIN
    -- Get booking settings
    SELECT * INTO booking_settings 
    FROM online_booking_settings 
    WHERE clinic_id = p_clinic_id AND is_enabled = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if date is within advance booking window
    IF p_date > CURRENT_DATE + INTERVAL '1 day' * booking_settings.advance_booking_days THEN
        RETURN false;
    END IF;
    
    -- Check if same day booking is allowed
    IF p_date = CURRENT_DATE AND NOT booking_settings.same_day_booking THEN
        RETURN false;
    END IF;
    
    -- Check time window
    IF p_time < booking_settings.booking_window_start OR 
       p_time > booking_settings.booking_window_end THEN
        RETURN false;
    END IF;
    
    -- Check for conflicts
    SELECT COUNT(*) INTO conflicts
    FROM online_bookings 
    WHERE clinic_id = p_clinic_id 
    AND preferred_date = p_date 
    AND status IN ('confirmed', 'pending')
    AND (
        (preferred_time <= p_time AND (preferred_time + INTERVAL '1 minute' * duration_minutes) > p_time) OR
        (p_time <= preferred_time AND (p_time + INTERVAL '1 minute' * p_duration_minutes) > preferred_time)
    );
    
    IF conflicts > 0 THEN
        RETURN false;
    END IF;
    
    -- Check blocked dates
    SELECT p_date = ANY(booking_settings.blocked_dates) INTO is_blocked;
    IF is_blocked THEN
        RETURN false;
    END IF;
    
    RETURN true;
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
ALTER TABLE treatment_goals ENABLE ROW LEVEL SECURITY;

-- Policies for patient_portal_sessions
CREATE POLICY "Patients can view their own sessions" ON patient_portal_sessions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can view all sessions in their clinic" ON patient_portal_sessions
    FOR SELECT USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- Policies for patient_uploads
CREATE POLICY "Patients can view their own uploads" ON patient_uploads
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Patients can insert their own uploads" ON patient_uploads
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can view all uploads in their clinic" ON patient_uploads
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- Policies for online_bookings
CREATE POLICY "Patients can manage their own bookings" ON online_bookings
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can manage all bookings in their clinic" ON online_bookings
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- Policies for patient_evaluations
CREATE POLICY "Patients can view and create their own evaluations" ON patient_evaluations
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can view all evaluations in their clinic" ON patient_evaluations
    FOR SELECT USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- Policies for treatment_progress
CREATE POLICY "Patients can view their own treatment progress" ON treatment_progress
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can manage all treatment progress in their clinic" ON treatment_progress
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- Policies for other tables follow similar patterns...
CREATE POLICY "Staff can manage portal settings" ON patient_portal_settings
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage booking settings" ON online_booking_settings
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

CREATE POLICY "Patients can view waitlist for their entries" ON booking_waitlist
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Staff can manage waitlist in their clinic" ON booking_waitlist
    FOR ALL USING (
        clinic_id IN (
            SELECT pr.clinic_id FROM profiles pr WHERE pr.id = auth.uid()
        )
    );

-- ==========================================
-- INITIAL DATA SEEDING
-- ==========================================

-- Insert default evaluation questions for clinics
INSERT INTO evaluation_questions (clinic_id, question_code, question_text, question_type, question_category, is_required, display_order, weight_factor)
SELECT 
    c.id as clinic_id,
    'overall_satisfaction',
    'Como você avalia sua experiência geral em nossa clínica?',
    'rating',
    'overall',
    true,
    1,
    2.0
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM evaluation_questions eq 
    WHERE eq.clinic_id = c.id AND eq.question_code = 'overall_satisfaction'
)
ON CONFLICT (clinic_id, question_code, language_code) DO NOTHING;

-- Insert default portal settings for clinics
INSERT INTO patient_portal_settings (clinic_id, portal_name, is_enabled)
SELECT 
    c.id as clinic_id,
    c.name || ' - Portal do Paciente' as portal_name,
    true
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM patient_portal_settings pps 
    WHERE pps.clinic_id = c.id
)
ON CONFLICT (clinic_id) DO NOTHING;

-- Insert default booking settings for clinics
INSERT INTO online_booking_settings (clinic_id, is_enabled)
SELECT 
    c.id as clinic_id,
    true
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM online_booking_settings obs 
    WHERE obs.clinic_id = c.id
)
ON CONFLICT (clinic_id) DO NOTHING;