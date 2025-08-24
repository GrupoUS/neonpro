-- Healthcare Professional Training System Database
-- LGPD/ANVISA/CFM compliant training and certification system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Training Modules Table
-- Stores all training modules with healthcare compliance
CREATE TABLE training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(50) NOT NULL CHECK (module_type IN ('ai_chat', 'anti_no_show', 'crm_behavioral', 'compliance', 'general')),
    category VARCHAR(100) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    duration_minutes INTEGER DEFAULT 30,
    required_score INTEGER DEFAULT 70 CHECK (required_score >= 0 AND required_score <= 100),
    compliance_level VARCHAR(20) DEFAULT 'standard' CHECK (compliance_level IN ('basic', 'standard', 'advanced', 'critical')),
    is_mandatory BOOLEAN DEFAULT false,
    prerequisites UUID[] DEFAULT ARRAY[]::UUID[],
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT training_modules_title_unique UNIQUE (title, version)
);

-- Training Progress Table
-- Tracks individual user progress with detailed analytics
CREATE TABLE training_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'certified', 'expired')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    attempts_count INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certification_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking JSON
    progress_data JSONB DEFAULT '{}', -- Store detailed progress, quiz answers, etc.
    
    -- Compliance and audit
    ip_address INET,
    user_agent TEXT,
    session_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT training_progress_user_module_unique UNIQUE (user_id, module_id),
    CONSTRAINT training_progress_score_completion_check 
        CHECK ((status = 'completed' OR status = 'certified') AND score IS NOT NULL OR status NOT IN ('completed', 'certified'))
);

-- Training Certificates Table  
-- Healthcare-compliant certification management
CREATE TABLE training_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    progress_id UUID NOT NULL REFERENCES training_progress(id) ON DELETE CASCADE,
    certificate_code VARCHAR(50) NOT NULL UNIQUE,
    certificate_type VARCHAR(30) DEFAULT 'completion' CHECK (certificate_type IN ('completion', 'mastery', 'expert', 'instructor')),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    
    -- Certificate validity
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT true,
    
    -- Issuing authority and compliance
    issuer_id UUID REFERENCES auth.users(id),
    issuer_name VARCHAR(255),
    compliance_verified BOOLEAN DEFAULT false,
    compliance_verified_at TIMESTAMP WITH TIME ZONE,
    compliance_verifier_id UUID REFERENCES auth.users(id),
    
    -- Audit trail
    audit_trail JSONB DEFAULT '{}',
    verification_hash VARCHAR(256), -- For certificate authenticity
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Badges Table
-- Gamification system for achievements
CREATE TABLE training_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    badge_type VARCHAR(30) DEFAULT 'achievement' CHECK (badge_type IN ('achievement', 'milestone', 'compliance', 'expert')),
    icon_url VARCHAR(255),
    criteria JSONB NOT NULL DEFAULT '{}', -- Achievement criteria
    points INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
-- Track which badges users have earned
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES training_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earned_for JSONB DEFAULT '{}', -- Context of how badge was earned
    
    -- Audit
    audit_trail JSONB DEFAULT '{}',
    
    CONSTRAINT user_badges_unique UNIQUE (user_id, badge_id)
);

-- Training Compliance Audit Table
-- LGPD/ANVISA/CFM compliance audit trail
CREATE TABLE training_compliance_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    module_id UUID REFERENCES training_modules(id),
    progress_id UUID REFERENCES training_progress(id),
    certificate_id UUID REFERENCES training_certificates(id),
    
    -- Audit details
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- LGPD compliance fields
    consent_given BOOLEAN,
    data_processing_purpose TEXT,
    legal_basis VARCHAR(100),
    
    -- Audit data
    before_data JSONB,
    after_data JSONB,
    additional_context JSONB DEFAULT '{}',
    
    -- Compliance verification
    compliance_status VARCHAR(20) DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'review_required', 'violation')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Training Content Table
