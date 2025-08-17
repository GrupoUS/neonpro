-- Create automated reorder alerts and threshold management system
-- Story 6.2: Automated Reorder Alerts + Threshold Management

-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.reorder_thresholds CASCADE;
DROP TABLE IF EXISTS public.reorder_alerts CASCADE;
DROP TABLE IF EXISTS public.demand_forecasts CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.approval_workflows CASCADE;
DROP TABLE IF EXISTS public.supplier_lead_times CASCADE;

-- Create supplier lead times table
CREATE TABLE public.supplier_lead_times (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    average_lead_time_days INTEGER NOT NULL DEFAULT 7,
    minimum_lead_time_days INTEGER NOT NULL DEFAULT 1,
    maximum_lead_time_days INTEGER NOT NULL DEFAULT 30,
    reliability_score DECIMAL(3,2) DEFAULT 0.85 CHECK (reliability_score BETWEEN 0 AND 1),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reorder thresholds table with intelligent management
CREATE TABLE public.reorder_thresholds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Threshold levels
    reorder_point INTEGER NOT NULL DEFAULT 10,
    safety_stock INTEGER NOT NULL DEFAULT 5,
    maximum_stock INTEGER DEFAULT 100,
    minimum_order_quantity INTEGER DEFAULT 1,
    
    -- Intelligent calculations
    calculated_reorder_point INTEGER,
    calculated_safety_stock INTEGER,
    demand_forecast_weekly DECIMAL(10,2) DEFAULT 0,
    seasonal_adjustment_factor DECIMAL(5,2) DEFAULT 1.0,
    lead_time_days INTEGER DEFAULT 7,
    
    -- Alert levels
    warning_threshold_percentage INTEGER DEFAULT 120 CHECK (warning_threshold_percentage > 100),
    critical_threshold_percentage INTEGER DEFAULT 150 CHECK (critical_threshold_percentage > warning_threshold_percentage),
    emergency_threshold_percentage INTEGER DEFAULT 200 CHECK (emergency_threshold_percentage > critical_threshold_percentage),
    
    -- Automation settings
    auto_reorder_enabled BOOLEAN DEFAULT false,
    preferred_supplier_id UUID,
    budget_approval_required BOOLEAN DEFAULT false,
    budget_threshold_amount DECIMAL(12,2) DEFAULT 1000.00,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, clinic_id)
);

-- Create reorder alerts table
CREATE TABLE public.reorder_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    threshold_id UUID REFERENCES public.reorder_thresholds(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Alert details
    alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'critical', 'emergency', 'reorder', 'overstock')),
    alert_level INTEGER NOT NULL DEFAULT 1 CHECK (alert_level BETWEEN 1 AND 5),
    current_stock INTEGER NOT NULL,
    recommended_order_quantity INTEGER,
    estimated_stockout_date TIMESTAMP WITH TIME ZONE,
    
    -- Message and context
    alert_title TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    context_data JSONB DEFAULT '{}',
    
    -- Status and tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'escalated', 'dismissed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
    
    -- Escalation
    escalation_level INTEGER DEFAULT 0,
    escalated_to UUID,
    escalated_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Purchase order integration
    purchase_order_id UUID,
    auto_generated BOOLEAN DEFAULT false,
    
    -- Delivery tracking
    notification_sent BOOLEAN DEFAULT false,
    notification_channels TEXT[] DEFAULT ARRAY['dashboard'],
    delivery_time_ms INTEGER,
    
    -- Metadata
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demand forecasts table
CREATE TABLE public.demand_forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Forecast period
    forecast_date DATE NOT NULL,
    forecast_period TEXT NOT NULL CHECK (forecast_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
    
    -- Forecast data
    predicted_demand DECIMAL(10,2) NOT NULL DEFAULT 0,
    confidence_interval DECIMAL(5,2) DEFAULT 0.85 CHECK (confidence_interval BETWEEN 0 AND 1),
    seasonal_factor DECIMAL(5,2) DEFAULT 1.0,
    trend_factor DECIMAL(5,2) DEFAULT 1.0,
    
    -- Historical analysis
    historical_average DECIMAL(10,2) DEFAULT 0,
    variance DECIMAL(10,2) DEFAULT 0,
    standard_deviation DECIMAL(10,2) DEFAULT 0,
    
    -- Context
    special_events JSONB DEFAULT '[]',
    promotion_impact DECIMAL(5,2) DEFAULT 1.0,
    appointment_based_demand DECIMAL(10,2) DEFAULT 0,
    
    -- Accuracy tracking
    actual_demand DECIMAL(10,2),
    forecast_accuracy DECIMAL(5,2),
    model_version TEXT DEFAULT 'v1.0',
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, clinic_id, forecast_date, forecast_period)
);

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    
    -- Order details
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'reorder' CHECK (order_type IN ('reorder', 'emergency', 'bulk', 'special')),
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Dates
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_delivery_date DATE,
    confirmed_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Automation
    auto_generated BOOLEAN DEFAULT false,
    generated_from_alert_id UUID REFERENCES public.reorder_alerts(id),
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    
    -- Supplier communication
    sent_to_supplier BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    supplier_confirmation TEXT,
    supplier_order_number TEXT,
    
    -- Notes and context
    notes TEXT,
    internal_notes TEXT,
    context_data JSONB DEFAULT '{}',
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    
    -- Order details
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Received tracking
    quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
    quantity_remaining INTEGER GENERATED ALWAYS AS (quantity - quantity_received) STORED,
    
    -- Item details at time of order
    item_name TEXT NOT NULL,
    item_sku TEXT,
    item_description TEXT,
    supplier_item_code TEXT,
    
    -- Quality control
    quality_check_required BOOLEAN DEFAULT false,
    quality_check_passed BOOLEAN,
    quality_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approval workflows table
