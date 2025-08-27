-- Migration: Create KPI Dashboard and Analytics Tables
-- Description: Tables for real-time KPI tracking, dashboard customization, and drill-down analysis
-- Author: Dev Agent
-- Date: 2025-01-26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Financial KPIs Table
CREATE TABLE financial_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_name VARCHAR(100) NOT NULL,
    kpi_category VARCHAR(50) NOT NULL, -- revenue, profitability, operational, financial_health
    current_value DECIMAL(15,4) NOT NULL,
    target_value DECIMAL(15,4),
    previous_value DECIMAL(15,4),
    variance_percent DECIMAL(8,4),
    trend_direction VARCHAR(20) DEFAULT 'stable', -- increasing, decreasing, stable
    calculation_formula TEXT,
    data_sources JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Thresholds and Alerts
CREATE TABLE kpi_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES financial_kpis(id) ON DELETE CASCADE,
    threshold_type VARCHAR(20) NOT NULL, -- warning, critical, target
    threshold_value DECIMAL(15,4) NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL, -- gt, lt, eq, gte, lte
    notification_enabled BOOLEAN DEFAULT true,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Layouts and Customization
CREATE TABLE dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    layout_name VARCHAR(100) NOT NULL,
    layout_type VARCHAR(50) DEFAULT 'kpi_dashboard', -- kpi_dashboard, executive_summary, detailed_analysis
    widget_configuration JSONB NOT NULL,
    grid_layout JSONB,
    filters JSONB,
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Drill-down Paths
CREATE TABLE kpi_drill_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES financial_kpis(id) ON DELETE CASCADE,
    drill_level INTEGER NOT NULL DEFAULT 1,
    dimension_name VARCHAR(100) NOT NULL,
    dimension_filters JSONB,
    aggregation_rules JSONB,
    display_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Historical Data
CREATE TABLE kpi_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES financial_kpis(id) ON DELETE CASCADE,
    value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    calculation_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Alerts and Notifications
CREATE TABLE kpi_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES financial_kpis(id) ON DELETE CASCADE,
    threshold_id UUID REFERENCES kpi_thresholds(id) ON DELETE SET NULL,
    alert_type VARCHAR(20) NOT NULL, -- warning, critical, improvement, target_achieved
    alert_message TEXT NOT NULL,
    alert_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Performance Metrics
CREATE TABLE dashboard_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES dashboard_layouts(id) ON DELETE CASCADE,
    load_time_ms INTEGER NOT NULL,
    data_refresh_time_ms INTEGER,
    widget_count INTEGER,
    user_id UUID NOT NULL,
    session_id VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_financial_kpis_category ON financial_kpis(kpi_category);
CREATE INDEX idx_financial_kpis_updated ON financial_kpis(last_updated);
CREATE INDEX idx_kpi_thresholds_kpi_id ON kpi_thresholds(kpi_id);
CREATE INDEX idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
CREATE INDEX idx_dashboard_layouts_default ON dashboard_layouts(is_default) WHERE is_default = true;
CREATE INDEX idx_kpi_drill_paths_kpi_id ON kpi_drill_paths(kpi_id);
CREATE INDEX idx_kpi_history_kpi_recorded ON kpi_history(kpi_id, recorded_at);
CREATE INDEX idx_kpi_alerts_unacknowledged ON kpi_alerts(is_acknowledged) WHERE is_acknowledged = false;
CREATE INDEX idx_dashboard_performance_dashboard ON dashboard_performance(dashboard_id, recorded_at);

-- Row Level Security
ALTER TABLE financial_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_drill_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for clinic context)
CREATE POLICY "Users can view all KPIs" ON financial_kpis FOR SELECT USING (true);
CREATE POLICY "Users can manage KPI thresholds" ON kpi_thresholds FOR ALL USING (true);
CREATE POLICY "Users can manage their dashboards" ON dashboard_layouts FOR ALL USING (true);
CREATE POLICY "Users can view drill-down paths" ON kpi_drill_paths FOR SELECT USING (true);
CREATE POLICY "Users can view KPI history" ON kpi_history FOR SELECT USING (true);
CREATE POLICY "Users can view and acknowledge alerts" ON kpi_alerts FOR ALL USING (true);
CREATE POLICY "Users can log performance metrics" ON dashboard_performance FOR ALL USING (true);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_kpis_updated_at BEFORE UPDATE ON financial_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_thresholds_updated_at BEFORE UPDATE ON kpi_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_layouts_updated_at BEFORE UPDATE ON dashboard_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample KPIs
INSERT INTO financial_kpis (kpi_name, kpi_category, current_value, target_value, calculation_formula) VALUES
('Total Revenue', 'revenue', 0, 100000, 'SUM(invoice_amount) WHERE period = current_month'),
('Revenue Per Patient', 'revenue', 0, 500, 'total_revenue / active_patients'),
('Gross Profit Margin', 'profitability', 0, 65, '(revenue - direct_costs) / revenue * 100'),
('EBITDA', 'profitability', 0, 25000, 'earnings + interest + taxes + depreciation + amortization'),
('Net Profit Margin', 'profitability', 0, 15, 'net_profit / total_revenue * 100'),
('Cash Flow Ratio', 'financial_health', 0, 2.5, 'operating_cash_flow / current_liabilities'),
('Patient Retention Rate', 'operational', 0, 85, 'returning_patients / total_patients * 100'),
('Appointment Utilization', 'operational', 0, 90, 'booked_appointments / available_slots * 100'),
('Accounts Receivable Turnover', 'financial_health', 0, 12, 'annual_revenue / average_accounts_receivable'),
('Cost Per Patient Acquisition', 'operational', 0, 50, 'marketing_costs / new_patients');

-- Insert sample thresholds
INSERT INTO kpi_thresholds (kpi_id, threshold_type, threshold_value, comparison_operator, notification_settings)
SELECT 
    k.id,
    'warning',
    k.target_value * 0.8,
    'lt',
    '{"email": true, "dashboard": true, "escalation_hours": 2}'::jsonb
FROM financial_kpis k
WHERE k.target_value IS NOT NULL;

INSERT INTO kpi_thresholds (kpi_id, threshold_type, threshold_value, comparison_operator, notification_settings)
SELECT 
    k.id,
    'critical',
    k.target_value * 0.6,
    'lt',
    '{"email": true, "dashboard": true, "sms": true, "escalation_hours": 1}'::jsonb
FROM financial_kpis k
WHERE k.target_value IS NOT NULL;