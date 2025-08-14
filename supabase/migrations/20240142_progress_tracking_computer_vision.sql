-- Story 10.2: Progress Tracking through Computer Vision
-- Migration: Progress tracking system with computer vision and timeline analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Progress tracking main table
CREATE TABLE progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
    tracking_type VARCHAR(50) NOT NULL, -- healing, aesthetic, treatment_response, maintenance
    progress_score DECIMAL(5,2) NOT NULL CHECK (progress_score >= 0 AND progress_score <= 100),
    measurement_data JSONB NOT NULL DEFAULT '{}', -- Vision analysis measurements and metrics
    comparison_baseline UUID REFERENCES progress_tracking(id), -- Reference to baseline measurement
    tracking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    treatment_area VARCHAR(100) NOT NULL,
    treatment_type VARCHAR(100) NOT NULL,
    visual_annotations JSONB DEFAULT '{}', -- Visual markings and annotations from CV
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected', 'manual_review')),
    validation_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Progress milestones table
CREATE TABLE progress_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracking_id UUID REFERENCES progress_tracking(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- significant_improvement, target_achieved, concern_detected, treatment_complete
    milestone_name VARCHAR(200) NOT NULL,
    achievement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    progress_data JSONB NOT NULL DEFAULT '{}', -- Milestone-specific progress data
    threshold_criteria JSONB NOT NULL DEFAULT '{}', -- Criteria that triggered the milestone
    achievement_score DECIMAL(5,2) NOT NULL CHECK (achievement_score >= 0 AND achievement_score <= 100),
    validation_status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (validation_status IN ('detected', 'confirmed', 'false_positive', 'manually_added')),
    validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validation_notes TEXT,
    alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    alert_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Progress predictions table
CREATE TABLE progress_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracking_id UUID REFERENCES progress_tracking(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- outcome_forecast, timeline_prediction, risk_assessment
    predicted_outcome JSONB NOT NULL DEFAULT '{}', -- Predicted results and timeline
    confidence_level DECIMAL(5,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
    prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    target_date TIMESTAMP WITH TIME ZONE, -- When the prediction is expected to be verified
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    input_features JSONB NOT NULL DEFAULT '{}', -- Features used for prediction
    actual_outcome JSONB DEFAULT '{}', -- Actual results when available
    accuracy_score DECIMAL(5,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tracking metrics configuration table
CREATE TABLE tracking_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- measurement, scoring, threshold, visualization
    measurement_method VARCHAR(100) NOT NULL, -- cv_analysis, manual_measurement, hybrid
    normal_ranges JSONB NOT NULL DEFAULT '{}', -- Normal value ranges for the metric
    improvement_thresholds JSONB NOT NULL DEFAULT '{}', -- Thresholds for determining improvement
    calculation_formula TEXT, -- Formula for calculating the metric
    unit_of_measurement VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    UNIQUE(treatment_type, metric_name)
);

-- Multi-session analysis table
CREATE TABLE multi_session_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_name VARCHAR(200) NOT NULL,
    session_ids UUID[] NOT NULL, -- Array of session IDs being compared
    tracking_ids UUID[] NOT NULL, -- Array of progress tracking IDs
    comparison_type VARCHAR(50) NOT NULL, -- timeline_progression, treatment_effectiveness, side_by_side
    analysis_period INTERVAL NOT NULL, -- Time period covered by the analysis
    progression_score DECIMAL(5,2) NOT NULL CHECK (progression_score >= 0 AND progression_score <= 100),
    trend_direction VARCHAR(20) NOT NULL CHECK (trend_direction IN ('improving', 'stable', 'declining', 'mixed')),
    statistical_significance DECIMAL(5,2) CHECK (statistical_significance >= 0 AND statistical_significance <= 100),
    analysis_data JSONB NOT NULL DEFAULT '{}', -- Detailed analysis results and metrics
    visualization_config JSONB DEFAULT '{}', -- Configuration for charts and visualizations
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Progress alerts table
CREATE TABLE progress_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracking_id UUID REFERENCES progress_tracking(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES progress_milestones(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- milestone_achieved, concern_detected, threshold_exceeded, prediction_update
    alert_priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (alert_priority IN ('low', 'medium', 'high', 'urgent')),
    alert_title VARCHAR(200) NOT NULL,
    alert_message TEXT NOT NULL,
    alert_data JSONB DEFAULT '{}', -- Additional alert-specific data
    recipient_type VARCHAR(50) NOT NULL, -- patient, provider, both
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_required BOOLEAN NOT NULL DEFAULT FALSE,
    action_taken BOOLEAN NOT NULL DEFAULT FALSE,
    action_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_progress_tracking_patient_date ON progress_tracking(patient_id, tracking_date DESC);
CREATE INDEX idx_progress_tracking_session ON progress_tracking(session_id);
CREATE INDEX idx_progress_tracking_type_area ON progress_tracking(tracking_type, treatment_area);
CREATE INDEX idx_progress_tracking_validation ON progress_tracking(validation_status, created_at);

CREATE INDEX idx_progress_milestones_patient ON progress_milestones(patient_id, achievement_date DESC);
CREATE INDEX idx_progress_milestones_type ON progress_milestones(milestone_type, achievement_date DESC);
CREATE INDEX idx_progress_milestones_alerts ON progress_milestones(alert_sent, created_at);

CREATE INDEX idx_progress_predictions_patient ON progress_predictions(patient_id, prediction_date DESC);
CREATE INDEX idx_progress_predictions_target ON progress_predictions(target_date) WHERE target_date IS NOT NULL;
CREATE INDEX idx_progress_predictions_verification ON progress_predictions(verified_at) WHERE verified_at IS NOT NULL;

CREATE INDEX idx_tracking_metrics_treatment ON tracking_metrics(treatment_type, is_active);
CREATE INDEX idx_tracking_metrics_category ON tracking_metrics(metric_category, display_order);

CREATE INDEX idx_multi_session_patient ON multi_session_analysis(patient_id, created_at DESC);
CREATE INDEX idx_multi_session_trend ON multi_session_analysis(trend_direction, progression_score);

CREATE INDEX idx_progress_alerts_patient ON progress_alerts(patient_id, created_at DESC);
CREATE INDEX idx_progress_alerts_unread ON progress_alerts(recipient_type, is_read, created_at) WHERE NOT is_read;
CREATE INDEX idx_progress_alerts_priority ON progress_alerts(alert_priority, created_at DESC);
CREATE INDEX idx_progress_alerts_expiry ON progress_alerts(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_session_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress_tracking
CREATE POLICY "progress_tracking_select_policy" ON progress_tracking
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_tracking_insert_policy" ON progress_tracking
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_tracking_update_policy" ON progress_tracking
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

CREATE POLICY "progress_tracking_delete_policy" ON progress_tracking
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for progress_milestones
CREATE POLICY "progress_milestones_select_policy" ON progress_milestones
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_milestones_insert_policy" ON progress_milestones
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_milestones_update_policy" ON progress_milestones
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

-- RLS Policies for progress_predictions
CREATE POLICY "progress_predictions_select_policy" ON progress_predictions
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_predictions_insert_policy" ON progress_predictions
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

-- RLS Policies for tracking_metrics
CREATE POLICY "tracking_metrics_select_policy" ON tracking_metrics
    FOR SELECT USING (
        is_active = true OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

CREATE POLICY "tracking_metrics_manage_policy" ON tracking_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

-- RLS Policies for multi_session_analysis
CREATE POLICY "multi_session_analysis_select_policy" ON multi_session_analysis
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "multi_session_analysis_manage_policy" ON multi_session_analysis
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

-- RLS Policies for progress_alerts
CREATE POLICY "progress_alerts_select_policy" ON progress_alerts
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider', 'staff')
        )
    );

CREATE POLICY "progress_alerts_manage_policy" ON progress_alerts
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('admin', 'provider')
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_progress_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply update triggers
CREATE TRIGGER trigger_update_progress_tracking_updated_at
    BEFORE UPDATE ON progress_tracking
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

CREATE TRIGGER trigger_update_progress_milestones_updated_at
    BEFORE UPDATE ON progress_milestones
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

CREATE TRIGGER trigger_update_progress_predictions_updated_at
    BEFORE UPDATE ON progress_predictions
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

CREATE TRIGGER trigger_update_tracking_metrics_updated_at
    BEFORE UPDATE ON tracking_metrics
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

CREATE TRIGGER trigger_update_multi_session_analysis_updated_at
    BEFORE UPDATE ON multi_session_analysis
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

CREATE TRIGGER trigger_update_progress_alerts_updated_at
    BEFORE UPDATE ON progress_alerts
    FOR EACH ROW EXECUTE FUNCTION update_progress_tracking_updated_at();

-- Function to detect progress milestones
CREATE OR REPLACE FUNCTION detect_progress_milestone()
RETURNS TRIGGER AS $$
DECLARE
    threshold_met BOOLEAN := FALSE;
    milestone_type_val VARCHAR(50);
    milestone_name_val VARCHAR(200);
    achievement_score_val DECIMAL(5,2);
BEGIN
    -- Check for significant improvement milestone (>= 20% improvement)
    IF NEW.progress_score >= 20 THEN
        threshold_met := TRUE;
        milestone_type_val := 'significant_improvement';
        milestone_name_val := 'Significant Progress Achieved';
        achievement_score_val := NEW.progress_score;
    END IF;

    -- Check for target achievement milestone (>= 85% progress)
    IF NEW.progress_score >= 85 THEN
        threshold_met := TRUE;
        milestone_type_val := 'target_achieved';
        milestone_name_val := 'Target Progress Achieved';
        achievement_score_val := NEW.progress_score;
    END IF;

    -- Check for concern detection milestone (confidence < 70% or low progress)
    IF NEW.confidence_score < 70 OR NEW.progress_score < 10 THEN
        threshold_met := TRUE;
        milestone_type_val := 'concern_detected';
        milestone_name_val := 'Progress Concern Detected';
        achievement_score_val := NEW.progress_score;
    END IF;

    -- Insert milestone if threshold is met
    IF threshold_met THEN
        INSERT INTO progress_milestones (
            patient_id, tracking_id, milestone_type, milestone_name,
            achievement_score, progress_data, threshold_criteria,
            created_by, updated_by
        ) VALUES (
            NEW.patient_id, NEW.id, milestone_type_val, milestone_name_val,
            achievement_score_val,
            jsonb_build_object(
                'progress_score', NEW.progress_score,
                'confidence_score', NEW.confidence_score,
                'treatment_type', NEW.treatment_type,
                'treatment_area', NEW.treatment_area
            ),
            jsonb_build_object(
                'progress_threshold', CASE 
                    WHEN milestone_type_val = 'significant_improvement' THEN 20
                    WHEN milestone_type_val = 'target_achieved' THEN 85
                    ELSE 0
                END,
                'confidence_threshold', CASE 
                    WHEN milestone_type_val = 'concern_detected' THEN 70
                    ELSE NULL
                END
            ),
            NEW.created_by, NEW.updated_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply milestone detection trigger
CREATE TRIGGER trigger_detect_progress_milestone
    AFTER INSERT OR UPDATE ON progress_tracking
    FOR EACH ROW EXECUTE FUNCTION detect_progress_milestone();

-- Function to generate progress alerts
CREATE OR REPLACE FUNCTION generate_progress_alert()
RETURNS TRIGGER AS $$
DECLARE
    alert_title_val VARCHAR(200);
    alert_message_val TEXT;
    alert_priority_val VARCHAR(20) := 'medium';
BEGIN
    -- Generate alert based on milestone type
    CASE NEW.milestone_type
        WHEN 'significant_improvement' THEN
            alert_title_val := 'Significant Progress Detected';
            alert_message_val := format('Patient has achieved %s%% progress in %s treatment', 
                NEW.achievement_score, NEW.progress_data->>'treatment_type');
            alert_priority_val := 'high';
        
        WHEN 'target_achieved' THEN
            alert_title_val := 'Treatment Target Achieved';
            alert_message_val := format('Patient has reached target progress (%s%%) for %s treatment', 
                NEW.achievement_score, NEW.progress_data->>'treatment_type');
            alert_priority_val := 'high';
        
        WHEN 'concern_detected' THEN
            alert_title_val := 'Progress Concern Detected';
            alert_message_val := format('Potential concern detected in %s treatment progress. Review recommended.', 
                NEW.progress_data->>'treatment_type');
            alert_priority_val := 'urgent';
        
        WHEN 'treatment_complete' THEN
            alert_title_val := 'Treatment Complete';
            alert_message_val := format('Treatment appears to be complete with %s%% achievement', 
                NEW.achievement_score);
            alert_priority_val := 'medium';
        
        ELSE
            alert_title_val := 'Progress Update';
            alert_message_val := format('New progress milestone: %s', NEW.milestone_name);
    END CASE;

    -- Insert progress alert
    INSERT INTO progress_alerts (
        patient_id, milestone_id, alert_type, alert_priority,
        alert_title, alert_message, alert_data, recipient_type,
        action_required, created_by, updated_by
    ) VALUES (
        NEW.patient_id, NEW.id, NEW.milestone_type, alert_priority_val,
        alert_title_val, alert_message_val,
        jsonb_build_object(
            'milestone_id', NEW.id,
            'achievement_score', NEW.achievement_score,
            'treatment_type', NEW.progress_data->>'treatment_type',
            'treatment_area', NEW.progress_data->>'treatment_area'
        ),
        CASE 
            WHEN NEW.milestone_type = 'concern_detected' THEN 'both'
            ELSE 'provider'
        END,
        CASE 
            WHEN NEW.milestone_type IN ('concern_detected', 'target_achieved') THEN TRUE
            ELSE FALSE
        END,
        NEW.created_by, NEW.updated_by
    );

    -- Update milestone with alert sent flag
    UPDATE progress_milestones 
    SET alert_sent = TRUE, alert_sent_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply alert generation trigger
CREATE TRIGGER trigger_generate_progress_alert
    AFTER INSERT ON progress_milestones
    FOR EACH ROW EXECUTE FUNCTION generate_progress_alert();

-- Insert default tracking metrics
INSERT INTO tracking_metrics (treatment_type, metric_name, metric_category, measurement_method, normal_ranges, improvement_thresholds, unit_of_measurement, display_order, created_by, updated_by) VALUES
('facial_treatment', 'skin_texture_improvement', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 75}', '{"minimal": 10, "moderate": 25, "significant": 50}', 'percentage', 1, uuid_generate_v4(), uuid_generate_v4()),
('facial_treatment', 'wrinkle_reduction', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 70}', '{"minimal": 15, "moderate": 30, "significant": 60}', 'percentage', 2, uuid_generate_v4(), uuid_generate_v4()),
('facial_treatment', 'pigmentation_improvement', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 65}', '{"minimal": 20, "moderate": 40, "significant": 70}', 'percentage', 3, uuid_generate_v4(), uuid_generate_v4()),

('body_contouring', 'volume_reduction', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 60}', '{"minimal": 10, "moderate": 20, "significant": 40}', 'percentage', 1, uuid_generate_v4(), uuid_generate_v4()),
('body_contouring', 'skin_tightening', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 70}', '{"minimal": 15, "moderate": 30, "significant": 50}', 'percentage', 2, uuid_generate_v4(), uuid_generate_v4()),

('wound_healing', 'healing_progress', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 80}', '{"minimal": 20, "moderate": 50, "significant": 80}', 'percentage', 1, uuid_generate_v4(), uuid_generate_v4()),
('wound_healing', 'inflammation_reduction', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 75}', '{"minimal": 25, "moderate": 50, "significant": 75}', 'percentage', 2, uuid_generate_v4(), uuid_generate_v4()),

('acne_treatment', 'lesion_reduction', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 70}', '{"minimal": 20, "moderate": 40, "significant": 70}', 'percentage', 1, uuid_generate_v4(), uuid_generate_v4()),
('acne_treatment', 'skin_clarity', 'measurement', 'cv_analysis', '{"min": 0, "max": 100, "normal": 75}', '{"minimal": 15, "moderate": 35, "significant": 60}', 'percentage', 2, uuid_generate_v4(), uuid_generate_v4());

-- Create view for progress tracking analytics
CREATE OR REPLACE VIEW progress_tracking_analytics AS
SELECT 
    pt.id,
    pt.patient_id,
    pt.tracking_type,
    pt.treatment_type,
    pt.treatment_area,
    pt.progress_score,
    pt.confidence_score,
    pt.tracking_date,
    pt.validation_status,
    
    -- Progress trend calculation
    LAG(pt.progress_score, 1) OVER (
        PARTITION BY pt.patient_id, pt.treatment_type, pt.treatment_area 
        ORDER BY pt.tracking_date
    ) AS previous_score,
    
    pt.progress_score - LAG(pt.progress_score, 1) OVER (
        PARTITION BY pt.patient_id, pt.treatment_type, pt.treatment_area 
        ORDER BY pt.tracking_date
    ) AS score_change,
    
    -- Time between measurements
    pt.tracking_date - LAG(pt.tracking_date, 1) OVER (
        PARTITION BY pt.patient_id, pt.treatment_type, pt.treatment_area 
        ORDER BY pt.tracking_date
    ) AS time_since_last,
    
    -- Milestone information
    COUNT(pm.id) OVER (
        PARTITION BY pt.patient_id, pt.treatment_type 
        ORDER BY pt.tracking_date 
        ROWS UNBOUNDED PRECEDING
    ) AS total_milestones,
    
    -- Latest prediction
    (
        SELECT pp.predicted_outcome 
        FROM progress_predictions pp 
        WHERE pp.patient_id = pt.patient_id 
        AND pp.tracking_id = pt.id 
        ORDER BY pp.prediction_date DESC 
        LIMIT 1
    ) AS latest_prediction

FROM progress_tracking pt
LEFT JOIN progress_milestones pm ON pm.tracking_id = pt.id
WHERE pt.validation_status IN ('validated', 'pending');

COMMENT ON TABLE progress_tracking IS 'Computer vision-based progress tracking for medical treatments';
COMMENT ON TABLE progress_milestones IS 'Automated milestone detection and achievement tracking';
COMMENT ON TABLE progress_predictions IS 'Predictive modeling for treatment progression and outcomes';
COMMENT ON TABLE tracking_metrics IS 'Configuration for treatment-specific progress metrics';
COMMENT ON TABLE multi_session_analysis IS 'Multi-session comparative analysis and trending';
COMMENT ON TABLE progress_alerts IS 'Automated alerts for progress milestones and concerns';
