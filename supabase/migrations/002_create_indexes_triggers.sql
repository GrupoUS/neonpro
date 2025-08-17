-- Migration: Create Indexes and Triggers for Subscription Tables  
-- Epic: EPIC-001 - Advanced Subscription Management
-- Story: EPIC-001.1 - Subscription Middleware & Management System
-- Date: 2024-12-30

-- Create indexes for performance optimization

-- Subscription Plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_featured ON subscription_plans (is_featured, sort_order) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product ON subscription_plans (stripe_product_id) WHERE stripe_product_id IS NOT NULL;

-- User Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_clinic_id ON user_subscriptions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions (clinic_id, status) WHERE status IN ('trial', 'active');
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_date ON user_subscriptions (next_billing_date) WHERE next_billing_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_external ON user_subscriptions (payment_provider, external_subscription_id) WHERE external_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end ON user_subscriptions (trial_end) WHERE trial_end IS NOT NULL AND status = 'trial';

-- Billing Events indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON billing_events (subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_status ON billing_events (status);
CREATE INDEX IF NOT EXISTS idx_billing_events_type_timestamp ON billing_events (event_type, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_billing_events_external_event ON billing_events (external_event_id) WHERE external_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_billing_events_processing ON billing_events (status, processing_attempts) WHERE status = 'pending';

-- Subscription Usage indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON subscription_usage (subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature ON subscription_usage (feature_name, usage_period_start);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_reset ON subscription_usage (last_reset_at, reset_frequency);

-- Payment Methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_clinic ON subscription_payment_methods (user_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON subscription_payment_methods (clinic_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON subscription_payment_methods (user_id, is_active) WHERE is_active = true;

-- Create triggers for automatic timestamp updates

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at 
    BEFORE UPDATE ON subscription_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON subscription_payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();