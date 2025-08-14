-- AI-Powered Automatic Scheduling System Schema
-- Story 2.3: AI-Powered Automatic Scheduling
-- Date: 2025-01-26

-- =====================================================
-- AI SCHEDULING MODELS TRACKING
-- =====================================================

CREATE TABLE ai_scheduling_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(100) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'preference_learning', 'optimization', 'forecasting'
    training_data_date TIMESTAMP WITH TIME ZONE NOT NULL,
    performance_metrics JSONB NOT NULL DEFAULT '{}',
    accuracy_score DECIMAL(5,4), -- 0.0000 to 1.0000
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENT PREFERENCES LEARNING
-- =====================================================

CREATE TABLE patient_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    time_preferences JSONB NOT NULL DEFAULT '{}', -- preferred times, days
    staff_preferences JSONB NOT NULL DEFAULT '{}', -- preferred providers
    treatment_preferences JSONB NOT NULL DEFAULT '{}', -- treatment types, durations
    location_preferences JSONB NOT NULL DEFAULT '{}', -- room preferences, accessibility
    communication_preferences JSONB NOT NULL DEFAULT '{}', -- notification timing, channels
    confidence_score DECIMAL(5,4) DEFAULT 0.5000, -- AI confidence in preferences
    data_points_count INTEGER DEFAULT 0, -- number of appointments used for learning
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SCHEDULING ANALYTICS AND PERFORMANCE
-- =====================================================

CREATE TABLE scheduling_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'utilization', 'revenue', 'satisfaction'
    value DECIMAL(10,4) NOT NULL,
    ai_influence_score DECIMAL(5,4), -- how much AI contributed to this metric
    comparison_baseline DECIMAL(10,4), -- baseline without AI
    algorithm_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI OPTIMIZATION PARAMETERS
-- =====================================================

CREATE TABLE ai_optimization_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value JSONB NOT NULL,
    parameter_type VARCHAR(50) NOT NULL, -- 'weights', 'constraints', 'thresholds'
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STAFF EFFICIENCY PATTERNS
-- =====================================================

CREATE TABLE staff_efficiency_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
    efficiency_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    patient_satisfaction_correlation DECIMAL(5,4),
    revenue_per_hour DECIMAL(10,2),
    fatigue_indicator DECIMAL(5,4), -- fatigue level prediction
    sample_size INTEGER NOT NULL DEFAULT 1,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TREATMENT SEQUENCING RULES
-- =====================================================

CREATE TABLE treatment_sequencing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_type_primary VARCHAR(100) NOT NULL,
    treatment_type_secondary VARCHAR(100) NOT NULL,
    sequence_order INTEGER NOT NULL, -- 1=first, 2=second, etc.
    min_days_between INTEGER DEFAULT 0,
    max_days_between INTEGER,
    is_required BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT TRUE,
    confidence_score DECIMAL(5,4) DEFAULT 0.8000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEMAND FORECASTING DATA
-- =====================================================

CREATE TABLE demand_forecasting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    predicted_demand INTEGER NOT NULL,
    actual_demand INTEGER,
    confidence_interval_lower INTEGER,
    confidence_interval_upper INTEGER,
    seasonal_factor DECIMAL(5,4) DEFAULT 1.0000,
    trend_factor DECIMAL(5,4) DEFAULT 1.0000,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI SCHEDULING DECISIONS LOG
-- =====================================================

CREATE TABLE ai_scheduling_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id VARCHAR(100) NOT NULL UNIQUE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES profiles(id),
    suggested_slot TIMESTAMP WITH TIME ZONE NOT NULL,
    alternative_slots JSONB DEFAULT '[]',
    optimization_factors JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(5,4) NOT NULL,
    was_accepted BOOLEAN,
    patient_satisfaction_score INTEGER CHECK (patient_satisfaction_score BETWEEN 1 AND 5),
    actual_outcome JSONB DEFAULT '{}',
    decision_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVENUE OPTIMIZATION TRACKING
-- =====================================================

CREATE TABLE revenue_optimization_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    original_revenue_projection DECIMAL(10,2),
    ai_optimized_projection DECIMAL(10,2),
    actual_revenue DECIMAL(10,2),
    optimization_strategies JSONB DEFAULT '[]',
    pricing_adjustments JSONB DEFAULT '{}',
    utilization_improvements JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Patient preferences
CREATE INDEX idx_patient_preferences_patient_id ON patient_preferences(patient_id);
CREATE INDEX idx_patient_preferences_confidence ON patient_preferences(confidence_score DESC);

-- Scheduling analytics
CREATE INDEX idx_scheduling_analytics_date ON scheduling_analytics(date);
CREATE INDEX idx_scheduling_analytics_metric_type ON scheduling_analytics(metric_type);
CREATE INDEX idx_scheduling_analytics_ai_influence ON scheduling_analytics(ai_influence_score DESC);

