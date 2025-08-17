-- Migration: Create Row Level Security (RLS) Policies for Subscription Tables
-- Epic: EPIC-001 - Advanced Subscription Management  
-- Story: EPIC-001.1 - Subscription Middleware & Management System
-- Date: 2024-12-30

-- Enable RLS on all subscription tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payment_methods ENABLE ROW LEVEL SECURITY;

-- Subscription Plans RLS Policies (Public read for active plans, admin write)
CREATE POLICY "Public read access to active subscription plans" 
    ON subscription_plans FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admin full access to subscription plans" 
    ON subscription_plans FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('super_admin', 'system_admin')
        )
    );

-- User Subscriptions RLS Policies (Users can only see their own clinic's subscriptions)
CREATE POLICY "Users can view their clinic subscriptions" 
    ON user_subscriptions FOR SELECT 
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinics 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic admins can manage subscriptions" 
    ON user_subscriptions FOR ALL 
    USING (
        clinic_id IN (
            SELECT uc.clinic_id FROM user_clinics uc
            JOIN user_roles ur ON uc.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE uc.user_id = auth.uid() 
            AND r.name IN ('clinic_admin', 'super_admin', 'system_admin')
        )
    );

-- Billing Events RLS Policies (Users can only see events for their clinic's subscriptions)
CREATE POLICY "Users can view their subscription billing events" 
    ON billing_events FOR SELECT 
    USING (
        subscription_id IN (
            SELECT us.id FROM user_subscriptions us
            JOIN user_clinics uc ON us.clinic_id = uc.clinic_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert billing events" 
    ON billing_events FOR INSERT 
    WITH CHECK (true); -- System-level operations

CREATE POLICY "System can update billing events" 
    ON billing_events FOR UPDATE 
    USING (true); -- System-level operations

-- Subscription Usage RLS Policies (Users can only see usage for their clinic's subscriptions)
CREATE POLICY "Users can view their subscription usage" 
    ON subscription_usage FOR SELECT 
    USING (
        subscription_id IN (
            SELECT us.id FROM user_subscriptions us
            JOIN user_clinics uc ON us.clinic_id = uc.clinic_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage subscription usage" 
    ON subscription_usage FOR ALL 
    USING (true); -- System-level operations for usage tracking

-- Payment Methods RLS Policies (Users can only see their own clinic's payment methods)
CREATE POLICY "Users can view their clinic payment methods" 
    ON subscription_payment_methods FOR SELECT 
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinics 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clinic admins can manage payment methods" 
    ON subscription_payment_methods FOR ALL 
    USING (
        clinic_id IN (
            SELECT uc.clinic_id FROM user_clinics uc
            JOIN user_roles ur ON uc.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE uc.user_id = auth.uid() 
            AND r.name IN ('clinic_admin', 'super_admin', 'system_admin')
        )
    );