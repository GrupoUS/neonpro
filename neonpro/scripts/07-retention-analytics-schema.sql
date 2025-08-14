-- =====================================================================================
-- RETENTION ANALYTICS DATABASE SCHEMA
-- Epic 7.4: Patient Retention Analytics + Predictions
-- Comprehensive analytics tables for patient retention and churn prediction
-- =====================================================================================

-- =====================================================================================
-- ENABLE EXTENSIONS
-- =====================================================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- ENUMS FOR RETENTION ANALYTICS
-- =====================================================================================

-- Churn risk levels
DO $$ BEGIN
    CREATE TYPE churn_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Retention strategy types
DO $$ BEGIN
    CREATE TYPE retention_strategy_type AS ENUM (
        'email_campaign',
        'sms_reminder', 
        'discount_offer',
        'personalized_content',
        'loyalty_program',
        'referral_incentive',
        'appointment_reminder',
        'birthday_campaign',
        'reactivation_campaign',
        'feedback_request'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Strategy execution status
DO $$ BEGIN
    CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Engagement event types
DO $$ BEGIN
    CREATE TYPE engagement_event_type AS ENUM (
        'appointment_scheduled',
        'appointment_completed',
        'appointment_cancelled',
        'email_opened',
        'email_clicked',
        'sms_received',
        'app_login',
        'profile_updated',
        'payment_completed',
        'review_submitted',
        'referral_made'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================================
-- TABLE: RETENTION_METRICS
-- Stores calculated retention metrics for patients
-- =====================================================================================

CREATE TABLE IF NOT EXISTS retention_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Retention metrics
    retention_rate DECIMAL(5,4) NOT NULL CHECK (retention_rate >= 0 AND retention_rate <= 1),
    churn_probability DECIMAL(5,4) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
    churn_risk_level churn_risk_level NOT NULL,
    
    -- Financial metrics
    lifetime_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    average_appointment_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Engagement metrics
    days_since_last_appointment INTEGER NOT NULL DEFAULT 0,
    total_appointments INTEGER NOT NULL DEFAULT 0,
    completed_appointments INTEGER NOT NULL DEFAULT 0,
    cancelled_appointments INTEGER NOT NULL DEFAULT 0,
    no_show_appointments INTEGER NOT NULL DEFAULT 0,
    
    -- Calculated dates
    first_appointment_date TIMESTAMP WITH TIME ZONE,
    last_appointment_date TIMESTAMP WITH TIME ZONE,
    predicted_next_appointment TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(clinic_id, patient_id, calculated_at)
);

-- Enable RLS
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view retention metrics from their clinic" ON retention_metrics
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert retention metrics for their clinic" ON retention_metrics
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update retention metrics from their clinic" ON retention_metrics
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_retention_metrics_clinic_id ON retention_metrics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_patient_id ON retention_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_churn_risk ON retention_metrics(clinic_id, churn_risk_level);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_calculated_at ON retention_metrics(calculated_at DESC);

-- =====================================================================================
-- TABLE: CHURN_PREDICTIONS
-- Stores ML-based churn predictions for patients
-- =====================================================================================

CREATE TABLE IF NOT EXISTS churn_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Prediction data
    churn_probability DECIMAL(5,4) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
    risk_level churn_risk_level NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Risk factors (JSON)
    risk_factors JSONB NOT NULL DEFAULT '{}',
    contributing_factors JSONB NOT NULL DEFAULT '{}',
    
    -- Prediction details
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Recommendations
    recommended_actions JSONB NOT NULL DEFAULT '[]',
    priority_score INTEGER NOT NULL DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(clinic_id, patient_id, prediction_date)
);

