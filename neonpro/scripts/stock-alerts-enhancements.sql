-- Stock Alerts Enhancements Schema
-- Implementation for TODO items in /api/stock/alerts/resolve
-- Story 11.4: Enhanced Alertas e Relatórios de Estoque
-- Created: 2025-01-21 (Claude Code Implementation)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- NOTIFICATIONS SYSTEM TABLES
-- =====================================================

-- Notification templates for different alert types
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    template_name VARCHAR(200) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT check_template_type_valid CHECK (
        template_type IN ('stock_alert', 'resolution_notification', 'system_update', 'custom')
    ),
    CONSTRAINT check_channel_valid CHECK (
        channel IN ('email', 'push', 'webhook', 'whatsapp', 'sms')
    ),
    CONSTRAINT check_template_name_not_empty CHECK (trim(template_name) != ''),
    CONSTRAINT check_body_template_not_empty CHECK (trim(body_template) != ''),
    
    -- Unique constraint for template names per clinic
    UNIQUE(clinic_id, template_name, channel)
);

-- Notification delivery log
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    alert_id UUID REFERENCES public.stock_alerts_history(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    webhook_url TEXT,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subject TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_channel_valid CHECK (
        channel IN ('email', 'push', 'webhook', 'whatsapp', 'sms')
    ),
    CONSTRAINT check_status_valid CHECK (
        status IN ('pending', 'sent', 'delivered', 'failed', 'retrying')
    ),
    CONSTRAINT check_retry_count_non_negative CHECK (retry_count >= 0),
    CONSTRAINT check_retry_count_reasonable CHECK (retry_count <= 10),
    CONSTRAINT check_recipient_data CHECK (
        (channel = 'email' AND recipient_email IS NOT NULL) OR
        (channel = 'push' AND recipient_id IS NOT NULL) OR
        (channel = 'webhook' AND webhook_url IS NOT NULL) OR
        (channel IN ('whatsapp', 'sms') AND recipient_phone IS NOT NULL)
    )
);

-- =====================================================
-- ANALYTICS SYSTEM TABLES  
-- =====================================================

-- Alert resolution analytics
CREATE TABLE IF NOT EXISTS public.alert_resolution_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    total_alerts_created INTEGER NOT NULL DEFAULT 0,
    total_alerts_resolved INTEGER NOT NULL DEFAULT 0,
    total_alerts_dismissed INTEGER NOT NULL DEFAULT 0,
    avg_resolution_time_hours DECIMAL(8,2),
    avg_acknowledgment_time_hours DECIMAL(8,2),
    fastest_resolution_time_hours DECIMAL(8,2),
    slowest_resolution_time_hours DECIMAL(8,2),
    resolution_rate_percentage DECIMAL(5,2),
    recurrence_count INTEGER NOT NULL DEFAULT 0,
    automation_triggered_count INTEGER NOT NULL DEFAULT 0,
    notification_sent_count INTEGER NOT NULL DEFAULT 0,
    notification_success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_alert_type_valid CHECK (
        alert_type IN ('low_stock', 'expiring', 'expired', 'overstock', 'critical_shortage', 'all')
    ),
    CONSTRAINT check_severity_valid CHECK (
        severity_level IN ('low', 'medium', 'high', 'critical', 'all')
    ),
    CONSTRAINT check_counts_non_negative CHECK (
        total_alerts_created >= 0 AND total_alerts_resolved >= 0 AND 
        total_alerts_dismissed >= 0 AND recurrence_count >= 0 AND
        automation_triggered_count >= 0 AND notification_sent_count >= 0
    ),
    CONSTRAINT check_resolution_rate_valid CHECK (
        resolution_rate_percentage IS NULL OR 
        (resolution_rate_percentage >= 0 AND resolution_rate_percentage <= 100)
    ),
    CONSTRAINT check_notification_success_rate_valid CHECK (
        notification_success_rate IS NULL OR 
        (notification_success_rate >= 0 AND notification_success_rate <= 100)
    ),
    CONSTRAINT check_time_values_positive CHECK (
        (avg_resolution_time_hours IS NULL OR avg_resolution_time_hours >= 0) AND
        (avg_acknowledgment_time_hours IS NULL OR avg_acknowledgment_time_hours >= 0) AND
        (fastest_resolution_time_hours IS NULL OR fastest_resolution_time_hours >= 0) AND
        (slowest_resolution_time_hours IS NULL OR slowest_resolution_time_hours >= 0)
    ),
    
    -- Unique constraint for one metric per clinic per date per alert type per severity
    UNIQUE(clinic_id, metric_date, alert_type, severity_level)
);

