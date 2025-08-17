-- Migration: 004_insert_default_plans.sql
-- Created: Foundation migration for default subscription plans
-- Purpose: Insert healthcare-specific subscription plans for Brazilian aesthetic clinics

-- Insert default subscription plans for NeonPro Healthcare
INSERT INTO subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly, 
    features, 
    max_users, 
    max_patients, 
    max_appointments, 
    storage_gb, 
    is_active
) VALUES 
(
    'Starter Clinic',
    'Plano ideal para clínicas iniciantes com funcionalidades essenciais de gestão',
    89.90,
    899.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "lgpd_compliance": true,
        "anvisa_basic": true,
        "payment_integration": false,
        "inventory_management": false,
        "advanced_analytics": false,
        "api_access": false,
        "whatsapp_integration": false,
        "patient_portal": false,
        "telehealth": false
    }'::jsonb,
    3,
    100,
    500,
    1,
    true
),
(
    'Professional Clinic',
    'Plano completo para clínicas em crescimento com recursos avançados',
    189.90,
    1899.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "lgpd_compliance": true,
        "anvisa_full": true,
        "cfm_integration": true,
        "payment_integration": true,
        "inventory_management": true,
        "advanced_analytics": true,
        "api_access": "basic",
        "whatsapp_integration": true,
        "patient_portal": true,
        "telehealth": false,
        "multi_location": false,
        "staff_management": true,
        "financial_reporting": true
    }'::jsonb,
    10,
    1000,
    5000,
    10,
    true
),
(
    'Enterprise Clinic',
    'Solução empresarial para redes de clínicas e grandes estabelecimentos',
    389.90,
    3899.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "custom_reporting": true,
        "lgpd_compliance": true,
        "lgpd_automation": true,
        "anvisa_full": true,
        "anvisa_automation": true,
        "cfm_integration": true,
        "cfm_automation": true,
        "payment_integration": true,
        "advanced_payment_features": true,
        "inventory_management": true,
        "advanced_inventory": true,
        "advanced_analytics": true,
        "predictive_analytics": true,
        "api_access": "full",
        "whatsapp_integration": true,
        "whatsapp_automation": true,
        "patient_portal": true,
        "patient_portal_advanced": true,
        "telehealth": true,
        "multi_location": true,
        "franchise_management": true,
        "staff_management": true,
        "advanced_staff_features": true,
        "financial_reporting": true,
        "advanced_financial": true,
        "ai_recommendations": true,
        "custom_integrations": true,
        "priority_support": true,
        "dedicated_account_manager": true
    }'::jsonb,
    null, -- Unlimited users
    null, -- Unlimited patients
    null, -- Unlimited appointments
    100,
    true
),
(
    'Premium SaaS',
    'Plano premium com recursos de IA e automação avançada para clínicas de alto padrão',
    789.90,
    7899.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "ai_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "custom_reporting": true,
        "real_time_dashboards": true,
        "lgpd_compliance": true,
        "lgpd_automation": true,
        "lgpd_ai_monitoring": true,
        "anvisa_full": true,
        "anvisa_automation": true,
        "anvisa_ai_compliance": true,
        "cfm_integration": true,
        "cfm_automation": true,
        "cfm_ai_validation": true,
        "payment_integration": true,
        "advanced_payment_features": true,
        "payment_optimization": true,
        "inventory_management": true,
        "advanced_inventory": true,
        "ai_inventory_optimization": true,
        "advanced_analytics": true,
        "predictive_analytics": true,
        "ai_insights": true,
        "machine_learning": true,
        "api_access": "unlimited",
        "webhook_support": true,
        "whatsapp_integration": true,
        "whatsapp_automation": true,
        "whatsapp_ai_bot": true,
        "patient_portal": true,
        "patient_portal_advanced": true,
        "patient_mobile_app": true,
        "telehealth": true,
        "telehealth_ai_assistance": true,
        "multi_location": true,
        "franchise_management": true,
        "enterprise_features": true,
        "staff_management": true,
        "advanced_staff_features": true,
        "ai_staff_optimization": true,
        "financial_reporting": true,
        "advanced_financial": true,
        "ai_financial_insights": true,
        "ai_recommendations": true,
        "treatment_ai_recommendations": true,
        "outcome_prediction": true,
        "custom_integrations": true,
        "unlimited_integrations": true,
        "priority_support": true,
        "dedicated_account_manager": true,
        "white_label_options": true,
        "custom_branding": true,
        "advanced_security": true,
        "soc2_compliance": true,
        "hipaa_compliance": true
    }'::jsonb,
    null, -- Unlimited users
    null, -- Unlimited patients
    null, -- Unlimited appointments
    500,
    true
),
(
    'Free Trial',
    'Teste gratuito de 14 dias com funcionalidades básicas',
    0.00,
    0.00,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "lgpd_compliance": true,
        "trial_limitations": true,
        "support_limited": true
    }'::jsonb,
    1,
    10,
    50,
    0.5,
    true
) 
ON CONFLICT DO NOTHING;

