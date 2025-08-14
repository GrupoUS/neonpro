-- =====================================================================================
-- PATIENT SEGMENTATION + AI-DRIVEN INSIGHTS SYSTEM
-- Epic 7 - Story 7.1: Intelligent patient segmentation with AI-driven insights
-- Created: 2025-01-30
-- =====================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA extensions;

-- =====================================================================================
-- PATIENT SEGMENTS TABLE
-- Core patient segmentation with AI-driven classification
-- =====================================================================================
CREATE TABLE patient_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Segment Definition
    name VARCHAR(255) NOT NULL,
    description TEXT,
    segment_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    ai_generated BOOLEAN DEFAULT false,
    
    -- Segmentation Criteria
    criteria JSONB NOT NULL, -- Flexible criteria definition
    ai_criteria JSONB, -- AI-generated criteria
    
    -- Performance Metrics
    accuracy_score DECIMAL(5,4), -- AI prediction accuracy
    confidence_score DECIMAL(5,4), -- Confidence in segment definition
    member_count INTEGER DEFAULT 0,
    
    -- Segment Configuration
    is_active BOOLEAN DEFAULT true,
    auto_update BOOLEAN DEFAULT false,
    update_frequency VARCHAR(20) DEFAULT 'weekly',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_segment_type CHECK (segment_type IN (
        'demographic', 'behavioral', 'clinical', 'engagement', 
        'financial', 'custom', 'ai_generated'
    )),
    CONSTRAINT valid_update_frequency CHECK (update_frequency IN (
        'real_time', 'hourly', 'daily', 'weekly', 'monthly'
    )),
    CONSTRAINT valid_scores CHECK (
        accuracy_score IS NULL OR (accuracy_score >= 0 AND accuracy_score <= 1)
    ),
    CONSTRAINT valid_confidence CHECK (
        confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
    )
);

-- =====================================================================================
-- PATIENT SEGMENT MEMBERSHIPS TABLE
-- Track which patients belong to which segments
-- =====================================================================================
CREATE TABLE patient_segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES patient_segments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Membership Metadata
    membership_score DECIMAL(5,4), -- How well patient fits segment (0-1)
    membership_reason JSONB, -- Explanation of why patient is in segment
    
    -- AI Predictions
    predicted_lifetime_value DECIMAL(12,2),
    predicted_engagement_score DECIMAL(5,4),
    predicted_retention_probability DECIMAL(5,4),
    treatment_propensity JSONB, -- Propensity for different treatments
    
    -- Membership Tracking
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_validated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    auto_assigned BOOLEAN DEFAULT false,
    
    UNIQUE(segment_id, patient_id),
    CONSTRAINT valid_membership_score CHECK (
        membership_score IS NULL OR (membership_score >= 0 AND membership_score <= 1)
    ),
    CONSTRAINT valid_engagement_score CHECK (
        predicted_engagement_score IS NULL OR (predicted_engagement_score >= 0 AND predicted_engagement_score <= 1)
    ),
    CONSTRAINT valid_retention_probability CHECK (
        predicted_retention_probability IS NULL OR (predicted_retention_probability >= 0 AND predicted_retention_probability <= 1)
    )
);

-- =====================================================================================
-- PATIENT ANALYTICS TABLE
-- Comprehensive patient analytics for AI-driven insights
-- =====================================================================================
CREATE TABLE patient_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Behavioral Analytics
    visit_frequency_score DECIMAL(5,4),
    appointment_compliance_rate DECIMAL(5,4),
    treatment_adherence_score DECIMAL(5,4),
    engagement_level VARCHAR(20) DEFAULT 'medium',
    
    -- Financial Analytics
    total_lifetime_value DECIMAL(12,2) DEFAULT 0,
    average_transaction_value DECIMAL(10,2),
    payment_reliability_score DECIMAL(5,4),
    revenue_trend VARCHAR(20),
    
    -- Clinical Analytics
    condition_complexity_score DECIMAL(5,4),
    treatment_response_rate DECIMAL(5,4),
    risk_level VARCHAR(20) DEFAULT 'low',
    health_improvement_trend VARCHAR(20),
    
    -- Interaction Analytics
    communication_preference JSONB,
    preferred_channels JSONB,
    response_rate_email DECIMAL(5,4),
    response_rate_sms DECIMAL(5,4),
    response_rate_phone DECIMAL(5,4),
    
    -- AI Insights
    ai_insights JSONB, -- AI-generated insights and recommendations
    personality_profile JSONB, -- AI-analyzed personality traits
    preference_predictions JSONB, -- Predicted preferences and behaviors
    
    -- Feature Vectors for ML
    feature_vector vector(100), -- 100-dimensional feature vector for ML
    
    -- Tracking
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculation_version INTEGER DEFAULT 1,
    
    UNIQUE(patient_id, clinic_id),
    CONSTRAINT valid_engagement_level CHECK (engagement_level IN (
        'very_low', 'low', 'medium', 'high', 'very_high'
    )),
    CONSTRAINT valid_revenue_trend CHECK (revenue_trend IN (
        'declining', 'stable', 'growing', 'volatile'
    )),
    CONSTRAINT valid_risk_level CHECK (risk_level IN (
        'very_low', 'low', 'medium', 'high', 'very_high'
    )),
    CONSTRAINT valid_health_trend CHECK (health_improvement_trend IN (
        'declining', 'stable', 'improving', 'fluctuating'
    ))
);

