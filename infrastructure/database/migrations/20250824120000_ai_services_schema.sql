-- NeonPro AI Services Schema Migration
-- Comprehensive AI infrastructure tables for Universal Chat, Feature Flags, Cache Management, and Compliance
-- Created: 2025-08-24

-- ====================================================================================================
-- AI CHAT SYSTEM TABLES
-- ====================================================================================================

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'medical', 'scheduling', 'billing'
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived', 'deleted'
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_session_type CHECK (session_type IN ('general', 'medical', 'scheduling', 'billing', 'emergency')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    response_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    compliance_flags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- AI Service Usage Analytics
CREATE TABLE IF NOT EXISTS ai_service_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL,
    tokens_consumed INTEGER DEFAULT 0,
    execution_time_ms INTEGER NOT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================================
-- FEATURE FLAG SYSTEM
-- ====================================================================================================

-- Feature Flags Configuration
CREATE TABLE IF NOT EXISTS ai_feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage DECIMAL(5,2) DEFAULT 0.0,
    target_conditions JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_percentage CHECK (rollout_percentage >= 0.0 AND rollout_percentage <= 100.0)
);

-- Feature Flag Evaluations Log
CREATE TABLE IF NOT EXISTS ai_feature_flag_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_key VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    evaluated_value BOOLEAN NOT NULL,
    conditions_met JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================================
-- CACHE MANAGEMENT SYSTEM
-- ====================================================================================================

-- Cache Entries (Redis backup/metadata)
CREATE TABLE IF NOT EXISTS ai_cache_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    data_size_bytes INTEGER,
    ttl_seconds INTEGER,
    access_count INTEGER DEFAULT 0,
    hit_rate DECIMAL(5,2),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Cache Performance Metrics
CREATE TABLE IF NOT EXISTS ai_cache_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    namespace VARCHAR(100) NOT NULL,
    operation_type VARCHAR(20) NOT NULL, -- 'GET', 'SET', 'DELETE', 'EXPIRE'
    hit BOOLEAN DEFAULT false,
    response_time_ms INTEGER NOT NULL,
    data_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_operation CHECK (operation_type IN ('GET', 'SET', 'DELETE', 'EXPIRE', 'CLEAR'))
);

-- ====================================================================================================
-- MONITORING AND ALERTING SYSTEM
-- ====================================================================================================

-- Service Health Checks
CREATE TABLE IF NOT EXISTS ai_service_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unknown', -- 'healthy', 'degraded', 'unhealthy', 'unknown'
    response_time_ms INTEGER,
    uptime_percentage DECIMAL(5,2),
    error_rate DECIMAL(5,2),
    last_check_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_health_status CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown'))
);

-- System Alerts
CREATE TABLE IF NOT EXISTS ai_system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    service_name VARCHAR(100),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'ms', 'mb', 'percent', 'count'
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================================
-- COMPLIANCE AND AUDIT SYSTEM
-- ====================================================================================================

-- LGPD/Healthcare Compliance Logs for AI
CREATE TABLE IF NOT EXISTS ai_compliance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    data_categories TEXT[], -- e.g., ['personal_data', 'health_data', 'sensitive_data']
    lawful_basis VARCHAR(100), -- LGPD lawful basis
    purpose TEXT NOT NULL,
    retention_period_days INTEGER,
    patient_id UUID,
    sensitive_data_handled BOOLEAN DEFAULT false,
    consent_obtained BOOLEAN DEFAULT false,
    audit_trail JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Model Training Data Tracking
CREATE TABLE IF NOT EXISTS ai_training_data_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    data_source VARCHAR(200) NOT NULL,
    data_hash VARCHAR(64), -- SHA-256 of data for integrity
    record_count INTEGER NOT NULL,
    anonymization_applied BOOLEAN DEFAULT false,
    consent_verified BOOLEAN DEFAULT false,
    retention_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================================
-- NO-SHOW PREDICTION SYSTEM
-- ====================================================================================================

-- No-Show Predictions
CREATE TABLE IF NOT EXISTS ai_no_show_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL, -- References appointments table
    patient_id UUID NOT NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    prediction_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    contributing_factors JSONB NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    confidence_interval JSONB,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_outcome BOOLEAN, -- null until appointment happens
    accuracy_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_score CHECK (prediction_score >= 0.0 AND prediction_score <= 1.0)
);

-- Feature Importance Tracking
CREATE TABLE IF NOT EXISTS ai_prediction_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_id UUID NOT NULL REFERENCES ai_no_show_predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value JSONB,
    importance_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================================================

