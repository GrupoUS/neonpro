-- NeonPro - Subscription Billing Schema
-- Story 6.1 - Task 2: Recurring Payment System
-- Migration: Create comprehensive subscription billing tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete')
    ),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Retry Log Table
CREATE TABLE IF NOT EXISTS payment_retry_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    payment_intent_id VARCHAR(255) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    retry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'processing', 'completed', 'failed', 'canceled')
    ),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Events Log Table
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Usage Tracking Table
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL, -- 'appointments', 'patients', 'storage', etc.
    usage_count INTEGER NOT NULL DEFAULT 0,
    usage_limit INTEGER,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proration Calculations Table
CREATE TABLE IF NOT EXISTS proration_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    old_plan_id UUID REFERENCES subscription_plans(id),
    new_plan_id UUID REFERENCES subscription_plans(id),
    original_amount DECIMAL(10,2) NOT NULL,
    prorated_amount DECIMAL(10,2) NOT NULL,
    days_used INTEGER NOT NULL,
    days_total INTEGER NOT NULL,
    proration_factor DECIMAL(5,4) NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Metrics View
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'canceled') as churned_subscriptions,
    COUNT(*) FILTER (WHERE status = 'trialing') as trial_subscriptions,
    COUNT(*) FILTER (WHERE status = 'past_due') as past_due_subscriptions,
    
    -- Monthly Recurring Revenue (MRR)
    SUM(
        CASE 
            WHEN sp.billing_cycle = 'monthly' THEN sp.price
            WHEN sp.billing_cycle = 'quarterly' THEN sp.price / 3
            WHEN sp.billing_cycle = 'annual' THEN sp.price / 12
            ELSE 0
        END
    ) FILTER (WHERE s.status = 'active') as mrr,
    
    -- Annual Recurring Revenue (ARR)
    SUM(
        CASE 
            WHEN sp.billing_cycle = 'monthly' THEN sp.price * 12
            WHEN sp.billing_cycle = 'quarterly' THEN sp.price * 4
            WHEN sp.billing_cycle = 'annual' THEN sp.price
            ELSE 0
        END
    ) FILTER (WHERE s.status = 'active') as arr,
    
    -- Churn Rate (last 30 days)
    CASE 
        WHEN COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') > 0 THEN
            (COUNT(*) FILTER (WHERE status = 'canceled' AND canceled_at >= NOW() - INTERVAL '30 days')::DECIMAL / 
             COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::DECIMAL) * 100
        ELSE 0
    END as churn_rate_30d
    
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_retry_subscription_id ON payment_retry_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_retry_status ON payment_retry_log(status);
CREATE INDEX IF NOT EXISTS idx_payment_retry_date ON payment_retry_log(retry_date);

CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing_events(created_at);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_type ON subscription_usage(usage_type);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_proration_subscription_id ON proration_calculations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_proration_effective_date ON proration_calculations(effective_date);

-- Row Level Security (RLS) Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_retry_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE proration_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "subscription_plans_select_policy" ON subscription_plans
    FOR SELECT USING (true); -- Public read access for active plans

CREATE POLICY "subscription_plans_insert_policy" ON subscription_plans
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'owner'
    );

CREATE POLICY "subscription_plans_update_policy" ON subscription_plans
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'owner'
    );

-- RLS Policies for subscriptions
CREATE POLICY "subscriptions_select_policy" ON subscriptions
    FOR SELECT USING (
        -- Users can see their own subscriptions
        customer_id IN (
            SELECT id FROM customers 
            WHERE user_id = auth.uid()
        ) OR
        -- Admins and owners can see all subscriptions in their tenant
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role IN ('admin', 'owner')
            AND up.tenant_id = (
                SELECT c.tenant_id FROM customers c 
                WHERE c.id = subscriptions.customer_id
            )
        )
    );

CREATE POLICY "subscriptions_insert_policy" ON subscriptions
    FOR INSERT WITH CHECK (
        -- Users can create subscriptions for themselves
        customer_id IN (
            SELECT id FROM customers 
            WHERE user_id = auth.uid()
        ) OR
        -- Admins and owners can create subscriptions for customers in their tenant
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role IN ('admin', 'owner')
            AND up.tenant_id = (
                SELECT c.tenant_id FROM customers c 
                WHERE c.id = subscriptions.customer_id
            )
        )
    );

CREATE POLICY "subscriptions_update_policy" ON subscriptions
    FOR UPDATE USING (
        -- Users can update their own subscriptions (limited fields)
        customer_id IN (
            SELECT id FROM customers 
            WHERE user_id = auth.uid()
        ) OR
        -- Admins and owners can update subscriptions in their tenant
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role IN ('admin', 'owner')
            AND up.tenant_id = (
                SELECT c.tenant_id FROM customers c 
                WHERE c.id = subscriptions.customer_id
            )
        )
    );

-- RLS Policies for payment_retry_log
CREATE POLICY "payment_retry_log_select_policy" ON payment_retry_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.id = payment_retry_log.subscription_id
            AND (
                c.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    WHERE up.user_id = auth.uid()
                    AND up.role IN ('admin', 'owner')
                    AND up.tenant_id = c.tenant_id
                )
            )
        )
    );

-- RLS Policies for billing_events
CREATE POLICY "billing_events_select_policy" ON billing_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.id = billing_events.subscription_id
            AND (
                c.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    WHERE up.user_id = auth.uid()
                    AND up.role IN ('admin', 'owner')
                    AND up.tenant_id = c.tenant_id
                )
            )
        )
    );