-- Staff efficiency patterns
CREATE INDEX idx_staff_efficiency_staff_id ON staff_efficiency_patterns(staff_id);
CREATE INDEX idx_staff_efficiency_day_hour ON staff_efficiency_patterns(day_of_week, hour_of_day);
CREATE INDEX idx_staff_efficiency_score ON staff_efficiency_patterns(efficiency_score DESC);

-- Demand forecasting
CREATE INDEX idx_demand_forecasting_date ON demand_forecasting(forecast_date);
CREATE INDEX idx_demand_forecasting_service ON demand_forecasting(service_type);

-- AI decisions
CREATE INDEX idx_ai_decisions_patient_id ON ai_scheduling_decisions(patient_id);
CREATE INDEX idx_ai_decisions_timestamp ON ai_scheduling_decisions(decision_timestamp);
CREATE INDEX idx_ai_decisions_confidence ON ai_scheduling_decisions(confidence_score DESC);

-- Revenue optimization
CREATE INDEX idx_revenue_optimization_date ON revenue_optimization_tracking(date);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ai_scheduling_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_optimization_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_efficiency_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_sequencing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasting ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scheduling_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_optimization_tracking ENABLE ROW LEVEL SECURITY;

-- AI Scheduling Models - Admin only
CREATE POLICY "AI models admin access" ON ai_scheduling_models
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager')
    ));

-- Patient Preferences - Own data + staff access
CREATE POLICY "Patient preferences own access" ON patient_preferences
    FOR ALL USING (
        patient_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager', 'provider', 'staff')
        )
    );

-- Scheduling Analytics - Staff+ access
CREATE POLICY "Scheduling analytics staff access" ON scheduling_analytics
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager', 'provider', 'staff')
    ));

-- AI Optimization Parameters - Admin only
CREATE POLICY "AI parameters admin access" ON ai_optimization_parameters
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager')
    ));

-- Staff Efficiency Patterns - Own data + managers
CREATE POLICY "Staff efficiency own data" ON staff_efficiency_patterns
    FOR ALL USING (
        staff_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager')
        )
    );

-- Treatment Sequencing Rules - Staff+ access
CREATE POLICY "Treatment sequencing staff access" ON treatment_sequencing_rules
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager', 'provider', 'staff')
    ));

-- Demand Forecasting - Staff+ access
CREATE POLICY "Demand forecasting staff access" ON demand_forecasting
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager', 'provider', 'staff')
    ));

-- AI Scheduling Decisions - Own decisions + staff access
CREATE POLICY "AI decisions patient access" ON ai_scheduling_decisions
    FOR ALL USING (
        patient_id = auth.uid() OR 
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager', 'provider', 'staff')
        )
    );

-- Revenue Optimization - Manager+ access
CREATE POLICY "Revenue optimization manager access" ON revenue_optimization_tracking
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'clinic_manager')
    ));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate staff efficiency score
CREATE OR REPLACE FUNCTION calculate_staff_efficiency_score(
    staff_member_id UUID,
    target_day INTEGER,
    target_hour INTEGER
) RETURNS DECIMAL(5,4) AS $$
DECLARE
    efficiency_score DECIMAL(5,4);
BEGIN
    SELECT COALESCE(AVG(efficiency_score), 0.5000)
    INTO efficiency_score
    FROM staff_efficiency_patterns
    WHERE staff_id = staff_member_id
      AND day_of_week = target_day
      AND hour_of_day = target_hour;
      
    RETURN efficiency_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get patient preference score for a slot
CREATE OR REPLACE FUNCTION get_patient_preference_score(
    target_patient_id UUID,
    proposed_slot TIMESTAMP WITH TIME ZONE,
    proposed_staff_id UUID
) RETURNS DECIMAL(5,4) AS $$
DECLARE
    preference_score DECIMAL(5,4) := 0.5000;
    prefs JSONB;
BEGIN
    SELECT time_preferences, staff_preferences
    INTO prefs
    FROM patient_preferences
    WHERE patient_id = target_patient_id;
    
    -- Calculate composite score based on time and staff preferences
    -- This is a simplified version - in practice would be more complex
    IF prefs IS NOT NULL THEN
        preference_score := 0.7000; -- Base improvement if we have data
    END IF;
    
    RETURN preference_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant appropriate access to service role
GRANT SELECT, INSERT, UPDATE ON ai_scheduling_models TO service_role;
GRANT SELECT, INSERT, UPDATE ON patient_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE ON scheduling_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai_optimization_parameters TO service_role;
GRANT SELECT, INSERT, UPDATE ON staff_efficiency_patterns TO service_role;
GRANT SELECT, INSERT, UPDATE ON treatment_sequencing_rules TO service_role;
GRANT SELECT, INSERT, UPDATE ON demand_forecasting TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai_scheduling_decisions TO service_role;
GRANT SELECT, INSERT, UPDATE ON revenue_optimization_tracking TO service_role;

-- Grant function execution
GRANT EXECUTE ON FUNCTION calculate_staff_efficiency_score TO service_role;
GRANT EXECUTE ON FUNCTION get_patient_preference_score TO service_role;