-- =====================================================================================
-- Advanced Financial Reporting System Migration
-- Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
-- Created: 2025-01-27
-- Author: VoidBeast V4.0 (BMad Method Implementation)
-- =====================================================================================

-- Financial Reports Table
-- Stores generated financial reports with metadata and file paths
CREATE TABLE IF NOT EXISTS financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL, -- 'profit_loss', 'balance_sheet', 'cash_flow', 'revenue_analysis', 'expense_analysis'
    report_name VARCHAR(200) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}', -- Report generation parameters (date range, filters, etc.)
    generated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    file_path TEXT, -- Path to generated report file
    file_format VARCHAR(10) NOT NULL DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
    status VARCHAR(20) NOT NULL DEFAULT 'generated', -- 'generating', 'generated', 'failed', 'archived'
    generated_by UUID REFERENCES auth.users(id),
    clinic_id UUID REFERENCES clinics(id),
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial KPIs Table
-- Tracks key performance indicators with targets and thresholds
CREATE TABLE IF NOT EXISTS financial_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id),
    kpi_name VARCHAR(100) NOT NULL, -- 'total_revenue', 'gross_profit_margin', 'net_profit_margin', 'cash_flow_ratio', etc.
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    current_value DECIMAL(15,2) NOT NULL,
    target_value DECIMAL(15,2),
    previous_value DECIMAL(15,2), -- For trend calculation
    threshold_warning DECIMAL(15,2), -- Warning threshold
    threshold_critical DECIMAL(15,2), -- Critical threshold
    unit_type VARCHAR(20) NOT NULL DEFAULT 'currency', -- 'currency', 'percentage', 'number', 'ratio'
    calculation_method TEXT, -- Description of how KPI is calculated
    alert_status VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'warning', 'critical'
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    last_calculated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report Schedules Table
-- Manages automated report generation and delivery
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    clinic_id UUID REFERENCES clinics(id),
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    frequency_config JSONB NOT NULL DEFAULT '{}', -- Day of week, day of month, etc.
    report_parameters JSONB NOT NULL DEFAULT '{}', -- Parameters for report generation
    recipients TEXT[] NOT NULL, -- Array of email addresses
    delivery_format VARCHAR(10) NOT NULL DEFAULT 'pdf',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ NOT NULL,
    run_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_failure_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Analytics Table
-- Stores pre-calculated analytics data for dashboard performance
CREATE TABLE IF NOT EXISTS financial_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id),
    metric_name VARCHAR(100) NOT NULL, -- 'monthly_revenue', 'service_profitability', 'provider_performance', etc.
    metric_category VARCHAR(50) NOT NULL, -- 'revenue', 'expenses', 'profitability', 'operational'
    metric_value DECIMAL(15,2) NOT NULL,
    metric_data JSONB NOT NULL DEFAULT '{}', -- Additional metric data and breakdown
    comparison_value DECIMAL(15,2), -- Previous period value for comparison
    variance_amount DECIMAL(15,2), -- Calculated variance
    variance_percentage DECIMAL(5,2), -- Variance as percentage
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    dimension_filters JSONB NOT NULL DEFAULT '{}', -- Applied filters (service, provider, location, etc.)
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Benchmarks Table
-- Stores industry benchmarks and targets for comparison
CREATE TABLE IF NOT EXISTS financial_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_name VARCHAR(100) NOT NULL,
    benchmark_category VARCHAR(50) NOT NULL, -- 'industry', 'clinic_type', 'region'
    metric_name VARCHAR(100) NOT NULL,
    benchmark_value DECIMAL(15,2) NOT NULL,
    unit_type VARCHAR(20) NOT NULL,
    source VARCHAR(200), -- Source of benchmark data
    applicable_criteria JSONB NOT NULL DEFAULT '{}', -- Criteria for when benchmark applies
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budget Plans Table
-- Manages budget planning and variance tracking
CREATE TABLE IF NOT EXISTS budget_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id),
    plan_name VARCHAR(200) NOT NULL,
    description TEXT,
    budget_year INTEGER NOT NULL,
    budget_type VARCHAR(20) NOT NULL DEFAULT 'annual', -- 'annual', 'quarterly', 'monthly'
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'active', 'completed'
    total_revenue_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_expense_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budget Items Table
