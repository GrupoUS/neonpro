-- ========================================
-- NEONPRO CRM TABLES SETUP - Local Migration
-- Created: 2025-07-21
-- Purpose: Complete CRM system for NeonPro clinic management  
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main customers table (extends profiles with CRM data)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID, -- Will create profiles table separately or use auth.users
    
    -- Basic customer info (redundant for performance)
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- CRM specific data
    customer_since TIMESTAMPTZ DEFAULT NOW(),
    total_visits INTEGER DEFAULT 0,
    last_visit TIMESTAMPTZ,
    last_treatment TIMESTAMPTZ,
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    
    -- Contact preferences
    email_opt_in BOOLEAN DEFAULT true,
    sms_opt_in BOOLEAN DEFAULT true,
    whatsapp_opt_in BOOLEAN DEFAULT false,
    marketing_opt_in BOOLEAN DEFAULT true,
    
    -- Customer status (using simple varchar instead of enum)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer segments for marketing campaigns
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- Flexible criteria for auto-segmentation
    auto_update BOOLEAN DEFAULT false,
    customer_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID, -- Will reference auth.users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for manual segment membership
CREATE TABLE IF NOT EXISTS customer_segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    added_date TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID, -- Reference to auth.users
    is_active BOOLEAN DEFAULT true,
    UNIQUE(customer_id, segment_id)
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) DEFAULT 'email' CHECK (campaign_type IN ('email', 'sms', 'whatsapp', 'push')),
    
    -- Campaign content
    subject VARCHAR(300), -- For email campaigns
    message_template TEXT NOT NULL,
    
    -- Campaign targeting
    target_segments UUID[] DEFAULT '{}', -- Array of segment IDs
    target_customers UUID[] DEFAULT '{}', -- Array of specific customer IDs
    
    -- Scheduling
    scheduled_date TIMESTAMPTZ,
    sent_date TIMESTAMPTZ,
    
    -- Status and metrics
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    -- Meta
    created_by UUID, -- Reference to auth.users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign recipients tracking
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Delivery status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    UNIQUE(campaign_id, customer_id)
);

-- Customer interactions log (visits, treatments, calls, etc.)
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Interaction details
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'visit', 'treatment', 'consultation', 'phone_call', 
        'email', 'sms', 'whatsapp', 'complaint', 'compliment', 'other'
    )),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Context
    staff_member UUID, -- Reference to auth.users (staff who handled interaction)
    treatment_id UUID, -- Reference to treatments table (if applicable)
    appointment_id UUID, -- Reference to appointments table (if applicable)
    
    -- Outcome and follow-up
    outcome VARCHAR(100),
    requires_followup BOOLEAN DEFAULT false,
    followup_date TIMESTAMPTZ,
    followup_notes TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_since ON customers(customer_since);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE INDEX IF NOT EXISTS idx_customer_segments_active ON customer_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_segments_created_by ON customer_segments(created_by);

CREATE INDEX IF NOT EXISTS idx_memberships_customer ON customer_segment_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_memberships_segment ON customer_segment_memberships(segment_id);
CREATE INDEX IF NOT EXISTS idx_memberships_active ON customer_segment_memberships(is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON marketing_campaigns(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent ON marketing_campaigns(sent_date);

CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_recipients_status ON campaign_recipients(status);

CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON customer_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_followup ON customer_interactions(requires_followup, followup_date);

-- Update triggers for maintaining updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_interactions_updated_at BEFORE UPDATE ON customer_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
