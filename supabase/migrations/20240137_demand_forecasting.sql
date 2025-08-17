-- Migration: 20240137_demand_forecasting.sql
-- Description: Demand Forecasting Engine with ≥80% accuracy prediction
-- Story: 11.1 - Demand Forecasting Engine
-- Multi-factor analysis: seasonal patterns, historical trends, marketing campaigns
-- Service-specific forecasting with resource allocation optimization
-- Real-time monitoring with scheduling integration

-- =================================================================
-- DEMAND FORECASTING CORE TABLES
-- =================================================================

-- Demand Forecasting Models Table
-- Stores ML models and configuration for demand prediction
CREATE TABLE IF NOT EXISTS demand_forecasting_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Model Configuration
    model_name VARCHAR(200) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'arima', 'seasonal_arima', 'linear_regression', 'random_forest',
        'xgboost', 'lstm', 'prophet', 'ensemble'
    )),
    model_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    
    -- Forecasting Scope
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    forecasting_scope VARCHAR(50) NOT NULL CHECK (forecasting_scope IN (
        'clinic_wide', 'service_specific', 'professional_specific', 'room_specific'
    )),
    target_metric VARCHAR(50) NOT NULL CHECK (target_metric IN (
        'appointment_count', 'service_demand', 'resource_utilization', 'revenue_forecast'
    )),
    
    -- Model Parameters
    training_window_days INTEGER NOT NULL DEFAULT 365,
    prediction_horizon_days INTEGER NOT NULL DEFAULT 30,
    seasonality_patterns JSONB DEFAULT '{}', -- yearly, monthly, weekly, daily
    external_factors JSONB DEFAULT '{}', -- holidays, marketing, events
    
    -- Model Performance
    accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_accuracy_check TIMESTAMPTZ,
    mae DECIMAL(10,4), -- Mean Absolute Error
    rmse DECIMAL(10,4), -- Root Mean Square Error
    mape DECIMAL(5,2), -- Mean Absolute Percentage Error
    
    -- Model Status
    model_status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (model_status IN (
        'draft', 'training', 'ready', 'active', 'deprecated', 'failed'
    )),
    is_primary BOOLEAN DEFAULT FALSE,
    auto_retrain BOOLEAN DEFAULT TRUE,
    retrain_frequency_days INTEGER DEFAULT 7,
    
    -- Model Artifacts
    model_config JSONB DEFAULT '{}',
    feature_importance JSONB DEFAULT '{}',
    training_metrics JSONB DEFAULT '{}',
    model_file_path TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Demand Forecasts Table
-- Stores generated demand predictions with confidence intervals
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES demand_forecasting_models(id) ON DELETE CASCADE,
    
    -- Forecast Scope
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    
    -- Forecast Period
    forecast_date DATE NOT NULL,
    forecast_period VARCHAR(20) NOT NULL CHECK (forecast_period IN (
        'hourly', 'daily', 'weekly', 'monthly'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Demand Predictions
    predicted_demand DECIMAL(10,2) NOT NULL,
    predicted_appointments INTEGER DEFAULT 0,
    predicted_revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Confidence Intervals
    confidence_level DECIMAL(5,2) NOT NULL DEFAULT 95.00,
    lower_bound DECIMAL(10,2) NOT NULL,
    upper_bound DECIMAL(10,2) NOT NULL,
    prediction_variance DECIMAL(10,4),
    
    -- Influencing Factors
    seasonal_factor DECIMAL(5,4) DEFAULT 1.0000,
    trend_factor DECIMAL(5,4) DEFAULT 1.0000,
    marketing_impact DECIMAL(5,4) DEFAULT 1.0000,
    external_factors JSONB DEFAULT '{}',
    
    -- Resource Allocation
    recommended_staff_count INTEGER DEFAULT 0,
    recommended_room_hours DECIMAL(8,2) DEFAULT 0.00,
    capacity_utilization_target DECIMAL(5,2) DEFAULT 85.00,
    
    -- Forecast Quality
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    forecast_accuracy DECIMAL(5,2), -- Updated after actual comparison
    actual_demand DECIMAL(10,2), -- Set after period completion
    forecast_error DECIMAL(10,4), -- Calculated after actual vs predicted
    
    -- Status and Alerts
    forecast_status VARCHAR(20) DEFAULT 'active' CHECK (forecast_status IN (
        'active', 'expired', 'superseded', 'validated'
    )),
    alert_thresholds JSONB DEFAULT '{}',
    alert_triggered BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Patterns Table
-- Stores historical demand patterns for pattern recognition
CREATE TABLE IF NOT EXISTS demand_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Pattern Identification
    pattern_name VARCHAR(200) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
        'seasonal', 'trend', 'cyclical', 'irregular', 'campaign_driven'
    )),
    pattern_scope VARCHAR(50) NOT NULL CHECK (pattern_scope IN (
        'clinic_wide', 'service_specific', 'day_of_week', 'time_of_day', 'monthly'
    )),
    
    -- Pattern Data
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    pattern_data JSONB NOT NULL DEFAULT '{}',
    statistical_significance DECIMAL(5,4),
    pattern_strength DECIMAL(5,4), -- 0.0 to 1.0
    
    -- Temporal Scope
    effective_from DATE NOT NULL,
    effective_to DATE,
    day_of_week INTEGER[], -- 0=Sunday, 6=Saturday
    hours_of_day INTEGER[], -- 0-23
    months_of_year INTEGER[], -- 1-12
    
    -- Pattern Metrics
    frequency_count INTEGER DEFAULT 0,
    average_impact DECIMAL(5,4),
    variance DECIMAL(10,6),
    correlation_strength DECIMAL(5,4),
    
    -- Pattern Status
    is_active BOOLEAN DEFAULT TRUE,
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_observed TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Forecast Alerts Table
-- Manages alerts for demand forecast anomalies and thresholds
CREATE TABLE IF NOT EXISTS forecast_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    forecast_id UUID REFERENCES demand_forecasts(id) ON DELETE CASCADE,
    
    -- Alert Configuration
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'high_demand', 'low_demand', 'capacity_exceeded', 'staffing_shortage',
        'accuracy_degradation', 'pattern_anomaly', 'resource_conflict'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Alert Details
    alert_title VARCHAR(300) NOT NULL,
    alert_message TEXT NOT NULL,
    alert_data JSONB DEFAULT '{}',
    
    -- Thresholds
    threshold_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    variance_percentage DECIMAL(5,2),
    
    -- Alert Status
    alert_status VARCHAR(20) DEFAULT 'active' CHECK (alert_status IN (
        'active', 'acknowledged', 'resolved', 'dismissed', 'escalated'
    )),
    
    -- Response Tracking
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    
    -- Notification
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[], -- email, sms, in_app, webhook
    escalation_level INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecast Performance Metrics Table
