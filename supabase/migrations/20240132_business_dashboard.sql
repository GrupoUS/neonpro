-- ================================================
-- Business Dashboard Migration
-- Real-time Business Dashboard with KPIs and Analytics
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dashboard Configurations Table
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES profiles(clinic_id),
  layout_config JSONB NOT NULL DEFAULT '{}',
  widget_preferences JSONB NOT NULL DEFAULT '{}',
  update_frequency INTEGER NOT NULL DEFAULT 30, -- seconds
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Metrics Table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES profiles(clinic_id),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- revenue, patient, appointment, efficiency
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  calculation_period VARCHAR(20) NOT NULL DEFAULT 'daily', -- daily, weekly, monthly, yearly
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Alerts Table
CREATE TABLE IF NOT EXISTS dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES profiles(clinic_id),
  alert_type VARCHAR(50) NOT NULL, -- revenue_drop, low_bookings, high_cancellations
  metric_name VARCHAR(100) NOT NULL,
  threshold_value DECIMAL(15,2) NOT NULL,
  threshold_operator VARCHAR(10) NOT NULL DEFAULT 'less_than', -- less_than, greater_than, equals
  notification_method VARCHAR(50) NOT NULL DEFAULT 'email', -- email, sms, push, dashboard
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Logs Table
CREATE TABLE IF NOT EXISTS performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES profiles(clinic_id),
  dashboard_load_time INTEGER NOT NULL, -- milliseconds
  data_fetch_time INTEGER NOT NULL, -- milliseconds
  widget_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  widget_type VARCHAR(50) NOT NULL, -- chart, metric, table, alert
  widget_name VARCHAR(100) NOT NULL,
  data_source VARCHAR(100) NOT NULL, -- patients, appointments, revenue, etc.
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 3,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Data Cache Table
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES profiles(clinic_id),
  cache_key VARCHAR(200) NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_id ON dashboard_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_clinic_id ON dashboard_configs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_kpi_metrics_clinic_id ON kpi_metrics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_type_date ON kpi_metrics(metric_type, calculation_date);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_name_period ON kpi_metrics(metric_name, calculation_period);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_user_id ON dashboard_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_clinic_id ON dashboard_alerts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_active ON dashboard_alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_performance_logs_user_id ON performance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_clinic_id ON performance_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_config_id ON dashboard_widgets(config_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);

CREATE INDEX IF NOT EXISTS idx_dashboard_cache_clinic_id ON dashboard_cache(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_key ON dashboard_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_expires ON dashboard_cache(expires_at);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_dashboard_configs_updated_at 
  BEFORE UPDATE ON dashboard_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_metrics_updated_at 
  BEFORE UPDATE ON kpi_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_alerts_updated_at 
  BEFORE UPDATE ON dashboard_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
  BEFORE UPDATE ON dashboard_widgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_configs
CREATE POLICY "Users can manage their own dashboard configs" ON dashboard_configs
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for kpi_metrics
CREATE POLICY "Users can view KPI metrics for their clinic" ON kpi_metrics
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage KPI metrics" ON kpi_metrics
  FOR ALL USING (true); -- For system-level operations

-- RLS Policies for dashboard_alerts
CREATE POLICY "Users can manage their own dashboard alerts" ON dashboard_alerts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for performance_logs
CREATE POLICY "Users can view their own performance logs" ON performance_logs
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for dashboard_widgets
CREATE POLICY "Users can manage widgets for their dashboard configs" ON dashboard_widgets
  FOR ALL USING (
    config_id IN (
      SELECT id FROM dashboard_configs WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for dashboard_cache
CREATE POLICY "Users can access cache for their clinic" ON dashboard_cache
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage dashboard cache" ON dashboard_cache
  FOR ALL USING (true); -- For system-level cache operations

-- Create function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_dashboard_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM dashboard_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate KPI metrics
CREATE OR REPLACE FUNCTION calculate_clinic_kpis(clinic_uuid UUID, calculation_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  daily_revenue DECIMAL(15,2);
  new_patients INTEGER;
  total_appointments INTEGER;
  cancellation_rate DECIMAL(5,2);
BEGIN
  -- Calculate daily revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO daily_revenue
  FROM invoices 
  WHERE clinic_id = clinic_uuid 
    AND DATE(created_at) = calculation_date;

  -- Calculate new patients
  SELECT COUNT(*) INTO new_patients
  FROM patients 
  WHERE clinic_id = clinic_uuid 
    AND DATE(created_at) = calculation_date;

  -- Calculate total appointments
  SELECT COUNT(*) INTO total_appointments
  FROM appointments 
  WHERE clinic_id = clinic_uuid 
    AND DATE(appointment_date) = calculation_date;

  -- Calculate cancellation rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'cancelled')::DECIMAL / COUNT(*)) * 100
      ELSE 0 
    END INTO cancellation_rate
  FROM appointments 
  WHERE clinic_id = clinic_uuid 
    AND DATE(appointment_date) = calculation_date;

  -- Insert or update KPI metrics
  INSERT INTO kpi_metrics (clinic_id, metric_name, metric_value, metric_type, calculation_date)
  VALUES 
    (clinic_uuid, 'daily_revenue', daily_revenue, 'revenue', calculation_date),
    (clinic_uuid, 'new_patients', new_patients, 'patient', calculation_date),
    (clinic_uuid, 'total_appointments', total_appointments, 'appointment', calculation_date),
    (clinic_uuid, 'cancellation_rate', cancellation_rate, 'efficiency', calculation_date)
  ON CONFLICT (clinic_id, metric_name, calculation_date) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert default dashboard configuration
INSERT INTO dashboard_configs (
  user_id, 
  layout_config, 
  widget_preferences, 
  is_default
) 
SELECT 
  auth.uid(),
  '{
    "layout": "grid",
    "columns": 12,
    "rowHeight": 150,
    "compactType": "vertical"
  }'::jsonb,
  '{
    "theme": "light",
    "autoRefresh": true,
    "refreshInterval": 30,
    "showAnimations": true
  }'::jsonb,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Business Dashboard migration completed successfully' as message;
