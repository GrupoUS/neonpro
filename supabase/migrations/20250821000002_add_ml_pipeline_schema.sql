-- Migration: Add ML Pipeline Schema
-- Description: Creates tables for ML model management, A/B testing, and drift detection
-- Author: NeonPro AI Development Team
-- Date: 2025-08-21
-- Version: 1.0.0

-- =============================================================================
-- AI MODELS TABLE
-- =============================================================================

CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  accuracy FLOAT NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  precision FLOAT NOT NULL CHECK (precision >= 0 AND precision <= 1),
  recall FLOAT NOT NULL CHECK (recall >= 0 AND recall <= 1),
  f1_score FLOAT NOT NULL CHECK (f1_score >= 0 AND f1_score <= 1),
  status TEXT NOT NULL CHECK (status IN ('training', 'active', 'retired', 'archived')),
  deployment_date TIMESTAMP WITH TIME ZONE,
  retired_date TIMESTAMP WITH TIME ZONE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique model name/version per clinic
  UNIQUE(clinic_id, model_name, version)
);

-- Indexes for ai_models
CREATE INDEX idx_ai_models_clinic_id ON ai_models(clinic_id);
CREATE INDEX idx_ai_models_status ON ai_models(status);
CREATE INDEX idx_ai_models_name_version ON ai_models(model_name, version);
CREATE INDEX idx_ai_models_deployment_date ON ai_models(deployment_date DESC);
CREATE INDEX idx_ai_models_accuracy ON ai_models(accuracy DESC);

-- RLS Policies for ai_models
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_models_clinic_access" ON ai_models
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- A/B TESTS TABLE
-- =============================================================================

CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  model_a_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  model_b_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'paused', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  traffic_split FLOAT NOT NULL CHECK (traffic_split >= 0 AND traffic_split <= 1),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  description TEXT,
  success_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure model A and B are different
  CHECK (model_a_id != model_b_id),
  -- Ensure end_date is after start_date
  CHECK (end_date IS NULL OR end_date > start_date)
);

