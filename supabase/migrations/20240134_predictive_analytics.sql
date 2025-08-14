-- Predictive Analytics for Demand Forecasting
-- Migration: 20240134_predictive_analytics.sql
-- Description: ML-based demand forecasting with ≥85% accuracy requirement

-- Forecasting Models table
CREATE TABLE IF NOT EXISTS forecasting_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(100) NOT NULL, -- 'appointment_demand', 'treatment_demand', 'seasonal', 'resource_utilization'
    model_name VARCHAR(200) NOT NULL,
    model_config JSONB NOT NULL DEFAULT '{}', -- Model configuration and parameters
    accuracy_score DECIMAL(5,4) DEFAULT NULL, -- Last calculated accuracy (0.0000 to 1.0000)
    training_data_start_date TIMESTAMP WITH TIME ZONE,
    training_data_end_date TIMESTAMP WITH TIME ZONE,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_prediction TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    model_version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'training', 'deprecated', 'failed'
    metadata JSONB DEFAULT '{}',
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demand Predictions table
CREATE TABLE IF NOT EXISTS demand_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES forecasting_models(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL, -- Date being predicted for
    forecast_period VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    category VARCHAR(100) NOT NULL, -- 'appointments', 'specific_treatment', 'staff_hours', 'equipment_usage'
    subcategory VARCHAR(100), -- Treatment type, equipment type, etc.
    forecast_value DECIMAL(10,2) NOT NULL, -- Predicted demand value
    confidence_interval_lower DECIMAL(10,2),
    confidence_interval_upper DECIMAL(10,2),
    confidence_score DECIMAL(5,4), -- Confidence in prediction (0.0000 to 1.0000)
    external_factors JSONB DEFAULT '{}', -- Weather, holidays, marketing campaigns, etc.
    prediction_metadata JSONB DEFAULT '{}',
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecast Accuracy Tracking table
CREATE TABLE IF NOT EXISTS forecast_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES demand_predictions(id) ON DELETE CASCADE,
    model_id UUID REFERENCES forecasting_models(id) ON DELETE CASCADE,
    actual_value DECIMAL(10,2) NOT NULL, -- Actual observed value
    accuracy_score DECIMAL(5,4) NOT NULL, -- Accuracy for this specific prediction
    absolute_error DECIMAL(10,2), -- |predicted - actual|
    percentage_error DECIMAL(8,4), -- ((predicted - actual) / actual) * 100
    evaluation_date DATE NOT NULL, -- Date when accuracy was calculated
    evaluation_notes TEXT,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demand Alerts table
CREATE TABLE IF NOT EXISTS demand_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL, -- 'demand_spike', 'capacity_constraint', 'anomaly_detected', 'low_accuracy'
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    prediction_data JSONB NOT NULL DEFAULT '{}', -- Related prediction information
    threshold_exceeded JSONB, -- What threshold was exceeded
    recommended_actions JSONB DEFAULT '[]', -- Suggested actions to take
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'dismissed'
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecasting Settings table
CREATE TABLE IF NOT EXISTS forecasting_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
    accuracy_threshold DECIMAL(5,4) DEFAULT 0.8500, -- Minimum acceptable accuracy (85%)
    retraining_frequency_days INTEGER DEFAULT 30, -- How often to retrain models
    prediction_horizon_days INTEGER DEFAULT 90, -- How far ahead to predict
    alert_thresholds JSONB DEFAULT '{}', -- Thresholds for different alert types
    model_preferences JSONB DEFAULT '{}', -- Preferred models and configurations
    external_data_sources JSONB DEFAULT '{}', -- Weather APIs, holiday calendars, etc.
    auto_retrain_enabled BOOLEAN DEFAULT TRUE,
    auto_alerts_enabled BOOLEAN DEFAULT TRUE,
    settings_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Training History table
CREATE TABLE IF NOT EXISTS model_training_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES forecasting_models(id) ON DELETE CASCADE,
    training_start TIMESTAMP WITH TIME ZONE NOT NULL,
    training_end TIMESTAMP WITH TIME ZONE,
    training_status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    training_accuracy DECIMAL(5,4), -- Accuracy achieved during training
    validation_accuracy DECIMAL(5,4), -- Accuracy on validation set
    training_data_size INTEGER, -- Number of data points used for training
    training_parameters JSONB DEFAULT '{}', -- Hyperparameters used
    training_metrics JSONB DEFAULT '{}', -- Detailed training metrics
    error_message TEXT, -- If training failed
    model_artifacts JSONB DEFAULT '{}', -- Links to saved model files
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Optimization Recommendations table
CREATE TABLE IF NOT EXISTS resource_optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_type VARCHAR(100) NOT NULL, -- 'staff_scheduling', 'equipment_allocation', 'capacity_planning'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    prediction_basis JSONB NOT NULL, -- Which predictions this is based on
    recommended_changes JSONB NOT NULL, -- Specific recommendations
    estimated_impact JSONB DEFAULT '{}', -- Cost savings, efficiency gains, etc.
    implementation_timeline VARCHAR(100), -- When to implement
    implementation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'implemented', 'rejected'
    cost_benefit_analysis JSONB DEFAULT '{}',
    implementation_notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    implemented_by UUID REFERENCES users(id),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_forecasting_models_clinic_type ON forecasting_models(clinic_id, model_type);
CREATE INDEX IF NOT EXISTS idx_forecasting_models_status ON forecasting_models(status);
CREATE INDEX IF NOT EXISTS idx_forecasting_models_accuracy ON forecasting_models(accuracy_score DESC);

CREATE INDEX IF NOT EXISTS idx_demand_predictions_clinic_date ON demand_predictions(clinic_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_model_category ON demand_predictions(model_id, category);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_date_period ON demand_predictions(prediction_date, forecast_period);

CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_model ON forecast_accuracy(model_id);
CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_evaluation_date ON forecast_accuracy(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_score ON forecast_accuracy(accuracy_score DESC);

CREATE INDEX IF NOT EXISTS idx_demand_alerts_clinic_type ON demand_alerts(clinic_id, alert_type);
CREATE INDEX IF NOT EXISTS idx_demand_alerts_severity_status ON demand_alerts(severity, resolution_status);
CREATE INDEX IF NOT EXISTS idx_demand_alerts_date ON demand_alerts(alert_date DESC);

CREATE INDEX IF NOT EXISTS idx_forecasting_settings_clinic ON forecasting_settings(clinic_id);

CREATE INDEX IF NOT EXISTS idx_model_training_history_model ON model_training_history(model_id);
CREATE INDEX IF NOT EXISTS idx_model_training_history_status ON model_training_history(training_status);
CREATE INDEX IF NOT EXISTS idx_model_training_history_date ON model_training_history(training_start DESC);

CREATE INDEX IF NOT EXISTS idx_resource_optimization_clinic_status ON resource_optimization_recommendations(clinic_id, implementation_status);
CREATE INDEX IF NOT EXISTS idx_resource_optimization_priority ON resource_optimization_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_resource_optimization_type ON resource_optimization_recommendations(recommendation_type);

-- RLS Policies for data security
ALTER TABLE forecasting_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access data from their clinic)
CREATE POLICY "Users can view forecasting models from their clinic" ON forecasting_models
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view demand predictions from their clinic" ON demand_predictions
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view forecast accuracy from their clinic" ON forecast_accuracy
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view demand alerts from their clinic" ON demand_alerts
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view forecasting settings from their clinic" ON forecasting_settings
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view model training history from their clinic" ON model_training_history
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view resource optimization recommendations from their clinic" ON resource_optimization_recommendations
    FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid()));

