-- Story 8.1: Real-time Business Dashboard Schema
-- Epic 8: Business Intelligence & Real-time Analytics

-- Dashboard configuration and settings
CREATE TABLE dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dashboard_name TEXT NOT NULL DEFAULT 'Main Business Dashboard',
    layout_config JSONB NOT NULL DEFAULT '{}',
    widget_config JSONB NOT NULL DEFAULT '[]',
    refresh_interval INTEGER NOT NULL DEFAULT 30, -- seconds
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard widgets and components
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_config_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL, -- 'kpi', 'chart', 'table', 'metric', 'alert'
    widget_title TEXT NOT NULL,
    data_source TEXT NOT NULL, -- 'appointments', 'patients', 'revenue', 'inventory', etc.
    query_config JSONB NOT NULL DEFAULT '{}',
    display_config JSONB NOT NULL DEFAULT '{}',
    position_config JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 4, "height": 3}',
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time dashboard metrics cache
CREATE TABLE dashboard_metrics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard performance monitoring
CREATE TABLE dashboard_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_config_id UUID REFERENCES dashboard_configs(id) ON DELETE CASCADE,
    load_time_ms INTEGER NOT NULL,
    query_time_ms INTEGER NOT NULL,
    render_time_ms INTEGER NOT NULL,
    total_widgets INTEGER NOT NULL,
    cached_widgets INTEGER NOT NULL DEFAULT 0,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business KPI snapshots for historical comparison
CREATE TABLE business_kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    revenue_metrics JSONB NOT NULL DEFAULT '{}',
    patient_metrics JSONB NOT NULL DEFAULT '{}',
    appointment_metrics JSONB NOT NULL DEFAULT '{}',
    efficiency_metrics JSONB NOT NULL DEFAULT '{}',
    performance_metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time alerts and notifications
CREATE TABLE dashboard_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'performance', 'revenue', 'capacity', 'system'
    alert_level TEXT NOT NULL, -- 'info', 'warning', 'critical'
    alert_title TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    alert_data JSONB NOT NULL DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX idx_dashboard_configs_user_clinic ON dashboard_configs(user_id, clinic_id);
CREATE INDEX idx_dashboard_widgets_config ON dashboard_widgets(dashboard_config_id);
CREATE INDEX idx_dashboard_metrics_cache_clinic_key ON dashboard_metrics_cache(clinic_id, metric_key);
CREATE INDEX idx_dashboard_metrics_cache_expires ON dashboard_metrics_cache(expires_at);
CREATE INDEX idx_dashboard_performance_logs_config ON dashboard_performance_logs(dashboard_config_id);
CREATE INDEX idx_business_kpi_snapshots_clinic_date ON business_kpi_snapshots(clinic_id, snapshot_date);
CREATE INDEX idx_dashboard_alerts_clinic_level ON dashboard_alerts(clinic_id, alert_level) WHERE NOT is_dismissed;

-- Enable RLS
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own dashboard configs" ON dashboard_configs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access widgets from their dashboard configs" ON dashboard_widgets
    FOR ALL USING (
        dashboard_config_id IN (
            SELECT id FROM dashboard_configs WHERE auth.uid() = user_id
        )
    );

CREATE POLICY "Users can access metrics cache for their clinic" ON dashboard_metrics_cache
    FOR ALL USING (
        clinic_id IN (
            SELECT id FROM profiles WHERE auth.uid() = user_id
        )
    );

CREATE POLICY "Users can access performance logs for their dashboards" ON dashboard_performance_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access KPI snapshots for their clinic" ON business_kpi_snapshots
    FOR ALL USING (
        clinic_id IN (
            SELECT id FROM profiles WHERE auth.uid() = user_id
        )
    );

CREATE POLICY "Users can access alerts for their clinic" ON dashboard_alerts
    FOR ALL USING (
        clinic_id IN (
            SELECT id FROM profiles WHERE auth.uid() = user_id
        )
    );

-- Functions for real-time dashboard updates
CREATE OR REPLACE FUNCTION update_dashboard_metrics_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate related cache entries when data changes
    DELETE FROM dashboard_metrics_cache 
    WHERE expires_at < NOW() 
       OR (metric_key LIKE '%' || TG_TABLE_NAME || '%');
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for cache invalidation
CREATE TRIGGER trigger_appointments_dashboard_cache
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_metrics_cache();

CREATE TRIGGER trigger_patients_dashboard_cache
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_metrics_cache();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_dashboard_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dashboard_metrics_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE dashboard_configs IS 'Real-time business dashboard configuration and settings';
COMMENT ON TABLE dashboard_widgets IS 'Individual dashboard widgets and their configuration';
COMMENT ON TABLE dashboard_metrics_cache IS 'Cached dashboard metrics for performance optimization';
COMMENT ON TABLE dashboard_performance_logs IS 'Dashboard performance monitoring and analytics';
COMMENT ON TABLE business_kpi_snapshots IS 'Historical business KPI snapshots for trend analysis';
COMMENT ON TABLE dashboard_alerts IS 'Real-time dashboard alerts and notifications';
