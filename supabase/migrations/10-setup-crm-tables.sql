-- NeonPro CRM Tables Setup
-- Task 10: CRM & Campanhas
-- Created: 2025-01-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types for CRM system
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'vip', 'blocked');
CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'whatsapp', 'push');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');

-- Customers table (extends existing profiles for CRM functionality)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    customer_since TIMESTAMPTZ DEFAULT NOW(),
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    last_treatment DATE,
    last_visit DATE,
    total_visits INTEGER DEFAULT 0,
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    notes TEXT,
    tags TEXT[], -- Array of custom tags
    status customer_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    UNIQUE(profile_id),
    INDEX(status),
    INDEX(customer_since),
    INDEX(last_visit),
    INDEX(lifetime_value DESC)
);

-- Customer segments for marketing campaigns
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- Dynamic segmentation rules
    auto_update BOOLEAN DEFAULT false,
    customer_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX(name),
    INDEX(is_active),
    INDEX(created_by)
);

-- Customer segment memberships (many-to-many)
CREATE TABLE IF NOT EXISTS customer_segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES customer_segments(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES profiles(id),
    
    -- Composite index for uniqueness
    UNIQUE(customer_id, segment_id),
    INDEX(customer_id),
    INDEX(segment_id)
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type campaign_type NOT NULL,
    status campaign_status DEFAULT 'draft',
    
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX(type),
    INDEX(status),
    INDEX(schedule_date),
    INDEX(created_by),
    INDEX(sent_at)
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
    UNIQUE(campaign_id, customer_id),
    INDEX(campaign_id),
    INDEX(customer_id),
    INDEX(sent_at),
    INDEX(opened_at)
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX(customer_id),
    INDEX(interaction_type),
    INDEX(interaction_date DESC),
    INDEX(created_by)
);

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view customers from their clinic" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = profile_id 
            AND p.clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage customers from their clinic" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = profile_id 
            AND p.clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Customer segments policies
CREATE POLICY "Users can view segments from their clinic" ON customer_segments
    FOR SELECT USING (
        created_by IN (
            SELECT id FROM profiles 
            WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own segments" ON customer_segments
    FOR ALL USING (created_by = auth.uid());

-- Marketing campaigns policies
CREATE POLICY "Users can view campaigns from their clinic" ON marketing_campaigns
    FOR SELECT USING (
        created_by IN (
            SELECT id FROM profiles 
            WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own campaigns" ON marketing_campaigns
    FOR ALL USING (created_by = auth.uid());

-- Customer segment memberships policies
CREATE POLICY "Users can view segment memberships from their clinic" ON customer_segment_memberships
    FOR SELECT USING (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN profiles p ON p.id = c.profile_id
            WHERE p.clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Campaign recipients policies
CREATE POLICY "Users can view campaign recipients from their clinic" ON campaign_recipients
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM marketing_campaigns 
            WHERE created_by IN (
                SELECT id FROM profiles 
                WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
            )
        )
    );

-- Customer interactions policies
CREATE POLICY "Users can view interactions from their clinic" ON customer_interactions
    FOR SELECT USING (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN profiles p ON p.id = c.profile_id
            WHERE p.clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can create interactions for their clinic customers" ON customer_interactions
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN profiles p ON p.id = c.profile_id
            WHERE p.clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total visits when a new appointment is completed
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE customers 
        SET 
            total_visits = total_visits + 1,
            last_visit = NEW.appointment_date,
            last_treatment = NEW.appointment_date
        WHERE profile_id = NEW.patient_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats (assumes appointments table exists)
-- This will be created when appointments table is available
-- CREATE TRIGGER update_customer_stats_trigger
--     AFTER INSERT OR UPDATE ON appointments
--     FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Function to update segment customer count
CREATE OR REPLACE FUNCTION update_segment_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count when membership is added
    IF TG_OP = 'INSERT' THEN
        UPDATE customer_segments 
        SET customer_count = customer_count + 1
        WHERE id = NEW.segment_id;
        RETURN NEW;
    END IF;
    
    -- Update count when membership is removed
    IF TG_OP = 'DELETE' THEN
        UPDATE customer_segments 
        SET customer_count = customer_count - 1
        WHERE id = OLD.segment_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update segment counts
CREATE TRIGGER update_segment_count_trigger
    AFTER INSERT OR DELETE ON customer_segment_memberships
    FOR EACH ROW EXECUTE FUNCTION update_segment_count();

-- Initial data: Default customer segments
INSERT INTO customer_segments (name, description, criteria, auto_update, is_active) VALUES
('VIP Customers', 'High lifetime value customers', '{"lifetime_value": {"operator": ">=", "value": 5000}}', true, true),
('New Customers', 'Customers who joined in the last 30 days', '{"customer_since": {"operator": ">=", "value": "30_days_ago"}}', true, true),
('Inactive Customers', 'Customers who haven''t visited in the last 90 days', '{"last_visit": {"operator": "<=", "value": "90_days_ago"}}', true, true),
('Regular Customers', 'Customers with 5+ visits', '{"total_visits": {"operator": ">=", "value": 5}}', true, true)
ON CONFLICT DO NOTHING;

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'CRM tables created successfully! 🎉' as status;