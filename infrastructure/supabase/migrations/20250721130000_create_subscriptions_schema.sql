-- Migration: Create user subscriptions table for NeonPro SaaS billing
-- Created: 2025-07-21
-- Purpose: Track user subscriptions and billing information

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan_id text NOT NULL CHECK (plan_id IN ('starter', 'professional', 'enterprise')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  canceled_at timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

-- Enable RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own subscription
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscription (for webhook updates)
CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create subscription plans reference table
CREATE TABLE subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  max_patients integer,
  max_clinics integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read subscription plans (public info)
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Only service role can manage plans
CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price_cents, stripe_price_id, features, max_patients, max_clinics) VALUES
  (
    'starter',
    'Starter',
    'Para clínicas pequenas',
    9900,
    'price_starter_monthly',
    '["Até 500 pacientes", "Agendamento básico", "Controle financeiro simples", "Suporte por email"]'::jsonb,
    500,
    1
  ),
  (
    'professional',
    'Professional',
    'Para clínicas em crescimento',
    19900,
    'price_professional_monthly',
    '["Até 2.000 pacientes", "Agendamento avançado", "Controle financeiro completo", "Relatórios e analytics", "Suporte prioritário", "Integrações API"]'::jsonb,
    2000,
    3
  ),
  (
    'enterprise',
    'Enterprise',
    'Para grandes clínicas',
    39900,
    'price_enterprise_monthly',
    '["Pacientes ilimitados", "Multi-clínicas", "Personalização completa", "Suporte 24/7", "Treinamento dedicado", "API completa"]'::jsonb,
    NULL,
    NULL
  );

-- Create trigger for subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create billing_events table to track billing history
CREATE TABLE billing_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  amount_cents integer,
  currency text DEFAULT 'brl',
  status text NOT NULL,
  description text,
  invoice_url text,
  receipt_url text,
  occurred_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for billing_events
CREATE INDEX idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);
CREATE INDEX idx_billing_events_occurred_at ON billing_events(occurred_at);

-- Enable RLS for billing_events
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own billing events
CREATE POLICY "Users can view their own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all billing events
CREATE POLICY "Service role can manage all billing events" ON billing_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create view for active subscriptions
CREATE VIEW active_subscriptions AS
SELECT 
  us.*,
  sp.name as plan_name,
  sp.description as plan_description,
  sp.price_cents as plan_price_cents,
  sp.max_patients as plan_max_patients,
  sp.max_clinics as plan_max_clinics,
  sp.features as plan_features
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active' 
  AND (us.current_period_end IS NULL OR us.current_period_end > now());

-- Grant access to the view
GRANT SELECT ON active_subscriptions TO authenticated;

-- Create user subscriptions view with plan details (for API usage)
CREATE VIEW user_subscriptions_view AS
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.stripe_subscription_id,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.cancel_at_period_end,
  us.created_at,
  us.updated_at,
  sp.name as plan_name,
  sp.description as plan_description,
  sp.price_cents as price,
  sp.stripe_price_id,
  'brl' as currency,
  'month' as interval,
  sp.features
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id;

-- Enable RLS for the view
ALTER VIEW user_subscriptions_view OWNER TO postgres;

-- Grant access to the view 
GRANT SELECT ON user_subscriptions_view TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_subscriptions IS 'Tracks user subscription information and billing status';
COMMENT ON TABLE subscription_plans IS 'Defines available subscription plans and their features';
COMMENT ON TABLE billing_events IS 'Historical record of all billing events and transactions';
COMMENT ON VIEW active_subscriptions IS 'View of active user subscriptions with plan details';
COMMENT ON VIEW user_subscriptions_view IS 'API view for user subscriptions with plan information';
