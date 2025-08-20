-- ========================================
-- NEONPRO CRM RLS POLICIES - Simplified Version
-- Created: 2025-01-28
-- Purpose: Add basic RLS policies for CRM tables
-- ========================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_since ON customers(customer_since);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit);
CREATE INDEX IF NOT EXISTS idx_customers_lifetime_value ON customers(lifetime_value DESC);

CREATE INDEX IF NOT EXISTS idx_customer_segments_name ON customer_segments(name);
CREATE INDEX IF NOT EXISTS idx_customer_segments_active ON customer_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_segments_created_by ON customer_segments(created_by);

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customer_segments;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customer_segment_memberships;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON marketing_campaigns;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON campaign_recipients;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customer_interactions;

-- Simple policies - Allow all authenticated users (can be refined later)
CREATE POLICY "Allow all for authenticated users" ON customers
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON customer_segments
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON customer_segment_memberships
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON marketing_campaigns
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON campaign_recipients
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON customer_interactions
    FOR ALL USING (auth.uid() IS NOT NULL);

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

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'CRM RLS policies created successfully! 🎉' as status;