-- Admins can manage all forecasting data for their clinic
CREATE POLICY "Admins can manage forecasting models" ON forecasting_models
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage demand predictions" ON demand_predictions
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage forecast accuracy" ON forecast_accuracy
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage demand alerts" ON demand_alerts
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage forecasting settings" ON forecasting_settings
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage model training history" ON model_training_history
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

CREATE POLICY "Admins can manage resource optimization recommendations" ON resource_optimization_recommendations
    FOR ALL USING (clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));

-- Functions for automatic accuracy calculation
CREATE OR REPLACE FUNCTION calculate_forecast_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate accuracy when actual value is recorded
    UPDATE forecast_accuracy 
    SET 
        absolute_error = ABS(NEW.actual_value - (
            SELECT forecast_value FROM demand_predictions WHERE id = NEW.prediction_id
        )),
        percentage_error = CASE 
            WHEN NEW.actual_value = 0 THEN 0
            ELSE (((SELECT forecast_value FROM demand_predictions WHERE id = NEW.prediction_id) - NEW.actual_value) / NEW.actual_value) * 100
        END,
        accuracy_score = CASE 
            WHEN NEW.actual_value = 0 THEN 
                CASE WHEN (SELECT forecast_value FROM demand_predictions WHERE id = NEW.prediction_id) = 0 THEN 1.0000 ELSE 0.0000 END
            ELSE 1.0000 - (ABS(NEW.actual_value - (SELECT forecast_value FROM demand_predictions WHERE id = NEW.prediction_id)) / NEW.actual_value)
        END
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_accuracy
    AFTER INSERT OR UPDATE ON forecast_accuracy
    FOR EACH ROW
    EXECUTE FUNCTION calculate_forecast_accuracy();

