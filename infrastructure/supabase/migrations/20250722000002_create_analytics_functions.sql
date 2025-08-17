-- Migration: Analytics Functions & Procedures
-- Story: STORY-SUB-002 - Analytics Dashboard & Trial Management  
-- Date: 2025-07-22
-- Description: Real-time analytics functions and AI-powered trial management procedures

-- Function to calculate comprehensive real-time subscription metrics
CREATE OR REPLACE FUNCTION calculate_subscription_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS subscription_metrics AS $$
DECLARE
  result subscription_metrics;
  prev_mrr DECIMAL(12,2);
  trial_stats RECORD;
BEGIN
  -- Get previous period MRR for growth rate calculation
  SELECT mrr_amount INTO prev_mrr 
  FROM subscription_metrics 
  WHERE date = target_date - INTERVAL '1 month'
  LIMIT 1;
  
  -- Get trial conversion statistics
  SELECT 
    COUNT(*) FILTER (WHERE trial_status = 'converted' AND DATE(converted_at) = target_date) as converted_trials,
    COUNT(*) FILTER (WHERE DATE(trial_started_at) = target_date) as new_trials
  INTO trial_stats
  FROM trial_analytics
  WHERE trial_started_at >= target_date - INTERVAL '30 days';
  
  -- Calculate comprehensive subscription metrics
  SELECT 
    gen_random_uuid() as id,
    target_date as date,
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE DATE(created_at) = target_date) as new_subscriptions,
    COUNT(*) FILTER (WHERE status = 'cancelled' AND DATE(cancelled_at) = target_date) as churned_subscriptions,
    COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) as mrr_amount,
    COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) * 12 as arr_amount,
    COALESCE(AVG(amount) FILTER (WHERE status = 'active'), 0) as average_revenue_per_user,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status IN ('active', 'cancelled')) > 0 THEN 
        COUNT(*) FILTER (WHERE status = 'cancelled' AND DATE(cancelled_at) = target_date)::DECIMAL / 
        NULLIF(COUNT(*) FILTER (WHERE status IN ('active', 'cancelled')), 0)
      ELSE 0 
    END as churn_rate,
    CASE 
      WHEN prev_mrr > 0 THEN 
        (COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) - prev_mrr) / prev_mrr
      ELSE 0 
    END as growth_rate,
    CASE 
      WHEN trial_stats.new_trials > 0 THEN 
        trial_stats.converted_trials::DECIMAL / trial_stats.new_trials
      ELSE 0 
    END as trial_conversion_rate,
    NOW() as created_at,
    NOW() as updated_at
  INTO result
  FROM subscriptions 
  WHERE created_at <= target_date + INTERVAL '1 day';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trial conversion probability using AI insights and behavioral analysis
CREATE OR REPLACE FUNCTION update_trial_conversion_probability(trial_id UUID)
RETURNS VOID AS $$
DECLARE
  engagement_score DECIMAL;
  time_factor DECIMAL;
  usage_score DECIMAL;
  support_factor DECIMAL;
  email_factor DECIMAL;
  probability DECIMAL;
  trial_record RECORD;
BEGIN
  -- Get trial record with user engagement data
  SELECT 
    ta.*,
    EXTRACT(DAYS FROM (ta.trial_expires_at - NOW()))::INTEGER as days_remaining,
    EXTRACT(DAYS FROM (NOW() - ta.trial_started_at))::INTEGER as days_active,
    COALESCE(ta.emails_opened, 0) as emails_opened,
    COALESCE(ta.campaigns_sent, 0) as campaigns_sent,
    COALESCE(ta.support_tickets_count, 0) as support_tickets,
    COALESCE(ta.feature_usage_score, 0) as usage_score
  INTO trial_record
  FROM trial_analytics ta 
  WHERE ta.id = trial_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate engagement score based on recent activity
  engagement_score := CASE 
    WHEN trial_record.last_engagement_at > NOW() - INTERVAL '6 hours' THEN 0.95
    WHEN trial_record.last_engagement_at > NOW() - INTERVAL '24 hours' THEN 0.80
    WHEN trial_record.last_engagement_at > NOW() - INTERVAL '48 hours' THEN 0.65
    WHEN trial_record.last_engagement_at > NOW() - INTERVAL '1 week' THEN 0.35
    WHEN trial_record.last_engagement_at IS NULL THEN 0.10
    ELSE 0.05
  END;
  
  -- Calculate time urgency factor (pressure increases conversion)
  time_factor := CASE 
    WHEN trial_record.days_remaining <= 0 THEN 0.20  -- Expired trials have low probability
    WHEN trial_record.days_remaining = 1 THEN 0.90   -- Last day urgency
    WHEN trial_record.days_remaining <= 3 THEN 0.75  -- High urgency
    WHEN trial_record.days_remaining <= 7 THEN 0.60  -- Medium urgency
    WHEN trial_record.days_remaining <= 14 THEN 0.45 -- Low urgency
    ELSE 0.30 -- Very early in trial
  END;
  
  -- Usage intensity score (higher usage = higher conversion probability)
  usage_score := LEAST(trial_record.usage_score * 0.85 + 0.15, 1.0);
  
  -- Support engagement factor (some support good, too much bad)
  support_factor := CASE 
    WHEN trial_record.support_tickets = 0 THEN 0.50  -- No engagement
    WHEN trial_record.support_tickets BETWEEN 1 AND 2 THEN 0.75  -- Good engagement
    WHEN trial_record.support_tickets BETWEEN 3 AND 5 THEN 0.60  -- Moderate issues
    ELSE 0.35 -- Too many issues
  END;
  
  -- Email engagement factor
  email_factor := CASE 
    WHEN trial_record.campaigns_sent = 0 THEN 0.50
    WHEN trial_record.emails_opened::DECIMAL / NULLIF(trial_record.campaigns_sent, 0) >= 0.7 THEN 0.85
    WHEN trial_record.emails_opened::DECIMAL / NULLIF(trial_record.campaigns_sent, 0) >= 0.4 THEN 0.65
    WHEN trial_record.emails_opened::DECIMAL / NULLIF(trial_record.campaigns_sent, 0) >= 0.2 THEN 0.45
    ELSE 0.25
  END;
  
  -- Calculate weighted probability with some randomization for real-world variance
  probability := (
    engagement_score * 0.30 +     -- Most important factor
    usage_score * 0.25 +          -- Product usage intensity  
    time_factor * 0.20 +          -- Urgency factor
    email_factor * 0.15 +         -- Email engagement
    support_factor * 0.10         -- Support interaction
  );
  
  -- Add slight randomization to simulate real-world uncertainty (±5%)
  probability := probability + (RANDOM() - 0.5) * 0.10;
  
  -- Ensure probability stays within valid bounds
  probability := GREATEST(LEAST(probability, 0.98), 0.02);
  
  -- Update trial analytics record with calculated probability and factors
  UPDATE trial_analytics 
  SET 
    conversion_probability = probability,
    conversion_factors = jsonb_build_object(
      'engagement_score', engagement_score,
      'time_factor', time_factor,  
      'usage_score', usage_score,
      'support_factor', support_factor,
      'email_factor', email_factor,
      'days_remaining', trial_record.days_remaining,
      'days_active', trial_record.days_active,
      'calculated_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = trial_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate cohort analysis data for retention insights
CREATE OR REPLACE FUNCTION generate_cohort_analysis(start_date DATE DEFAULT CURRENT_DATE - INTERVAL '12 months')
RETURNS VOID AS $$
DECLARE
  cohort_month DATE;
  period_num INTEGER;
  cohort_data RECORD;
BEGIN
  -- Clear existing cohort data for regeneration
  DELETE FROM subscription_cohorts WHERE cohort_month >= start_date;
  
  -- Generate cohort data for each month since start_date
  FOR cohort_month IN 
    SELECT generate_series(start_date, CURRENT_DATE, '1 month'::interval)::DATE
  LOOP
    -- Generate data for each period (0-12 months)
    FOR period_num IN 0..12 LOOP
      
      -- Calculate cohort metrics for this month and period
      SELECT 
        COUNT(*) as customers_count,
        COALESCE(SUM(s.amount), 0) as revenue_amount,
        COUNT(*) FILTER (WHERE s.status = 'active')::DECIMAL / NULLIF(COUNT(*), 0) as retention_rate,
        COUNT(*) FILTER (WHERE s.status = 'cancelled') as churn_count,
        COUNT(*) FILTER (WHERE s.amount > lag_amount) as upgrade_count,
        COUNT(*) FILTER (WHERE s.amount < lag_amount AND s.amount > 0) as downgrade_count,
        AVG(
          CASE WHEN s.status = 'active' 
          THEN s.amount * 12 -- Simple LTV approximation
          ELSE 0 END
        ) as average_ltv
      INTO cohort_data
      FROM subscriptions s
      LEFT JOIN LATERAL (
        SELECT amount as lag_amount 
        FROM subscriptions s2 
        WHERE s2.user_id = s.user_id 
        AND s2.created_at < s.created_at 
        ORDER BY s2.created_at DESC 
        LIMIT 1
      ) prev ON true
      WHERE DATE_TRUNC('month', s.created_at) = cohort_month
      AND s.created_at <= cohort_month + (period_num || ' months')::INTERVAL
      AND (s.cancelled_at IS NULL OR s.cancelled_at > cohort_month + (period_num || ' months')::INTERVAL);
      
      -- Insert cohort data if customers exist for this cohort/period
      IF cohort_data.customers_count > 0 THEN
        INSERT INTO subscription_cohorts (
          cohort_month, 
          period_number, 
          customers_count, 
          revenue_amount, 
          retention_rate,
          churn_count,
          upgrade_count,
          downgrade_count,
          average_ltv
        ) VALUES (
          cohort_month,
          period_num,
          cohort_data.customers_count,
          cohort_data.revenue_amount,
          COALESCE(cohort_data.retention_rate, 0),
          COALESCE(cohort_data.churn_count, 0),
          COALESCE(cohort_data.upgrade_count, 0),
          COALESCE(cohort_data.downgrade_count, 0),
          COALESCE(cohort_data.average_ltv, 0)
        );
      END IF;
      
    END LOOP;
  END LOOP;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate revenue forecasts using linear regression
CREATE OR REPLACE FUNCTION generate_revenue_forecast(
  forecast_months INTEGER DEFAULT 6,
  model_version VARCHAR(50) DEFAULT 'v1.0'
)
RETURNS VOID AS $$
DECLARE
  historical_data RECORD;
  forecast_date DATE;
  predicted_mrr DECIMAL;
  confidence_lower DECIMAL;
  confidence_upper DECIMAL;
  month_counter INTEGER;
BEGIN
  -- Calculate historical trend for MRR forecasting
  SELECT 
    COALESCE(
      REGR_SLOPE(mrr_amount, EXTRACT(EPOCH FROM date)::INTEGER / 86400), 
      0
    ) as slope,
    COALESCE(
      REGR_INTERCEPT(mrr_amount, EXTRACT(EPOCH FROM date)::INTEGER / 86400), 
      0
    ) as intercept,
    COALESCE(AVG(mrr_amount), 0) as avg_mrr,
    COALESCE(STDDEV(mrr_amount), 0) as stddev_mrr
  INTO historical_data
  FROM subscription_metrics 
  WHERE date >= CURRENT_DATE - INTERVAL '12 months'
  AND mrr_amount > 0;
  
  -- Generate forecasts for the requested number of months
  FOR month_counter IN 1..forecast_months LOOP
    forecast_date := CURRENT_DATE + (month_counter || ' months')::INTERVAL;
    
    -- Calculate predicted MRR using linear regression
    predicted_mrr := historical_data.slope * (EXTRACT(EPOCH FROM forecast_date)::INTEGER / 86400) + historical_data.intercept;
    
    -- Ensure positive prediction with minimum baseline
    predicted_mrr := GREATEST(predicted_mrr, historical_data.avg_mrr * 0.5);
    
    -- Calculate confidence intervals (±1.96 standard deviations for 95% confidence)
    confidence_lower := predicted_mrr - (1.96 * historical_data.stddev_mrr);
    confidence_upper := predicted_mrr + (1.96 * historical_data.stddev_mrr);
    
    -- Ensure confidence bounds are reasonable
    confidence_lower := GREATEST(confidence_lower, predicted_mrr * 0.6);
    confidence_upper := LEAST(confidence_upper, predicted_mrr * 1.4);
    
    -- Insert MRR forecast
    INSERT INTO revenue_forecasts (
      forecast_date,
      forecast_type,
      predicted_value,
      confidence_interval,
      model_version,
      model_accuracy,
      input_parameters
    ) VALUES (
      forecast_date,
      'mrr',
      predicted_mrr,
      jsonb_build_object('lower', confidence_lower, 'upper', confidence_upper),
      model_version,
      0.75, -- Initial accuracy estimate
      jsonb_build_object(
        'slope', historical_data.slope,
        'intercept', historical_data.intercept,
        'data_points', 12,
        'method', 'linear_regression'
      )
    ) ON CONFLICT (forecast_date, forecast_type, model_version) 
    DO UPDATE SET
      predicted_value = EXCLUDED.predicted_value,
      confidence_interval = EXCLUDED.confidence_interval,
      input_parameters = EXCLUDED.input_parameters,
      created_at = NOW();
    
    -- Generate ARR forecast (MRR * 12)
    INSERT INTO revenue_forecasts (
      forecast_date,
      forecast_type,
      predicted_value,
      confidence_interval,
      model_version,
      model_accuracy,
      input_parameters
    ) VALUES (
      forecast_date,
      'arr',
      predicted_mrr * 12,
      jsonb_build_object('lower', confidence_lower * 12, 'upper', confidence_upper * 12),
      model_version,
      0.75,
      jsonb_build_object(
        'base_mrr', predicted_mrr,
        'method', 'mrr_multiplication'
      )
    ) ON CONFLICT (forecast_date, forecast_type, model_version)
    DO UPDATE SET
      predicted_value = EXCLUDED.predicted_value,
      confidence_interval = EXCLUDED.confidence_interval,
      input_parameters = EXCLUDED.input_parameters,
      created_at = NOW();
      
  END LOOP;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily subscription metrics (automated)
CREATE OR REPLACE FUNCTION update_daily_subscription_metrics()
RETURNS VOID AS $$
DECLARE
  today_metrics subscription_metrics;
BEGIN
  -- Calculate today's metrics
  SELECT * INTO today_metrics FROM calculate_subscription_metrics(CURRENT_DATE);
  
  -- Insert or update today's metrics
  INSERT INTO subscription_metrics (
    date, total_subscriptions, active_subscriptions, new_subscriptions,
    churned_subscriptions, mrr_amount, arr_amount, average_revenue_per_user,
    churn_rate, growth_rate, trial_conversion_rate
  ) VALUES (
    today_metrics.date, today_metrics.total_subscriptions, today_metrics.active_subscriptions,
    today_metrics.new_subscriptions, today_metrics.churned_subscriptions, today_metrics.mrr_amount,
    today_metrics.arr_amount, today_metrics.average_revenue_per_user, today_metrics.churn_rate,
    today_metrics.growth_rate, today_metrics.trial_conversion_rate
  ) ON CONFLICT (date) DO UPDATE SET
    total_subscriptions = EXCLUDED.total_subscriptions,
    active_subscriptions = EXCLUDED.active_subscriptions,
    new_subscriptions = EXCLUDED.new_subscriptions,
    churned_subscriptions = EXCLUDED.churned_subscriptions,
    mrr_amount = EXCLUDED.mrr_amount,
    arr_amount = EXCLUDED.arr_amount,
    average_revenue_per_user = EXCLUDED.average_revenue_per_user,
    churn_rate = EXCLUDED.churn_rate,
    growth_rate = EXCLUDED.growth_rate,
    trial_conversion_rate = EXCLUDED.trial_conversion_rate,
    updated_at = NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to automatically update trial conversion probabilities
CREATE OR REPLACE FUNCTION trigger_update_trial_probability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversion probability when trial data changes
  PERFORM update_trial_conversion_probability(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update trial probabilities
CREATE TRIGGER auto_update_trial_probability
  AFTER INSERT OR UPDATE ON trial_analytics
  FOR EACH ROW 
  WHEN (NEW.trial_status = 'active')
  EXECUTE FUNCTION trigger_update_trial_probability();

-- Function to create lifecycle event (for external triggers)
CREATE OR REPLACE FUNCTION create_lifecycle_event(
  p_user_id UUID,
  p_event_type lifecycle_event_type,
  p_event_data JSONB DEFAULT '{}',
  p_subscription_id UUID DEFAULT NULL,
  p_revenue_impact DECIMAL(12,2) DEFAULT 0.00,
  p_source_attribution TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO customer_lifecycle_events (
    user_id, event_type, event_data, subscription_id, 
    revenue_impact, source_attribution
  ) VALUES (
    p_user_id, p_event_type, p_event_data, p_subscription_id,
    p_revenue_impact, p_source_attribution
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;