-- Patient Profile System Database Schema
-- Epic 3: Smart Patient Management - Story 3.1: 360° Patient Profile Implementation
-- Created: 2025-01-26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for patient data management
CREATE TYPE patient_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE photo_type AS ENUM ('profile', 'identification', 'medical', 'before', 'after', 'progress');
CREATE TYPE timeline_event_type AS ENUM ('appointment', 'treatment', 'procedure', 'diagnosis', 'medication', 'test_result', 'follow_up');
CREATE TYPE duplicate_status AS ENUM ('pending', 'approved', 'rejected', 'merged');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'manual_review');

-- Extended patient profiles table
CREATE TABLE patient_profiles_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Biometric data
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN height_cm > 0 AND weight_kg > 0 
            THEN ROUND((weight_kg / POWER(height_cm / 100, 2))::numeric, 2)
            ELSE NULL
        END
    ) STORED,
    blood_type VARCHAR(10),
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    
    -- AI insights and risk assessment
    ai_insights JSONB DEFAULT '{}'::jsonb,
    risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_level patient_risk_level,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    treatment_recommendations JSONB DEFAULT '[]'::jsonb,
    last_assessment_date TIMESTAMPTZ,
    
    -- Profile metadata
    profile_completeness_score DECIMAL(3,2) DEFAULT 0,
    data_quality_score DECIMAL(3,2) DEFAULT 0,
    preferences JSONB DEFAULT '{}'::jsonb,
    consent_status JSONB DEFAULT '{}'::jsonb,
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT unique_patient_profile UNIQUE (patient_id)
);

-- Patient photos table
CREATE TABLE patient_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Photo metadata
    photo_url TEXT NOT NULL,
    photo_type photo_type NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    dimensions JSONB DEFAULT '{}'::jsonb,
    
    -- Recognition and analysis data
    recognition_data JSONB DEFAULT '{}'::jsonb,
    face_encoding TEXT,
    quality_score DECIMAL(3,2),
    verification_status verification_status DEFAULT 'pending',
    
    -- Photo organization
    title VARCHAR(255),
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_primary BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    
    -- Security and privacy
    access_level VARCHAR(50) DEFAULT 'staff_only',
    encryption_key_id UUID,
    
    -- Audit trail
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 1)
);

-- Medical timeline table
CREATE TABLE medical_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Event details
    event_type timeline_event_type NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    
    -- Associated data
    photos UUID[] DEFAULT '{}',
    documents JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Outcome tracking
    outcome_score DECIMAL(3,2),
    outcome_notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    
    -- Treatment context
    treatment_id UUID,
    appointment_id UUID,
    staff_id UUID REFERENCES auth.users(id),
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_outcome_score CHECK (outcome_score >= 0 AND outcome_score <= 1)
);

-- Duplicate detection candidates table
CREATE TABLE duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Patient pair
    patient_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Matching analysis
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    matching_factors JSONB DEFAULT '{}'::jsonb,
    similarity_analysis JSONB DEFAULT '{}'::jsonb,
    
    -- Review workflow
    review_status duplicate_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    
    -- Resolution
    resolved_date TIMESTAMPTZ,
    merge_result JSONB DEFAULT '{}'::jsonb,
    kept_patient_id UUID REFERENCES auth.users(id),
    
    -- Detection metadata
    detection_algorithm VARCHAR(100),
    detection_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT different_patients CHECK (patient_id_1 != patient_id_2),
    CONSTRAINT unique_patient_pair UNIQUE (patient_id_1, patient_id_2)
);