-- Enable RLS
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view churn predictions from their clinic" ON churn_predictions
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert churn predictions for their clinic" ON churn_predictions
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update churn predictions from their clinic" ON churn_predictions
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_churn_predictions_clinic_id ON churn_predictions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_patient_id ON churn_predictions(patient_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_risk_level ON churn_predictions(clinic_id, risk_level);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_date ON churn_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_priority ON churn_predictions(clinic_id, priority_score DESC);

-- =====================================================================================
-- TABLE: RETENTION_STRATEGIES
-- Stores configured retention strategies for clinics
-- =====================================================================================CREATE TABLE IF NOT EXISTS retention_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Strategy details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type retention_strategy_type NOT NULL,
    
    -- Targeting criteria
    target_criteria JSONB NOT NULL DEFAULT '{}',
    risk_levels churn_risk_level[] NOT NULL DEFAULT '{}',
    
    -- Content and configuration
    content JSONB NOT NULL DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{}',
    
    -- Timing and scheduling
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    schedule_config JSONB NOT NULL DEFAULT '{}',
    
    -- Status and performance
    is_active BOOLEAN NOT NULL DEFAULT true,
    execution_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE 
            WHEN execution_count > 0 THEN success_count::DECIMAL / execution_count::DECIMAL
            ELSE 0.0000
        END
    ) STORED,
    
    -- Financial metrics
    cost_per_execution DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estimated_roi DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(clinic_id, name),
    CHECK (success_count <= execution_count)
);

-- Enable RLS
ALTER TABLE retention_strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view retention strategies from their clinic" ON retention_strategies
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert retention strategies for their clinic" ON retention_strategies
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update retention strategies from their clinic" ON retention_strategies
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete retention strategies from their clinic" ON retention_strategies
    FOR DELETE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_retention_strategies_clinic_id ON retention_strategies(clinic_id);