-- Tracks model performance and validation metrics
CREATE TABLE IF NOT EXISTS forecast_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES demand_forecasting_models(id) ON DELETE CASCADE,
    
    -- Performance Period
    evaluation_date DATE NOT NULL,
    evaluation_period VARCHAR(20) NOT NULL CHECK (evaluation_period IN (
        'daily', 'weekly', 'monthly', 'quarterly'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Accuracy Metrics
    overall_accuracy DECIMAL(5,2) NOT NULL,
    mae DECIMAL(10,4) NOT NULL, -- Mean Absolute Error
    rmse DECIMAL(10,4) NOT NULL, -- Root Mean Square Error
    mape DECIMAL(5,2) NOT NULL, -- Mean Absolute Percentage Error
    
    -- Service-Specific Accuracy
    service_accuracies JSONB DEFAULT '{}', -- {service_id: accuracy}
    time_period_accuracies JSONB DEFAULT '{}', -- {period: accuracy}
    
    -- Forecast Quality
    predictions_made INTEGER DEFAULT 0,
    predictions_validated INTEGER DEFAULT 0,
    validation_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Performance Trends
    accuracy_trend VARCHAR(20) CHECK (accuracy_trend IN ('improving', 'stable', 'declining')),
    trend_percentage DECIMAL(5,2),
    
    -- Comparative Metrics
    baseline_accuracy DECIMAL(5,2), -- Simple baseline comparison
    improvement_over_baseline DECIMAL(5,2),
    
    -- Performance Status
    performance_grade VARCHAR(2) CHECK (performance_grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')),
    meets_sla BOOLEAN DEFAULT FALSE, -- Service Level Agreement
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- INDEXES FOR OPTIMAL PERFORMANCE
-- =================================================================

-- Demand Forecasting Models Indexes
CREATE INDEX IF NOT EXISTS idx_demand_models_clinic_active ON demand_forecasting_models(clinic_id, model_status) WHERE model_status = 'active';
CREATE INDEX IF NOT EXISTS idx_demand_models_service_primary ON demand_forecasting_models(service_type_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_demand_models_accuracy ON demand_forecasting_models(accuracy_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_demand_models_retrain ON demand_forecasting_models(clinic_id, auto_retrain, updated_at) WHERE auto_retrain = true;

-- Demand Forecasts Indexes
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_clinic_date ON demand_forecasts(clinic_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_service_period ON demand_forecasts(service_type_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_status_active ON demand_forecasts(clinic_id, forecast_status) WHERE forecast_status = 'active';
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_alerts ON demand_forecasts(clinic_id, alert_triggered) WHERE alert_triggered = true;
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_professional ON demand_forecasts(professional_id, forecast_date);

-- Demand Patterns Indexes
CREATE INDEX IF NOT EXISTS idx_demand_patterns_clinic_active ON demand_patterns(clinic_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_demand_patterns_service_type ON demand_patterns(service_type_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_demand_patterns_confidence ON demand_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_demand_patterns_effective ON demand_patterns(effective_from, effective_to);

-- Forecast Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_clinic_active ON forecast_alerts(clinic_id, alert_status) WHERE alert_status = 'active';
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_severity ON forecast_alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_type ON forecast_alerts(alert_type, created_at DESC);

-- Forecast Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_model_date ON forecast_performance_metrics(model_id, evaluation_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_clinic_accuracy ON forecast_performance_metrics(clinic_id, overall_accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON forecast_performance_metrics(evaluation_period, period_start);

-- =================================================================
-- ROW LEVEL SECURITY POLICIES
-- =================================================================

-- Enable RLS for all demand forecasting tables
ALTER TABLE demand_forecasting_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Demand Forecasting Models Policies
CREATE POLICY "demand_models_clinic_access" ON demand_forecasting_models
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "demand_models_manage" ON demand_forecasting_models
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'manager', 'analyst')
        )
    );

-- Demand Forecasts Policies
CREATE POLICY "demand_forecasts_clinic_access" ON demand_forecasts
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "demand_forecasts_manage" ON demand_forecasts
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'manager', 'analyst')
        )
    );

-- Demand Patterns Policies
CREATE POLICY "demand_patterns_clinic_access" ON demand_patterns
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "demand_patterns_manage" ON demand_patterns
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'manager', 'analyst')
        )
    );

-- Forecast Alerts Policies
CREATE POLICY "forecast_alerts_clinic_access" ON forecast_alerts
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "forecast_alerts_manage" ON forecast_alerts
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'manager', 'analyst')
        )
    );

