-- ========================================
-- NEONPRO CRM TABLES SETUP - Supabase Compatible Version
-- Created: 2025-01-28
-- Purpose: Complete CRM system for NeonPro clinic management
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main customers table (extends profiles with CRM data)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(profile_id)
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
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer segment memberships (many-to-many)
CREATE TABLE IF NOT EXISTS customer_segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES customer_segments(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES profiles(id),
    
    -- Composite index for uniqueness
    UNIQUE(customer_id, segment_id)
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'push')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    
    -- Target audience
    target_segment_id UUID REFERENCES customer_segments(id),
    target_all_customers BOOLEAN DEFAULT false,
    
    -- Campaign content
    subject VARCHAR(255), -- For email campaigns
    content JSONB NOT NULL, -- Email/SMS content, templates, etc.
    
    -- Scheduling
    schedule_date TIMESTAMPTZ,
    send_immediately BOOLEAN DEFAULT false,
    
    -- Execution tracking
    sent_at TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    
    -- Performance metrics
    metrics JSONB DEFAULT '{}', -- Open rates, click rates, conversions, etc.
    
    -- Audit fields
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign recipients tracking
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Delivery tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Error tracking
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    
    -- Composite index for uniqueness
    UNIQUE(campaign_id, customer_id)
);

-- Customer interactions log
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'visit', 'treatment', 'campaign_response'
    interaction_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Interaction details
    title VARCHAR(200),
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Flexible data for different interaction types
    
    -- Staff member who logged the interaction
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