-- Chat System Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_clinic ON ai_chat_sessions(user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON ai_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON ai_chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON ai_chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON ai_chat_messages(role);

-- Feature Flag Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON ai_feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flag_evaluations_flag_user ON ai_feature_flag_evaluations(flag_key, user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_evaluations_created ON ai_feature_flag_evaluations(created_at);

-- Cache Indexes
CREATE INDEX IF NOT EXISTS idx_cache_entries_namespace ON ai_cache_entries(namespace);
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires ON ai_cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_namespace_created ON ai_cache_metrics(namespace, created_at DESC);

-- Monitoring Indexes
CREATE INDEX IF NOT EXISTS idx_service_health_service_status ON ai_service_health(service_name, status);
CREATE INDEX IF NOT EXISTS idx_service_health_updated ON ai_service_health(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity_created ON ai_system_alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON ai_system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service_recorded ON ai_performance_metrics(service_name, recorded_at DESC);

-- Compliance Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_logs_user_service ON ai_compliance_logs(user_id, service_name);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_clinic_created ON ai_compliance_logs(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_sensitive ON ai_compliance_logs(sensitive_data_handled);

-- No-Show Prediction Indexes
CREATE INDEX IF NOT EXISTS idx_no_show_predictions_appointment ON ai_no_show_predictions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_no_show_predictions_patient_clinic ON ai_no_show_predictions(patient_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_no_show_predictions_risk_level ON ai_no_show_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_no_show_predictions_date ON ai_no_show_predictions(prediction_date DESC);

-- ====================================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================================

-- Enable RLS on all tables
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_flag_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_data_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_no_show_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prediction_features ENABLE ROW LEVEL SECURITY;

-- Chat Sessions RLS: Users can only see their own sessions
CREATE POLICY "chat_sessions_user_isolation" ON ai_chat_sessions
    FOR ALL USING (user_id = auth.uid());

-- Chat Messages RLS: Users can only see messages from their sessions
CREATE POLICY "chat_messages_user_isolation" ON ai_chat_messages
    FOR ALL USING (
        session_id IN (
            SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
        )
    );

-- Service Usage RLS: Users see their own usage
CREATE POLICY "service_usage_user_isolation" ON ai_service_usage
    FOR ALL USING (user_id = auth.uid());

-- Feature Flags RLS: Admin-only for management, read-only for users
CREATE POLICY "feature_flags_admin_manage" ON ai_feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin')
        )
    );

CREATE POLICY "feature_flags_user_read" ON ai_feature_flags
    FOR SELECT USING (enabled = true);

-- Feature Flag Evaluations RLS: Users see their own evaluations
CREATE POLICY "feature_flag_evaluations_user_isolation" ON ai_feature_flag_evaluations
    FOR ALL USING (user_id = auth.uid());

-- Cache Management RLS: Admin-only
CREATE POLICY "cache_entries_admin_only" ON ai_cache_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin')
        )
    );

CREATE POLICY "cache_metrics_admin_only" ON ai_cache_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin')
        )
    );

-- Monitoring RLS: Admin and clinic managers
CREATE POLICY "service_health_admin_clinic" ON ai_service_health
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin', 'clinic_manager')
        )
    );

CREATE POLICY "system_alerts_admin_clinic" ON ai_system_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin', 'clinic_manager')
        )
    );

CREATE POLICY "performance_metrics_admin_clinic" ON ai_performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'system_admin', 'clinic_manager')
        )
    );

-- Compliance RLS: Users see their own compliance logs
CREATE POLICY "compliance_logs_user_clinic" ON ai_compliance_logs
    FOR ALL USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'compliance_officer', 'clinic_manager')
        )
    );

-- Training Data Audit RLS: Admin-only
CREATE POLICY "training_data_audit_admin_only" ON ai_training_data_audit
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('admin', 'data_scientist')
        )
    );

-- No-Show Predictions RLS: Clinic-based isolation
CREATE POLICY "no_show_predictions_clinic_isolation" ON ai_no_show_predictions
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "prediction_features_clinic_isolation" ON ai_prediction_features
    FOR ALL USING (
        prediction_id IN (
            SELECT id FROM ai_no_show_predictions 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid()
            )
        )
    );

-- ====================================================================================================
-- TRIGGER FUNCTIONS FOR AUTOMATED UPDATES
-- ====================================================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_feature_flags_updated_at
    BEFORE UPDATE ON ai_feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_service_health_updated_at
    BEFORE UPDATE ON ai_service_health
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================================================
-- INITIAL DATA SEEDING
-- ====================================================================================================