-- Forecast Performance Metrics Policies  
CREATE POLICY "performance_metrics_clinic_access" ON forecast_performance_metrics
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "performance_metrics_manage" ON forecast_performance_metrics
    FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'manager', 'analyst')
        )
    );

-- =================================================================
-- FUNCTIONS AND TRIGGERS
-- =================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER trigger_demand_models_updated_at
    BEFORE UPDATE ON demand_forecasting_models
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER trigger_demand_forecasts_updated_at
    BEFORE UPDATE ON demand_forecasts
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER trigger_demand_patterns_updated_at
    BEFORE UPDATE ON demand_patterns
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER trigger_forecast_alerts_updated_at
    BEFORE UPDATE ON forecast_alerts
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- Function to calculate forecast accuracy
CREATE OR REPLACE FUNCTION calculate_forecast_accuracy(
    p_clinic_id UUID,
    p_model_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    model_id UUID,
    overall_accuracy DECIMAL(5,2),
    mae DECIMAL(10,4),
    rmse DECIMAL(10,4),
    mape DECIMAL(5,2),
    predictions_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        df.model_id,
        (100 - AVG(ABS(df.forecast_error))) AS overall_accuracy,
        AVG(ABS(df.predicted_demand - df.actual_demand)) AS mae,
        SQRT(AVG(POWER(df.predicted_demand - df.actual_demand, 2))) AS rmse,
        AVG(ABS((df.predicted_demand - df.actual_demand) / NULLIF(df.actual_demand, 0)) * 100) AS mape,
        COUNT(*)::INTEGER AS predictions_count
    FROM demand_forecasts df
    WHERE df.clinic_id = p_clinic_id
      AND (p_model_id IS NULL OR df.model_id = p_model_id)
      AND (p_start_date IS NULL OR df.forecast_date >= p_start_date)
      AND (p_end_date IS NULL OR df.forecast_date <= p_end_date)
      AND df.actual_demand IS NOT NULL
      AND df.forecast_error IS NOT NULL
    GROUP BY df.model_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- TABLE COMMENTS
-- =================================================================

COMMENT ON TABLE demand_forecasting_models IS 'ML models and configuration for demand prediction with ≥80% accuracy';
COMMENT ON TABLE demand_forecasts IS 'Generated demand predictions with confidence intervals and resource allocation recommendations';
COMMENT ON TABLE demand_patterns IS 'Historical demand patterns for pattern recognition and trend analysis';
COMMENT ON TABLE forecast_alerts IS 'Alerts for demand forecast anomalies, capacity issues, and threshold breaches';
COMMENT ON TABLE forecast_performance_metrics IS 'Model performance tracking and validation metrics for continuous improvement';

-- Grant necessary permissions for the function
GRANT EXECUTE ON FUNCTION calculate_forecast_accuracy TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_set_updated_at TO authenticated;