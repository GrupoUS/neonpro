-- Migration: Patient Retention Analytics + Predictions System
-- Story 7.4: Advanced patient retention analytics with predictive modeling
-- Date: 2024-01-31

-- Enable necessary extensions for analytics and ML
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Patient Retention Analytics Tables
CREATE TABLE patient_retention_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    retention_score DECIMAL(5,4) NOT NULL CHECK (retention_score >= 0 AND retention_score <= 1),
    churn_risk_level TEXT NOT NULL CHECK (churn_risk_level IN ('low', 'medium', 'high', 'critical')),
    churn_probability DECIMAL(5,4) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
    lifetime_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    predicted_ltv DECIMAL(12,2) NOT NULL DEFAULT 0,
    retention_segment TEXT NOT NULL DEFAULT 'standard',
    last_visit_date TIMESTAMP WITH TIME ZONE,
    visit_frequency_score DECIMAL(5,4) DEFAULT 0,
    engagement_score DECIMAL(5,4) DEFAULT 0,
    satisfaction_score DECIMAL(5,4) DEFAULT 0,
    financial_score DECIMAL(5,4) DEFAULT 0,
    risk_factors JSONB DEFAULT '[]',
    retention_interventions JSONB DEFAULT '[]',
    calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    confidence_level DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Metrics Tracking
CREATE TABLE retention_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cohort_month DATE NOT NULL,
    total_patients INTEGER NOT NULL DEFAULT 0,
    retained_patients INTEGER NOT NULL DEFAULT 0,
    churned_patients INTEGER NOT NULL DEFAULT 0,
    new_patients INTEGER NOT NULL DEFAULT 0,
    retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    churn_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    net_retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    revenue_retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    patient_ltv_avg DECIMAL(12,2) NOT NULL DEFAULT 0,
    acquisition_cost_avg DECIMAL(12,2) NOT NULL DEFAULT 0,
    roi_score DECIMAL(10,4) NOT NULL DEFAULT 0,
    benchmark_score DECIMAL(5,4) DEFAULT 0,
    improvement_percentage DECIMAL(5,4) DEFAULT 0,
    target_retention_rate DECIMAL(5,4) DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Churn Predictions
CREATE TABLE patient_churn_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    churn_probability DECIMAL(5,4) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
    risk_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    predicted_churn_date DATE,
    contributing_factors JSONB DEFAULT '[]',
    intervention_recommendations JSONB DEFAULT '[]',
    model_features JSONB DEFAULT '{}',
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    confidence_score DECIMAL(5,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'disputed')),
    actual_outcome TEXT CHECK (actual_outcome IN ('retained', 'churned', 'unknown')),
    outcome_date DATE,
    prediction_accuracy DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Interventions
CREATE TABLE retention_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES patient_churn_predictions(id) ON DELETE SET NULL,
    intervention_type TEXT NOT NULL,
    intervention_description TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'phone', 'in_person', 'push')),
    personalization_data JSONB DEFAULT '{}',
    trigger_conditions JSONB DEFAULT '{}',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    executed_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'responded', 'failed')),
    response_data JSONB DEFAULT '{}',
    effectiveness_score DECIMAL(5,4),
    cost DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(10,4),
    campaign_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Campaign Analytics
CREATE TABLE retention_campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL,
    target_segment TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    clicked_count INTEGER NOT NULL DEFAULT 0,
    responded_count INTEGER NOT NULL DEFAULT 0,
    converted_count INTEGER NOT NULL DEFAULT 0,
    delivery_rate DECIMAL(5,4) DEFAULT 0,
    open_rate DECIMAL(5,4) DEFAULT 0,
    click_rate DECIMAL(5,4) DEFAULT 0,
    response_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    retention_improvement DECIMAL(5,4) DEFAULT 0,
    cost_per_retention DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(10,4) DEFAULT 0,
    campaign_start_date TIMESTAMP WITH TIME ZONE,
    campaign_end_date TIMESTAMP WITH TIME ZONE,
    benchmark_comparison JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Lifetime Value Calculations
