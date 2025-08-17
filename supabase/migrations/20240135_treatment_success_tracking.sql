-- Migration: Treatment Success Rate Tracking & Optimization
-- Description: Comprehensive treatment success rate tracking with optimization recommendations

-- Treatment Success Tracking
CREATE TABLE treatment_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id),
    treatment_id UUID NOT NULL,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    treatment_type VARCHAR(100) NOT NULL,
    treatment_date DATE NOT NULL,
    outcome_date DATE,
    success_score DECIMAL(3,2) CHECK (success_score >= 0 AND success_score <= 1),
    success_criteria JSONB NOT NULL,
    actual_outcomes JSONB,
    before_photos TEXT[],
    after_photos TEXT[],
    patient_satisfaction_score DECIMAL(3,2) CHECK (patient_satisfaction_score >= 0 AND patient_satisfaction_score <= 1),
    complications JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Success Rate Metrics
CREATE TABLE success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_type VARCHAR(100) NOT NULL,
    provider_id UUID REFERENCES auth.users(id),
    time_period VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_treatments INTEGER NOT NULL DEFAULT 0,
    successful_treatments INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,4) CHECK (success_rate >= 0 AND success_rate <= 1),
    average_satisfaction DECIMAL(3,2),
    complication_rate DECIMAL(5,4),
    benchmarks JSONB,
    industry_comparison JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(treatment_type, provider_id, time_period, period_start)
);

-- Provider Performance Analytics
CREATE TABLE provider_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    evaluation_period VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    overall_success_rate DECIMAL(5,4),
    patient_satisfaction_avg DECIMAL(3,2),
    total_treatments INTEGER DEFAULT 0,
    specialties JSONB,
    performance_trends JSONB,
    improvement_areas JSONB,
    achievements JSONB,
    training_recommendations JSONB,
    certification_status JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, evaluation_period, period_start)
);

-- Treatment Protocol Optimization
CREATE TABLE protocol_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_type VARCHAR(100) NOT NULL,
    current_protocol JSONB NOT NULL,
    recommended_changes JSONB NOT NULL,
    success_rate_improvement DECIMAL(5,4),
    evidence_data JSONB,
    implementation_priority VARCHAR(20) DEFAULT 'medium',
    cost_impact DECIMAL(12,2),
    timeline_estimate VARCHAR(100),
    approval_status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    implementation_date DATE,
    results_tracking JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Benchmarks
CREATE TABLE quality_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_type VARCHAR(100) NOT NULL,
    benchmark_type VARCHAR(50) NOT NULL, -- 'industry_standard', 'clinic_target', 'best_practice'
    metric_name VARCHAR(100) NOT NULL,
    target_value DECIMAL(10,4) NOT NULL,
    current_value DECIMAL(10,4),
    variance_percentage DECIMAL(5,2),
    benchmark_source VARCHAR(200),
    update_frequency VARCHAR(50),
    last_updated DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(treatment_type, benchmark_type, metric_name)
);

-- Success Predictions
CREATE TABLE success_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id),
    treatment_type VARCHAR(100) NOT NULL,
    predicted_success_rate DECIMAL(5,4) NOT NULL,
    prediction_factors JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    risk_factors JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Reports
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    reporting_period VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    compliance_score DECIMAL(5,4),
    findings JSONB,
    recommendations JSONB,
    action_items JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    generated_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_treatment_outcomes_patient ON treatment_outcomes(patient_id);
CREATE INDEX idx_treatment_outcomes_provider ON treatment_outcomes(provider_id);
CREATE INDEX idx_treatment_outcomes_type_date ON treatment_outcomes(treatment_type, treatment_date);
CREATE INDEX idx_treatment_outcomes_success ON treatment_outcomes(success_score) WHERE success_score IS NOT NULL;

CREATE INDEX idx_success_metrics_type_period ON success_metrics(treatment_type, time_period, period_start);
CREATE INDEX idx_success_metrics_provider ON success_metrics(provider_id);

CREATE INDEX idx_provider_performance_provider ON provider_performance(provider_id);
CREATE INDEX idx_provider_performance_period ON provider_performance(evaluation_period, period_start);

CREATE INDEX idx_protocol_optimizations_type ON protocol_optimizations(treatment_type);
CREATE INDEX idx_protocol_optimizations_priority ON protocol_optimizations(implementation_priority);

CREATE INDEX idx_quality_benchmarks_type ON quality_benchmarks(treatment_type, benchmark_type);

CREATE INDEX idx_success_predictions_patient ON success_predictions(patient_id);
CREATE INDEX idx_success_predictions_type ON success_predictions(treatment_type);

CREATE INDEX idx_compliance_reports_type_period ON compliance_reports(report_type, reporting_period, period_start);

-- Enable RLS
ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view treatment outcomes" ON treatment_outcomes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert treatment outcomes" ON treatment_outcomes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update treatment outcomes" ON treatment_outcomes FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view success metrics" ON success_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert success metrics" ON success_metrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update success metrics" ON success_metrics FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view provider performance" ON provider_performance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert provider performance" ON provider_performance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update provider performance" ON provider_performance FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view protocol optimizations" ON protocol_optimizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert protocol optimizations" ON protocol_optimizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update protocol optimizations" ON protocol_optimizations FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view quality benchmarks" ON quality_benchmarks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert quality benchmarks" ON quality_benchmarks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update quality benchmarks" ON quality_benchmarks FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view success predictions" ON success_predictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert success predictions" ON success_predictions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update success predictions" ON success_predictions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view compliance reports" ON compliance_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert compliance reports" ON compliance_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update compliance reports" ON compliance_reports FOR UPDATE USING (auth.role() = 'authenticated');