-- Dynamic alert configuration updates log
CREATE TABLE IF NOT EXISTS public.alert_config_updates_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    alert_config_id UUID REFERENCES public.stock_alert_configs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    trigger_alert_id UUID REFERENCES public.stock_alerts_history(id) ON DELETE SET NULL,
    update_type VARCHAR(50) NOT NULL,
    old_threshold_value DECIMAL(10,2),
    new_threshold_value DECIMAL(10,2),
    old_severity_level VARCHAR(20),
    new_severity_level VARCHAR(20),
    old_notification_channels TEXT[],
    new_notification_channels TEXT[],
    update_reason TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    auto_applied BOOLEAN NOT NULL DEFAULT false,
    applied_by UUID REFERENCES auth.users(id),
    applied_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_update_type_valid CHECK (
        update_type IN ('threshold_adjustment', 'severity_update', 'channel_modification', 'frequency_change', 'deactivation')
    ),
    CONSTRAINT check_confidence_score_valid CHECK (
        confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)
    ),
    CONSTRAINT check_update_reason_not_empty CHECK (trim(update_reason) != ''),
    CONSTRAINT check_application_logic CHECK (
        (auto_applied = false AND applied_by IS NOT NULL AND applied_at IS NOT NULL) OR
        (auto_applied = true AND applied_by IS NULL AND applied_at IS NOT NULL) OR
        (applied_by IS NULL AND applied_at IS NULL)
    )
);

-- =====================================================
-- PURCHASING INTEGRATION TABLES
-- =====================================================

-- Purchase orders tracking
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(200),
    supplier_contact JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_status_valid CHECK (
        status IN ('pending', 'approved', 'ordered', 'partial_delivered', 'delivered', 'cancelled')
    ),
    CONSTRAINT check_priority_valid CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    CONSTRAINT check_total_value_non_negative CHECK (total_value >= 0),
    CONSTRAINT check_order_number_not_empty CHECK (trim(order_number) != ''),
    CONSTRAINT check_approval_logic CHECK (
        (approved_by IS NULL AND approved_at IS NULL) OR
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    ),
    
    -- Unique constraint for order numbers per clinic
    UNIQUE(clinic_id, order_number)
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(100),
    quantity_ordered DECIMAL(10,2) NOT NULL,
    quantity_received DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'unit',
    notes TEXT,
    alert_trigger_id UUID REFERENCES public.stock_alerts_history(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_quantity_ordered_positive CHECK (quantity_ordered > 0),
    CONSTRAINT check_quantity_received_non_negative CHECK (quantity_received >= 0),
    CONSTRAINT check_quantity_received_reasonable CHECK (quantity_received <= quantity_ordered * 1.1), -- Allow 10% overdelivery
    CONSTRAINT check_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT check_total_price_non_negative CHECK (total_price >= 0),
    CONSTRAINT check_product_name_not_empty CHECK (trim(product_name) != '')
);

-- Reorder suggestions based on alert patterns
CREATE TABLE IF NOT EXISTS public.reorder_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    trigger_alert_id UUID REFERENCES public.stock_alerts_history(id) ON DELETE SET NULL,
    suggested_quantity DECIMAL(10,2) NOT NULL,
    suggested_supplier VARCHAR(200),
    estimated_cost DECIMAL(10,2),
    urgency_score DECIMAL(3,2) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    reasoning TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    
    -- Constraints
    CONSTRAINT check_suggested_quantity_positive CHECK (suggested_quantity > 0),
    CONSTRAINT check_estimated_cost_non_negative CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    CONSTRAINT check_urgency_score_valid CHECK (urgency_score >= 0.0 AND urgency_score <= 1.0),
    CONSTRAINT check_confidence_score_valid CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    CONSTRAINT check_status_valid CHECK (
        status IN ('pending', 'approved', 'rejected', 'implemented', 'expired')
    ),
    CONSTRAINT check_reasoning_not_empty CHECK (trim(reasoning) != ''),
    CONSTRAINT check_review_logic CHECK (
        (reviewed_by IS NULL AND reviewed_at IS NULL AND review_notes IS NULL) OR
        (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    ),
    CONSTRAINT check_expires_at_future CHECK (expires_at > created_at)
);