-- Indexes for ab_tests
CREATE INDEX idx_ab_tests_clinic_id ON ab_tests(clinic_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_start_date ON ab_tests(start_date DESC);
CREATE INDEX idx_ab_tests_models ON ab_tests(model_a_id, model_b_id);

-- RLS Policies for ab_tests
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_tests_clinic_access" ON ab_tests
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- A/B TEST RESULTS TABLE
-- =============================================================================

CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  sample_size INTEGER NOT NULL CHECK (sample_size > 0),
  accuracy FLOAT NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  precision FLOAT NOT NULL CHECK (precision >= 0 AND precision <= 1),
  recall FLOAT NOT NULL CHECK (recall >= 0 AND recall <= 1),
  f1_score FLOAT NOT NULL CHECK (f1_score >= 0 AND f1_score <= 1),
  confidence_interval JSONB NOT NULL DEFAULT '{}'::jsonb,
  statistical_significance BOOLEAN NOT NULL DEFAULT false,
  p_value FLOAT CHECK (p_value >= 0 AND p_value <= 1),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  evaluation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ab_test_results
CREATE INDEX idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX idx_ab_test_results_model_id ON ab_test_results(model_id);
CREATE INDEX idx_ab_test_results_clinic_id ON ab_test_results(clinic_id);
CREATE INDEX idx_ab_test_results_evaluation_date ON ab_test_results(evaluation_date DESC);

-- RLS Policies for ab_test_results
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_test_results_clinic_access" ON ab_test_results
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- DRIFT DETECTION TABLE
-- =============================================================================

CREATE TABLE drift_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  drift_type TEXT NOT NULL CHECK (drift_type IN ('data', 'prediction', 'performance')),
  detection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  drift_score FLOAT NOT NULL CHECK (drift_score >= 0),
  threshold FLOAT NOT NULL CHECK (threshold >= 0),
  status TEXT NOT NULL CHECK (status IN ('detected', 'investigating', 'resolved', 'false_positive')),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  affected_metrics TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for drift_detections
CREATE INDEX idx_drift_detections_model_id ON drift_detections(model_id);
CREATE INDEX idx_drift_detections_clinic_id ON drift_detections(clinic_id);
CREATE INDEX idx_drift_detections_detection_date ON drift_detections(detection_date DESC);
CREATE INDEX idx_drift_detections_severity ON drift_detections(severity);
CREATE INDEX idx_drift_detections_status ON drift_detections(status);
CREATE INDEX idx_drift_detections_drift_type ON drift_detections(drift_type);

-- RLS Policies for drift_detections
ALTER TABLE drift_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drift_detections_clinic_access" ON drift_detections
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- PATIENT ANALYTICS TABLE
-- =============================================================================

CREATE TABLE patient_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  analytics_type TEXT NOT NULL CHECK (
    analytics_type IN ('no_show_risk', 'treatment_adherence', 'health_score', 'engagement_level')
  ),
  computed_value FLOAT NOT NULL,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_id UUID REFERENCES ai_models(id),
  computation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  features_used JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient_analytics
CREATE INDEX idx_patient_analytics_patient_id ON patient_analytics(patient_id);
CREATE INDEX idx_patient_analytics_clinic_id ON patient_analytics(clinic_id);
CREATE INDEX idx_patient_analytics_type ON patient_analytics(analytics_type);
CREATE INDEX idx_patient_analytics_model_id ON patient_analytics(model_id);
CREATE INDEX idx_patient_analytics_computation_date ON patient_analytics(computation_date DESC);
CREATE INDEX idx_patient_analytics_expires_at ON patient_analytics(expires_at);

-- RLS Policies for patient_analytics
ALTER TABLE patient_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_analytics_clinic_access" ON patient_analytics
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- ML PIPELINE CONFIGURATION TABLE
-- =============================================================================

CREATE TABLE ml_pipeline_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  drift_detection_threshold FLOAT NOT NULL DEFAULT 0.1 CHECK (drift_detection_threshold >= 0),
  model_performance_threshold FLOAT NOT NULL DEFAULT 0.8 CHECK (model_performance_threshold >= 0 AND model_performance_threshold <= 1),
  ab_test_min_sample_size INTEGER NOT NULL DEFAULT 100 CHECK (ab_test_min_sample_size > 0),
  ab_test_significance_level FLOAT NOT NULL DEFAULT 0.05 CHECK (ab_test_significance_level > 0 AND ab_test_significance_level < 1),
  auto_retrain_enabled BOOLEAN NOT NULL DEFAULT false,
  model_retention_days INTEGER NOT NULL DEFAULT 365 CHECK (model_retention_days > 0),
  notification_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ml_pipeline_configs
CREATE INDEX idx_ml_pipeline_configs_clinic_id ON ml_pipeline_configs(clinic_id);

-- RLS Policies for ml_pipeline_configs
ALTER TABLE ml_pipeline_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_pipeline_configs_clinic_access" ON ml_pipeline_configs
FOR ALL USING (
  clinic_id = (auth.jwt() ->> 'clinic_id')::UUID OR
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_test_results_updated_at BEFORE UPDATE ON ab_test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drift_detections_updated_at BEFORE UPDATE ON drift_detections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_analytics_updated_at BEFORE UPDATE ON patient_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_pipeline_configs_updated_at BEFORE UPDATE ON ml_pipeline_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired analytics
CREATE OR REPLACE FUNCTION cleanup_expired_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM patient_analytics 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO ai_audit_trail (
    operation_id, 
    service_name, 
    operation_type, 
    status, 
    output_data, 
    timestamp
  ) VALUES (
    'cleanup-analytics-' || extract(epoch from now())::text,
    'ml_pipeline_cleanup',
    'data_processing',
    'completed',
    jsonb_build_object('deleted_count', deleted_count),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get active model for clinic
CREATE OR REPLACE FUNCTION get_active_model(clinic_uuid UUID, model_name_param TEXT DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  model_name TEXT,
  version TEXT,
  accuracy FLOAT,
  deployment_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.model_name,
    m.version,
    m.accuracy,
    m.deployment_date
  FROM ai_models m
  WHERE m.clinic_id = clinic_uuid 
  AND m.status = 'active'
  AND (model_name_param IS NULL OR m.model_name = model_name_param)
  ORDER BY m.deployment_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate model performance over time
CREATE OR REPLACE FUNCTION calculate_model_performance(
  model_uuid UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  total_predictions BIGINT,
  avg_accuracy FLOAT,
  avg_confidence FLOAT,
  performance_trend TEXT
) AS $$
DECLARE
  current_period_accuracy FLOAT;
  previous_period_accuracy FLOAT;
BEGIN
  -- Get current period performance
  SELECT AVG(ap.prediction_confidence), COUNT(*)
  INTO current_period_accuracy, total_predictions
  FROM appointment_predictions ap
  WHERE ap.model_version = (SELECT version FROM ai_models WHERE id = model_uuid)
  AND ap.created_at BETWEEN start_date AND end_date;
  
  -- Get previous period for trend analysis
  SELECT AVG(ap.prediction_confidence)
  INTO previous_period_accuracy
  FROM appointment_predictions ap
  WHERE ap.model_version = (SELECT version FROM ai_models WHERE id = model_uuid)
  AND ap.created_at BETWEEN (start_date - (end_date - start_date)) AND start_date;
  
  -- Determine trend
  performance_trend := CASE
    WHEN previous_period_accuracy IS NULL THEN 'insufficient_data'
    WHEN current_period_accuracy > previous_period_accuracy + 0.05 THEN 'improving'
    WHEN current_period_accuracy < previous_period_accuracy - 0.05 THEN 'degrading'
    ELSE 'stable'
  END;
  
  avg_accuracy := current_period_accuracy;
  avg_confidence := current_period_accuracy; -- Simplified for now
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR ML PIPELINE ANALYTICS
-- =============================================================================

-- Model Performance Summary View
CREATE VIEW ml_model_performance AS
SELECT 
  m.id,
  m.model_name,
  m.version,
  m.clinic_id,
  m.status,
  m.accuracy as baseline_accuracy,
  m.deployment_date,
  COUNT(ap.id) as predictions_count,
  AVG(ap.prediction_confidence) as avg_confidence,
  COUNT(ap.id) FILTER (WHERE ap.actual_outcome IS NOT NULL) as predictions_with_outcome,
  COUNT(ap.id) FILTER (WHERE 
    (ap.risk_score > 70 AND ap.actual_outcome = 'no_show') OR
    (ap.risk_score <= 70 AND ap.actual_outcome = 'attended')
  ) as accurate_predictions
FROM ai_models m
LEFT JOIN appointment_predictions ap ON ap.model_version = m.version
WHERE m.created_at >= NOW() - INTERVAL '90 days'
GROUP BY m.id, m.model_name, m.version, m.clinic_id, m.status, m.accuracy, m.deployment_date
ORDER BY m.deployment_date DESC;

-- A/B Test Summary View
CREATE VIEW ab_test_summary AS
SELECT
  t.id,
  t.test_name,
  t.status,
  t.start_date,
  t.end_date,
  t.traffic_split,
  t.clinic_id,
  ma.model_name as model_a_name,
  ma.version as model_a_version,
  mb.model_name as model_b_name,
  mb.version as model_b_version,
  COUNT(ra.id) as model_a_results,
  COUNT(rb.id) as model_b_results,
  AVG(ra.accuracy) as model_a_avg_accuracy,
  AVG(rb.accuracy) as model_b_avg_accuracy
FROM ab_tests t
LEFT JOIN ai_models ma ON ma.id = t.model_a_id
LEFT JOIN ai_models mb ON mb.id = t.model_b_id
LEFT JOIN ab_test_results ra ON ra.test_id = t.id AND ra.model_id = t.model_a_id
LEFT JOIN ab_test_results rb ON rb.test_id = t.id AND rb.model_id = t.model_b_id
GROUP BY t.id, t.test_name, t.status, t.start_date, t.end_date, t.traffic_split, t.clinic_id,
         ma.model_name, ma.version, mb.model_name, mb.version
ORDER BY t.start_date DESC;

-- Drift Detection Summary View
CREATE VIEW drift_detection_summary AS
SELECT
  d.id,
  d.model_id,
  m.model_name,
  m.version,
  d.drift_type,
  d.severity,
  d.drift_score,
  d.status,
  d.detection_date,
  d.clinic_id,
  ARRAY_LENGTH(d.affected_metrics, 1) as affected_metrics_count
FROM drift_detections d
JOIN ai_models m ON m.id = d.model_id
WHERE d.detection_date >= NOW() - INTERVAL '90 days'
ORDER BY d.detection_date DESC;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant appropriate permissions to service roles
GRANT SELECT, INSERT, UPDATE ON ai_models TO service_role;
GRANT SELECT, INSERT, UPDATE ON ab_tests TO service_role;
GRANT SELECT, INSERT, UPDATE ON ab_test_results TO service_role;
GRANT SELECT, INSERT, UPDATE ON drift_detections TO service_role;
GRANT SELECT, INSERT, UPDATE ON patient_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE ON ml_pipeline_configs TO service_role;

-- Grant read access to ML analytics views
GRANT SELECT ON ml_model_performance TO service_role;
GRANT SELECT ON ab_test_summary TO service_role;
GRANT SELECT ON drift_detection_summary TO service_role;

-- =============================================================================
-- INSERT DEFAULT CONFIGURATIONS
-- =============================================================================

-- This will be populated per clinic during setup
-- INSERT INTO ml_pipeline_configs (clinic_id) 
-- SELECT id FROM clinics WHERE id NOT IN (SELECT clinic_id FROM ml_pipeline_configs);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE ai_models IS 'ML model versions with performance metrics and lifecycle management';
COMMENT ON TABLE ab_tests IS 'A/B testing configuration for comparing model performance';
COMMENT ON TABLE ab_test_results IS 'Results and metrics from A/B testing experiments';
COMMENT ON TABLE drift_detections IS 'Detection and tracking of model drift incidents';
COMMENT ON TABLE patient_analytics IS 'Patient-specific analytics computed by ML models';
COMMENT ON TABLE ml_pipeline_configs IS 'Per-clinic configuration for ML pipeline behavior';

COMMENT ON VIEW ml_model_performance IS 'Aggregated performance metrics for all models';
COMMENT ON VIEW ab_test_summary IS 'Summary of A/B tests with model comparison metrics';
COMMENT ON VIEW drift_detection_summary IS 'Summary of drift detection incidents and status';

-- Migration complete
SELECT 'ML Pipeline Schema Migration Completed Successfully' as status;