-- Insert Brazilian healthcare market specific plans
INSERT INTO subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly, 
    features, 
    max_users, 
    max_patients, 
    max_appointments, 
    storage_gb, 
    is_active
) VALUES 
(
    'Micro Empresa',
    'Plano especial para microempresas do setor de estética',
    49.90,
    499.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "lgpd_compliance": true,
        "anvisa_basic": true,
        "brazilian_tax_integration": true,
        "mei_features": true,
        "simples_nacional": true
    }'::jsonb,
    2,
    50,
    200,
    0.5,
    true
),
(
    'Clínica Regional',
    'Ideal para clínicas que atendem múltiplas cidades',
    289.90,
    2899.90,
    '{
        "patient_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "regional_analytics": true,
        "lgpd_compliance": true,
        "anvisa_full": true,
        "cfm_integration": true,
        "payment_integration": true,
        "inventory_management": true,
        "multi_location": true,
        "regional_compliance": true,
        "state_reporting": true,
        "municipal_integration": true
    }'::jsonb,
    15,
    2000,
    10000,
    25,
    true
) 
ON CONFLICT DO NOTHING;

-- Create function to get recommended plan based on clinic size
CREATE OR REPLACE FUNCTION get_recommended_plan(
    expected_patients INTEGER DEFAULT 100,
    expected_users INTEGER DEFAULT 3,
    expected_appointments_monthly INTEGER DEFAULT 200,
    has_multiple_locations BOOLEAN DEFAULT false,
    needs_ai_features BOOLEAN DEFAULT false
)
RETURNS TABLE (
    plan_id UUID,
    plan_name VARCHAR(255),
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    recommendation_reason TEXT
) AS $$
BEGIN
    -- AI/Premium features required
    IF needs_ai_features THEN
        RETURN QUERY
        SELECT id, name, price_monthly, price_yearly, 
               'Recomendado para clínicas que necessitam de recursos de IA e automação avançada'
        FROM subscription_plans 
        WHERE name = 'Premium SaaS' AND is_active = true;
        RETURN;
    END IF;
    
    -- Multiple locations
    IF has_multiple_locations THEN
        RETURN QUERY
        SELECT id, name, price_monthly, price_yearly,
               'Ideal para redes de clínicas e estabelecimentos com múltiplas unidades'
        FROM subscription_plans 
        WHERE name IN ('Enterprise Clinic', 'Clínica Regional') AND is_active = true
        ORDER BY price_monthly;
        RETURN;
    END IF;
    
    -- Large clinic
    IF expected_patients > 1000 OR expected_users > 10 THEN
        RETURN QUERY
        SELECT id, name, price_monthly, price_yearly,
               'Recomendado para clínicas grandes com alto volume de pacientes'
        FROM subscription_plans 
        WHERE name = 'Enterprise Clinic' AND is_active = true;
        RETURN;
    END IF;
    
    -- Medium clinic
    IF expected_patients > 100 OR expected_users > 3 OR expected_appointments_monthly > 500 THEN
        RETURN QUERY
        SELECT id, name, price_monthly, price_yearly,
               'Ideal para clínicas em crescimento com necessidades profissionais'
        FROM subscription_plans 
        WHERE name = 'Professional Clinic' AND is_active = true;
        RETURN;
    END IF;
    
    -- Small clinic/MEI
    IF expected_patients <= 50 AND expected_users <= 2 THEN
        RETURN QUERY
        SELECT id, name, price_monthly, price_yearly,
               'Perfeito para microempresas e profissionais autônomos'
        FROM subscription_plans 
        WHERE name = 'Micro Empresa' AND is_active = true;
        RETURN;
    END IF;
    
    -- Default starter plan
    RETURN QUERY
    SELECT id, name, price_monthly, price_yearly,
           'Plano inicial ideal para começar sua jornada digital'
    FROM subscription_plans 
    WHERE name = 'Starter Clinic' AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check plan feature availability
CREATE OR REPLACE FUNCTION has_plan_feature(
    tenant_uuid UUID,
    feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    plan_features JSONB;
BEGIN
    -- Get current plan features for tenant
    SELECT sp.features INTO plan_features
    FROM subscription_plans sp
    JOIN subscriptions s ON s.plan_id = sp.id
    WHERE s.tenant_id = tenant_uuid 
    AND s.status = 'active'
    AND sp.is_active = true;
    
    -- If no active subscription, deny feature
    IF plan_features IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if feature exists and is true
    RETURN COALESCE((plan_features ->> feature_name)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get plan usage limits
CREATE OR REPLACE FUNCTION get_plan_limits(tenant_uuid UUID)
RETURNS TABLE (
    max_users INTEGER,
    max_patients INTEGER,
    max_appointments INTEGER,
    storage_gb INTEGER,
    current_users BIGINT,
    current_patients BIGINT,
    current_storage_mb BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.max_users,
        sp.max_patients,
        sp.max_appointments,
        sp.storage_gb,
        -- Current usage (will be populated as tables are created)
        COALESCE((SELECT COUNT(*) FROM user_tenants WHERE tenant_id = tenant_uuid AND is_active = true), 0) as current_users,
        0::bigint as current_patients, -- Placeholder for patients table
        0::bigint as current_storage_mb -- Placeholder for storage calculation
    FROM subscription_plans sp
    JOIN subscriptions s ON s.plan_id = sp.id
    WHERE s.tenant_id = tenant_uuid 
    AND s.status = 'active'
    AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for plan functions
GRANT EXECUTE ON FUNCTION get_recommended_plan(INTEGER, INTEGER, INTEGER, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION has_plan_feature(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_plan_limits(UUID) TO authenticated;