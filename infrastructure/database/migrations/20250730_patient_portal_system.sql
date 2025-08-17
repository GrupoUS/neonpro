-- Patient Portal Database Schema
-- File: database/migrations/20250730_patient_portal_system.sql
-- Description: Schema completo para o portal do paciente e sistema de auto-atendimento

-- ==========================================
-- TABLES: Patient Portal Sessions & Security
-- ==========================================

-- Sessões do portal do paciente
CREATE TABLE patient_portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    login_method VARCHAR(50) DEFAULT 'password', -- 'password', 'sms', 'email_link'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de acesso do portal
CREATE TABLE patient_portal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id)
);

-- ==========================================
-- TABLES: File Uploads & Document Management
-- ==========================================

-- Upload de arquivos pelos pacientes
CREATE TABLE patient_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'exam', 'document', 'progress_photo', 'prescription'
    subcategory VARCHAR(50), -- 'before', 'after', 'during_treatment'
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'supabase', -- 'supabase', 's3', 'cloudinary'
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    staff_notes TEXT,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissões de acesso a arquivos
CREATE TABLE patient_file_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID NOT NULL REFERENCES patient_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    permission_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'delete', 'share'
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- TABLES: Online Booking & Scheduling
-- ==========================================

-- Configurações de agendamento online
CREATE TABLE online_booking_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    is_enabled BOOLEAN DEFAULT true,
    advance_booking_days INTEGER DEFAULT 30,
    same_day_booking BOOLEAN DEFAULT false,
    cancellation_deadline_hours INTEGER DEFAULT 24,
    reschedule_deadline_hours INTEGER DEFAULT 12,
    max_appointments_per_day INTEGER DEFAULT 1,
    allowed_services TEXT[], -- Array de IDs de serviços permitidos
    blocked_days INTEGER[], -- 0=Sunday, 1=Monday, etc.
    blocked_dates DATE[],
    business_hours JSONB DEFAULT '{}', -- {"monday": {"start": "09:00", "end": "18:00"}}
    buffer_time_minutes INTEGER DEFAULT 15,
    auto_confirm BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id)
);

-- Agendamentos online solicitados
CREATE TABLE online_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_id UUID, -- Referência para tabela de serviços
    preferred_staff_id UUID REFERENCES auth.users(id),
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    priority_level INTEGER DEFAULT 1, -- 1=normal, 2=high, 3=urgent
    special_requests TEXT,
    cancellation_reason TEXT,
    confirmation_sent BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    staff_notes TEXT,
    booking_source VARCHAR(50) DEFAULT 'portal', -- 'portal', 'app', 'phone'
    estimated_price DECIMAL(10,2),
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES auth.users(id)
);

-- Lista de espera para agendamentos
CREATE TABLE booking_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    desired_date_start DATE NOT NULL,
    desired_date_end DATE NOT NULL,
    desired_times TIME[], -- Array de horários preferenciais
    service_type VARCHAR(100) NOT NULL,
    preferred_staff_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    auto_book BOOLEAN DEFAULT false, -- Se deve agendar automaticamente quando vagar
    notifications_enabled BOOLEAN DEFAULT true,
    priority_score INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLES: Evaluations & Feedback
-- ==========================================

-- Avaliações e feedback dos pacientes
CREATE TABLE patient_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    appointment_id UUID REFERENCES appointments(id),
    booking_id UUID REFERENCES online_bookings(id),
    staff_id UUID REFERENCES auth.users(id),
    service_type VARCHAR(100),
    
    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- NPS (0-10 scale)
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    
    -- Qualitative feedback
    qualitative_feedback TEXT,
    improvement_suggestions TEXT,
    would_recommend BOOLEAN,
    would_return BOOLEAN,
    
    -- Categorized feedback
    feedback_categories TEXT[], -- ['punctuality', 'cleanliness', 'communication', 'results']
    positive_aspects TEXT[],
    negative_aspects TEXT[],
    
    -- Metadata
    evaluation_type VARCHAR(50) DEFAULT 'post_appointment', -- 'post_appointment', 'periodic', 'exit'
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_minutes INTEGER,
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    staff_response TEXT,
    staff_response_at TIMESTAMP WITH TIME ZONE,
    staff_response_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perguntas customizadas para avaliações