-- =====================================================
-- PERFORMANCE INDICES
-- =====================================================

-- Notification templates indices
CREATE INDEX IF NOT EXISTS idx_notification_templates_clinic_type_active 
ON public.notification_templates(clinic_id, template_type, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_notification_templates_channel_type 
ON public.notification_templates(channel, template_type, is_active) 
WHERE is_active = true;

-- Notification deliveries indices
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_alert_channel 
ON public.notification_deliveries(alert_id, channel, status);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status_created 
ON public.notification_deliveries(status, created_at) 
WHERE status IN ('pending', 'retrying');

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_clinic_date 
ON public.notification_deliveries(clinic_id, created_at DESC);

-- Analytics indices
CREATE INDEX IF NOT EXISTS idx_alert_resolution_analytics_clinic_date 
ON public.alert_resolution_analytics(clinic_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_alert_resolution_analytics_type_severity 
ON public.alert_resolution_analytics(alert_type, severity_level, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_alert_config_updates_log_clinic_created 
ON public.alert_config_updates_log(clinic_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_config_updates_log_config_type 
ON public.alert_config_updates_log(alert_config_id, update_type, created_at DESC);

-- Purchase orders indices
CREATE INDEX IF NOT EXISTS idx_purchase_orders_clinic_status 
ON public.purchase_orders(clinic_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status_delivery 
ON public.purchase_orders(status, expected_delivery_date) 
WHERE status IN ('approved', 'ordered', 'partial_delivered');

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_product 
ON public.purchase_order_items(purchase_order_id, product_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_alert_trigger 
ON public.purchase_order_items(alert_trigger_id) 
WHERE alert_trigger_id IS NOT NULL;

-- Reorder suggestions indices
CREATE INDEX IF NOT EXISTS idx_reorder_suggestions_clinic_status 
ON public.reorder_suggestions(clinic_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reorder_suggestions_product_urgency 
ON public.reorder_suggestions(product_id, urgency_score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reorder_suggestions_expires 
ON public.reorder_suggestions(expires_at) 
WHERE status = 'pending' AND expires_at > now();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_resolution_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_config_updates_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_suggestions ENABLE ROW LEVEL SECURITY;

-- Notification templates policies
CREATE POLICY "Users can manage notification templates for their clinic" 
ON public.notification_templates FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Notification deliveries policies
CREATE POLICY "Users can view notification deliveries for their clinic" 
ON public.notification_deliveries FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "System can create notification deliveries" 
ON public.notification_deliveries FOR INSERT 
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

-- Analytics policies
CREATE POLICY "Users can view analytics for their clinic" 
ON public.alert_resolution_analytics FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "System can manage analytics" 
ON public.alert_resolution_analytics FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Config updates log policies
CREATE POLICY "Users can view config updates for their clinic" 
ON public.alert_config_updates_log FOR SELECT 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid()
    )
);

-- Purchase orders policies
CREATE POLICY "Users can manage purchase orders for their clinic" 
ON public.purchase_orders FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'staff')
    )
);

CREATE POLICY "Users can manage purchase order items for their clinic" 
ON public.purchase_order_items FOR ALL 
USING (
    purchase_order_id IN (
        SELECT po.id FROM public.purchase_orders po
        JOIN public.clinic_staff cs ON po.clinic_id = cs.clinic_id
        WHERE cs.user_id = auth.uid() 
        AND cs.role IN ('admin', 'manager', 'staff')
    )
);

-- Reorder suggestions policies
CREATE POLICY "Users can manage reorder suggestions for their clinic" 
ON public.reorder_suggestions FOR ALL 
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'staff')
    )
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Apply updated_at triggers
CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON public.notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_resolution_analytics_updated_at 
    BEFORE UPDATE ON public.alert_resolution_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON public.purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at 
    BEFORE UPDATE ON public.purchase_order_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE NOTIFICATION TEMPLATES
-- =====================================================

-- Insert sample notification templates (only if clinics exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.clinics LIMIT 1) THEN
        -- Email templates
        INSERT INTO public.notification_templates (
            clinic_id, template_name, template_type, channel, subject_template, body_template, variables
        )
        SELECT 
            c.id,
            'Stock Alert Email',
            'stock_alert',
            'email',
            'Alerta de Estoque - {{product_name}}',
            'Olá {{user_name}},\n\nUm alerta de estoque foi gerado:\n\nProduto: {{product_name}}\nTipo de Alerta: {{alert_type}}\nNível Atual: {{current_value}}\nLimite: {{threshold_value}}\n\nPor favor, tome as devidas providências.\n\nAtenciosamente,\nSistema NeonPro',
            '{"user_name": "string", "product_name": "string", "alert_type": "string", "current_value": "number", "threshold_value": "number"}'::jsonb
        FROM public.clinics c
        WHERE NOT EXISTS (
            SELECT 1 FROM public.notification_templates nt 
            WHERE nt.clinic_id = c.id AND nt.template_name = 'Stock Alert Email'
        )
        LIMIT 3; -- Only for first 3 clinics

        -- Resolution notification templates
        INSERT INTO public.notification_templates (
            clinic_id, template_name, template_type, channel, subject_template, body_template, variables
        )
        SELECT 
            c.id,
            'Alert Resolution Email',
            'resolution_notification',
            'email',
            'Alerta Resolvido - {{product_name}}',
            'Olá {{user_name}},\n\nO alerta de estoque foi resolvido:\n\nProduto: {{product_name}}\nResolvido por: {{resolved_by}}\nAções Tomadas: {{actions_taken}}\nDescrição: {{resolution_description}}\n\nAtenciosamente,\nSistema NeonPro',
            '{"user_name": "string", "product_name": "string", "resolved_by": "string", "actions_taken": "array", "resolution_description": "string"}'::jsonb
        FROM public.clinics c
        WHERE NOT EXISTS (
            SELECT 1 FROM public.notification_templates nt 
            WHERE nt.clinic_id = c.id AND nt.template_name = 'Alert Resolution Email'
        )
        LIMIT 3; -- Only for first 3 clinics
    END IF;
END $$;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Analytics summary view
CREATE OR REPLACE VIEW public.alert_analytics_summary AS
SELECT 
    clinic_id,
    metric_date,
    SUM(total_alerts_created) as total_alerts_created,
    SUM(total_alerts_resolved) as total_alerts_resolved,
    AVG(avg_resolution_time_hours) as avg_resolution_time_hours,
    AVG(resolution_rate_percentage) as avg_resolution_rate,
    AVG(notification_success_rate) as avg_notification_success_rate
FROM public.alert_resolution_analytics
WHERE alert_type = 'all' AND severity_level = 'all'
GROUP BY clinic_id, metric_date;

-- Active reorder suggestions view
CREATE OR REPLACE VIEW public.active_reorder_suggestions AS
SELECT 
    rs.*,
    p.name as product_name,
    p.sku as product_sku,
    p.current_stock,
    sah.message as trigger_alert_message
FROM public.reorder_suggestions rs
JOIN public.products p ON rs.product_id = p.id
LEFT JOIN public.stock_alerts_history sah ON rs.trigger_alert_id = sah.id
WHERE rs.status = 'pending' AND rs.expires_at > now();

-- Purchase orders summary view
CREATE OR REPLACE VIEW public.purchase_orders_summary AS
SELECT 
    po.*,
    COUNT(poi.id) as items_count,
    SUM(poi.quantity_ordered) as total_quantity_ordered,
    SUM(poi.quantity_received) as total_quantity_received,
    CASE 
        WHEN SUM(poi.quantity_ordered) = 0 THEN 0
        ELSE (SUM(poi.quantity_received) / SUM(poi.quantity_ordered)) * 100
    END as completion_percentage
FROM public.purchase_orders po
LEFT JOIN public.purchase_order_items poi ON po.id = poi.purchase_order_id
GROUP BY po.id;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.notification_templates IS 'Templates for different types of notifications sent to users';
COMMENT ON TABLE public.notification_deliveries IS 'Log of all notification delivery attempts and their status';
COMMENT ON TABLE public.alert_resolution_analytics IS 'Analytics data for alert resolution metrics and performance';
COMMENT ON TABLE public.alert_config_updates_log IS 'Log of automatic and manual updates to alert configurations';
COMMENT ON TABLE public.purchase_orders IS 'Purchase orders created from alert resolutions';
COMMENT ON TABLE public.purchase_order_items IS 'Individual items within purchase orders';
COMMENT ON TABLE public.reorder_suggestions IS 'AI-generated suggestions for product reorders based on alert patterns';

-- Migration completed successfully
SELECT 'Stock Alerts Enhancements schema created successfully' as status;