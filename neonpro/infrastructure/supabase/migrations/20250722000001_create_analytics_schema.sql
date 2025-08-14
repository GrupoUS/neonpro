-- Migration: Analytics Dashboard & Trial Management Schema
-- Story: STORY-SUB-002 - Analytics Dashboard & Trial Management
-- Date: 2025-07-22
-- Description: Creates comprehensive analytics and trial management schema for subscription system

-- Custom types for analytics and trial management
CREATE TYPE trial_status_type AS ENUM ('active', 'expired', 'converted', 'extended', 'cancelled');
CREATE TYPE lifecycle_event_type AS ENUM (
  'trial_started', 
  'trial_converted', 
  'subscription_cancelled', 
  'subscription_upgraded', 
  'subscription_downgraded', 
  'payment_failed',
  'subscription_renewed',
  'trial_extended'
);
CREATE TYPE forecast_type_enum AS ENUM ('mrr', 'arr', 'trials', 'churn', 'ltv', 'conversion_rate');

-- Subscription metrics aggregation table for performance optimization
CREATE TABLE subscription_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_subscriptions INTEGER NOT NULL DEFAULT 0,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  new_subscriptions INTEGER NOT NULL DEFAULT 0,
  churned_subscriptions INTEGER NOT NULL DEFAULT 0,
  mrr_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  arr_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  average_revenue_per_user DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  churn_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  growth_rate DECIMAL(5,4) DEFAULT 0.0000,
  trial_conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Trial management tracking table with AI-powered insights
CREATE TABLE trial_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  trial_started_at TIMESTAMPTZ NOT NULL,
  trial_expires_at TIMESTAMPTZ NOT NULL,
  trial_extended_until TIMESTAMPTZ,
  trial_status trial_status_type DEFAULT 'active',
  conversion_probability DECIMAL(3,2) DEFAULT 0.50, -- AI prediction 0.00-1.00
  conversion_factors JSONB DEFAULT '{}', -- Factors influencing conversion
  campaigns_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  last_engagement_at TIMESTAMPTZ,
  feature_usage_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00-1.00 usage intensity
  support_tickets_count INTEGER DEFAULT 0,
  converted_at TIMESTAMPTZ,
  conversion_revenue DECIMAL(12,2),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer lifecycle tracking for comprehensive analytics
CREATE TABLE customer_lifecycle_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type lifecycle_event_type NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  subscription_id UUID REFERENCES subscriptions(id),
  revenue_impact DECIMAL(12,2) DEFAULT 0.00,
  previous_value TEXT,
  new_value TEXT,
  campaign_id UUID,
  source_attribution TEXT, -- Marketing channel attribution
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort analysis table for retention insights
CREATE TABLE subscription_cohorts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_month DATE NOT NULL,
  period_number INTEGER NOT NULL, -- 0, 1, 2, 3... months since start
  customers_count INTEGER NOT NULL DEFAULT 0,
  revenue_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  churn_count INTEGER DEFAULT 0,
  upgrade_count INTEGER DEFAULT 0,
  downgrade_count INTEGER DEFAULT 0,
  average_ltv DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_month, period_number)
);

-- Revenue forecasting table with confidence intervals
CREATE TABLE revenue_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_date DATE NOT NULL,
  forecast_type forecast_type_enum NOT NULL,
  predicted_value DECIMAL(12,2) NOT NULL,
  confidence_interval JSONB NOT NULL DEFAULT '{"lower": 0, "upper": 0}',
  model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  model_accuracy DECIMAL(5,4) DEFAULT 0.0000,
  input_parameters JSONB DEFAULT '{}',
  actual_value DECIMAL(12,2), -- For validation and model improvement
  variance DECIMAL(12,2), -- Difference between predicted and actual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  UNIQUE(forecast_date, forecast_type, model_version)
);

-- Trial campaign effectiveness tracking
CREATE TABLE trial_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100) NOT NULL, -- 'email', 'in_app', 'sms'
  template_id VARCHAR(100),
  target_segment JSONB DEFAULT '{}', -- Targeting criteria
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0.00,
  cost_per_acquisition DECIMAL(12,2) DEFAULT 0.00,
  roi DECIMAL(5,4) DEFAULT 0.0000,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for analytics queries
CREATE INDEX idx_subscription_metrics_date ON subscription_metrics(date DESC);
CREATE INDEX idx_subscription_metrics_mrr ON subscription_metrics(mrr_amount DESC, date DESC);

CREATE INDEX idx_trial_analytics_status ON trial_analytics(trial_status, trial_expires_at);
CREATE INDEX idx_trial_analytics_conversion ON trial_analytics(conversion_probability DESC, trial_expires_at);
CREATE INDEX idx_trial_analytics_user_status ON trial_analytics(user_id, trial_status);

CREATE INDEX idx_lifecycle_events_user_type ON customer_lifecycle_events(user_id, event_type, occurred_at DESC);
CREATE INDEX idx_lifecycle_events_type_date ON customer_lifecycle_events(event_type, occurred_at DESC);
CREATE INDEX idx_lifecycle_events_revenue ON customer_lifecycle_events(revenue_impact DESC) WHERE revenue_impact > 0;

CREATE INDEX idx_cohorts_month_period ON subscription_cohorts(cohort_month, period_number);
CREATE INDEX idx_cohorts_retention ON subscription_cohorts(retention_rate DESC, cohort_month);

CREATE INDEX idx_forecasts_date_type ON revenue_forecasts(forecast_date DESC, forecast_type);
CREATE INDEX idx_forecasts_accuracy ON revenue_forecasts(model_accuracy DESC, forecast_type);

CREATE INDEX idx_campaigns_performance ON trial_campaigns(roi DESC, converted_count DESC) WHERE active = true;
CREATE INDEX idx_campaigns_dates ON trial_campaigns(created_at DESC, updated_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE subscription_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_metrics (admin and manager access)
CREATE POLICY "subscription_metrics_read_policy" ON subscription_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'analyst')
    )
  );

-- RLS Policies for trial_analytics (user can see own data, admins see all)
CREATE POLICY "trial_analytics_user_policy" ON trial_analytics
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "trial_analytics_update_policy" ON trial_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'system')
    )
  );

-- RLS Policies for customer_lifecycle_events
CREATE POLICY "lifecycle_events_read_policy" ON customer_lifecycle_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'analyst')
    )
  );

-- RLS Policies for cohort and forecast data (analytical access only)
CREATE POLICY "cohorts_read_policy" ON subscription_cohorts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'analyst')
    )
  );

CREATE POLICY "forecasts_read_policy" ON revenue_forecasts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'analyst')
    )
  );

CREATE POLICY "campaigns_read_policy" ON trial_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'marketing')
    )
  );

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_metrics_updated_at 
  BEFORE UPDATE ON subscription_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_analytics_updated_at 
  BEFORE UPDATE ON trial_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at 
  BEFORE UPDATE ON subscription_cohorts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON trial_campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();