CREATE TABLE patient_lifetime_value (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    historical_ltv DECIMAL(12,2) NOT NULL DEFAULT 0,
    predicted_ltv DECIMAL(12,2) NOT NULL DEFAULT 0,
    ltv_segment TEXT NOT NULL DEFAULT 'standard',
    average_order_value DECIMAL(10,2) DEFAULT 0,
    purchase_frequency DECIMAL(5,2) DEFAULT 0,
    customer_lifespan_months DECIMAL(5,2) DEFAULT 0,
    retention_probability DECIMAL(5,4) DEFAULT 0,
    growth_potential DECIMAL(5,4) DEFAULT 0,
    acquisition_cost DECIMAL(10,2) DEFAULT 0,
    ltv_to_cac_ratio DECIMAL(5,2) DEFAULT 0,
    revenue_contribution DECIMAL(12,2) DEFAULT 0,
    profit_margin DECIMAL(5,4) DEFAULT 0,
    risk_adjusted_ltv DECIMAL(12,2) DEFAULT 0,
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    confidence_level DECIMAL(5,4) DEFAULT 0,
    calculation_method TEXT DEFAULT 'predictive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Model Performance
CREATE TABLE retention_model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('churn_prediction', 'ltv_prediction', 'retention_scoring')),
    training_date TIMESTAMP WITH TIME ZONE NOT NULL,
    validation_date TIMESTAMP WITH TIME ZONE,
    accuracy_score DECIMAL(5,4) DEFAULT 0,
    precision_score DECIMAL(5,4) DEFAULT 0,
    recall_score DECIMAL(5,4) DEFAULT 0,
    f1_score DECIMAL(5,4) DEFAULT 0,
    auc_score DECIMAL(5,4) DEFAULT 0,
    feature_importance JSONB DEFAULT '{}',
    model_parameters JSONB DEFAULT '{}',
    training_data_size INTEGER DEFAULT 0,
    validation_data_size INTEGER DEFAULT 0,
    cross_validation_scores JSONB DEFAULT '[]',
    performance_trends JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    deployment_status TEXT DEFAULT 'testing' CHECK (deployment_status IN ('development', 'testing', 'production', 'deprecated')),
    performance_threshold DECIMAL(5,4) DEFAULT 0.7,
    monitoring_alerts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Benchmarks
CREATE TABLE retention_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_segment TEXT NOT NULL DEFAULT 'healthcare',
    benchmark_type TEXT NOT NULL CHECK (benchmark_type IN ('retention_rate', 'churn_rate', 'ltv', 'intervention_effectiveness')),
    benchmark_value DECIMAL(10,4) NOT NULL,
    percentile_rank DECIMAL(5,2) NOT NULL CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
    data_source TEXT NOT NULL,
    sample_size INTEGER,
    geographic_region TEXT DEFAULT 'brazil',
    clinic_size_category TEXT CHECK (clinic_size_category IN ('small', 'medium', 'large', 'enterprise')),
    specialty_focus TEXT,
    benchmark_period TEXT NOT NULL,
    confidence_interval JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_patient_retention_analytics_patient_id ON patient_retention_analytics(patient_id);
CREATE INDEX idx_patient_retention_analytics_churn_risk ON patient_retention_analytics(churn_risk_level);
CREATE INDEX idx_patient_retention_analytics_retention_score ON patient_retention_analytics(retention_score);
CREATE INDEX idx_patient_retention_analytics_calculation_date ON patient_retention_analytics(calculation_date);

CREATE INDEX idx_retention_metrics_clinic_period ON retention_metrics(clinic_id, period_start, period_end);
CREATE INDEX idx_retention_metrics_cohort ON retention_metrics(cohort_month);
CREATE INDEX idx_retention_metrics_retention_rate ON retention_metrics(retention_rate);

CREATE INDEX idx_patient_churn_predictions_patient_id ON patient_churn_predictions(patient_id);
CREATE INDEX idx_patient_churn_predictions_probability ON patient_churn_predictions(churn_probability);
CREATE INDEX idx_patient_churn_predictions_risk_level ON patient_churn_predictions(risk_level);
CREATE INDEX idx_patient_churn_predictions_date ON patient_churn_predictions(prediction_date);
CREATE INDEX idx_patient_churn_predictions_active ON patient_churn_predictions(is_active) WHERE is_active = true;