-- Detailed budget line items for revenue and expense categories
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_plan_id UUID REFERENCES budget_plans(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL, -- 'consultation_revenue', 'treatment_revenue', 'staff_costs', 'equipment_costs', etc.
    category_type VARCHAR(20) NOT NULL, -- 'revenue', 'expense'
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance_amount DECIMAL(15,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2) DEFAULT 0,
    period_allocation JSONB NOT NULL DEFAULT '{}', -- Monthly/quarterly allocation breakdown
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report Templates Table
-- Customizable report templates for different clinic needs
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    description TEXT,
    template_config JSONB NOT NULL DEFAULT '{}', -- Template configuration (layout, fields, formatting)
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false, -- Available to all clinics
    clinic_id UUID REFERENCES clinics(id), -- NULL for public templates
    created_by UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================================

-- Financial Reports Indexes
CREATE INDEX IF NOT EXISTS idx_financial_reports_clinic_type ON financial_reports(clinic_id, report_type);
CREATE INDEX IF NOT EXISTS idx_financial_reports_date_range ON financial_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_reports_status ON financial_reports(status);
CREATE INDEX IF NOT EXISTS idx_financial_reports_generated_date ON financial_reports(generated_date DESC);

-- Financial KPIs Indexes
CREATE INDEX IF NOT EXISTS idx_financial_kpis_clinic_name ON financial_kpis(clinic_id, kpi_name);
CREATE INDEX IF NOT EXISTS idx_financial_kpis_period ON financial_kpis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_kpis_alert_status ON financial_kpis(alert_status);
CREATE INDEX IF NOT EXISTS idx_financial_kpis_last_calculated ON financial_kpis(last_calculated DESC);

-- Report Schedules Indexes
CREATE INDEX IF NOT EXISTS idx_report_schedules_clinic_active ON report_schedules(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run) WHERE is_active = true;

-- Financial Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_financial_analytics_clinic_metric ON financial_analytics(clinic_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_period ON financial_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_category ON financial_analytics(metric_category);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_calculated ON financial_analytics(calculated_at DESC);

-- Budget Plans Indexes
CREATE INDEX IF NOT EXISTS idx_budget_plans_clinic_year ON budget_plans(clinic_id, budget_year);
CREATE INDEX IF NOT EXISTS idx_budget_plans_status ON budget_plans(status);

-- Budget Items Indexes
CREATE INDEX IF NOT EXISTS idx_budget_items_plan_category ON budget_items(budget_plan_id, category_type);

-- =====================================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================================

-- Enable RLS
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Financial Reports Policies
CREATE POLICY "financial_reports_clinic_access" ON financial_reports
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager' OR role = 'financial')
        )
    );

-- Financial KPIs Policies
CREATE POLICY "financial_kpis_clinic_access" ON financial_kpis
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager' OR role = 'financial')
        )
    );

-- Report Schedules Policies
CREATE POLICY "report_schedules_clinic_access" ON report_schedules
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager')
        )
    );

-- Financial Analytics Policies
CREATE POLICY "financial_analytics_clinic_access" ON financial_analytics
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager' OR role = 'financial')
        )
    );

-- Financial Benchmarks Policies (Public read, admin write)
CREATE POLICY "financial_benchmarks_read" ON financial_benchmarks
    FOR SELECT USING (is_active = true);

CREATE POLICY "financial_benchmarks_write" ON financial_benchmarks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Budget Plans Policies
CREATE POLICY "budget_plans_clinic_access" ON budget_plans
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager' OR role = 'financial')
        )
    );

-- Budget Items Policies
CREATE POLICY "budget_items_clinic_access" ON budget_items
    FOR ALL USING (
        budget_plan_id IN (
            SELECT bp.id FROM budget_plans bp
            JOIN user_clinic_access uca ON bp.clinic_id = uca.clinic_id
            WHERE uca.user_id = auth.uid() 
            AND (uca.role = 'admin' OR uca.role = 'manager' OR uca.role = 'financial')
        )
    );

-- Report Templates Policies
CREATE POLICY "report_templates_access" ON report_templates
    FOR SELECT USING (
        is_public = true OR 
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "report_templates_write" ON report_templates
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid() 
            AND (role = 'admin' OR role = 'manager')
        )
    );