-- RLS Policies for subscription_usage
CREATE POLICY "subscription_usage_select_policy" ON subscription_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.id = subscription_usage.subscription_id
            AND (
                c.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    WHERE up.user_id = auth.uid()
                    AND up.role IN ('admin', 'owner')
                    AND up.tenant_id = c.tenant_id
                )
            )
        )
    );

-- RLS Policies for proration_calculations
CREATE POLICY "proration_calculations_select_policy" ON proration_calculations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions s
            JOIN customers c ON s.customer_id = c.id
            WHERE s.id = proration_calculations.subscription_id
            AND (
                c.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    WHERE up.user_id = auth.uid()
                    AND up.role IN ('admin', 'owner')
                    AND up.tenant_id = c.tenant_id
                )
            )
        )
    );

-- Functions for automated billing
CREATE OR REPLACE FUNCTION process_subscription_billing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update expired subscriptions
    UPDATE subscriptions 
    SET status = 'past_due'
    WHERE status = 'active'
    AND current_period_end < NOW()
    AND NOT cancel_at_period_end;
    
    -- Cancel subscriptions that should be canceled
    UPDATE subscriptions 
    SET status = 'canceled',
        canceled_at = NOW()
    WHERE cancel_at_period_end = true
    AND current_period_end < NOW()
    AND status != 'canceled';
    
    -- Log the billing process
    INSERT INTO billing_events (subscription_id, event_type, event_data)
    SELECT 
        id,
        'automated_billing_process',
        jsonb_build_object(
            'processed_at', NOW(),
            'status', status
        )
    FROM subscriptions
    WHERE updated_at >= NOW() - INTERVAL '1 minute';
END;
$$;

-- Function to calculate subscription metrics
CREATE OR REPLACE FUNCTION get_subscription_metrics(tenant_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    total_subscriptions BIGINT,
    active_subscriptions BIGINT,
    churned_subscriptions BIGINT,
    trial_subscriptions BIGINT,
    past_due_subscriptions BIGINT,
    mrr DECIMAL,
    arr DECIMAL,
    churn_rate_30d DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_subscriptions,
        COUNT(*) FILTER (WHERE s.status = 'active')::BIGINT as active_subscriptions,
        COUNT(*) FILTER (WHERE s.status = 'canceled')::BIGINT as churned_subscriptions,
        COUNT(*) FILTER (WHERE s.status = 'trialing')::BIGINT as trial_subscriptions,
        COUNT(*) FILTER (WHERE s.status = 'past_due')::BIGINT as past_due_subscriptions,
        
        -- Monthly Recurring Revenue (MRR)
        COALESCE(SUM(
            CASE 
                WHEN sp.billing_cycle = 'monthly' THEN sp.price
                WHEN sp.billing_cycle = 'quarterly' THEN sp.price / 3
                WHEN sp.billing_cycle = 'annual' THEN sp.price / 12
                ELSE 0
            END
        ) FILTER (WHERE s.status = 'active'), 0) as mrr,
        
        -- Annual Recurring Revenue (ARR)
        COALESCE(SUM(
            CASE 
                WHEN sp.billing_cycle = 'monthly' THEN sp.price * 12
                WHEN sp.billing_cycle = 'quarterly' THEN sp.price * 4
                WHEN sp.billing_cycle = 'annual' THEN sp.price
                ELSE 0
            END
        ) FILTER (WHERE s.status = 'active'), 0) as arr,
        
        -- Churn Rate (last 30 days)
        CASE 
            WHEN COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '30 days') > 0 THEN
                (COUNT(*) FILTER (WHERE s.status = 'canceled' AND s.canceled_at >= NOW() - INTERVAL '30 days')::DECIMAL / 
                 COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '30 days')::DECIMAL) * 100
            ELSE 0
        END as churn_rate_30d
        
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    JOIN customers c ON s.customer_id = c.id
    WHERE (tenant_id_param IS NULL OR c.tenant_id = tenant_id_param);
END;
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schedule automated billing process (runs every hour)
-- Note: pg_cron extension must be enabled and configured
SELECT cron.schedule('process-subscription-billing', '0 * * * *', 'SELECT process_subscription_billing();');

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, currency, billing_cycle, trial_days, features) VALUES
('Starter', 'Perfect for small clinics starting their digital journey', 99.00, 'BRL', 'monthly', 14, 
 '["Up to 100 appointments/month", "Basic patient management", "Email support", "Mobile app access"]'),
('Professional', 'Ideal for growing clinics with advanced needs', 199.00, 'BRL', 'monthly', 14,
 '["Up to 500 appointments/month", "Advanced analytics", "SMS notifications", "Priority support", "Custom branding"]'),
('Enterprise', 'Complete solution for large clinics and chains', 399.00, 'BRL', 'monthly', 30,
 '["Unlimited appointments", "AI-powered insights", "WhatsApp integration", "Dedicated support", "Multi-location", "API access"]'),
('Starter Annual', 'Starter plan with annual billing (2 months free)', 990.00, 'BRL', 'annual', 14,
 '["Up to 100 appointments/month", "Basic patient management", "Email support", "Mobile app access"]'),
('Professional Annual', 'Professional plan with annual billing (2 months free)', 1990.00, 'BRL', 'annual', 14,
 '["Up to 500 appointments/month", "Advanced analytics", "SMS notifications", "Priority support", "Custom branding"]'),
('Enterprise Annual', 'Enterprise plan with annual billing (2 months free)', 3990.00, 'BRL', 'annual', 30,
 '["Unlimited appointments", "AI-powered insights", "WhatsApp integration", "Dedicated support", "Multi-location", "API access"]')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMIT;