-- Executive Dashboard Schema Extensions
-- Migration: 20241220_executive_dashboard_schema
-- Description: Add tables and extensions for executive dashboard system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Dashboard Layouts Table
CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    layout_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_default_layout_per_clinic 
        UNIQUE (clinic_id, is_default) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Widget Configurations Table
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    layout_id UUID REFERENCES dashboard_layouts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'kpi_card', 'line_chart', 'bar_chart', 'pie_chart', 
        'area_chart', 'table', 'metric', 'gauge', 'heatmap'
    )),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'financial', 'operational', 'patients', 'staff', 'general'
    )),
    data_source JSONB NOT NULL DEFAULT '{}',
    configuration JSONB NOT NULL DEFAULT '{}',
    position JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 300, -- seconds
    cache_duration INTEGER DEFAULT 60, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Definitions Table
CREATE TABLE IF NOT EXISTS kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'financial', 'operational', 'patients', 'staff'
    )),
    calculation_method VARCHAR(100) NOT NULL,
    calculation_config JSONB NOT NULL DEFAULT '{}',
    format VARCHAR(20) DEFAULT 'number' CHECK (format IN (
        'number', 'currency', 'percentage', 'duration'
    )),
    unit VARCHAR(20),
    target_value DECIMAL(15,2),
    target_operator VARCHAR(10) CHECK (target_operator IN (
        '>', '>=', '<', '<=', '=', '!='
    )),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_kpi_name_per_clinic UNIQUE (clinic_id, name)
);

-- KPI Values Table (Historical data)
CREATE TABLE IF NOT EXISTS kpi_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    value DECIMAL(15,4) NOT NULL,
    previous_value DECIMAL(15,4),
    trend DECIMAL(8,4), -- percentage change
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    calculation_metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_kpi_period UNIQUE (kpi_definition_id, period_start, period_end)
);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    kpi_definition_id UUID REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN (
        'threshold', 'trend', 'anomaly', 'custom'
    )),
    condition_config JSONB NOT NULL DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN (
        'info', 'warning', 'critical'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    notification_config JSONB DEFAULT '{}',
    cooldown_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_alert_name_per_clinic UNIQUE (clinic_id, name)
);

-- Alert Instances Table
CREATE TABLE IF NOT EXISTS alert_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    kpi_value_id UUID REFERENCES kpi_values(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'info', 'warning', 'critical'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'acknowledged', 'resolved', 'dismissed'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    trigger_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    metadata JSONB DEFAULT '{}',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Alert Notifications Table
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_instance_id UUID NOT NULL REFERENCES alert_instances(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN (
        'email', 'sms', 'push', 'webhook'
    )),
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'failed', 'bounced'
    )),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'executive_summary', 'financial_report', 'operational_report',
        'patient_analytics', 'staff_performance', 'custom_report'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_template_name_per_clinic UNIQUE (clinic_id, name)
);

-- Report Schedules Table
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand'
    )),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
    is_active BOOLEAN DEFAULT TRUE,
    schedule JSONB NOT NULL DEFAULT '{}',
    recipients JSONB NOT NULL DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_schedule_name_per_clinic UNIQUE (clinic_id, name)
);

-- Report Instances Table
CREATE TABLE IF NOT EXISTS report_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'generating', 'completed', 'failed', 'cancelled'
    )),
    parameters JSONB DEFAULT '{}',
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    file_path TEXT,
    file_size BIGINT,
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Widget Data Cache Table
CREATE TABLE IF NOT EXISTS widget_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    widget_id UUID NOT NULL REFERENCES widget_configs(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_widget_cache_key UNIQUE (widget_id, cache_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_clinic_user ON dashboard_layouts(clinic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_default ON dashboard_layouts(clinic_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_widget_configs_clinic ON widget_configs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_layout ON widget_configs(layout_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_category ON widget_configs(category);
CREATE INDEX IF NOT EXISTS idx_widget_configs_active ON widget_configs(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_kpi_definitions_clinic ON kpi_definitions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON kpi_definitions(category);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_active ON kpi_definitions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_kpi_values_definition ON kpi_values(kpi_definition_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_clinic ON kpi_values(clinic_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_period ON kpi_values(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_kpi_values_calculated_at ON kpi_values(calculated_at);

CREATE INDEX IF NOT EXISTS idx_alert_rules_clinic ON alert_rules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_kpi ON alert_rules(kpi_definition_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_alert_instances_rule ON alert_instances(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_instances_clinic ON alert_instances(clinic_id);
CREATE INDEX IF NOT EXISTS idx_alert_instances_status ON alert_instances(status);
CREATE INDEX IF NOT EXISTS idx_alert_instances_triggered_at ON alert_instances(triggered_at);

CREATE INDEX IF NOT EXISTS idx_alert_notifications_instance ON alert_notifications(alert_instance_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_status ON alert_notifications(status);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_type ON alert_notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_report_templates_clinic ON report_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON report_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_report_schedules_template ON report_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_clinic ON report_schedules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_report_instances_template ON report_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_report_instances_schedule ON report_instances(schedule_id);
CREATE INDEX IF NOT EXISTS idx_report_instances_clinic ON report_instances(clinic_id);
CREATE INDEX IF NOT EXISTS idx_report_instances_status ON report_instances(status);
CREATE INDEX IF NOT EXISTS idx_report_instances_started_at ON report_instances(started_at);

CREATE INDEX IF NOT EXISTS idx_widget_data_cache_widget ON widget_data_cache(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_data_cache_expires ON widget_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_widget_data_cache_key ON widget_data_cache(cache_key);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_layouts_updated_at 
    BEFORE UPDATE ON dashboard_layouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_configs_updated_at 
    BEFORE UPDATE ON widget_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_definitions_updated_at 
    BEFORE UPDATE ON kpi_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at 
    BEFORE UPDATE ON report_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at 
    BEFORE UPDATE ON report_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_widget_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM widget_data_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old alert instances
CREATE OR REPLACE FUNCTION clean_old_alert_instances(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM alert_instances 
    WHERE triggered_at < NOW() - INTERVAL '1 day' * retention_days
    AND status IN ('resolved', 'dismissed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old report instances
CREATE OR REPLACE FUNCTION clean_old_report_instances(retention_days INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM report_instances 
    WHERE started_at < NOW() - INTERVAL '1 day' * retention_days
    AND status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup jobs (requires pg_cron extension)
-- Clean expired cache every hour
SELECT cron.schedule('clean-widget-cache', '0 * * * *', 'SELECT clean_expired_widget_cache();');

-- Clean old alerts daily at 2 AM
SELECT cron.schedule('clean-old-alerts', '0 2 * * *', 'SELECT clean_old_alert_instances();');

-- Clean old reports weekly on Sunday at 3 AM
SELECT cron.schedule('clean-old-reports', '0 3 * * 0', 'SELECT clean_old_report_instances();');

-- Row Level Security (RLS) Policies
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_data_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinic-based access
CREATE POLICY "Users can access their clinic's dashboard layouts" ON dashboard_layouts
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's widgets" ON widget_configs
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's KPI definitions" ON kpi_definitions
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's KPI values" ON kpi_values
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's alert rules" ON alert_rules
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's alert instances" ON alert_instances
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's alert notifications" ON alert_notifications
    FOR ALL USING (
        alert_instance_id IN (
            SELECT id FROM alert_instances 
            WHERE clinic_id IN (
                SELECT clinic_id FROM clinic_users 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access their clinic's report templates" ON report_templates
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's report schedules" ON report_schedules
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's report instances" ON report_instances
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their clinic's widget cache" ON widget_data_cache
    FOR ALL USING (
        widget_id IN (
            SELECT id FROM widget_configs 
            WHERE clinic_id IN (
                SELECT clinic_id FROM clinic_users 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Insert default KPI definitions
INSERT INTO kpi_definitions (id, clinic_id, name, description, category, calculation_method, format, target_value, target_operator, display_order)
SELECT 
    uuid_generate_v4(),
    c.id,
    'Receita Mensal',
    'Receita total do mês atual',
    'financial',
    'monthly_revenue',
    'currency',
    50000.00,
    '>=',
    1
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM kpi_definitions k 
    WHERE k.clinic_id = c.id AND k.name = 'Receita Mensal'
);

INSERT INTO kpi_definitions (id, clinic_id, name, description, category, calculation_method, format, target_value, target_operator, display_order)
SELECT 
    uuid_generate_v4(),
    c.id,
    'Ticket Médio',
    'Valor médio por consulta/procedimento',
    'financial',
    'average_ticket',
    'currency',
    200.00,
    '>=',
    2
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM kpi_definitions k 
    WHERE k.clinic_id = c.id AND k.name = 'Ticket Médio'
);

INSERT INTO kpi_definitions (id, clinic_id, name, description, category, calculation_method, format, target_value, target_operator, display_order)
SELECT 
    uuid_generate_v4(),
    c.id,
    'Taxa de Ocupação',
    'Percentual de ocupação da agenda',
    'operational',
    'occupancy_rate',
    'percentage',
    80.00,
    '>=',
    3
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM kpi_definitions k 
    WHERE k.clinic_id = c.id AND k.name = 'Taxa de Ocupação'
);

INSERT INTO kpi_definitions (id, clinic_id, name, description, category, calculation_method, format, target_value, target_operator, display_order)
SELECT 
    uuid_generate_v4(),
    c.id,
    'Novos Pacientes',
    'Número de novos pacientes no mês',
    'patients',
    'new_patients_count',
    'number',
    50.00,
    '>=',
    4
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM kpi_definitions k 
    WHERE k.clinic_id = c.id AND k.name = 'Novos Pacientes'
);

-- Insert default report templates
INSERT INTO report_templates (id, clinic_id, name, description, type, configuration)
SELECT 
    uuid_generate_v4(),
    c.id,
    'Relatório Executivo Mensal',
    'Resumo executivo com principais KPIs e métricas do mês',
    'executive_summary',
    '{
        "sections": [
            {
                "id": "financial_summary",
                "title": "Resumo Financeiro",
                "type": "kpi_summary",
                "dataSource": "financial_kpis"
            },
            {
                "id": "revenue_trend",
                "title": "Tendência de Receita",
                "type": "chart",
                "dataSource": "monthly_revenue_trend"
            }
        ],
        "layout": {
            "orientation": "portrait",
            "pageSize": "A4",
            "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
            "header": {"enabled": true, "content": "Relatório Executivo", "height": 50},
            "footer": {"enabled": true, "content": "Confidencial", "height": 30}
        },
        "filters": {
            "dateRange": {"enabled": true, "defaultPeriod": "last_30_days"}
        }
    }'::jsonb
FROM clinics c
WHERE NOT EXISTS (
    SELECT 1 FROM report_templates r 
    WHERE r.clinic_id = c.id AND r.name = 'Relatório Executivo Mensal'
);

-- Create notification for successful migration
DO $$
BEGIN
    RAISE NOTICE 'Executive Dashboard schema migration completed successfully!';
    RAISE NOTICE 'Created tables: dashboard_layouts, widget_configs, kpi_definitions, kpi_values, alert_rules, alert_instances, alert_notifications, report_templates, report_schedules, report_instances, widget_data_cache';
    RAISE NOTICE 'Created indexes, triggers, RLS policies, and cleanup functions';
    RAISE NOTICE 'Scheduled cleanup jobs with pg_cron';
    RAISE NOTICE 'Inserted default KPI definitions and report templates for all clinics';
END $$;