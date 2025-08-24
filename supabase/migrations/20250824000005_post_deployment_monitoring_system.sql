-- Post-Deployment Monitoring System Database Schema
-- Comprehensive monitoring infrastructure for NeonPro Healthcare Platform
-- Author: AI IDE Agent
-- Date: 2025-08-24
-- Version: 1.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- Performance Metrics Table
-- Tracks dashboard load times, query performance, and system responsiveness
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'dashboard_load_time',
        'query_response_time', 
        'cache_hit_rate',
        'api_response_time',
        'page_load_time',
        'database_connection_time'
    )),
    metric_value DECIMAL(10,3) NOT NULL, -- Value in milliseconds or percentage
    threshold_status TEXT NOT NULL CHECK (threshold_status IN ('excellent', 'good', 'warning', 'critical')),
    clinic_id UUID REFERENCES clinics(id),
    user_id UUID REFERENCES auth.users(id),
    component_name TEXT, -- Which component was measured
    url_path TEXT, -- For page load metrics
    metadata JSONB DEFAULT '{}', -- Additional context data
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Usage Analytics Table  
-- Tracks adoption and usage of AI features across the platform
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_type TEXT NOT NULL CHECK (feature_type IN (
        'universal_ai_chat',
        'anti_no_show_prediction',
        'crm_behavioral_analytics',
        'patient_sentiment_analysis',
        'automated_scheduling'
    )),
    clinic_id UUID REFERENCES clinics(id),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT, -- For tracking user sessions
    action_type TEXT NOT NULL CHECK (action_type IN (
        'feature_opened',
        'query_submitted', 
        'prediction_requested',
        'recommendation_accepted',
        'recommendation_rejected',
        'session_completed'
    )),
    query_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Percentage
    response_time_ms INTEGER,
    accuracy_score DECIMAL(5,2), -- For predictions
    user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
    business_impact JSONB DEFAULT '{}', -- ROI tracking data
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Health Checks Table
-- Monitors infrastructure health and service availability  
CREATE TABLE IF NOT EXISTS system_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_name TEXT NOT NULL CHECK (component_name IN (
        'supabase_database',
        'supabase_auth',
        'supabase_storage',
        'redis_cache',
        'ai_chat_service',
        'prediction_engine',
        'email_service',
        'file_upload_service',
        'backup_system',
        'monitoring_system'
    )),
    health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'down')),
    response_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '{}',
    uptime_percentage DECIMAL(5,2),
    last_error_at TIMESTAMPTZ,
    recovery_time_seconds INTEGER, -- Time to recover from last incident
    alert_sent BOOLEAN DEFAULT FALSE,
    escalation_level INTEGER DEFAULT 0 CHECK (escalation_level BETWEEN 0 AND 3),
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compliance Audit Logs Table
-- Tracks LGPD/ANVISA/CFM compliance events and violations
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'data_access',
        'data_modification',
        'data_deletion',
        'user_consent',
        'data_export',
        'security_event',
        'privacy_violation',
        'audit_trail_access',
        'anonymization_process',
        'data_retention_cleanup'
    )),
    compliance_framework TEXT NOT NULL CHECK (compliance_framework IN ('LGPD', 'ANVISA', 'CFM', 'GENERAL')),
    user_id UUID REFERENCES auth.users(id),
    clinic_id UUID REFERENCES clinics(id),
    patient_id UUID REFERENCES patients(id),
    data_type TEXT, -- Type of data accessed/modified
    data_classification TEXT CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    action_performed TEXT NOT NULL,
    compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'violation', 'warning', 'pending_review')),
    violation_severity TEXT CHECK (violation_severity IN ('low', 'medium', 'high', 'critical')),
    violation_details JSONB DEFAULT '{}',
    remediation_required BOOLEAN DEFAULT FALSE,
    remediation_status TEXT CHECK (remediation_status IN ('not_required', 'pending', 'in_progress', 'completed')),
    automated_response_taken JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_context JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Intelligence Metrics Table
