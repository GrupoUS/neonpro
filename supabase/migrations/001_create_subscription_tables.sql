-- Migration: Create Subscription Management Tables
-- Epic: EPIC-001 - Advanced Subscription Management
-- Story: EPIC-001.1 - Subscription Middleware & Management System
-- Date: 2024-12-30

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types for subscription system
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'trial',
        'active', 
        'past_due',
        'canceled',
        'unpaid',
        'paused'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_cycle_type AS ENUM (
        'monthly',
        'quarterly', 
        'yearly'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_event_type AS ENUM (
        'invoice_created',
        'invoice_payment_succeeded',
        'invoice_payment_failed',
        'subscription_created',
        'subscription_updated',
        'subscription_canceled',
        'payment_method_attached',
        'payment_method_detached'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'processing',
        'succeeded',
        'failed',
        'canceled',
        'requires_action'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_quarterly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    
    -- Feature flags and limits
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    
    -- Plan configuration
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Stripe/MercadoPago product IDs
    stripe_product_id VARCHAR(255),
    stripe_price_monthly_id VARCHAR(255),
    stripe_price_quarterly_id VARCHAR(255),
    stripe_price_yearly_id VARCHAR(255),
    mercado_pago_plan_id VARCHAR(255),
    
    -- Metadata and audit
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription status and timing
    status subscription_status DEFAULT 'trial',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Billing configuration
    billing_cycle billing_cycle_type DEFAULT 'monthly',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment provider integration
    payment_provider VARCHAR(50), -- 'stripe', 'mercado_pago'
    external_subscription_id VARCHAR(255),
    external_customer_id VARCHAR(255),
    
    -- Usage tracking
    usage_data JSONB DEFAULT '{}',
    last_usage_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Cancellation handling
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Metadata and audit
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active subscription per clinic
    CONSTRAINT unique_active_subscription_per_clinic 
        EXCLUDE (clinic_id WITH =) 
        WHERE (status IN ('trial', 'active'))
);

-- Billing Events Table
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    
    -- Event details
    event_type billing_event_type NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Financial details
    amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Payment status
    status payment_status DEFAULT 'pending',
    
    -- External provider references
    external_event_id VARCHAR(255),
    external_invoice_id VARCHAR(255),
    external_payment_intent_id VARCHAR(255),
    
    -- Processing information
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_attempts INTEGER DEFAULT 0,
    last_processing_error TEXT,
    
    -- Metadata and audit
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Idempotency constraint
    CONSTRAINT unique_external_event UNIQUE (external_event_id) WHERE external_event_id IS NOT NULL
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    
    -- Usage metrics
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_period_start TIMESTAMP WITH TIME ZONE,
    usage_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Reset information
    reset_frequency VARCHAR(20) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for feature tracking per subscription
    CONSTRAINT unique_feature_usage_per_subscription 
        UNIQUE (subscription_id, feature_name, usage_period_start)
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS subscription_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Payment method details
    payment_provider VARCHAR(50) NOT NULL, -- 'stripe', 'mercado_pago'
    external_payment_method_id VARCHAR(255) NOT NULL,
    
    -- Card/payment method information
    type VARCHAR(50), -- 'card', 'bank_account', 'pix', etc.
    brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    
    -- Status and preferences
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata and audit
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique external payment method
    CONSTRAINT unique_external_payment_method 
        UNIQUE (payment_provider, external_payment_method_id)
);