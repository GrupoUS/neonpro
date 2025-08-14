-- Migration: Create Subscription System Tables
-- Description: Comprehensive subscription management with plans, billing cycles, and retry logic
-- Author: APEX Master Developer
-- Date: 2025-01-26

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'quarter', 'year')),
    interval_count INTEGER NOT NULL DEFAULT 1,
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing cycles table for tracking payment attempts
CREATE TABLE IF NOT EXISTS billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    attempt_count INTEGER DEFAULT 0,
    next_retry_date TIMESTAMP WITH TIME ZONE,
    invoice_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    stripe_event_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_interval ON subscription_plans(interval);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_patient ON stripe_customers(patient_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_patient ON subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_billing_cycles_subscription ON billing_cycles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_status ON billing_cycles(status);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_retry_date ON billing_cycles(next_retry_date);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_period ON billing_cycles(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created ON subscription_events(created_at);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON stripe_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_cycles_updated_at BEFORE UPDATE ON billing_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, admin write)
CREATE POLICY "subscription_plans_select" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "subscription_plans_insert" ON subscription_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "subscription_plans_update" ON subscription_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- RLS Policies for stripe_customers (user can see their own)
CREATE POLICY "stripe_customers_select" ON stripe_customers
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "stripe_customers_insert" ON stripe_customers
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

-- RLS Policies for subscriptions (user can see their patients' subscriptions)
CREATE POLICY "subscriptions_select" ON subscriptions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "subscriptions_insert" ON subscriptions
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

CREATE POLICY "subscriptions_update" ON subscriptions
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE created_by = auth.uid() 
            OR auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role IN ('admin', 'manager', 'financial')
            )
        )
    );

-- RLS Policies for billing_cycles (linked to subscription access)
CREATE POLICY "billing_cycles_select" ON billing_cycles
    FOR SELECT USING (
        subscription_id IN (
            SELECT id FROM subscriptions 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

CREATE POLICY "billing_cycles_insert" ON billing_cycles
    FOR INSERT WITH CHECK (
        subscription_id IN (
            SELECT id FROM subscriptions 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

CREATE POLICY "billing_cycles_update" ON billing_cycles
    FOR UPDATE USING (
        subscription_id IN (
            SELECT id FROM subscriptions 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

-- RLS Policies for subscription_events (linked to subscription access)
CREATE POLICY "subscription_events_select" ON subscription_events
    FOR SELECT USING (
        subscription_id IN (
            SELECT id FROM subscriptions 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE created_by = auth.uid() 
                OR auth.uid() IN (
                    SELECT id FROM profiles 
                    WHERE role IN ('admin', 'manager', 'financial')
                )
            )
        )
    );

CREATE POLICY "subscription_events_insert" ON subscription_events
    FOR INSERT WITH CHECK (true); -- System can insert events

-- Create useful views
CREATE OR REPLACE VIEW subscription_summary AS
SELECT 
    s.id,
    s.patient_id,
    p.name as patient_name,
    p.email as patient_email,
    sp.name as plan_name,
    sp.description as plan_description,
    s.status,
    s.amount,
    s.currency,
    s.current_period_start,
    s.current_period_end,
    s.trial_end,
    s.cancel_at_period_end,
    s.created_at,
    s.updated_at
FROM subscriptions s
JOIN patients p ON s.patient_id = p.id
JOIN subscription_plans sp ON s.plan_id = sp.id;

-- Create functions for subscription management
CREATE OR REPLACE FUNCTION get_active_subscriptions()
RETURNS TABLE (
    subscription_id UUID,
    patient_name TEXT,
    plan_name TEXT,
    amount INTEGER,
    currency TEXT,
    next_billing_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        p.name,
        sp.name,
        s.amount,
        s.currency,
        s.current_period_end
    FROM subscriptions s
    JOIN patients p ON s.patient_id = p.id
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.status = 'active'
    ORDER BY s.current_period_end ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_subscription_revenue_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
    total_revenue BIGINT,
    active_subscriptions BIGINT,
    new_subscriptions BIGINT,
    canceled_subscriptions BIGINT,
    mrr BIGINT -- Monthly Recurring Revenue
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN bc.status = 'paid' THEN bc.amount ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_subscriptions,
        COUNT(DISTINCT CASE WHEN s.created_at::date BETWEEN start_date AND end_date THEN s.id END) as new_subscriptions,
        COUNT(DISTINCT CASE WHEN s.canceled_at::date BETWEEN start_date AND end_date THEN s.id END) as canceled_subscriptions,
        COALESCE(SUM(CASE WHEN s.status = 'active' AND sp.interval = 'month' THEN s.amount 
                         WHEN s.status = 'active' AND sp.interval = 'quarter' THEN s.amount / 3
                         WHEN s.status = 'active' AND sp.interval = 'year' THEN s.amount / 12
                         ELSE 0 END), 0) as mrr
    FROM subscriptions s
    LEFT JOIN billing_cycles bc ON s.id = bc.subscription_id 
        AND bc.period_start >= start_date::timestamp 
        AND bc.period_end <= end_date::timestamp
    LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stripe_customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON billing_cycles TO authenticated;
GRANT SELECT, INSERT ON subscription_events TO authenticated;
GRANT SELECT ON subscription_summary TO authenticated;

GRANT EXECUTE ON FUNCTION get_active_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_revenue_stats(DATE, DATE) TO authenticated;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, amount, currency, interval, interval_count, trial_days, features) VALUES
('Basic Plan', 'Essential features for small clinics', 9900, 'BRL', 'month', 1, 7, '["Up to 100 patients", "Basic reporting", "Email support"]'),
('Professional Plan', 'Advanced features for growing clinics', 19900, 'BRL', 'month', 1, 14, '["Up to 500 patients", "Advanced reporting", "Priority support", "API access"]'),
('Enterprise Plan', 'Full features for large clinics', 39900, 'BRL', 'month', 1, 30, '["Unlimited patients", "Custom reporting", "24/7 support", "API access", "Custom integrations"]'),
('Annual Basic', 'Basic plan with annual billing', 99000, 'BRL', 'year', 1, 30, '["Up to 100 patients", "Basic reporting", "Email support", "2 months free"]'),
('Annual Professional', 'Professional plan with annual billing', 199000, 'BRL', 'year', 1, 30, '["Up to 500 patients", "Advanced reporting", "Priority support", "API access", "2 months free"]'),
('Annual Enterprise', 'Enterprise plan with annual billing', 399000, 'BRL', 'year', 1, 30, '["Unlimited patients", "Custom reporting", "24/7 support", "API access", "Custom integrations", "2 months free"]')
ON CONFLICT DO NOTHING;

-- Add subscription_id reference to ap_payments table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'subscription_id') THEN
        ALTER TABLE ap_payments ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
        CREATE INDEX IF NOT EXISTS idx_ap_payments_subscription ON ap_payments(subscription_id);
    END IF;
END $$;

COMMIT;
