-- Stock Alerts and Reports Schema
-- Story 11.4: Alertas e Relatórios de Estoque
-- Created: 2025-01-21 (Claude Code Implementation)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STOCK ALERT CONFIGURATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stock_alert_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value DECIMAL(10,2) NOT NULL,
    threshold_unit VARCHAR(20) NOT NULL DEFAULT 'quantity',
    severity_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT true,
    notification_channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Data integrity constraints (QA Recommendation)
    CONSTRAINT check_threshold_positive CHECK (threshold_value > 0),
    CONSTRAINT check_alert_type_valid CHECK (
        alert_type IN ('low_stock', 'expiring', 'expired', 'overstock', 'critical_shortage')
    ),
    CONSTRAINT check_threshold_unit_valid CHECK (
        threshold_unit IN ('quantity', 'days', 'percentage')
    ),
    CONSTRAINT check_severity_valid CHECK (
        severity_level IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT check_notification_channels_valid CHECK (
        notification_channels <@ ARRAY['in_app', 'email', 'whatsapp', 'sms']::text[]
    ),
    CONSTRAINT check_product_or_category CHECK (
        (product_id IS NOT NULL AND category_id IS NULL) OR
        (product_id IS NULL AND category_id IS NOT NULL) OR
        (product_id IS NULL AND category_id IS NULL)
    )
);

-- =====================================================
-- STOCK ALERTS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stock_alerts_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    alert_config_id UUID REFERENCES public.stock_alert_configs(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    threshold_value DECIMAL(10,2) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Data integrity constraints
    CONSTRAINT check_alert_type_valid CHECK (
        alert_type IN ('low_stock', 'expiring', 'expired', 'overstock', 'critical_shortage')
    ),
    CONSTRAINT check_severity_valid CHECK (
        severity_level IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT check_status_valid CHECK (
        status IN ('active', 'acknowledged', 'resolved', 'dismissed')
    ),
    CONSTRAINT check_threshold_positive CHECK (threshold_value > 0),
    CONSTRAINT check_current_value_non_negative CHECK (current_value >= 0),
    CONSTRAINT check_acknowledgment_logic CHECK (
        (acknowledged_by IS NULL AND acknowledged_at IS NULL) OR
        (acknowledged_by IS NOT NULL AND acknowledged_at IS NOT NULL)
    )
);

-- =====================================================
-- CUSTOM STOCK REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.custom_stock_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    schedule_config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Data integrity constraints
    CONSTRAINT check_report_type_valid CHECK (
        report_type IN ('consumption', 'valuation', 'movement', 'expiration', 'custom', 'performance')
    ),
    CONSTRAINT check_report_name_not_empty CHECK (trim(report_name) != ''),
    CONSTRAINT check_execution_count_non_negative CHECK (execution_count >= 0),
    
    -- Unique constraint for report names per clinic
    UNIQUE(clinic_id, report_name)
);

-- =====================================================
-- STOCK PERFORMANCE METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stock_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    turnover_rate DECIMAL(8,4),
    days_coverage INTEGER,
    accuracy_percentage DECIMAL(5,2),
    waste_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    waste_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    active_alerts_count INTEGER NOT NULL DEFAULT 0,
    critical_alerts_count INTEGER NOT NULL DEFAULT 0,
    products_count INTEGER NOT NULL DEFAULT 0,
    out_of_stock_count INTEGER NOT NULL DEFAULT 0,
    low_stock_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Data integrity constraints
    CONSTRAINT check_total_value_non_negative CHECK (total_value >= 0),
    CONSTRAINT check_waste_value_non_negative CHECK (waste_value >= 0),
    CONSTRAINT check_waste_percentage_valid CHECK (waste_percentage >= 0 AND waste_percentage <= 100),
    CONSTRAINT check_accuracy_percentage_valid CHECK (
        accuracy_percentage IS NULL OR (accuracy_percentage >= 0 AND accuracy_percentage <= 100)
    ),
    CONSTRAINT check_counts_non_negative CHECK (
        active_alerts_count >= 0 AND critical_alerts_count >= 0 AND
        products_count >= 0 AND out_of_stock_count >= 0 AND low_stock_count >= 0
    ),
    CONSTRAINT check_days_coverage_positive CHECK (
        days_coverage IS NULL OR days_coverage > 0
    ),
    
    -- Unique constraint for one metric per clinic per date
    UNIQUE(clinic_id, metric_date)
);

-- =====================================================
-- PERFORMANCE INDICES (QA Optimized)
-- =====================================================