CREATE TABLE public.approval_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL,
    
    -- Workflow details
    workflow_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('purchase_order', 'budget_approval', 'emergency_order')),
    
    -- Trigger conditions
    trigger_amount_threshold DECIMAL(12,2),
    trigger_item_categories TEXT[],
    trigger_suppliers UUID[],
    
    -- Approval chain
    approval_chain JSONB NOT NULL DEFAULT '[]', -- Array of user IDs in order
    current_step INTEGER DEFAULT 0,
    
    -- Settings
    parallel_approval BOOLEAN DEFAULT false,
    auto_approve_conditions JSONB DEFAULT '{}',
    escalation_timeout_hours INTEGER DEFAULT 24,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clinic_id, workflow_name)
);

-- Create indexes for performance
CREATE INDEX idx_reorder_thresholds_item_clinic ON public.reorder_thresholds(item_id, clinic_id);
CREATE INDEX idx_reorder_thresholds_clinic_active ON public.reorder_thresholds(clinic_id, is_active);
CREATE INDEX idx_reorder_alerts_status_priority ON public.reorder_alerts(status, priority);
CREATE INDEX idx_reorder_alerts_clinic_type ON public.reorder_alerts(clinic_id, alert_type);
CREATE INDEX idx_reorder_alerts_created_at ON public.reorder_alerts(created_at DESC);
CREATE INDEX idx_demand_forecasts_item_date ON public.demand_forecasts(item_id, forecast_date);
CREATE INDEX idx_purchase_orders_clinic_status ON public.purchase_orders(clinic_id, status);
CREATE INDEX idx_purchase_orders_order_date ON public.purchase_orders(order_date DESC);
CREATE INDEX idx_supplier_lead_times_supplier_item ON public.supplier_lead_times(supplier_id, item_id);