-- =====================================================================================
-- SEGMENT PERFORMANCE TRACKING TABLE
-- Track segment performance and effectiveness over time
-- =====================================================================================
CREATE TABLE segment_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES patient_segments(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
    
    -- Performance Metrics
    member_count INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    departed_members INTEGER DEFAULT 0,
    member_retention_rate DECIMAL(5,4),
    
    -- Engagement Metrics
    average_engagement_score DECIMAL(5,4),
    total_interactions INTEGER DEFAULT 0,
    response_rate DECIMAL(5,4),
    conversion_rate DECIMAL(5,4),
    
    -- Financial Metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_revenue_per_member DECIMAL(10,2),
    roi DECIMAL(8,4), -- Return on investment for segment-targeted activities
    
    -- Campaign Performance
    campaigns_sent INTEGER DEFAULT 0,
    campaign_open_rate DECIMAL(5,4),
    campaign_click_rate DECIMAL(5,4),
    campaign_conversion_rate DECIMAL(5,4),
    
    -- Clinical Outcomes
    treatment_success_rate DECIMAL(5,4),
    patient_satisfaction_score DECIMAL(5,4),
    health_improvement_rate DECIMAL(5,4),
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_period_type CHECK (period_type IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    CONSTRAINT valid_period_order CHECK (period_start < period_end)
);

-- =====================================================================================
-- AI MODEL TRACKING TABLE
-- Track AI models used for segmentation and their performance
-- =====================================================================================
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Model Information
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    
    -- Model Configuration
    parameters JSONB,
    training_data_info JSONB,
    features_used JSONB,
    
    -- Performance Metrics
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    auc_score DECIMAL(5,4),
    
    -- Model Status
    status VARCHAR(20) DEFAULT 'training',
    is_active BOOLEAN DEFAULT false,
    deployment_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trained_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_model_type CHECK (model_type IN (
        'classification', 'clustering', 'regression', 'neural_network', 
        'ensemble', 'deep_learning'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'training', 'validating', 'testing', 'ready', 'deployed', 'deprecated'
    ))
);

-- =====================================================================================
-- SEGMENTATION RULES TABLE
-- Define rules for automated segment assignment
-- =====================================================================================
CREATE TABLE segmentation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES patient_segments(id) ON DELETE CASCADE,
    
    -- Rule Definition
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    rule_logic JSONB NOT NULL, -- JSON representation of rule logic
    
    -- Rule Configuration
    priority INTEGER DEFAULT 0, -- Higher priority rules are evaluated first
    is_active BOOLEAN DEFAULT true,
    requires_ai BOOLEAN DEFAULT false,
    
    -- Rule Performance
    matches_count INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,4),
    last_evaluated TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Patient Segments
CREATE INDEX idx_patient_segments_clinic_id ON patient_segments(clinic_id);
CREATE INDEX idx_patient_segments_type ON patient_segments(segment_type);
CREATE INDEX idx_patient_segments_active ON patient_segments(is_active);
CREATE INDEX idx_patient_segments_ai_generated ON patient_segments(ai_generated);

-- Patient Segment Memberships
CREATE INDEX idx_memberships_segment_id ON patient_segment_memberships(segment_id);
CREATE INDEX idx_memberships_patient_id ON patient_segment_memberships(patient_id);
CREATE INDEX idx_memberships_active ON patient_segment_memberships(is_active);
CREATE INDEX idx_memberships_score ON patient_segment_memberships(membership_score);

