-- ===============================================
-- AI Duration Prediction Engine Database Schema
-- Story 2.1: AI Duration Prediction Engine
-- ===============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- ML Duration Predictions Table
-- ===============================================
CREATE TABLE ml_duration_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    predicted_duration INTEGER NOT NULL, -- Duration in minutes
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    model_version VARCHAR(50) NOT NULL,
    prediction_factors JSONB NOT NULL, -- Store feature values used for prediction
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite indexes for performance
    INDEX idx_ml_predictions_appointment (appointment_id),
    INDEX idx_ml_predictions_model_version (model_version),
    INDEX idx_ml_predictions_confidence (confidence_score),
    INDEX idx_ml_predictions_created_at (created_at)
);

-- ===============================================
-- ML Model Performance Tracking Table
-- ===============================================
CREATE TABLE ml_model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50) NOT NULL UNIQUE,
    accuracy_percentage DECIMAL(5,2) NOT NULL CHECK (accuracy_percentage BETWEEN 0 AND 100),
    mae_minutes DECIMAL(8,2), -- Mean Absolute Error in minutes
    rmse_minutes DECIMAL(8,2), -- Root Mean Square Error in minutes
    confidence_threshold DECIMAL(5,4) DEFAULT 0.70,
    training_data_count INTEGER NOT NULL,
    validation_data_count INTEGER NOT NULL,
    feature_importance JSONB NOT NULL, -- Feature importance scores
    hyperparameters JSONB NOT NULL, -- Model configuration
    is_active BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance monitoring
    INDEX idx_ml_performance_version (model_version),
    INDEX idx_ml_performance_active (is_active),
    INDEX idx_ml_performance_accuracy (accuracy_percentage),
    INDEX idx_ml_performance_deployed (deployed_at)
);

-- ===============================================
-- A/B Testing Assignments Table
-- ===============================================
CREATE TABLE ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL,
    test_group VARCHAR(50) NOT NULL, -- 'control' or 'ai_prediction'
    assignment_percentage INTEGER CHECK (assignment_percentage BETWEEN 0 AND 100),
    test_start_date TIMESTAMPTZ NOT NULL,
    test_end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate assignments
    UNIQUE (user_id, test_name),
    
    -- Indexes for A/B testing queries
    INDEX idx_ab_test_user (user_id),
    INDEX idx_ab_test_name (test_name),
    INDEX idx_ab_test_group (test_group),
    INDEX idx_ab_test_active (is_active),
    INDEX idx_ab_test_dates (test_start_date, test_end_date)
);

-- ===============================================
-- Prediction Feedback & Accuracy Tracking Table
-- ===============================================
CREATE TABLE prediction_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES ml_duration_predictions(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    actual_duration INTEGER, -- Actual duration in minutes (null if appointment not completed)
    accuracy_score DECIMAL(5,4), -- Calculated accuracy score (null until actual duration known)
    prediction_error INTEGER, -- Difference between predicted and actual (null until completed)
    feedback_notes TEXT,
    manual_override BOOLEAN DEFAULT FALSE, -- True if user manually changed AI suggestion
    override_reason TEXT, -- Reason for manual override
    completion_status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for feedback analysis
    INDEX idx_prediction_feedback_prediction (prediction_id),
    INDEX idx_prediction_feedback_appointment (appointment_id),
    INDEX idx_prediction_feedback_accuracy (accuracy_score),
    INDEX idx_prediction_feedback_status (completion_status),
    INDEX idx_prediction_feedback_override (manual_override)
);

-- ===============================================
-- Professional Efficiency Metrics Table
-- ===============================================
CREATE TABLE professional_efficiency_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    treatment_type VARCHAR(100) NOT NULL,
    avg_duration_minutes DECIMAL(8,2) NOT NULL,
    efficiency_rating DECIMAL(5,4) NOT NULL CHECK (efficiency_rating BETWEEN 0 AND 2), -- 1.0 = baseline, >1.0 = faster than average
    total_appointments INTEGER NOT NULL,
    calculation_period_start TIMESTAMPTZ NOT NULL,
    calculation_period_end TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for professional + treatment type + period
    UNIQUE (professional_id, treatment_type, calculation_period_start),
    
    -- Indexes for efficiency lookups
    INDEX idx_professional_efficiency_professional (professional_id),
    INDEX idx_professional_efficiency_treatment (treatment_type),
    INDEX idx_professional_efficiency_rating (efficiency_rating),
    INDEX idx_professional_efficiency_period (calculation_period_start, calculation_period_end)
);

