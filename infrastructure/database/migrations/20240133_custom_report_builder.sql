-- Migration: Custom Report Builder System
-- Story 8.2: Custom Report Builder (Drag-Drop Interface)
-- Created: 2025-01-26

-- Custom Reports Table
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_description TEXT,
    report_config JSONB NOT NULL DEFAULT '{}',
    data_sources JSONB NOT NULL DEFAULT '[]',
    visualization_type VARCHAR(100) NOT NULL DEFAULT 'table',
    filters JSONB DEFAULT '{}',
    layout_config JSONB DEFAULT '{}',
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinic_settings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_generated TIMESTAMP WITH TIME ZONE,
    generation_count INTEGER DEFAULT 0,
    CONSTRAINT valid_visualization_type CHECK (
        visualization_type IN ('table', 'chart', 'graph', 'metric', 'pivot', 'dashboard')
    )
);

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    category VARCHAR(100) NOT NULL,
    config_json JSONB NOT NULL DEFAULT '{}',
    preview_image TEXT,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES clinic_settings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_category CHECK (
        category IN ('financial', 'patient', 'operational', 'clinical', 'inventory', 'custom')
    ),
    CONSTRAINT valid_rating CHECK (rating >= 0.00 AND rating <= 5.00)
);

-- Report Usage Analytics Table
CREATE TABLE IF NOT EXISTS report_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_count INTEGER DEFAULT 1,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_duration INTEGER DEFAULT 0, -- seconds
    action_type VARCHAR(50) NOT NULL DEFAULT 'view',
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_action_type CHECK (
        action_type IN ('view', 'generate', 'export', 'share', 'edit', 'clone')
    )
);

-- Report Schedules Table
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    schedule_config JSONB NOT NULL DEFAULT '{}',
    recipients JSONB NOT NULL DEFAULT '[]',
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'email',
    format VARCHAR(20) NOT NULL DEFAULT 'pdf',
    is_active BOOLEAN DEFAULT TRUE,
    next_run TIMESTAMP WITH TIME ZONE,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_delivery_method CHECK (
        delivery_method IN ('email', 'dashboard', 'webhook', 'file_system')
    ),
    CONSTRAINT valid_format CHECK (
        format IN ('pdf', 'excel', 'csv', 'powerpoint', 'json')
    )
);

-- Report Collaborators Table
CREATE TABLE IF NOT EXISTS report_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL DEFAULT 'view',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    UNIQUE(report_id, user_id),
    CONSTRAINT valid_permission_level CHECK (
        permission_level IN ('view', 'edit', 'admin', 'owner')
    )
);

-- Report Comments Table
CREATE TABLE IF NOT EXISTS report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES report_comments(id) ON DELETE CASCADE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Source Connectors Table
CREATE TABLE IF NOT EXISTS data_source_connectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connector_name VARCHAR(255) NOT NULL,
    connector_type VARCHAR(100) NOT NULL,
    connection_config JSONB NOT NULL DEFAULT '{}',
    schema_definition JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_tested TIMESTAMP WITH TIME ZONE,
    test_status VARCHAR(20) DEFAULT 'unknown',
    clinic_id UUID REFERENCES clinic_settings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_connector_type CHECK (
        connector_type IN ('internal', 'database', 'api', 'file', 'webhook')
    ),
    CONSTRAINT valid_test_status CHECK (
        test_status IN ('success', 'failed', 'unknown', 'testing')
    )
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_clinic_id ON custom_reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_is_template ON custom_reports(is_template);
CREATE INDEX IF NOT EXISTS idx_custom_reports_visualization_type ON custom_reports(visualization_type);

CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_featured ON report_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_report_templates_usage_count ON report_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_report_templates_rating ON report_templates(rating DESC);

CREATE INDEX IF NOT EXISTS idx_report_usage_analytics_report_id ON report_usage_analytics(report_id);
CREATE INDEX IF NOT EXISTS idx_report_usage_analytics_user_id ON report_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_report_usage_analytics_last_accessed ON report_usage_analytics(last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run);
CREATE INDEX IF NOT EXISTS idx_report_schedules_is_active ON report_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_report_collaborators_report_id ON report_collaborators(report_id);
CREATE INDEX IF NOT EXISTS idx_report_collaborators_user_id ON report_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_parent_id ON report_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_data_source_connectors_clinic_id ON data_source_connectors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_data_source_connectors_type ON data_source_connectors(connector_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON custom_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_comments_updated_at BEFORE UPDATE ON report_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_source_connectors_updated_at BEFORE UPDATE ON data_source_connectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_connectors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own reports and public reports" ON custom_reports
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_public = true OR
        EXISTS (
            SELECT 1 FROM report_collaborators 
            WHERE report_id = custom_reports.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own reports" ON custom_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports or collaborated reports" ON custom_reports
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM report_collaborators 
            WHERE report_id = custom_reports.id 
            AND user_id = auth.uid() 
            AND permission_level IN ('edit', 'admin', 'owner')
        )
    );

CREATE POLICY "Users can delete their own reports" ON custom_reports
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for report_templates
CREATE POLICY "Everyone can view active templates" ON report_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create templates" ON report_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Template creators can update their templates" ON report_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Template creators can delete their templates" ON report_templates
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for report_usage_analytics
CREATE POLICY "Users can view their own usage analytics" ON report_usage_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage records" ON report_usage_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for report_schedules
CREATE POLICY "Users can view schedules for their reports" ON report_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_reports 
            WHERE id = report_schedules.report_id 
            AND (user_id = auth.uid() OR is_public = true)
        )
    );

