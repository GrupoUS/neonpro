-- Migration: Create subscriptions table for NeonPro Subscription Middleware
-- Created: 2024-12-31
-- Purpose: Support STORY-SUB-001 subscription middleware implementation

-- Create subscriptions table (compatible with middleware expectations)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  price_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (
    status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')
  ),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  canceled_at timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  last_checked_at timestamp with time zone DEFAULT NOW(),
  check_frequency_minutes integer DEFAULT 5,
  grace_period_days integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for optimal middleware performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_active ON public.subscriptions(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_checked ON public.subscriptions(last_checked_at) WHERE status IN ('active', 'trialing');

-- Enable RLS (Row Level Security)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for middleware compatibility
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for Stripe webhooks and middleware)
CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can update their own subscription (for client-side updates)
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  NEW.last_checked_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Create function for real-time subscription validation (middleware support)
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE(
  status text,
  expires_at timestamptz,
  grace_expires_at timestamptz,
  can_access_features boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status,
    s.current_period_end as expires_at,
    s.current_period_end + INTERVAL '3 days' as grace_expires_at,
    CASE 
      WHEN s.status IN ('active', 'trialing') THEN true
      WHEN s.status = 'past_due' AND s.current_period_end + INTERVAL '3 days' > NOW() THEN true
      ELSE false
    END as can_access_features
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to refresh subscription cache
CREATE OR REPLACE FUNCTION refresh_subscription_cache(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions 
  SET last_checked_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_subscription_cache(UUID) TO authenticated;

-- Insert sample data for testing (optional)
-- This can be removed in production
INSERT INTO public.subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  price_id,
  status,
  current_period_start,
  current_period_end
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Test user ID
  'cus_test_customer',
  'sub_test_subscription',
  'price_test',
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
) ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE public.subscriptions IS 'User subscription data for NeonPro SaaS billing with middleware support';
COMMENT ON FUNCTION get_user_subscription_status(UUID) IS 'Real-time subscription validation for middleware';
COMMENT ON FUNCTION refresh_subscription_cache(UUID) IS 'Refresh subscription cache timestamp';

-- Notify successful migration
DO $$
BEGIN
  RAISE NOTICE 'NeonPro Subscriptions table created successfully with middleware support!';
END $$;