CREATE INDEX IF NOT EXISTS idx_retention_strategies_type ON retention_strategies(clinic_id, strategy_type);
CREATE INDEX IF NOT EXISTS idx_retention_strategies_active ON retention_strategies(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_retention_strategies_success_rate ON retention_strategies(clinic_id, success_rate DESC);

-- =====================================================================================
-- TABLE: STRATEGY_EXECUTIONS
-- Stores history of strategy executions
-- =====================================================================================

CREATE TABLE IF NOT EXISTS strategy_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES retention_strategies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Execution details
    execution_status execution_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution data
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    
    -- Results and metrics
    was_successful BOOLEAN,
    engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
    conversion_achieved BOOLEAN NOT NULL DEFAULT false,
    cost_incurred DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Follow-up tracking
    follow_up_required BOOLEAN NOT NULL DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_completed BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    executed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE strategy_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view strategy executions from their clinic" ON strategy_executions
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert strategy executions for their clinic" ON strategy_executions
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update strategy executions from their clinic" ON strategy_executions
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_strategy_executions_clinic_id ON strategy_executions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_strategy_executions_strategy_id ON strategy_executions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_executions_patient_id ON strategy_executions(patient_id);
CREATE INDEX IF NOT EXISTS idx_strategy_executions_status ON strategy_executions(clinic_id, execution_status);
CREATE INDEX IF NOT EXISTS idx_strategy_executions_started_at ON strategy_executions(started_at DESC);

-- =====================================================================================
-- TABLE: PATIENT_ENGAGEMENT_LOGS
-- Stores detailed engagement events for analytics
-- =====================================================================================

CREATE TABLE IF NOT EXISTS patient_engagement_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Event details
    event_type engagement_event_type NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Engagement metrics
    engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    interaction_duration INTEGER, -- in seconds
    
    -- Context
    source VARCHAR(100), -- app, website, email, sms, etc.
    campaign_id UUID, -- reference to marketing campaigns
    strategy_execution_id UUID REFERENCES strategy_executions(id),
    
    -- Device and session info
    device_info JSONB NOT NULL DEFAULT '{}',
    session_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patient_engagement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view engagement logs from their clinic" ON patient_engagement_logs
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert engagement logs for their clinic" ON patient_engagement_logs
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engagement_logs_clinic_id ON patient_engagement_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_patient_id ON patient_engagement_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_event_type ON patient_engagement_logs(clinic_id, event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_timestamp ON patient_engagement_logs(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_strategy_exec ON patient_engagement_logs(strategy_execution_id);

-- =====================================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_retention_metrics_updated_at 
    BEFORE UPDATE ON retention_metrics 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_churn_predictions_updated_at 
    BEFORE UPDATE ON churn_predictions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_retention_strategies_updated_at 
    BEFORE UPDATE ON retention_strategies 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_strategy_executions_updated_at 
    BEFORE UPDATE ON strategy_executions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================================================
-- FUNCTION: UPDATE STRATEGY EXECUTION COUNTS
-- Automatically update execution counts on retention_strategies table
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_strategy_execution_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update execution count and success count
    UPDATE retention_strategies 
    SET 
        execution_count = (
            SELECT COUNT(*) 
            FROM strategy_executions 
            WHERE strategy_id = NEW.strategy_id
        ),
        success_count = (
            SELECT COUNT(*) 
            FROM strategy_executions 
            WHERE strategy_id = NEW.strategy_id 
            AND was_successful = true
        ),
        last_executed_at = NOW()
    WHERE id = NEW.strategy_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update strategy counts
CREATE TRIGGER update_strategy_counts
    AFTER INSERT OR UPDATE ON strategy_executions
    FOR EACH ROW EXECUTE PROCEDURE update_strategy_execution_counts();

-- =====================================================================================
-- VIEWS FOR ANALYTICS
-- =====================================================================================

-- View for latest retention metrics per patient
CREATE OR REPLACE VIEW latest_retention_metrics AS
SELECT DISTINCT ON (clinic_id, patient_id) *
FROM retention_metrics
ORDER BY clinic_id, patient_id, calculated_at DESC;

-- View for active churn predictions
CREATE OR REPLACE VIEW active_churn_predictions AS
SELECT *
FROM churn_predictions
WHERE expires_at IS NULL OR expires_at > NOW()
ORDER BY prediction_date DESC;

-- View for strategy performance summary
CREATE OR REPLACE VIEW strategy_performance_summary AS
SELECT 
    rs.*,
    COUNT(se.id) as total_executions,
    COUNT(se.id) FILTER (WHERE se.was_successful = true) as successful_executions,
    AVG(se.engagement_score) as avg_engagement_score,
    SUM(se.cost_incurred) as total_cost,
    MIN(se.started_at) as first_execution,
    MAX(se.started_at) as last_execution
FROM retention_strategies rs
LEFT JOIN strategy_executions se ON rs.id = se.strategy_id
GROUP BY rs.id;

-- =====================================================================================
-- GRANTS AND PERMISSIONS
-- =====================================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON retention_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON churn_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON retention_strategies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON strategy_executions TO authenticated;
GRANT SELECT, INSERT ON patient_engagement_logs TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================================

COMMENT ON TABLE retention_metrics IS 'Stores calculated retention metrics and financial data for patients';
COMMENT ON TABLE churn_predictions IS 'ML-based churn predictions with risk factors and recommendations';
COMMENT ON TABLE retention_strategies IS 'Configurable retention strategies for different patient segments';
COMMENT ON TABLE strategy_executions IS 'History and results of retention strategy executions';
COMMENT ON TABLE patient_engagement_logs IS 'Detailed engagement events for analytics and tracking';

COMMENT ON COLUMN retention_metrics.lifetime_value IS 'Calculated customer lifetime value based on appointment history';
COMMENT ON COLUMN churn_predictions.confidence_score IS 'ML model confidence in the prediction (0-1)';
COMMENT ON COLUMN retention_strategies.success_rate IS 'Automatically calculated success rate based on executions';
COMMENT ON COLUMN strategy_executions.engagement_score IS 'Measured engagement score from strategy execution (0-100)';

-- =====================================================================================
-- END OF RETENTION ANALYTICS SCHEMA
-- =====================================================================================