CREATE TABLE evaluation_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'rating', 'text', 'boolean', 'multiple_choice'
    options TEXT[], -- Para perguntas multiple_choice
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(50), -- 'service', 'facility', 'staff', 'general'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respostas para perguntas customizadas
CREATE TABLE evaluation_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES patient_evaluations(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES evaluation_questions(id),
    response_value TEXT,
    response_numeric INTEGER,
    response_boolean BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLES: Treatment Progress Tracking
-- ==========================================

-- Progresso de tratamentos
CREATE TABLE treatment_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    treatment_plan_id UUID, -- Referência para plano de tratamento
    session_number INTEGER NOT NULL DEFAULT 1,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    progress_percentage DECIMAL(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Notas e observações
    patient_notes TEXT,
    staff_notes TEXT,
    clinical_notes TEXT,
    
    -- Medições e métricas
    measurements JSONB DEFAULT '{}', -- {"weight": 70, "body_fat": 15, "muscle_mass": 55}
    vital_signs JSONB DEFAULT '{}', -- {"bp_systolic": 120, "bp_diastolic": 80, "heart_rate": 72}
    
    -- Fotos de progresso
    photos TEXT[], -- Array de URLs das fotos
    photo_metadata JSONB DEFAULT '{}', -- {"before": ["url1"], "after": ["url2"], "angles": ["front", "side"]}
    
    -- Próxima sessão
    next_session_date DATE,
    next_session_notes TEXT,
    next_session_goals TEXT[],
    
    -- Satisfação da sessão
    session_satisfaction INTEGER CHECK (session_satisfaction >= 1 AND session_satisfaction <= 5),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    
    -- Metadata
    is_milestone BOOLEAN DEFAULT false,
    milestone_description TEXT,
    is_baseline BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metas e objetivos do tratamento
CREATE TABLE treatment_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    treatment_plan_id UUID,
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT,
    goal_type VARCHAR(50) NOT NULL, -- 'measurement', 'visual', 'functional', 'satisfaction'
    target_value VARCHAR(100), -- "lose 5kg", "reduce 2cm waist", "satisfaction > 4"
    current_value VARCHAR(100),
    target_date DATE,
    is_achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    priority_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================

-- Patient Portal Sessions
CREATE INDEX idx_patient_portal_sessions_patient_id ON patient_portal_sessions(patient_id);
CREATE INDEX idx_patient_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX idx_patient_portal_sessions_expires ON patient_portal_sessions(expires_at);
CREATE INDEX idx_patient_portal_sessions_active ON patient_portal_sessions(is_active);

-- Patient Uploads
CREATE INDEX idx_patient_uploads_patient_id ON patient_uploads(patient_id);
CREATE INDEX idx_patient_uploads_category ON patient_uploads(category);
CREATE INDEX idx_patient_uploads_date ON patient_uploads(upload_date);
CREATE INDEX idx_patient_uploads_clinic ON patient_uploads(clinic_id);

-- Online Bookings
CREATE INDEX idx_online_bookings_patient_id ON online_bookings(patient_id);
CREATE INDEX idx_online_bookings_date ON online_bookings(requested_date);
CREATE INDEX idx_online_bookings_status ON online_bookings(status);
CREATE INDEX idx_online_bookings_clinic ON online_bookings(clinic_id);
CREATE INDEX idx_online_bookings_staff ON online_bookings(preferred_staff_id);

-- Patient Evaluations
CREATE INDEX idx_patient_evaluations_patient_id ON patient_evaluations(patient_id);
CREATE INDEX idx_patient_evaluations_clinic ON patient_evaluations(clinic_id);
CREATE INDEX idx_patient_evaluations_date ON patient_evaluations(completed_at);
CREATE INDEX idx_patient_evaluations_rating ON patient_evaluations(overall_rating);
CREATE INDEX idx_patient_evaluations_nps ON patient_evaluations(nps_score);

-- Treatment Progress
CREATE INDEX idx_treatment_progress_patient_id ON treatment_progress(patient_id);
CREATE INDEX idx_treatment_progress_date ON treatment_progress(session_date);
CREATE INDEX idx_treatment_progress_clinic ON treatment_progress(clinic_id);
CREATE INDEX idx_treatment_progress_plan ON treatment_progress(treatment_plan_id);

-- Booking Waitlist
CREATE INDEX idx_booking_waitlist_patient_id ON booking_waitlist(patient_id);
CREATE INDEX idx_booking_waitlist_dates ON booking_waitlist(desired_date_start, desired_date_end);
CREATE INDEX idx_booking_waitlist_active ON booking_waitlist(is_active);

-- ==========================================
-- TRIGGERS for Audit and Automation
-- ==========================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_patient_portal_sessions_updated_at BEFORE UPDATE ON patient_portal_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_portal_settings_updated_at BEFORE UPDATE ON patient_portal_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_uploads_updated_at BEFORE UPDATE ON patient_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_online_bookings_updated_at BEFORE UPDATE ON online_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_evaluations_updated_at BEFORE UPDATE ON patient_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_progress_updated_at BEFORE UPDATE ON treatment_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_goals_updated_at BEFORE UPDATE ON treatment_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session cleanup trigger
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM patient_portal_sessions 
    WHERE expires_at < NOW() 
    AND last_activity < NOW() - INTERVAL '7 days';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-cleanup expired sessions (runs on insert)
CREATE TRIGGER trigger_cleanup_expired_sessions
    AFTER INSERT ON patient_portal_sessions
    FOR EACH STATEMENT
    EXECUTE FUNCTION cleanup_expired_sessions();

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
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all sessions in their clinic" ON patient_portal_sessions
    FOR SELECT USING (
        patient_id IN (
            SELECT p.id FROM patients p
            JOIN clinic_staff cs ON cs.clinic_id = p.clinic_id
            WHERE cs.user_id = auth.uid()
        )
    );

-- Policies for patient_uploads
CREATE POLICY "Patients can view their own uploads" ON patient_uploads
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can insert their own uploads" ON patient_uploads
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all uploads in their clinic" ON patient_uploads
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
        )
    );

