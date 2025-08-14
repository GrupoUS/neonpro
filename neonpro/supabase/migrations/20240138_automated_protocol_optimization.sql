-- Migration: Automated Protocol Optimization System
-- Story 9.3: Automated protocol optimization with continuous improvement
-- Date: 2025-01-30
-- Author: VoidBeast V4.0

-- Core protocol versions table for version management and optimization data
CREATE TABLE protocol_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_name VARCHAR(255) NOT NULL,
    version_number VARCHAR(50) NOT NULL,
    description TEXT,
    optimization_data JSONB DEFAULT '{}',
    protocol_content JSONB NOT NULL DEFAULT '{}',
    approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'deprecated')),
    approved_by UUID REFERENCES auth.users(id),
    effective_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT false,
    optimization_score DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(protocol_name, version_number)
);

-- Protocol outcomes tracking for optimization analysis
CREATE TABLE protocol_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_version_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    treatment_id UUID,
    outcome_data JSONB NOT NULL DEFAULT '{}',
    success_score DECIMAL(5,2) NOT NULL,
    improvement_percentage DECIMAL(5,2),
    complications JSONB DEFAULT '[]',
    side_effects JSONB DEFAULT '[]',
    patient_satisfaction DECIMAL(3,1),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    outcome_date TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical professional feedback for protocol refinement
CREATE TABLE protocol_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('improvement', 'issue', 'suggestion', 'rating', 'complaint')),
    feedback_data JSONB NOT NULL DEFAULT '{}',
    improvement_suggestions TEXT,
    rating DECIMAL(3,1) CHECK (rating >= 1.0 AND rating <= 5.0),
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'implemented', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    implementation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization results from automated analysis
CREATE TABLE optimization_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    optimization_type VARCHAR(100) NOT NULL,
    improvement_metrics JSONB NOT NULL DEFAULT '{}',
    validation_data JSONB DEFAULT '{}',
    confidence_score DECIMAL(5,2),
    statistical_significance DECIMAL(5,3),
    recommendation_data JSONB DEFAULT '{}',
    implementation_status VARCHAR(50) DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'approved', 'implemented', 'rejected')),
    automated_analysis JSONB DEFAULT '{}',
    human_review_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A/B testing experiments for protocol comparison
CREATE TABLE protocol_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_name VARCHAR(255) NOT NULL,
    description TEXT,
    control_protocol_id UUID REFERENCES protocol_versions(id),
    test_protocol_id UUID REFERENCES protocol_versions(id),
    experiment_type VARCHAR(50) DEFAULT 'ab_test' CHECK (experiment_type IN ('ab_test', 'multivariate', 'sequential')),
    status VARCHAR(50) DEFAULT 'setup' CHECK (status IN ('setup', 'running', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_sample_size INTEGER DEFAULT 100,
    current_sample_size INTEGER DEFAULT 0,
    statistical_power DECIMAL(5,2) DEFAULT 0.80,
    significance_level DECIMAL(5,3) DEFAULT 0.05,
    primary_metric VARCHAR(100),
    secondary_metrics JSONB DEFAULT '[]',
    results_data JSONB DEFAULT '{}',
    conclusion TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidence and medical literature integration
CREATE TABLE protocol_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('literature', 'guideline', 'regulation', 'study', 'best_practice')),
    source_reference TEXT NOT NULL,
    evidence_level VARCHAR(20) CHECK (evidence_level IN ('A', 'B', 'C', 'D', 'expert_opinion')),
    evidence_data JSONB DEFAULT '{}',
    relevance_score DECIMAL(5,2),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'current' CHECK (verification_status IN ('current', 'outdated', 'conflicting', 'superseded')),
    compliance_status VARCHAR(20) DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'partial', 'non_compliant', 'unknown')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Protocol implementation and distribution tracking
CREATE TABLE protocol_implementations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_version_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    implementation_scope VARCHAR(50) NOT NULL CHECK (implementation_scope IN ('clinic_wide', 'department', 'provider', 'pilot')),
    target_providers JSONB DEFAULT '[]',
    implementation_date TIMESTAMP WITH TIME ZONE,
    rollout_strategy VARCHAR(50) DEFAULT 'immediate' CHECK (rollout_strategy IN ('immediate', 'gradual', 'pilot', 'scheduled')),
    training_required BOOLEAN DEFAULT true,
    training_completion_rate DECIMAL(5,2),
    adherence_rate DECIMAL(5,2),
    implementation_notes TEXT,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'failed', 'rolled_back')),
    success_metrics JSONB DEFAULT '{}',
    rollback_reason TEXT,
    implemented_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive protocol performance analytics