-- Enable Row Level Security
ALTER TABLE public.reorder_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_lead_times ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Clinic users can manage their reorder thresholds" ON public.reorder_thresholds
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can view their reorder alerts" ON public.reorder_alerts
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can manage their reorder alerts" ON public.reorder_alerts
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can update their reorder alerts" ON public.reorder_alerts
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can view their demand forecasts" ON public.demand_forecasts
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can manage their purchase orders" ON public.purchase_orders
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic users can view purchase order items" ON public.purchase_order_items
    FOR SELECT USING (
        purchase_order_id IN (
            SELECT id FROM public.purchase_orders 
            WHERE clinic_id IN (
                SELECT clinic_id FROM public.profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Clinic users can manage their approval workflows" ON public.approval_workflows
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view supplier lead times" ON public.supplier_lead_times
    FOR SELECT USING (true);

-- Create automated alert generation function
CREATE OR REPLACE FUNCTION generate_reorder_alerts()
RETURNS TRIGGER AS $$
DECLARE
    threshold_record RECORD;
    alert_type TEXT;
    alert_level INTEGER;
    alert_title TEXT;
    alert_message TEXT;
    priority TEXT;
    recommended_quantity INTEGER;
    estimated_stockout DATE;
BEGIN
    -- Get threshold configuration for this item
    SELECT * INTO threshold_record
    FROM public.reorder_thresholds rt
    WHERE rt.item_id = NEW.item_id 
    AND rt.clinic_id = NEW.clinic_id
    AND rt.is_active = true;
    
    -- Skip if no threshold configured
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Calculate alert parameters based on stock level
    IF NEW.current_stock <= 0 THEN
        alert_type := 'emergency';
        alert_level := 5;
        priority := 'emergency';
        alert_title := 'ESTOQUE ZERADO - Ação Imediata Necessária';
        alert_message := format('Item %s está com estoque ZERADO. Necessário reposição URGENTE.', NEW.item_name);
    ELSIF NEW.current_stock <= threshold_record.safety_stock THEN
        alert_type := 'critical';
        alert_level := 4;
        priority := 'critical';
        alert_title := 'Estoque Crítico - Abaixo do Estoque de Segurança';
        alert_message := format('Item %s está abaixo do estoque de segurança (%s unidades). Estoque atual: %s.', 
                               NEW.item_name, threshold_record.safety_stock, NEW.current_stock);
    ELSIF NEW.current_stock <= threshold_record.reorder_point THEN
        alert_type := 'reorder';
        alert_level := 3;
        priority := 'high';
        alert_title := 'Ponto de Reposição Atingido';
        alert_message := format('Item %s atingiu o ponto de reposição (%s unidades). Estoque atual: %s.', 
                               NEW.item_name, threshold_record.reorder_point, NEW.current_stock);
    ELSIF NEW.current_stock <= (threshold_record.reorder_point * 1.2) THEN
        alert_type := 'warning';
        alert_level := 2;
        priority := 'medium';
        alert_title := 'Aviso de Estoque Baixo';
        alert_message := format('Item %s está com estoque baixo. Estoque atual: %s, ponto de reposição: %s.', 
                               NEW.item_name, NEW.current_stock, threshold_record.reorder_point);
    ELSE
        -- Stock is sufficient, no alert needed
        RETURN NEW;
    END IF;
    
    -- Calculate recommended order quantity
    recommended_quantity := GREATEST(
        threshold_record.maximum_stock - NEW.current_stock,
        threshold_record.minimum_order_quantity
    );
    
    -- Estimate stockout date based on demand forecast
    IF threshold_record.demand_forecast_weekly > 0 THEN
        estimated_stockout := CURRENT_DATE + INTERVAL '1 day' * (NEW.current_stock / (threshold_record.demand_forecast_weekly / 7));
    END IF;
    
    -- Insert alert (only if not already exists for this item in pending status)
    INSERT INTO public.reorder_alerts (
        item_id,
        threshold_id,
        clinic_id,
        alert_type,
        alert_level,
        current_stock,
        recommended_order_quantity,
        estimated_stockout_date,
        alert_title,
        alert_message,
        priority,
        context_data,
        notification_channels,
        expires_at
    )
    SELECT 
        NEW.item_id,
        threshold_record.id,
        NEW.clinic_id,
        alert_type,
        alert_level,
        NEW.current_stock,
        recommended_quantity,
        estimated_stockout,
        alert_title,
        alert_message,
        priority,
        jsonb_build_object(
            'threshold_type', alert_type,
            'previous_stock', OLD.current_stock,
            'reorder_point', threshold_record.reorder_point,
            'safety_stock', threshold_record.safety_stock,
            'auto_reorder_enabled', threshold_record.auto_reorder_enabled
        ),
        CASE 
            WHEN alert_type = 'emergency' THEN ARRAY['dashboard', 'email', 'sms', 'push']
            WHEN alert_type = 'critical' THEN ARRAY['dashboard', 'email', 'push']
            ELSE ARRAY['dashboard', 'email']
        END,
        CURRENT_TIMESTAMP + INTERVAL '7 days'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.reorder_alerts ra
        WHERE ra.item_id = NEW.item_id
        AND ra.clinic_id = NEW.clinic_id
        AND ra.status = 'pending'
        AND ra.alert_type = alert_type
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automated alert generation
DROP TRIGGER IF EXISTS trigger_generate_reorder_alerts ON public.inventory_items;
CREATE TRIGGER trigger_generate_reorder_alerts
    AFTER UPDATE OF current_stock ON public.inventory_items
    FOR EACH ROW
    WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
    EXECUTE FUNCTION generate_reorder_alerts();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_reorder_thresholds_updated_at
    BEFORE UPDATE ON public.reorder_thresholds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reorder_alerts_updated_at
    BEFORE UPDATE ON public.reorder_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON public.purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at
    BEFORE UPDATE ON public.approval_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_lead_times_updated_at
    BEFORE UPDATE ON public.supplier_lead_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.reorder_thresholds (item_id, clinic_id, reorder_point, safety_stock, maximum_stock, minimum_order_quantity, auto_reorder_enabled, demand_forecast_weekly)
SELECT 
    ii.id,
    ii.clinic_id,
    CASE 
        WHEN ii.category = 'medication' THEN 20
        WHEN ii.category = 'consumable' THEN 15
        ELSE 10
    END as reorder_point,
    CASE 
        WHEN ii.category = 'medication' THEN 10
        WHEN ii.category = 'consumable' THEN 8
        ELSE 5
    END as safety_stock,
    CASE 
        WHEN ii.category = 'medication' THEN 100
        WHEN ii.category = 'consumable' THEN 75
        ELSE 50
    END as maximum_stock,
    CASE 
        WHEN ii.category = 'medication' THEN 5
        ELSE 1
    END as minimum_order_quantity,
    true as auto_reorder_enabled,
    CASE 
        WHEN ii.category = 'medication' THEN 8.5
        WHEN ii.category = 'consumable' THEN 12.0
        ELSE 5.0
    END as demand_forecast_weekly
FROM public.inventory_items ii
WHERE ii.is_active = true
LIMIT 10;

-- Create view for alert dashboard
CREATE OR REPLACE VIEW public.alert_dashboard AS
SELECT 
    ra.id,
    ra.alert_type,
    ra.alert_level,
    ra.priority,
    ra.status,
    ra.alert_title,
    ra.alert_message,
    ra.current_stock,
    ra.recommended_order_quantity,
    ra.estimated_stockout_date,
    ra.created_at,
    ra.acknowledged_at,
    ra.resolved_at,
    ii.name as item_name,
    ii.sku as item_sku,
    ii.category as item_category,
    ii.unit as item_unit,
    rt.reorder_point,
    rt.safety_stock,
    rt.maximum_stock,
    CASE 
        WHEN ra.created_at > NOW() - INTERVAL '1 hour' THEN true
        ELSE false
    END as is_recent,
    EXTRACT(EPOCH FROM (NOW() - ra.created_at))/3600 as hours_since_created
FROM public.reorder_alerts ra
JOIN public.inventory_items ii ON ra.item_id = ii.id
LEFT JOIN public.reorder_thresholds rt ON ra.threshold_id = rt.id
ORDER BY 
    CASE ra.priority
        WHEN 'emergency' THEN 1
        WHEN 'critical' THEN 2
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 4
        ELSE 5
    END,
    ra.created_at DESC;

-- Grant permissions
GRANT ALL ON public.reorder_thresholds TO authenticated;
GRANT ALL ON public.reorder_alerts TO authenticated;
GRANT ALL ON public.demand_forecasts TO authenticated;
GRANT ALL ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.approval_workflows TO authenticated;
GRANT ALL ON public.supplier_lead_times TO authenticated;
GRANT SELECT ON public.alert_dashboard TO authenticated;
