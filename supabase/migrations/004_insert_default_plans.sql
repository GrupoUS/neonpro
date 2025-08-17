-- Migration: Insert Default Subscription Plans
-- Epic: EPIC-001 - Advanced Subscription Management
-- Story: EPIC-001.1 - Subscription Middleware & Management System  
-- Date: 2024-12-30

-- Insert default subscription plans for NeonPro clinic management

-- Basic Plan
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price_monthly,
    price_quarterly,
    price_yearly,
    features,
    limits,
    is_active,
    is_featured,
    sort_order
) VALUES (
    'basic',
    'Plano Básico',
    'Ideal para clínicas pequenas com funcionalidades essenciais',
    99.90,
    269.90,
    999.90,
    '{
        "appointment_management": true,
        "patient_records": true,
        "basic_reports": true,
        "email_notifications": true,
        "mobile_app": true,
        "basic_support": true,
        "data_backup": true,
        "lgpd_compliance": true
    }',
    '{
        "max_patients": 500,
        "max_appointments_per_month": 1000,
        "max_users": 3,
        "storage_gb": 5,
        "api_requests_per_month": 10000,
        "sms_notifications": 100,
        "email_notifications": 1000
    }',
    true,
    false,
    1
);

-- Professional Plan  
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price_monthly,
    price_quarterly,
    price_yearly,
    features,
    limits,
    is_active,
    is_featured,
    sort_order
) VALUES (
    'professional',
    'Plano Profissional',
    'Para clínicas em crescimento com recursos avançados',
    199.90,
    539.90,
    1999.90,
    '{
        "appointment_management": true,
        "patient_records": true,
        "advanced_reports": true,
        "bi_dashboard": true,
        "inventory_management": true,
        "financial_management": true,
        "email_notifications": true,
        "sms_notifications": true,
        "mobile_app": true,
        "priority_support": true,
        "data_backup": true,
        "lgpd_compliance": true,
        "multi_location": true,
        "custom_templates": true,
        "api_access": true
    }',
    '{
        "max_patients": 2000,
        "max_appointments_per_month": 5000,
        "max_users": 10,
        "storage_gb": 25,
        "api_requests_per_month": 50000,
        "sms_notifications": 500,
        "email_notifications": 5000,
        "max_locations": 3
    }',
    true,
    true,
    2
);

-- Enterprise Plan
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price_monthly,
    price_quarterly,
    price_yearly,
    features,
    limits,
    is_active,
    is_featured,
    sort_order
) VALUES (
    'enterprise',
    'Plano Enterprise',
    'Solução completa para grandes clínicas e redes de saúde',
    499.90,
    1349.90,
    4999.90,
    '{
        "appointment_management": true,
        "patient_records": true,
        "advanced_reports": true,
        "bi_dashboard": true,
        "custom_dashboards": true,
        "inventory_management": true,
        "financial_management": true,
        "email_notifications": true,
        "sms_notifications": true,
        "whatsapp_integration": true,
        "mobile_app": true,
        "dedicated_support": true,
        "data_backup": true,
        "disaster_recovery": true,
        "lgpd_compliance": true,
        "multi_location": true,
        "custom_templates": true,
        "api_access": true,
        "webhook_integration": true,
        "sso_integration": true,
        "advanced_security": true,
        "white_label": true
    }',
    '{
        "max_patients": -1,
        "max_appointments_per_month": -1,
        "max_users": -1,
        "storage_gb": 100,
        "api_requests_per_month": -1,
        "sms_notifications": -1,
        "email_notifications": -1,
        "max_locations": -1
    }',
    true,
    false,
    3
);