CREATE TABLE protocol_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_version_id UUID REFERENCES protocol_versions(id) ON DELETE CASCADE,
    analytics_period VARCHAR(20) NOT NULL CHECK (analytics_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_outcome_score DECIMAL(5,2),
    patient_satisfaction DECIMAL(3,1),
    provider_satisfaction DECIMAL(3,1),
    cost_effectiveness DECIMAL(10,2),
    time_efficiency DECIMAL(5,2),
    complication_rate DECIMAL(5,2),
    readmission_rate DECIMAL(5,2),
    performance_metrics JSONB DEFAULT '{}',
    comparative_analysis JSONB DEFAULT '{}',
    roi_analysis JSONB DEFAULT '{}',
    trend_analysis JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance
CREATE INDEX idx_protocol_versions_name_version ON protocol_versions(protocol_name, version_number);
CREATE INDEX idx_protocol_versions_active ON protocol_versions(is_active) WHERE is_active = true;
CREATE INDEX idx_protocol_versions_approval_status ON protocol_versions(approval_status);
CREATE INDEX idx_protocol_versions_effective_date ON protocol_versions(effective_date) WHERE effective_date IS NOT NULL;

CREATE INDEX idx_protocol_outcomes_protocol_version ON protocol_outcomes(protocol_version_id);
CREATE INDEX idx_protocol_outcomes_patient ON protocol_outcomes(patient_id);
CREATE INDEX idx_protocol_outcomes_date ON protocol_outcomes(outcome_date);
CREATE INDEX idx_protocol_outcomes_success_score ON protocol_outcomes(success_score);

CREATE INDEX idx_protocol_feedback_protocol ON protocol_feedback(protocol_id);
CREATE INDEX idx_protocol_feedback_provider ON protocol_feedback(provider_id);
CREATE INDEX idx_protocol_feedback_type ON protocol_feedback(feedback_type);
CREATE INDEX idx_protocol_feedback_status ON protocol_feedback(status);
CREATE INDEX idx_protocol_feedback_priority ON protocol_feedback(priority_level);

CREATE INDEX idx_optimization_results_protocol ON optimization_results(protocol_id);
CREATE INDEX idx_optimization_results_type ON optimization_results(optimization_type);
CREATE INDEX idx_optimization_results_status ON optimization_results(implementation_status);
CREATE INDEX idx_optimization_results_confidence ON optimization_results(confidence_score);

CREATE INDEX idx_protocol_experiments_status ON protocol_experiments(status);
CREATE INDEX idx_protocol_experiments_dates ON protocol_experiments(start_date, end_date);
CREATE INDEX idx_protocol_experiments_protocols ON protocol_experiments(control_protocol_id, test_protocol_id);

CREATE INDEX idx_protocol_evidence_protocol ON protocol_evidence(protocol_id);
CREATE INDEX idx_protocol_evidence_type ON protocol_evidence(evidence_type);
CREATE INDEX idx_protocol_evidence_verification ON protocol_evidence(verification_status);
CREATE INDEX idx_protocol_evidence_compliance ON protocol_evidence(compliance_status);

CREATE INDEX idx_protocol_implementations_protocol ON protocol_implementations(protocol_version_id);
CREATE INDEX idx_protocol_implementations_scope ON protocol_implementations(implementation_scope);
CREATE INDEX idx_protocol_implementations_status ON protocol_implementations(status);
CREATE INDEX idx_protocol_implementations_date ON protocol_implementations(implementation_date);

CREATE INDEX idx_protocol_analytics_protocol ON protocol_analytics(protocol_version_id);
CREATE INDEX idx_protocol_analytics_period ON protocol_analytics(analytics_period, period_start, period_end);
CREATE INDEX idx_protocol_analytics_calculated ON protocol_analytics(calculated_at);

-- Row Level Security (RLS) Policies
ALTER TABLE protocol_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_analytics ENABLE ROW LEVEL SECURITY;

-- Protocol versions policies
CREATE POLICY "Users can view approved protocols" ON protocol_versions FOR SELECT USING (
    approval_status = 'approved' OR created_by = auth.uid()
);
CREATE POLICY "Authorized users can create protocols" ON protocol_versions FOR INSERT WITH CHECK (
    created_by = auth.uid()
);
CREATE POLICY "Protocol creators and managers can update" ON protocol_versions FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'medical_director'))
);
CREATE POLICY "Protocol creators and managers can delete" ON protocol_versions FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'medical_director'))
);