-- =====================================================================================
-- TRIGGERS FOR AUTOMATED MAINTENANCE
-- =====================================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_financial_reporting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER trigger_financial_reports_updated_at
    BEFORE UPDATE ON financial_reports
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

CREATE TRIGGER trigger_financial_kpis_updated_at
    BEFORE UPDATE ON financial_kpis
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

CREATE TRIGGER trigger_report_schedules_updated_at
    BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

CREATE TRIGGER trigger_financial_benchmarks_updated_at
    BEFORE UPDATE ON financial_benchmarks
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

CREATE TRIGGER trigger_budget_plans_updated_at
    BEFORE UPDATE ON budget_plans
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

CREATE TRIGGER trigger_report_templates_updated_at
    BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_financial_reporting_updated_at();

-- =====================================================================================
-- SAMPLE DATA FOR TESTING AND DEMONSTRATION
-- =====================================================================================

-- Insert sample financial benchmarks
INSERT INTO financial_benchmarks (
    benchmark_name, benchmark_category, metric_name, benchmark_value, 
    unit_type, source, applicable_criteria, effective_date
) VALUES 
('Healthcare Industry Revenue Growth', 'industry', 'revenue_growth_rate', 8.5, 'percentage', 'ANS Healthcare Statistics 2024', '{"clinic_type": "aesthetic", "region": "southeast"}', '2024-01-01'),
('Aesthetic Clinic Profit Margin', 'clinic_type', 'gross_profit_margin', 65.0, 'percentage', 'Brazilian Aesthetic Medicine Association', '{"clinic_type": "aesthetic"}', '2024-01-01'),
('Small Clinic Operating Ratio', 'clinic_type', 'operating_expense_ratio', 45.0, 'percentage', 'Healthcare Management Institute', '{"clinic_size": "small"}', '2024-01-01'),
('Patient Retention Benchmark', 'industry', 'patient_retention_rate', 75.0, 'percentage', 'Healthcare CRM Analytics', '{"clinic_type": "all"}', '2024-01-01');

-- Insert sample report templates
INSERT INTO report_templates (
    template_name, report_type, description, template_config, is_default, is_public
) VALUES 
('Standard P&L Statement', 'profit_loss', 'Standard profit and loss statement with Brazilian accounting standards', '{"sections": ["revenue", "costs", "expenses", "profit"], "format": "standard", "currency": "BRL"}', true, true),
('Executive Dashboard', 'executive_summary', 'High-level executive summary with key KPIs and trends', '{"metrics": ["revenue", "profit", "growth", "patients"], "visualization": "charts", "period": "monthly"}', true, true),
('Cash Flow Analysis', 'cash_flow', 'Detailed cash flow analysis with operating, investing, and financing activities', '{"categories": ["operating", "investing", "financing"], "format": "detailed"}', true, true),
('Service Profitability Report', 'revenue_analysis', 'Detailed analysis of service profitability and performance', '{"breakdown": ["service", "provider", "location"], "metrics": ["revenue", "cost", "profit", "margin"]}', true, true);

-- =====================================================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================================================

COMMENT ON TABLE financial_reports IS 'Stores generated financial reports with metadata and file paths for clinic financial analysis';
COMMENT ON TABLE financial_kpis IS 'Tracks key performance indicators with targets, thresholds, and alerts for financial monitoring';
COMMENT ON TABLE report_schedules IS 'Manages automated report generation and delivery schedules for clinic stakeholders';
COMMENT ON TABLE financial_analytics IS 'Pre-calculated analytics data for dashboard performance and business intelligence';
COMMENT ON TABLE financial_benchmarks IS 'Industry and clinic-type benchmarks for performance comparison and goal setting';
COMMENT ON TABLE budget_plans IS 'Annual and periodic budget planning with approval workflow for financial management';
COMMENT ON TABLE budget_items IS 'Detailed budget line items with variance tracking for expense and revenue categories';
COMMENT ON TABLE report_templates IS 'Customizable report templates for different clinic needs and stakeholder requirements';

-- Migration completed successfully
-- Advanced Financial Reporting System ready for Epic 5 Story 5.1 implementation