CREATE POLICY "Users can create schedules for their reports" ON report_schedules
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Schedule creators can update their schedules" ON report_schedules
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Schedule creators can delete their schedules" ON report_schedules
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for report_collaborators
CREATE POLICY "Users can view collaborations they're part of" ON report_collaborators
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_by);

CREATE POLICY "Report owners can manage collaborators" ON report_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM custom_reports 
            WHERE id = report_collaborators.report_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for report_comments
CREATE POLICY "Users can view comments on accessible reports" ON report_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_reports 
            WHERE id = report_comments.report_id 
            AND (
                user_id = auth.uid() OR 
                is_public = true OR
                EXISTS (
                    SELECT 1 FROM report_collaborators 
                    WHERE report_id = custom_reports.id 
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create comments on accessible reports" ON report_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON report_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON report_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for data_source_connectors
CREATE POLICY "Users can view connectors for their clinic" ON data_source_connectors
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Insert default report templates
INSERT INTO report_templates (template_name, template_description, category, config_json, is_featured, tags) VALUES
('Revenue Analysis', 'Comprehensive revenue analysis with monthly trends and forecasting', 'financial', 
'{"charts": [{"type": "line", "data_source": "appointments", "metrics": ["revenue"]}], "filters": ["date_range", "treatment_type"]}', 
true, ARRAY['revenue', 'financial', 'trends']),

('Patient Demographics', 'Patient demographic breakdown with age groups and geographic distribution', 'patient', 
'{"charts": [{"type": "pie", "data_source": "patients", "metrics": ["age_group", "location"]}], "filters": ["date_range"]}', 
true, ARRAY['patients', 'demographics', 'analytics']),

('Appointment Efficiency', 'Appointment scheduling efficiency and utilization metrics', 'operational', 
'{"charts": [{"type": "bar", "data_source": "appointments", "metrics": ["utilization_rate", "cancellation_rate"]}], "filters": ["date_range", "staff_member"]}', 
true, ARRAY['appointments', 'efficiency', 'operations']),

('Treatment Outcomes', 'Treatment success rates and patient satisfaction analysis', 'clinical', 
'{"charts": [{"type": "gauge", "data_source": "treatments", "metrics": ["success_rate", "satisfaction_score"]}], "filters": ["treatment_type", "date_range"]}', 
true, ARRAY['treatments', 'outcomes', 'clinical']),

('Inventory Analysis', 'Inventory levels, usage patterns, and reorder recommendations', 'inventory', 
'{"charts": [{"type": "table", "data_source": "inventory", "metrics": ["stock_level", "usage_rate", "reorder_point"]}], "filters": ["category", "supplier"]}', 
true, ARRAY['inventory', 'stock', 'supplies']),

('Monthly Summary', 'Comprehensive monthly business summary with key performance indicators', 'operational', 
'{"charts": [{"type": "dashboard", "data_source": "multiple", "metrics": ["revenue", "patients", "appointments", "efficiency"]}], "filters": ["month", "year"]}', 
true, ARRAY['summary', 'kpi', 'monthly']);

-- Insert default data source connectors
INSERT INTO data_source_connectors (connector_name, connector_type, connection_config, schema_definition, clinic_id) VALUES
('Patient Management System', 'internal', 
'{"table": "patients", "fields": ["id", "name", "age", "gender", "created_at", "last_visit"]}',
'{"fields": [{"name": "patient_count", "type": "number"}, {"name": "age_group", "type": "category"}, {"name": "gender", "type": "category"}]}',
(SELECT id FROM clinic_settings LIMIT 1)),

('Appointment System', 'internal', 
'{"table": "appointments", "fields": ["id", "patient_id", "staff_id", "appointment_date", "status", "revenue"]}',
'{"fields": [{"name": "appointment_count", "type": "number"}, {"name": "revenue", "type": "currency"}, {"name": "utilization_rate", "type": "percentage"}]}',
(SELECT id FROM clinic_settings LIMIT 1)),

('Financial System', 'internal', 
'{"table": "financial_transactions", "fields": ["id", "amount", "transaction_type", "created_at"]}',
'{"fields": [{"name": "total_revenue", "type": "currency"}, {"name": "profit_margin", "type": "percentage"}, {"name": "payment_method", "type": "category"}]}',
(SELECT id FROM clinic_settings LIMIT 1)),

('Inventory System', 'internal', 
'{"table": "inventory_items", "fields": ["id", "name", "category", "stock_level", "usage_rate"]}',
'{"fields": [{"name": "stock_level", "type": "number"}, {"name": "category", "type": "category"}, {"name": "usage_rate", "type": "number"}]}',
(SELECT id FROM clinic_settings LIMIT 1));

COMMENT ON TABLE custom_reports IS 'Custom reports created by users with drag-drop interface';
COMMENT ON TABLE report_templates IS 'Pre-built report templates for clinic management';
COMMENT ON TABLE report_usage_analytics IS 'Analytics tracking for report usage and adoption';
COMMENT ON TABLE report_schedules IS 'Automated report scheduling and distribution';
COMMENT ON TABLE report_collaborators IS 'Report sharing and collaboration permissions';
COMMENT ON TABLE report_comments IS 'Comments and annotations on reports';
COMMENT ON TABLE data_source_connectors IS 'Data source connections for report building';