-- ===============================================
-- Treatment Complexity Factors Table
-- ===============================================
CREATE TABLE treatment_complexity_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_type VARCHAR(100) NOT NULL,
    complexity_factor VARCHAR(100) NOT NULL, -- e.g., 'patient_age_senior', 'first_visit', 'anxiety_level_high'
    duration_multiplier DECIMAL(5,4) NOT NULL CHECK (duration_multiplier > 0), -- e.g., 1.2 = 20% longer
    confidence_level DECIMAL(5,4) NOT NULL CHECK (confidence_level BETWEEN 0 AND 1),
    sample_size INTEGER NOT NULL,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Unique constraint for treatment + factor combination
    UNIQUE (treatment_type, complexity_factor),
    
    -- Indexes for complexity calculations
    INDEX idx_complexity_factors_treatment (treatment_type),
    INDEX idx_complexity_factors_factor (complexity_factor),
    INDEX idx_complexity_factors_multiplier (duration_multiplier),
    INDEX idx_complexity_factors_active (is_active)
);

-- ===============================================
-- Row Level Security Policies
-- ===============================================

-- ML Duration Predictions - Healthcare staff can read all, create/update their own predictions
ALTER TABLE ml_duration_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view all predictions" ON ml_duration_predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager', 'scheduler', 'professional')
        )
    );

CREATE POLICY "AI service can create predictions" ON ml_duration_predictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'ai_service')
        )
    );

-- ML Model Performance - Read-only for staff, admin can manage
ALTER TABLE ml_model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view model performance" ON ml_model_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager', 'scheduler', 'professional')
        )
    );

CREATE POLICY "Admin can manage models" ON ml_model_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- A/B Test Assignments - Users can see their own assignments, admin sees all
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test assignments" ON ab_test_assignments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all test assignments" ON ab_test_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Prediction Feedback - Healthcare staff can read all, create feedback
ALTER TABLE prediction_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view all feedback" ON prediction_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager', 'scheduler', 'professional')
        )
    );

CREATE POLICY "Healthcare staff can create feedback" ON prediction_feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager', 'scheduler', 'professional')
        )
    );

-- Professional Efficiency Metrics - Professionals can see their own, managers see all
ALTER TABLE professional_efficiency_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own metrics" ON professional_efficiency_metrics
    FOR SELECT USING (
        professional_id IN (
            SELECT p.id FROM professionals p 
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view all efficiency metrics" ON professional_efficiency_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager')
        )
    );

-- Treatment Complexity Factors - Read-only for staff, admin can manage
ALTER TABLE treatment_complexity_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare staff can view complexity factors" ON treatment_complexity_factors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'manager', 'scheduler', 'professional')
        )
    );

CREATE POLICY "Admin can manage complexity factors" ON treatment_complexity_factors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- ===============================================
-- Audit Log Triggers (LGPD Compliance)
-- ===============================================