-- Patient Analytics
CREATE INDEX idx_analytics_patient_id ON patient_analytics(patient_id);
CREATE INDEX idx_analytics_clinic_id ON patient_analytics(clinic_id);
CREATE INDEX idx_analytics_engagement ON patient_analytics(engagement_level);
CREATE INDEX idx_analytics_risk_level ON patient_analytics(risk_level);
CREATE INDEX idx_analytics_calculated ON patient_analytics(last_calculated);

-- Segment Performance
CREATE INDEX idx_performance_segment_id ON segment_performance(segment_id);
CREATE INDEX idx_performance_period ON segment_performance(period_start, period_end);
CREATE INDEX idx_performance_type ON segment_performance(period_type);

-- AI Models
CREATE INDEX idx_models_clinic_id ON ai_models(clinic_id);
CREATE INDEX idx_models_active ON ai_models(is_active);
CREATE INDEX idx_models_status ON ai_models(status);

-- Segmentation Rules
CREATE INDEX idx_rules_segment_id ON segmentation_rules(segment_id);
CREATE INDEX idx_rules_active ON segmentation_rules(is_active);
CREATE INDEX idx_rules_priority ON segmentation_rules(priority);

-- =====================================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_segments_updated_at 
    BEFORE UPDATE ON patient_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segmentation_rules_updated_at 
    BEFORE UPDATE ON segmentation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- RLS POLICIES
-- =====================================================================================

-- Enable RLS
ALTER TABLE patient_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (clinic-based access)
CREATE POLICY "Users can access segments for their clinics" ON patient_segments
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access memberships for their clinics" ON patient_segment_memberships
    FOR ALL USING (
        segment_id IN (
            SELECT ps.id FROM patient_segments ps
            JOIN clinic_users cu ON ps.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access analytics for their clinics" ON patient_analytics
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access performance for their segments" ON segment_performance
    FOR ALL USING (
        segment_id IN (
            SELECT ps.id FROM patient_segments ps
            JOIN clinic_users cu ON ps.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access models for their clinics" ON ai_models
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access rules for their segments" ON segmentation_rules
    FOR ALL USING (
        segment_id IN (
            SELECT ps.id FROM patient_segments ps
            JOIN clinic_users cu ON ps.clinic_id = cu.clinic_id
            WHERE cu.user_id = auth.uid()
        )
    );

-- =====================================================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================================================

-- Sample segments (will be created per clinic)
INSERT INTO patient_segments (
    clinic_id, name, description, segment_type, criteria, accuracy_score, confidence_score
) VALUES 
-- Note: These would be inserted with actual clinic_id values
-- Leaving as placeholder for now
(NULL, 'High-Value Patients', 'Patients with high lifetime value and frequent visits', 'financial', 
 '{"total_lifetime_value": {"operator": ">", "value": 5000}, "visit_frequency": {"operator": ">", "value": 0.8}}',
 0.8750, 0.9200),
(NULL, 'At-Risk Patients', 'Patients with declining engagement and missed appointments', 'behavioral',
 '{"engagement_level": {"operator": "in", "value": ["low", "very_low"]}, "appointment_compliance": {"operator": "<", "value": 0.6}}',
 0.8100, 0.8800),
(NULL, 'Preventive Care Candidates', 'Patients due for preventive treatments and screenings', 'clinical',
 '{"age": {"operator": ">=", "value": 40}, "last_screening": {"operator": ">", "value": "12 months"}}',
 0.9200, 0.9500);

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON TABLE patient_segments IS 'Patient segmentation with AI-driven insights and classification';
COMMENT ON TABLE patient_segment_memberships IS 'Patient membership in segments with AI predictions';
COMMENT ON TABLE patient_analytics IS 'Comprehensive patient analytics for AI-driven insights';
COMMENT ON TABLE segment_performance IS 'Segment performance tracking and effectiveness metrics';
COMMENT ON TABLE ai_models IS 'AI/ML models used for patient segmentation and predictions';
COMMENT ON TABLE segmentation_rules IS 'Automated rules for segment assignment and management';

COMMENT ON COLUMN patient_analytics.feature_vector IS 'High-dimensional feature vector for machine learning models';
COMMENT ON COLUMN patient_segment_memberships.treatment_propensity IS 'AI-predicted propensity for different treatment types';
COMMENT ON COLUMN patient_analytics.ai_insights IS 'AI-generated insights and personalized recommendations';

-- =====================================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- Patient Segmentation + AI-driven Insights Database Schema Ready
-- =====================================================================================