-- Protocol outcomes policies  
CREATE POLICY "Users can view outcomes for approved protocols" ON protocol_outcomes FOR SELECT USING (
    EXISTS (SELECT 1 FROM protocol_versions pv WHERE pv.id = protocol_version_id AND pv.approval_status = 'approved')
);
CREATE POLICY "Authorized users can record outcomes" ON protocol_outcomes FOR INSERT WITH CHECK (
    recorded_by = auth.uid()
);
CREATE POLICY "Outcome recorders can update their entries" ON protocol_outcomes FOR UPDATE USING (
    recorded_by = auth.uid()
);

-- Protocol feedback policies
CREATE POLICY "Users can view feedback for their protocols" ON protocol_feedback FOR SELECT USING (
    provider_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM protocol_versions pv WHERE pv.id = protocol_id AND pv.created_by = auth.uid())
);
CREATE POLICY "Users can create feedback" ON protocol_feedback FOR INSERT WITH CHECK (
    provider_id = auth.uid()
);
CREATE POLICY "Feedback providers can update their feedback" ON protocol_feedback FOR UPDATE USING (
    provider_id = auth.uid()
);

-- Optimization results policies
CREATE POLICY "Users can view optimization results" ON optimization_results FOR SELECT USING (
    EXISTS (SELECT 1 FROM protocol_versions pv WHERE pv.id = protocol_id AND pv.approval_status = 'approved')
);
CREATE POLICY "System can create optimization results" ON optimization_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized users can update optimization results" ON optimization_results FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'medical_director'))
);

-- Protocol experiments policies
CREATE POLICY "Users can view experiments" ON protocol_experiments FOR SELECT USING (true);
CREATE POLICY "Authorized users can create experiments" ON protocol_experiments FOR INSERT WITH CHECK (
    created_by = auth.uid()
);
CREATE POLICY "Experiment creators can update" ON protocol_experiments FOR UPDATE USING (
    created_by = auth.uid()
);

-- Protocol evidence policies
CREATE POLICY "Users can view evidence" ON protocol_evidence FOR SELECT USING (true);
CREATE POLICY "Authorized users can add evidence" ON protocol_evidence FOR INSERT WITH CHECK (
    created_by = auth.uid()
);
CREATE POLICY "Evidence creators can update" ON protocol_evidence FOR UPDATE USING (
    created_by = auth.uid()
);

-- Protocol implementations policies
CREATE POLICY "Users can view implementations" ON protocol_implementations FOR SELECT USING (true);
CREATE POLICY "Authorized users can create implementations" ON protocol_implementations FOR INSERT WITH CHECK (
    implemented_by = auth.uid()
);
CREATE POLICY "Implementation managers can update" ON protocol_implementations FOR UPDATE USING (
    implemented_by = auth.uid()
);

-- Protocol analytics policies
CREATE POLICY "Users can view analytics" ON protocol_analytics FOR SELECT USING (true);
CREATE POLICY "System can create analytics" ON protocol_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update analytics" ON protocol_analytics FOR UPDATE USING (true);

-- Add helpful comments
COMMENT ON TABLE protocol_versions IS 'Core protocol management with versioning and optimization data';
COMMENT ON TABLE protocol_outcomes IS 'Patient outcomes linked to specific protocol versions for optimization analysis';
COMMENT ON TABLE protocol_feedback IS 'Medical professional feedback for protocol refinement and improvement';
COMMENT ON TABLE optimization_results IS 'Automated analysis results and optimization recommendations';
COMMENT ON TABLE protocol_experiments IS 'A/B testing framework for protocol comparison and validation';
COMMENT ON TABLE protocol_evidence IS 'Medical literature and evidence integration for evidence-based updates';
COMMENT ON TABLE protocol_implementations IS 'Protocol distribution and implementation tracking across the clinic';
COMMENT ON TABLE protocol_analytics IS 'Comprehensive performance metrics and analytics for protocol effectiveness';