-- Function to update model accuracy based on recent predictions
CREATE OR REPLACE FUNCTION update_model_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update overall model accuracy based on recent accuracy scores
    UPDATE forecasting_models 
    SET 
        accuracy_score = (
            SELECT AVG(accuracy_score) 
            FROM forecast_accuracy 
            WHERE model_id = NEW.model_id 
            AND evaluation_date >= CURRENT_DATE - INTERVAL '30 days'
        ),
        updated_at = NOW()
    WHERE id = NEW.model_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_model_accuracy
    AFTER INSERT OR UPDATE ON forecast_accuracy
    FOR EACH ROW
    EXECUTE FUNCTION update_model_accuracy();

-- Function to create alerts for low accuracy
CREATE OR REPLACE FUNCTION check_accuracy_threshold()
RETURNS TRIGGER AS $$
DECLARE
    threshold DECIMAL(5,4);
    model_name VARCHAR(200);
BEGIN
    -- Get accuracy threshold for the clinic
    SELECT accuracy_threshold INTO threshold
    FROM forecasting_settings 
    WHERE clinic_id = NEW.clinic_id;
    
    -- Get model name
    SELECT forecasting_models.model_name INTO model_name
    FROM forecasting_models
    WHERE id = NEW.model_id;
    
    -- Create alert if accuracy drops below threshold
    IF NEW.accuracy_score IS NOT NULL AND NEW.accuracy_score < COALESCE(threshold, 0.8500) THEN
        INSERT INTO demand_alerts (
            alert_type,
            severity,
            title,
            description,
            prediction_data,
            clinic_id
        ) VALUES (
            'low_accuracy',
            CASE 
                WHEN NEW.accuracy_score < 0.7000 THEN 'high'
                WHEN NEW.accuracy_score < 0.8000 THEN 'medium'
                ELSE 'low'
            END,
            'Model Accuracy Below Threshold',
            'Model "' || model_name || '" has accuracy of ' || (NEW.accuracy_score * 100)::text || '% which is below the required threshold of ' || (threshold * 100)::text || '%',
            jsonb_build_object('model_id', NEW.model_id, 'accuracy_score', NEW.accuracy_score, 'threshold', threshold),
            NEW.clinic_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_accuracy_threshold
    AFTER INSERT OR UPDATE ON forecasting_models
    FOR EACH ROW
    EXECUTE FUNCTION check_accuracy_threshold();

-- Comments for documentation
COMMENT ON TABLE forecasting_models IS 'Machine learning models for demand forecasting with accuracy tracking';
COMMENT ON TABLE demand_predictions IS 'Forecasted demand values with confidence intervals';
COMMENT ON TABLE forecast_accuracy IS 'Accuracy tracking for predictions vs actual outcomes';
COMMENT ON TABLE demand_alerts IS 'Alerts for demand spikes, capacity constraints, and model performance';
COMMENT ON TABLE forecasting_settings IS 'Configuration settings for forecasting system per clinic';
COMMENT ON TABLE model_training_history IS 'History of model training sessions and performance';
COMMENT ON TABLE resource_optimization_recommendations IS 'AI-generated recommendations for resource optimization';