-- Store documents, SOPs, and training materials
CREATE TABLE training_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'document', 'interactive', 'quiz', 'simulation', 'sop')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Content storage
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    content_data JSONB DEFAULT '{}', -- For interactive content
    
    -- Version control
    version VARCHAR(20) DEFAULT '1.0',
    parent_content_id UUID REFERENCES training_content(id),
    
    -- Access control
    access_level VARCHAR(20) DEFAULT 'standard' CHECK (access_level IN ('public', 'standard', 'restricted', 'confidential')),
    required_clearance VARCHAR(50),
    
    -- Compliance
    compliance_level VARCHAR(20) DEFAULT 'standard' CHECK (compliance_level IN ('basic', 'standard', 'advanced', 'critical')),
    data_classification VARCHAR(30) DEFAULT 'internal' CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    duration_seconds INTEGER,
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED
);

-- Performance optimization indexes
CREATE INDEX idx_training_modules_type_status ON training_modules (module_type, status);
CREATE INDEX idx_training_modules_compliance ON training_modules (compliance_level, is_mandatory);
CREATE INDEX idx_training_progress_user_status ON training_progress (user_id, status);
CREATE INDEX idx_training_progress_module_completed ON training_progress (module_id, completed_at) WHERE status = 'completed';
CREATE INDEX idx_training_certificates_user_valid ON training_certificates (user_id, is_valid, expires_at);
CREATE INDEX idx_training_certificates_code ON training_certificates (certificate_code);
CREATE INDEX idx_training_compliance_audit_user_time ON training_compliance_audit (user_id, timestamp);
CREATE INDEX idx_training_compliance_audit_action ON training_compliance_audit (action, timestamp);
CREATE INDEX idx_training_content_module_type ON training_content (module_id, content_type);
CREATE INDEX idx_training_content_search ON training_content USING GIN (search_vector);
CREATE INDEX idx_user_badges_user ON user_badges (user_id, earned_at);

-- Row Level Security (RLS) Policies
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_compliance_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_modules (public read, admin write)
CREATE POLICY training_modules_read_policy ON training_modules
    FOR SELECT USING (status = 'active');

CREATE POLICY training_modules_admin_policy ON training_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'training_admin')
        )
    );

-- RLS Policies for training_progress (users can only see their own)
CREATE POLICY training_progress_user_policy ON training_progress
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY training_progress_admin_read_policy ON training_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'training_admin')
        )
    );

-- RLS Policies for training_certificates
CREATE POLICY training_certificates_user_policy ON training_certificates
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY training_certificates_admin_policy ON training_certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'training_admin')
        )
    );

-- RLS Policies for badges (public read)
CREATE POLICY training_badges_read_policy ON training_badges
    FOR SELECT USING (is_active = true);

-- RLS Policies for user_badges
CREATE POLICY user_badges_user_policy ON user_badges
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for compliance audit (admin only)
CREATE POLICY training_compliance_audit_admin_policy ON training_compliance_audit
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'compliance_officer')
        )
    );

-- RLS Policies for training_content
CREATE POLICY training_content_read_policy ON training_content
    FOR SELECT USING (access_level IN ('public', 'standard'));

-- Functions for training system
CREATE OR REPLACE FUNCTION update_training_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_training_modules_timestamp
    BEFORE UPDATE ON training_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_training_timestamps();

CREATE TRIGGER update_training_progress_timestamp
    BEFORE UPDATE ON training_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_training_timestamps();

CREATE TRIGGER update_training_certificates_timestamp
    BEFORE UPDATE ON training_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_training_timestamps();

CREATE TRIGGER update_training_content_timestamp
    BEFORE UPDATE ON training_content
    FOR EACH ROW
    EXECUTE FUNCTION update_training_timestamps();

-- Grant permissions
GRANT SELECT ON training_modules TO authenticated;
GRANT ALL ON training_progress TO authenticated;
GRANT SELECT ON training_certificates TO authenticated;
GRANT SELECT ON training_badges TO authenticated;
GRANT ALL ON user_badges TO authenticated;
GRANT SELECT ON training_content TO authenticated;

-- Comments
COMMENT ON TABLE training_modules IS 'Healthcare training modules with LGPD compliance';
COMMENT ON TABLE training_progress IS 'Individual user training progress tracking';
COMMENT ON TABLE training_certificates IS 'Healthcare-compliant certification management';
COMMENT ON TABLE training_badges IS 'Gamification badges for training achievements';
COMMENT ON TABLE user_badges IS 'User-earned badges tracking';
COMMENT ON TABLE training_compliance_audit IS 'LGPD/ANVISA/CFM compliance audit trail';
COMMENT ON TABLE training_content IS 'Training materials and documents storage';