-- Tracks ROI, patient outcomes, and business performance indicators
CREATE TABLE IF NOT EXISTS business_intelligence_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_category TEXT NOT NULL CHECK (metric_category IN (
        'financial_roi',
        'patient_outcomes',
        'operational_efficiency', 
        'ai_adoption',
        'user_engagement',
        'clinical_effectiveness',
        'patient_satisfaction',
        'staff_productivity'
    )),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    target_value DECIMAL(15,2),
    unit_of_measurement TEXT, -- e.g., 'percentage', 'currency', 'count', 'minutes'
    clinic_id UUID REFERENCES clinics(id),
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable', 'volatile')),
    variance_from_target DECIMAL(10,2), -- Percentage difference from target
    business_impact_score INTEGER CHECK (business_impact_score BETWEEN 1 AND 10),
    contributing_factors JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    data_sources JSONB DEFAULT '{}', -- Where this metric was calculated from
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Real-time Alert Configurations Table
-- Defines alert rules and thresholds for monitoring
CREATE TABLE IF NOT EXISTS alert_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_name TEXT NOT NULL UNIQUE,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'performance_degradation',
        'system_health',
        'compliance_violation',
        'business_metric',
        'security_incident',
        'ai_accuracy_drop',
        'user_experience'
    )),
    metric_source TEXT NOT NULL, -- Which table/metric to monitor
    threshold_value DECIMAL(15,2) NOT NULL,
    threshold_operator TEXT NOT NULL CHECK (threshold_operator IN ('>', '<', '>=', '<=', '=', '!=')),
    severity_level TEXT NOT NULL CHECK (severity_level IN ('info', 'warning', 'critical', 'emergency')),
    notification_channels JSONB NOT NULL DEFAULT '{}', -- email, sms, slack, etc.
    escalation_rules JSONB DEFAULT '{}',
    cooldown_minutes INTEGER DEFAULT 30, -- Prevent alert spam
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert History Table
-- Tracks all alerts triggered and their resolution
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_configuration_id UUID REFERENCES alert_configurations(id),
    alert_name TEXT NOT NULL,
    severity_level TEXT NOT NULL,
    metric_value DECIMAL(15,2),
    threshold_value DECIMAL(15,2),
    message TEXT NOT NULL,
    context_data JSONB DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('triggered', 'acknowledged', 'resolved', 'false_positive')),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    response_time_minutes INTEGER, -- Time from trigger to acknowledgment
    resolution_time_minutes INTEGER, -- Time from trigger to resolution
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance tracking indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_clinic_time ON performance_metrics(metric_type, clinic_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_threshold ON performance_metrics(threshold_status, measured_at DESC);

-- AI analytics indexes  
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature_clinic_time ON ai_usage_analytics(feature_type, clinic_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_session ON ai_usage_analytics(session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON ai_usage_analytics(user_id, timestamp DESC);

-- System health indexes
CREATE INDEX IF NOT EXISTS idx_system_health_component_time ON system_health_checks(component_name, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health_checks(health_status, checked_at DESC);

-- Compliance audit indexes
CREATE INDEX IF NOT EXISTS idx_compliance_framework_time ON compliance_audit_logs(compliance_framework, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_status_time ON compliance_audit_logs(compliance_status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_user_time ON compliance_audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_clinic_time ON compliance_audit_logs(clinic_id, timestamp DESC);

-- Business intelligence indexes
CREATE INDEX IF NOT EXISTS idx_bi_metrics_category_clinic_period ON business_intelligence_metrics(metric_category, clinic_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_bi_metrics_name_period ON business_intelligence_metrics(metric_name, period_start DESC);

-- Alert system indexes
CREATE INDEX IF NOT EXISTS idx_alert_config_active ON alert_configurations(is_active, alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_history_status_time ON alert_history(status, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_config_time ON alert_history(alert_configuration_id, triggered_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for healthcare data protection
-- Performance metrics: Users can only see their clinic's data
CREATE POLICY "performance_metrics_clinic_access" ON performance_metrics
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM clinic_staff WHERE clinic_id = performance_metrics.clinic_id
        ) OR 
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'system_admin'
        )
    );

-- AI usage analytics: Users can only see their clinic's data and their own usage
CREATE POLICY "ai_usage_clinic_access" ON ai_usage_analytics
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT user_id FROM clinic_staff WHERE clinic_id = ai_usage_analytics.clinic_id
        ) OR
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'system_admin'
        )
    );

-- System health: Only system admins can access
CREATE POLICY "system_health_admin_only" ON system_health_checks
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'system_admin'
        )
    );

-- Compliance audit logs: Users can see logs related to their clinic or their actions
CREATE POLICY "compliance_audit_access" ON compliance_audit_logs
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT user_id FROM clinic_staff WHERE clinic_id = compliance_audit_logs.clinic_id
        ) OR
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' IN ('system_admin', 'compliance_officer')
        )
    );

-- Business intelligence: Clinic-specific access
CREATE POLICY "bi_metrics_clinic_access" ON business_intelligence_metrics
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM clinic_staff WHERE clinic_id = business_intelligence_metrics.clinic_id
        ) OR
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' IN ('system_admin', 'business_analyst')
        )
    );

-- Alert configurations: Admin and clinic managers only
CREATE POLICY "alert_config_admin_access" ON alert_configurations
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' IN ('system_admin', 'clinic_manager')
        )
    );

-- Alert history: Admin and relevant clinic staff
CREATE POLICY "alert_history_access" ON alert_history
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' IN ('system_admin', 'clinic_manager')
        )
    );

-- Create TimescaleDB hypertables for time-series data (if TimescaleDB is available)
-- This optimizes performance for time-series queries
DO $$ 
BEGIN
    -- Try to create hypertables, fail silently if TimescaleDB is not available
    BEGIN
        PERFORM create_hypertable('performance_metrics', 'measured_at', if_not_exists => TRUE);
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        PERFORM create_hypertable('ai_usage_analytics', 'timestamp', if_not_exists => TRUE);
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        PERFORM create_hypertable('system_health_checks', 'checked_at', if_not_exists => TRUE);
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        PERFORM create_hypertable('compliance_audit_logs', 'timestamp', if_not_exists => TRUE);
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        PERFORM create_hypertable('alert_history', 'triggered_at', if_not_exists => TRUE);
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
END $$;