CREATE INDEX idx_retention_interventions_patient_id ON retention_interventions(patient_id);
CREATE INDEX idx_retention_interventions_status ON retention_interventions(status);
CREATE INDEX idx_retention_interventions_type ON retention_interventions(intervention_type);
CREATE INDEX idx_retention_interventions_scheduled ON retention_interventions(scheduled_date);

CREATE INDEX idx_retention_campaign_analytics_campaign ON retention_campaign_analytics(campaign_id);
CREATE INDEX idx_retention_campaign_analytics_type ON retention_campaign_analytics(campaign_type);
CREATE INDEX idx_retention_campaign_analytics_conversion ON retention_campaign_analytics(conversion_rate);

CREATE INDEX idx_patient_lifetime_value_patient_id ON patient_lifetime_value(patient_id);
CREATE INDEX idx_patient_lifetime_value_ltv ON patient_lifetime_value(predicted_ltv);
CREATE INDEX idx_patient_lifetime_value_segment ON patient_lifetime_value(ltv_segment);
CREATE INDEX idx_patient_lifetime_value_calculation_date ON patient_lifetime_value(calculation_date);

CREATE INDEX idx_retention_model_performance_model ON retention_model_performance(model_name, model_version);
CREATE INDEX idx_retention_model_performance_type ON retention_model_performance(model_type);
CREATE INDEX idx_retention_model_performance_active ON retention_model_performance(is_active) WHERE is_active = true;
CREATE INDEX idx_retention_model_performance_accuracy ON retention_model_performance(accuracy_score);

CREATE INDEX idx_retention_benchmarks_type ON retention_benchmarks(benchmark_type);
CREATE INDEX idx_retention_benchmarks_industry ON retention_benchmarks(industry_segment);
CREATE INDEX idx_retention_benchmarks_active ON retention_benchmarks(is_active) WHERE is_active = true;

-- GIN indexes for JSONB columns
CREATE INDEX idx_patient_retention_analytics_risk_factors ON patient_retention_analytics USING GIN (risk_factors);
CREATE INDEX idx_patient_retention_analytics_interventions ON patient_retention_analytics USING GIN (retention_interventions);
CREATE INDEX idx_patient_churn_predictions_factors ON patient_churn_predictions USING GIN (contributing_factors);
CREATE INDEX idx_patient_churn_predictions_recommendations ON patient_churn_predictions USING GIN (intervention_recommendations);
CREATE INDEX idx_retention_interventions_personalization ON retention_interventions USING GIN (personalization_data);
CREATE INDEX idx_retention_campaign_analytics_metrics ON retention_campaign_analytics USING GIN (performance_metrics);

-- RLS Policies for data security
ALTER TABLE patient_retention_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_lifetime_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_benchmarks ENABLE ROW LEVEL SECURITY;

-- Audit trail triggers
CREATE OR REPLACE FUNCTION update_retention_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_retention_analytics_updated_at
    BEFORE UPDATE ON patient_retention_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_retention_metrics_updated_at
    BEFORE UPDATE ON retention_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_patient_churn_predictions_updated_at
    BEFORE UPDATE ON patient_churn_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_retention_interventions_updated_at
    BEFORE UPDATE ON retention_interventions
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_retention_campaign_analytics_updated_at
    BEFORE UPDATE ON retention_campaign_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_patient_lifetime_value_updated_at
    BEFORE UPDATE ON patient_lifetime_value
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

CREATE TRIGGER update_retention_model_performance_updated_at
    BEFORE UPDATE ON retention_model_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_retention_analytics_updated_at();

-- Comments for documentation
COMMENT ON TABLE patient_retention_analytics IS 'Comprehensive patient retention analytics and scoring';
COMMENT ON TABLE retention_metrics IS 'Clinic-wide retention metrics and performance tracking';
COMMENT ON TABLE patient_churn_predictions IS 'ML-powered patient churn predictions and risk scoring';
COMMENT ON TABLE retention_interventions IS 'Automated retention interventions and campaigns';
COMMENT ON TABLE retention_campaign_analytics IS 'Retention campaign performance and effectiveness analysis';
COMMENT ON TABLE patient_lifetime_value IS 'Patient lifetime value calculations and predictions';
COMMENT ON TABLE retention_model_performance IS 'ML model performance tracking and monitoring';
COMMENT ON TABLE retention_benchmarks IS 'Industry benchmarks for retention metrics comparison';