-- Function to log AI prediction events
CREATE OR REPLACE FUNCTION log_ai_prediction_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        event_type,
        event_description,
        table_name,
        record_id,
        metadata
    ) VALUES (
        auth.uid(),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'ai_prediction_created'
            WHEN TG_OP = 'UPDATE' THEN 'ai_prediction_updated'
            WHEN TG_OP = 'DELETE' THEN 'ai_prediction_deleted'
        END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'AI duration prediction created'
            WHEN TG_OP = 'UPDATE' THEN 'AI duration prediction updated'
            WHEN TG_OP = 'DELETE' THEN 'AI duration prediction deleted'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'prediction_duration', COALESCE(NEW.predicted_duration, OLD.predicted_duration),
            'confidence_score', COALESCE(NEW.confidence_score, OLD.confidence_score),
            'model_version', COALESCE(NEW.model_version, OLD.model_version)
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_ml_duration_predictions
    AFTER INSERT OR UPDATE OR DELETE ON ml_duration_predictions
    FOR EACH ROW
    EXECUTE FUNCTION log_ai_prediction_event();

-- ===============================================
-- Sample Data for Testing
-- ===============================================

-- Insert initial model performance record
INSERT INTO ml_model_performance (
    model_version,
    accuracy_percentage,
    mae_minutes,
    rmse_minutes,
    confidence_threshold,
    training_data_count,
    validation_data_count,
    feature_importance,
    hyperparameters,
    is_active
) VALUES (
    'baseline_v1.0.0',
    72.50,
    8.25,
    12.40,
    0.70,
    1500,
    300,
    '{"treatment_type": 0.35, "professional_efficiency": 0.28, "patient_age": 0.15, "treatment_history": 0.12, "complexity_factors": 0.10}',
    '{"algorithm": "xgboost", "max_depth": 6, "learning_rate": 0.1, "n_estimators": 100}',
    true
);

-- Insert sample complexity factors
INSERT INTO treatment_complexity_factors (treatment_type, complexity_factor, duration_multiplier, confidence_level, sample_size) VALUES
('consultation', 'first_visit', 1.25, 0.85, 250),
('consultation', 'patient_age_senior', 1.15, 0.90, 400),
('consultation', 'anxiety_level_high', 1.30, 0.80, 150),
('cleaning', 'patient_age_child', 1.20, 0.85, 200),
('cleaning', 'extensive_buildup', 1.40, 0.88, 180),
('treatment', 'complex_procedure', 1.50, 0.92, 120),
('treatment', 'patient_anxiety', 1.25, 0.82, 160);

-- ===============================================
-- Helper Functions for AI Prediction System
-- ===============================================

-- Function to get active model version
CREATE OR REPLACE FUNCTION get_active_model_version()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN (
        SELECT model_version 
        FROM ml_model_performance 
        WHERE is_active = true 
        ORDER BY deployed_at DESC 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
    prediction_id UUID,
    actual_duration INTEGER
)
RETURNS DECIMAL(5,4) AS $$
DECLARE
    predicted_duration INTEGER;
    accuracy DECIMAL(5,4);
BEGIN
    -- Get predicted duration
    SELECT predicted_duration INTO predicted_duration
    FROM ml_duration_predictions
    WHERE id = prediction_id;
    
    -- Calculate accuracy (1.0 - normalized absolute error)
    accuracy := 1.0 - LEAST(ABS(predicted_duration - actual_duration)::DECIMAL / GREATEST(predicted_duration, actual_duration), 1.0);
    
    -- Update feedback record
    UPDATE prediction_feedback
    SET 
        actual_duration = actual_duration,
        accuracy_score = accuracy,
        prediction_error = predicted_duration - actual_duration,
        updated_at = NOW()
    WHERE prediction_id = prediction_id;
    
    RETURN accuracy;
END;
$$ LANGUAGE plpgsql;

-- Function to update professional efficiency metrics
CREATE OR REPLACE FUNCTION update_professional_efficiency(
    prof_id UUID,
    treatment_type VARCHAR(100),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
    avg_duration DECIMAL(8,2);
    appointment_count INTEGER;
    baseline_duration DECIMAL(8,2);
    efficiency DECIMAL(5,4);
BEGIN
    -- Calculate average duration for this professional and treatment type
    SELECT 
        AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60)::DECIMAL(8,2),
        COUNT(*)
    INTO avg_duration, appointment_count
    FROM appointments a
    JOIN professionals p ON a.professional_id = p.id
    WHERE p.id = prof_id 
    AND a.treatment_type = treatment_type
    AND a.start_time BETWEEN period_start AND period_end
    AND a.status = 'completed';
    
    -- Get baseline duration for this treatment type
    SELECT AVG(predicted_duration)::DECIMAL(8,2)
    INTO baseline_duration
    FROM ml_duration_predictions mdp
    JOIN appointments a ON mdp.appointment_id = a.id
    WHERE a.treatment_type = treatment_type;
    
    -- Calculate efficiency rating (baseline/actual, capped at 2.0)
    efficiency := LEAST(baseline_duration / NULLIF(avg_duration, 0), 2.0);
    
    -- Insert or update efficiency metrics
    INSERT INTO professional_efficiency_metrics (
        professional_id,
        treatment_type,
        avg_duration_minutes,
        efficiency_rating,
        total_appointments,
        calculation_period_start,
        calculation_period_end
    ) VALUES (
        prof_id,
        treatment_type,
        avg_duration,
        efficiency,
        appointment_count,
        period_start,
        period_end
    )
    ON CONFLICT (professional_id, treatment_type, calculation_period_start)
    DO UPDATE SET
        avg_duration_minutes = EXCLUDED.avg_duration_minutes,
        efficiency_rating = EXCLUDED.efficiency_rating,
        total_appointments = EXCLUDED.total_appointments,
        calculation_period_end = EXCLUDED.calculation_period_end,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- Indexes for Performance Optimization
-- ===============================================

-- Additional composite indexes for complex queries
CREATE INDEX idx_ml_predictions_appointment_confidence ON ml_duration_predictions (appointment_id, confidence_score);
CREATE INDEX idx_prediction_feedback_accuracy_status ON prediction_feedback (accuracy_score, completion_status);
CREATE INDEX idx_efficiency_metrics_professional_treatment ON professional_efficiency_metrics (professional_id, treatment_type);
CREATE INDEX idx_complexity_factors_treatment_active ON treatment_complexity_factors (treatment_type, is_active);

-- Partial indexes for performance
CREATE INDEX idx_active_models ON ml_model_performance (model_version) WHERE is_active = true;
CREATE INDEX idx_active_ab_tests ON ab_test_assignments (test_name, test_group) WHERE is_active = true;
CREATE INDEX idx_completed_feedback ON prediction_feedback (prediction_id) WHERE completion_status = 'completed';

COMMENT ON SCHEMA public IS 'AI Duration Prediction Engine - Comprehensive ML infrastructure for intelligent appointment scheduling';