-- Alert configurations indices
CREATE INDEX IF NOT EXISTS idx_stock_alert_configs_clinic_active 
ON public.stock_alert_configs(clinic_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_stock_alert_configs_product 
ON public.stock_alert_configs(product_id, is_active) 
WHERE product_id IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_stock_alert_configs_category 
ON public.stock_alert_configs(category_id, is_active) 
WHERE category_id IS NOT NULL AND is_active = true;

-- Alerts history indices (partitioned by clinic and date for performance)
CREATE INDEX IF NOT EXISTS idx_stock_alerts_clinic_status 
ON public.stock_alerts_history(clinic_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_date 
ON public.stock_alerts_history(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_type_severity 
ON public.stock_alerts_history(alert_type, severity_level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_acknowledged 
ON public.stock_alerts_history(acknowledged_by, acknowledged_at) 
WHERE acknowledged_by IS NOT NULL;

-- Custom reports indices
CREATE INDEX IF NOT EXISTS idx_custom_stock_reports_user_active 
ON public.custom_stock_reports(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_custom_stock_reports_type_clinic 
ON public.custom_stock_reports(clinic_id, report_type, is_active);

-- Performance metrics indices
CREATE INDEX IF NOT EXISTS idx_stock_performance_clinic_date 
ON public.stock_performance_metrics(clinic_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_stock_performance_date_range 
ON public.stock_performance_metrics(metric_date) 
WHERE metric_date >= CURRENT_DATE - INTERVAL '1 year';

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.stock_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_stock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Stock alert configurations policies
CREATE POLICY "Users can view alert configs for their clinic" 
ON public.stock_alert_configs FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Clinic staff can manage alert configs" 
ON public.stock_alert_configs FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'staff')
    )
);

-- Stock alerts history policies
CREATE POLICY "Users can view alerts for their clinic" 
ON public.stock_alerts_history FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Clinic staff can acknowledge alerts" 
ON public.stock_alerts_history FOR UPDATE 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'staff')
    )
);

CREATE POLICY "System can create alerts" 
ON public.stock_alerts_history FOR INSERT 
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'staff')
    )
);

-- Custom reports policies
CREATE POLICY "Users can manage their own reports" 
ON public.custom_stock_reports FOR ALL 
USING (
    user_id = auth.uid() AND
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Clinic admins can view all clinic reports" 
ON public.custom_stock_reports FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Performance metrics policies
CREATE POLICY "Users can view metrics for their clinic" 
ON public.stock_performance_metrics FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "System can manage performance metrics" 
ON public.stock_performance_metrics FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_stock_alert_configs_updated_at 
    BEFORE UPDATE ON public.stock_alert_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_stock_reports_updated_at 
    BEFORE UPDATE ON public.custom_stock_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================

-- Insert sample alert configurations (only if clinics exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.clinics LIMIT 1) THEN
        INSERT INTO public.stock_alert_configs (
            clinic_id, alert_type, threshold_value, threshold_unit, 
            severity_level, notification_channels
        )
        SELECT 
            c.id,
            'low_stock',
            10,
            'quantity',
            'medium',
            ARRAY['in_app', 'email']
        FROM public.clinics c
        WHERE NOT EXISTS (
            SELECT 1 FROM public.stock_alert_configs sac 
            WHERE sac.clinic_id = c.id AND sac.alert_type = 'low_stock'
        )
        LIMIT 3; -- Only for first 3 clinics
    END IF;
END $$;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active alerts with product information
CREATE OR REPLACE VIEW public.active_stock_alerts AS
SELECT 
    sah.*,
    p.name as product_name,
    p.sku as product_sku,
    pc.name as category_name
FROM public.stock_alerts_history sah
LEFT JOIN public.products p ON sah.product_id = p.id
LEFT JOIN public.product_categories pc ON p.category_id = pc.id
WHERE sah.status = 'active';

-- Alert summary by clinic
CREATE OR REPLACE VIEW public.stock_alerts_summary AS
SELECT 
    clinic_id,
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE severity_level = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE severity_level = 'high') as high_count,
    COUNT(*) FILTER (WHERE severity_level = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE severity_level = 'low') as low_count,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_count
FROM public.stock_alerts_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY clinic_id;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.stock_alert_configs IS 'Configuration for automatic stock alerts by clinic';
COMMENT ON TABLE public.stock_alerts_history IS 'Historical record of all generated stock alerts';
COMMENT ON TABLE public.custom_stock_reports IS 'User-defined custom reports for stock analysis';
COMMENT ON TABLE public.stock_performance_metrics IS 'Daily performance metrics for stock management';

COMMENT ON COLUMN public.stock_alert_configs.threshold_value IS 'Trigger value for alert (quantity, days, or percentage)';
COMMENT ON COLUMN public.stock_alerts_history.metadata IS 'Additional context data for the alert in JSON format';
COMMENT ON COLUMN public.custom_stock_reports.filters IS 'Report filter configuration in JSON format';
COMMENT ON COLUMN public.custom_stock_reports.schedule_config IS 'Automated report scheduling configuration';

-- Migration completed successfully
SELECT 'Stock Alerts and Reports schema created successfully' as status;