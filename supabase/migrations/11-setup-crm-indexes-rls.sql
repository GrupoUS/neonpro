-- ========================================
-- NEONPRO CRM INDEXES AND RLS POLICIES
-- Created: 2025-01-28
-- Purpose: Add indexes and security policies to CRM tables
-- ========================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_since ON customers(customer_since);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit);
CREATE INDEX IF NOT EXISTS idx_customers_lifetime_value ON customers(lifetime_value DESC);

CREATE INDEX IF NOT EXISTS idx_customer_segments_name ON customer_segments(name);
CREATE INDEX IF NOT EXISTS idx_customer_segments_active ON customer_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_segments_created_by ON customer_segments(created_by);

CREATE INDEX IF NOT EXISTS idx_segment_memberships_customer ON customer_segment_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_segment_memberships_segment ON customer_segment_memberships(segment_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_type ON marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_schedule_date ON marketing_campaigns(schedule_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON marketing_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON marketing_campaigns(sent_at);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_sent_at ON campaign_recipients(sent_at);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_opened_at ON campaign_recipients(opened_at);

CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON customer_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_created_by ON customer_interactions(created_by);

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view customers from their clinic" ON customers;
DROP POLICY IF EXISTS "Users can manage customers from their clinic" ON customers;
DROP POLICY IF EXISTS "Users can view segments from their clinic" ON customer_segments;
DROP POLICY IF EXISTS "Users can manage their own segments" ON customer_segments;
DROP POLICY IF EXISTS "Users can view campaigns from their clinic" ON marketing_campaigns;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON marketing_campaigns;
DROP POLICY IF EXISTS "Users can view segment memberships from their clinic" ON customer_segment_memberships;
DROP POLICY IF EXISTS "Users can view campaign recipients from their clinic" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can view interactions from their clinic" ON customer_interactions;
DROP POLICY IF EXISTS "Users can create interactions for their clinic customers" ON customer_interactions;

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
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_segments_updated_at ON customer_segments;
CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
DROP TRIGGER IF EXISTS update_segment_count_trigger ON customer_segment_memberships;
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
SELECT 'CRM indexes and RLS policies created successfully! 🎉' as status;