-- Policies for online_bookings
CREATE POLICY "Patients can manage their own bookings" ON online_bookings
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage all bookings in their clinic" ON online_bookings
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
        )
    );

-- Policies for patient_evaluations
CREATE POLICY "Patients can view and create their own evaluations" ON patient_evaluations
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view evaluations in their clinic" ON patient_evaluations
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
        )
    );

-- Policies for treatment_progress
CREATE POLICY "Patients can view their treatment progress" ON treatment_progress
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage treatment progress in their clinic" ON treatment_progress
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
        )
    );

-- ==========================================
-- VIEWS for Reporting and Analytics
-- ==========================================

-- View: Portal usage statistics
CREATE VIEW portal_usage_stats AS
SELECT 
    p.clinic_id,
    DATE_TRUNC('month', pps.created_at) as month,
    COUNT(DISTINCT pps.patient_id) as unique_patients,
    COUNT(*) as total_sessions,
    AVG(EXTRACT(EPOCH FROM (pps.updated_at - pps.created_at))/60) as avg_session_duration_minutes,
    COUNT(*) FILTER (WHERE pps.created_at >= NOW() - INTERVAL '24 hours') as sessions_last_24h
FROM patient_portal_sessions pps
JOIN patients p ON p.id = pps.patient_id
GROUP BY p.clinic_id, DATE_TRUNC('month', pps.created_at);

-- View: Booking conversion funnel
CREATE VIEW booking_conversion_stats AS
SELECT 
    clinic_id,
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_appointments,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'confirmed')::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as confirmation_rate,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
        NULLIF(COUNT(*) FILTER (WHERE status = 'confirmed'), 0) * 100, 2
    ) as completion_rate
FROM online_bookings
GROUP BY clinic_id, DATE_TRUNC('week', created_at);

-- View: Patient satisfaction summary
CREATE VIEW patient_satisfaction_summary AS
SELECT 
    pe.clinic_id,
    DATE_TRUNC('month', pe.completed_at) as month,
    COUNT(*) as total_evaluations,
    ROUND(AVG(pe.overall_rating), 2) as avg_overall_rating,
    ROUND(AVG(pe.service_rating), 2) as avg_service_rating,
    ROUND(AVG(pe.staff_rating), 2) as avg_staff_rating,
    ROUND(AVG(pe.facility_rating), 2) as avg_facility_rating,
    ROUND(AVG(pe.nps_score), 2) as avg_nps_score,
    COUNT(*) FILTER (WHERE pe.nps_score >= 9) as promoters,
    COUNT(*) FILTER (WHERE pe.nps_score <= 6) as detractors,
    ROUND(
        (COUNT(*) FILTER (WHERE pe.nps_score >= 9) - COUNT(*) FILTER (WHERE pe.nps_score <= 6))::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as nps_score,
    COUNT(*) FILTER (WHERE pe.would_recommend = true) as would_recommend_count,
    ROUND(
        COUNT(*) FILTER (WHERE pe.would_recommend = true)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as recommend_percentage
FROM patient_evaluations pe
GROUP BY pe.clinic_id, DATE_TRUNC('month', pe.completed_at);

-- View: Treatment progress overview
CREATE VIEW treatment_progress_overview AS
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
    
    -- Check if day is blocked
    SELECT EXTRACT(DOW FROM p_date)::INTEGER = ANY(booking_settings.blocked_days) INTO is_blocked;
    IF is_blocked OR p_date = ANY(booking_settings.blocked_dates) THEN
        RETURN false;
    END IF;
    
    -- Check for time conflicts
    SELECT COUNT(*) INTO conflicts
    FROM online_bookings
    WHERE clinic_id = p_clinic_id
    AND requested_date = p_date
    AND status IN ('confirmed', 'pending')
    AND (
        (requested_time, requested_time + INTERVAL '1 minute' * duration_minutes) 
        OVERLAPS 
        (p_time, p_time + INTERVAL '1 minute' * p_duration_minutes)
    );
    
    RETURN conflicts = 0;
END;
$$ LANGUAGE plpgsql;