-- Patient search index table for advanced search capabilities
CREATE TABLE patient_search_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Searchable content
    search_vector TSVECTOR,
    full_name_normalized TEXT,
    phone_normalized TEXT,
    email_normalized TEXT,
    
    -- Search tags and keywords
    search_tags JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Patient segmentation
    patient_segments JSONB DEFAULT '[]'::jsonb,
    demographic_data JSONB DEFAULT '{}'::jsonb,
    
    -- Update tracking
    last_indexed_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_search_index UNIQUE (patient_id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_patient_profiles_patient_id ON patient_profiles_extended(patient_id);
CREATE INDEX idx_patient_profiles_risk_level ON patient_profiles_extended(risk_level);
CREATE INDEX idx_patient_profiles_last_assessment ON patient_profiles_extended(last_assessment_date);
CREATE INDEX idx_patient_profiles_updated_at ON patient_profiles_extended(updated_at);

CREATE INDEX idx_patient_photos_patient_id ON patient_photos(patient_id);
CREATE INDEX idx_patient_photos_type ON patient_photos(photo_type);
CREATE INDEX idx_patient_photos_verification ON patient_photos(verification_status);
CREATE INDEX idx_patient_photos_primary ON patient_photos(is_primary) WHERE is_primary = true;

CREATE INDEX idx_medical_timeline_patient_id ON medical_timeline(patient_id);
CREATE INDEX idx_medical_timeline_event_date ON medical_timeline(event_date);
CREATE INDEX idx_medical_timeline_event_type ON medical_timeline(event_type);
CREATE INDEX idx_medical_timeline_follow_up ON medical_timeline(follow_up_required, follow_up_date);

CREATE INDEX idx_duplicate_candidates_patient1 ON duplicate_candidates(patient_id_1);
CREATE INDEX idx_duplicate_candidates_patient2 ON duplicate_candidates(patient_id_2);
CREATE INDEX idx_duplicate_candidates_status ON duplicate_candidates(review_status);
CREATE INDEX idx_duplicate_candidates_confidence ON duplicate_candidates(confidence_score);

CREATE INDEX idx_patient_search_vector ON patient_search_index USING gin(search_vector);
CREATE INDEX idx_patient_search_normalized_name ON patient_search_index(full_name_normalized);
CREATE INDEX idx_patient_search_phone ON patient_search_index(phone_normalized);
CREATE INDEX idx_patient_search_segments ON patient_search_index USING gin(patient_segments);

-- Full-text search index
CREATE INDEX idx_patient_search_gin_tags ON patient_search_index USING gin(search_tags);
CREATE INDEX idx_patient_search_gin_keywords ON patient_search_index USING gin(keywords);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_patient_profiles_updated_at 
    BEFORE UPDATE ON patient_profiles_extended 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_timeline_updated_at 
    BEFORE UPDATE ON medical_timeline 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate profile completeness score
CREATE OR REPLACE FUNCTION calculate_profile_completeness(patient_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    score DECIMAL(3,2) := 0;
    profile_data RECORD;
BEGIN
    SELECT * INTO profile_data 
    FROM patient_profiles_extended 
    WHERE patient_id = patient_uuid;
    
    IF FOUND THEN
        -- Basic info (20 points)
        IF profile_data.height_cm IS NOT NULL THEN score := score + 0.05; END IF;
        IF profile_data.weight_kg IS NOT NULL THEN score := score + 0.05; END IF;
        IF profile_data.blood_type IS NOT NULL THEN score := score + 0.05; END IF;
        IF profile_data.emergency_contact != '{}'::jsonb THEN score := score + 0.05; END IF;
        
        -- Medical history (30 points)
        IF jsonb_array_length(profile_data.allergies) > 0 THEN score := score + 0.10; END IF;
        IF jsonb_array_length(profile_data.chronic_conditions) > 0 THEN score := score + 0.10; END IF;
        IF jsonb_array_length(profile_data.medications) > 0 THEN score := score + 0.10; END IF;
        
        -- AI insights (30 points)
        IF profile_data.risk_score IS NOT NULL THEN score := score + 0.15; END IF;
        IF profile_data.last_assessment_date IS NOT NULL THEN score := score + 0.15; END IF;
        
        -- Photos and documentation (20 points)
        IF EXISTS (SELECT 1 FROM patient_photos WHERE patient_id = patient_uuid AND photo_type = 'profile') THEN
            score := score + 0.10;
        END IF;
        IF EXISTS (SELECT 1 FROM medical_timeline WHERE patient_id = patient_uuid) THEN
            score := score + 0.10;
        END IF;
    END IF;
    
    RETURN LEAST(score, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Function to update search index
CREATE OR REPLACE FUNCTION update_patient_search_index(patient_uuid UUID)
RETURNS VOID AS $$
DECLARE
    user_data RECORD;
    profile_data RECORD;
    search_content TEXT := '';
BEGIN
    -- Get user data
    SELECT * INTO user_data FROM auth.users WHERE id = patient_uuid;
    
    -- Get profile data
    SELECT * INTO profile_data FROM patient_profiles_extended WHERE patient_id = patient_uuid;
    
    IF FOUND THEN
        -- Build search content
        search_content := COALESCE(user_data.raw_user_meta_data->>'full_name', '') || ' ' ||
                         COALESCE(user_data.email, '') || ' ' ||
                         COALESCE(user_data.phone, '') || ' ' ||
                         COALESCE(profile_data.blood_type, '');
        
        -- Upsert search index
        INSERT INTO patient_search_index (
            patient_id,
            search_vector,
            full_name_normalized,
            phone_normalized,
            email_normalized,
            last_indexed_at
        ) VALUES (
            patient_uuid,
            to_tsvector('portuguese', search_content),
            LOWER(COALESCE(user_data.raw_user_meta_data->>'full_name', '')),
            REGEXP_REPLACE(COALESCE(user_data.phone, ''), '[^0-9]', '', 'g'),
            LOWER(COALESCE(user_data.email, '')),
            NOW()
        )
        ON CONFLICT (patient_id) 
        DO UPDATE SET
            search_vector = to_tsvector('portuguese', search_content),
            full_name_normalized = LOWER(COALESCE(user_data.raw_user_meta_data->>'full_name', '')),
            phone_normalized = REGEXP_REPLACE(COALESCE(user_data.phone, ''), '[^0-9]', '', 'g'),
            email_normalized = LOWER(COALESCE(user_data.email, '')),
            last_indexed_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE patient_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_search_index ENABLE ROW LEVEL SECURITY;

-- Patient profiles policies
CREATE POLICY "Patients can view own profile" ON patient_profiles_extended
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view all profiles" ON patient_profiles_extended
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

CREATE POLICY "Staff can insert profiles" ON patient_profiles_extended
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

CREATE POLICY "Staff can update profiles" ON patient_profiles_extended
    FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

-- Patient photos policies
CREATE POLICY "Patients can view own photos" ON patient_photos
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view patient photos" ON patient_photos
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

CREATE POLICY "Staff can manage photos" ON patient_photos
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Medical timeline policies
CREATE POLICY "Patients can view own timeline" ON medical_timeline
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view patient timelines" ON medical_timeline
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

CREATE POLICY "Staff can manage timelines" ON medical_timeline
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

-- Duplicate candidates policies (admin/staff only)
CREATE POLICY "Staff can manage duplicates" ON duplicate_candidates
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Search index policies
CREATE POLICY "Staff can search patients" ON patient_search_index
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff', 'doctor', 'nurse'));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;