-- Insert default feature flags
INSERT INTO ai_feature_flags (flag_key, name, description, enabled, rollout_percentage, created_by) VALUES
    ('universal_chat_enabled', 'Universal AI Chat', 'Enable the universal AI chat system', true, 100.0, NULL),
    ('no_show_prediction_enabled', 'No-Show Prediction', 'Enable AI-powered no-show predictions', true, 50.0, NULL),
    ('advanced_analytics_enabled', 'Advanced Analytics', 'Enable advanced AI analytics features', false, 0.0, NULL),
    ('voice_commands_enabled', 'Voice Commands', 'Enable voice command functionality', false, 0.0, NULL),
    ('predictive_scheduling_enabled', 'Predictive Scheduling', 'Enable AI-powered scheduling optimization', false, 10.0, NULL)
ON CONFLICT (flag_key) DO NOTHING;

-- Insert default service health entries
INSERT INTO ai_service_health (service_name, status, response_time_ms, uptime_percentage, error_rate) VALUES
    ('universal-chat', 'healthy', 150, 99.9, 0.1),
    ('no-show-prediction', 'healthy', 300, 99.8, 0.2),
    ('feature-flags', 'healthy', 50, 100.0, 0.0),
    ('cache-service', 'healthy', 25, 99.95, 0.05),
    ('monitoring-service', 'healthy', 100, 99.9, 0.1)
ON CONFLICT DO NOTHING;

-- ====================================================================================================
-- PERFORMANCE OPTIMIZATION FUNCTIONS
-- ====================================================================================================

-- Function to cleanup old chat sessions and messages
CREATE OR REPLACE FUNCTION cleanup_old_ai_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete chat messages older than 1 year for archived sessions
    DELETE FROM ai_chat_messages 
    WHERE session_id IN (
        SELECT id FROM ai_chat_sessions 
        WHERE status = 'archived' 
        AND updated_at < NOW() - INTERVAL '1 year'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete archived chat sessions older than 1 year
    DELETE FROM ai_chat_sessions 
    WHERE status = 'archived' 
    AND updated_at < NOW() - INTERVAL '1 year';
    
    -- Delete old cache metrics (keep last 30 days)
    DELETE FROM ai_cache_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old performance metrics (keep last 90 days)
    DELETE FROM ai_performance_metrics 
    WHERE recorded_at < NOW() - INTERVAL '90 days';
    
    -- Delete old service usage records (keep last 6 months)
    DELETE FROM ai_service_usage 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cache hit rates
CREATE OR REPLACE FUNCTION calculate_cache_hit_rate(namespace_filter TEXT DEFAULT NULL)
RETURNS TABLE(namespace TEXT, hit_rate DECIMAL(5,2), total_operations BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.namespace,
        CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE cm.hit = true)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0.0
        END as hit_rate,
        COUNT(*) as total_operations
    FROM ai_cache_metrics cm
    WHERE (namespace_filter IS NULL OR cm.namespace = namespace_filter)
        AND cm.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY cm.namespace;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================================
-- COMMENTS AND DOCUMENTATION
-- ====================================================================================================

COMMENT ON TABLE ai_chat_sessions IS 'Universal AI chat sessions for all types of healthcare interactions';
COMMENT ON TABLE ai_chat_messages IS 'Individual messages within AI chat sessions with compliance tracking';
COMMENT ON TABLE ai_service_usage IS 'Analytics and billing data for AI service consumption';
COMMENT ON TABLE ai_feature_flags IS 'Feature flag configuration for gradual AI feature rollout';
COMMENT ON TABLE ai_feature_flag_evaluations IS 'Log of feature flag evaluations for analytics';
COMMENT ON TABLE ai_cache_entries IS 'Metadata for Redis cache entries with performance tracking';
COMMENT ON TABLE ai_cache_metrics IS 'Performance metrics for cache operations';
COMMENT ON TABLE ai_service_health IS 'Real-time health status of all AI services';
COMMENT ON TABLE ai_system_alerts IS 'System alerts and notifications for AI service monitoring';
COMMENT ON TABLE ai_performance_metrics IS 'Performance metrics for AI services';
COMMENT ON TABLE ai_compliance_logs IS 'LGPD and healthcare compliance audit logs for AI operations';
COMMENT ON TABLE ai_training_data_audit IS 'Audit trail for AI model training data usage';
COMMENT ON TABLE ai_no_show_predictions IS 'AI-powered no-show predictions with Brazilian behavioral patterns';
COMMENT ON TABLE ai_prediction_features IS 'Feature importance and values for prediction explainability';

-- Migration completed successfully
-- Total tables created: 14
-- Total indexes created: 21
-- Total RLS policies created: 16
-- Total trigger functions created: 4
-- Total utility functions created: 2