-- ============================================================================
-- Advanced Cohort Analysis & Forecasting Functions for NeonPro Analytics
-- ============================================================================
-- 
-- This migration creates comprehensive SQL functions for:
-- 1. Cohort analysis with retention, revenue, and churn metrics
-- 2. Time series forecasting data preparation
-- 3. Statistical analysis functions for insights
-- 4. Performance-optimized aggregation queries
--
-- These functions support the advanced analytics features in STORY-SUB-002
-- enabling cohort heatmaps, revenue forecasting, and predictive insights.
-- ============================================================================

-- Function: Get cohort user count for specific date range and dimension
CREATE OR REPLACE FUNCTION get_cohort_user_count(
    p_start_date DATE,
    p_end_date DATE,
    p_dimension TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Get user count based on cohort dimension
    IF p_dimension = 'subscription_start' THEN
        SELECT COUNT(DISTINCT user_id)
        INTO user_count
        FROM subscriptions
        WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
        AND status IN ('active', 'trialing', 'past_due');
        
    ELSIF p_dimension = 'trial_start' THEN
        SELECT COUNT(DISTINCT user_id)
        INTO user_count
        FROM trial_analytics
        WHERE DATE(trial_started_at) BETWEEN p_start_date AND p_end_date;
        
    ELSE -- 'first_login'
        SELECT COUNT(DISTINCT auth.users.id)
        INTO user_count
        FROM auth.users
        JOIN profiles ON auth.users.id = profiles.id
        WHERE DATE(profiles.created_at) BETWEEN p_start_date AND p_end_date;
    END IF;
    
    RETURN COALESCE(user_count, 0);
END;
$$;

-- Function: Calculate cohort period metrics (retention, revenue, churn)
CREATE OR REPLACE FUNCTION calculate_cohort_period_metrics(
    p_cohort_start DATE,
    p_cohort_end DATE,
    p_period_date DATE,
    p_dimension TEXT,
    p_include_revenue BOOLEAN DEFAULT true
)
RETURNS TABLE (
    active_users INTEGER,
    churned_users INTEGER,
    revenue DECIMAL(12,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH cohort_users AS (
        -- Define the cohort based on dimension
        SELECT DISTINCT 
            CASE 
                WHEN p_dimension = 'subscription_start' THEN s.user_id
                WHEN p_dimension = 'trial_start' THEN ta.user_id
                ELSE p.id
            END as user_id
        FROM 
            CASE 
                WHEN p_dimension = 'subscription_start' THEN subscriptions s
                WHEN p_dimension = 'trial_start' THEN trial_analytics ta
                ELSE profiles p
            END
        WHERE 
            CASE 
                WHEN p_dimension = 'subscription_start' THEN DATE(s.created_at) BETWEEN p_cohort_start AND p_cohort_end
                WHEN p_dimension = 'trial_start' THEN DATE(ta.trial_started_at) BETWEEN p_cohort_start AND p_cohort_end
                ELSE DATE(p.created_at) BETWEEN p_cohort_start AND p_cohort_end
            END
    ),
    period_activity AS (
        -- Check user activity in the specific period
        SELECT 
            cu.user_id,
            CASE 
                WHEN s.status IN ('active', 'trialing') AND DATE(s.current_period_end) >= p_period_date THEN 1
                ELSE 0
            END as is_active,
            CASE 
                WHEN s.status = 'cancelled' AND DATE(s.cancelled_at) <= p_period_date THEN 1
                ELSE 0
            END as is_churned,
            CASE 
                WHEN p_include_revenue AND s.status = 'active' THEN COALESCE(s.amount, 0)
                ELSE 0
            END as period_revenue
        FROM cohort_users cu
        LEFT JOIN subscriptions s ON cu.user_id = s.user_id
    )
    SELECT 
        SUM(pa.is_active)::INTEGER as active_users,
        SUM(pa.is_churned)::INTEGER as churned_users,
        SUM(pa.period_revenue)::DECIMAL(12,2) as revenue
    FROM period_activity pa;
END;
$$;

-- Function: Calculate cohort revenue progression over time
CREATE OR REPLACE FUNCTION calculate_cohort_revenue_progression(
    p_cohort_start DATE,
    p_cohort_end DATE,
    p_periods INTEGER,
    p_granularity TEXT
)
RETURNS TABLE (
    period_number INTEGER,
    period_date DATE,
    revenue DECIMAL(12,2),
    active_users INTEGER,
    cumulative_revenue DECIMAL(12,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_date DATE := p_cohort_start;
    period_interval INTERVAL;
    running_total DECIMAL(12,2) := 0;
BEGIN
    -- Set interval based on granularity
    period_interval := 
        CASE p_granularity
            WHEN 'daily' THEN INTERVAL '1 day'
            WHEN 'weekly' THEN INTERVAL '1 week'
            ELSE INTERVAL '1 month'
        END;
    
    -- Generate revenue progression for each period
    FOR i IN 0..p_periods LOOP
        current_date := p_cohort_start + (i * period_interval);
        
        -- Calculate metrics for this period
        WITH period_metrics AS (
            SELECT 
                active_users as users,
                revenue as period_rev
            FROM calculate_cohort_period_metrics(
                p_cohort_start, 
                p_cohort_end, 
                current_date, 
                'subscription_start', 
                true
            )
        )
        SELECT 
            i as period_number,
            current_date as period_date,
            pm.period_rev as revenue,
            pm.users as active_users,
            (running_total + pm.period_rev) as cumulative_revenue
        FROM period_metrics pm;
        
        -- Update running total
        running_total := running_total + (SELECT revenue FROM period_metrics);
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Function: Get forecasting data for machine learning models
CREATE OR REPLACE FUNCTION get_forecasting_data(
    p_metric TEXT,
    p_frequency TEXT,
    p_extended BOOLEAN DEFAULT false
)
RETURNS TABLE (
    date TEXT,
    value DECIMAL(12,2),
    exogenous JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    date_interval INTERVAL;
    lookback_days INTEGER;
BEGIN
    -- Set parameters based on frequency
    IF p_frequency = 'daily' THEN
        date_interval := INTERVAL '1 day';
        lookback_days := CASE WHEN p_extended THEN 365 ELSE 90 END;
    ELSIF p_frequency = 'weekly' THEN
        date_interval := INTERVAL '1 week';
        lookback_days := CASE WHEN p_extended THEN 730 ELSE 180 END;
    ELSE -- monthly
        date_interval := INTERVAL '1 month';
        lookback_days := CASE WHEN p_extended THEN 1095 ELSE 365 END;
    END IF;
    
    -- Generate time series data based on metric type
    RETURN QUERY
    WITH time_series AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * lookback_days,
            CURRENT_DATE,
            date_interval
        )::DATE as series_date
    ),
    aggregated_data AS (
        SELECT 
            ts.series_date,
            CASE p_metric
                WHEN 'subscriptions' THEN (
                    SELECT COUNT(*)::DECIMAL(12,2)
                    FROM subscriptions s
                    WHERE DATE(s.created_at) = ts.series_date
                    AND s.status IN ('active', 'trialing', 'past_due')
                )
                WHEN 'revenue' THEN (
                    SELECT COALESCE(SUM(s.amount), 0)::DECIMAL(12,2)
                    FROM subscriptions s
                    WHERE DATE(s.current_period_start) = ts.series_date
                    AND s.status = 'active'
                )
                WHEN 'mrr' THEN (
                    SELECT COALESCE(SUM(s.amount), 0)::DECIMAL(12,2)
                    FROM subscriptions s
                    WHERE s.status = 'active'
                    AND DATE(s.created_at) <= ts.series_date
                    AND (s.cancelled_at IS NULL OR DATE(s.cancelled_at) > ts.series_date)
                )
                WHEN 'churn_rate' THEN (
                    SELECT 
                        CASE 
                            WHEN COUNT(*) > 0 THEN 
                                (COUNT(*) FILTER (WHERE s.status = 'cancelled' AND DATE(s.cancelled_at) = ts.series_date))::DECIMAL(12,2) / COUNT(*)::DECIMAL(12,2) * 100
                            ELSE 0
                        END
                    FROM subscriptions s
                    WHERE DATE(s.created_at) <= ts.series_date
                )
                ELSE 0
            END as metric_value,
            -- Add exogenous variables (simplified examples)
            jsonb_build_object(
                'day_of_week', EXTRACT(DOW FROM ts.series_date),
                'month', EXTRACT(MONTH FROM ts.series_date),
                'quarter', EXTRACT(QUARTER FROM ts.series_date),
                'is_weekend', CASE WHEN EXTRACT(DOW FROM ts.series_date) IN (0, 6) THEN 1 ELSE 0 END,
                'marketing_spend', (RANDOM() * 1000 + 500)::INTEGER, -- Placeholder
                'support_tickets', (RANDOM() * 20 + 5)::INTEGER, -- Placeholder
                'feature_releases', CASE WHEN RANDOM() > 0.8 THEN 1 ELSE 0 END -- Placeholder
            ) as exog_vars
        FROM time_series ts
    )
    SELECT 
        ad.series_date::TEXT as date,
        ad.metric_value as value,
        ad.exog_vars as exogenous
    FROM aggregated_data ad
    WHERE ad.metric_value IS NOT NULL
    ORDER BY ad.series_date;
END;
$$;

-- Function: Calculate statistical correlation between metrics
CREATE OR REPLACE FUNCTION calculate_correlation_matrix(
    p_metrics TEXT[],
    p_days_back INTEGER DEFAULT 90
)
RETURNS TABLE (
    metric_x TEXT,
    metric_y TEXT,
    correlation_coefficient DECIMAL(5,4),
    p_value DECIMAL(10,8),
    significance_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    metric_x TEXT;
    metric_y TEXT;
    correlation DECIMAL(5,4);
    n INTEGER;
    t_stat DECIMAL;
    p_val DECIMAL(10,8);
BEGIN
    -- Calculate correlations for each pair of metrics
    FOR i IN 1..array_length(p_metrics, 1) LOOP
        FOR j IN i..array_length(p_metrics, 1) LOOP
            metric_x := p_metrics[i];
            metric_y := p_metrics[j];
            
            -- Get correlation data
            WITH metric_data AS (
                SELECT 
                    date_val,
                    -- Get values for metric X
                    CASE metric_x
                        WHEN 'subscriptions' THEN (
                            SELECT COUNT(*)::DECIMAL
                            FROM subscriptions s
                            WHERE DATE(s.created_at) = date_val
                        )
                        WHEN 'revenue' THEN (
                            SELECT COALESCE(SUM(s.amount), 0)
                            FROM subscriptions s
                            WHERE DATE(s.current_period_start) = date_val
                            AND s.status = 'active'
                        )
                        ELSE 0
                    END as x_value,
                    -- Get values for metric Y
                    CASE metric_y
                        WHEN 'subscriptions' THEN (
                            SELECT COUNT(*)::DECIMAL
                            FROM subscriptions s
                            WHERE DATE(s.created_at) = date_val
                        )
                        WHEN 'revenue' THEN (
                            SELECT COALESCE(SUM(s.amount), 0)
                            FROM subscriptions s
                            WHERE DATE(s.current_period_start) = date_val
                            AND s.status = 'active'
                        )
                        ELSE 0
                    END as y_value
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '1 day' * p_days_back,
                    CURRENT_DATE,
                    INTERVAL '1 day'
                )::DATE as date_val
            ),
            correlation_calc AS (
                SELECT 
                    COUNT(*) as n,
                    AVG(x_value) as mean_x,
                    AVG(y_value) as mean_y,
                    STDDEV(x_value) as std_x,
                    STDDEV(y_value) as std_y,
                    SUM((x_value - AVG(x_value) OVER()) * (y_value - AVG(y_value) OVER())) / (COUNT(*) - 1) as covariance
                FROM metric_data
                WHERE x_value IS NOT NULL AND y_value IS NOT NULL
            )
            SELECT 
                cc.n,
                CASE 
                    WHEN cc.std_x > 0 AND cc.std_y > 0 THEN 
                        cc.covariance / (cc.std_x * cc.std_y)
                    ELSE 0
                END
            INTO n, correlation
            FROM correlation_calc cc;
            
            -- Calculate t-statistic and p-value for significance testing
            IF n > 2 AND correlation IS NOT NULL THEN
                t_stat := correlation * SQRT((n - 2) / (1 - correlation * correlation));
                -- Simplified p-value calculation (in production, use proper statistical functions)
                p_val := CASE 
                    WHEN ABS(t_stat) > 2.576 THEN 0.01  -- 99% confidence
                    WHEN ABS(t_stat) > 1.96 THEN 0.05   -- 95% confidence
                    WHEN ABS(t_stat) > 1.645 THEN 0.10  -- 90% confidence
                    ELSE 0.50
                END;
            ELSE
                p_val := 1.0;
            END IF;
            
            -- Return correlation result
            metric_x := p_metrics[i];
            metric_y := p_metrics[j];
            correlation_coefficient := COALESCE(correlation, 0);
            p_value := p_val;
            significance_level := 
                CASE 
                    WHEN p_val <= 0.01 THEN 'Very Significant (p≤0.01)'
                    WHEN p_val <= 0.05 THEN 'Significant (p≤0.05)'
                    WHEN p_val <= 0.10 THEN 'Marginally Significant (p≤0.10)'
                    ELSE 'Not Significant (p>0.10)'
                END;
            
            RETURN NEXT;
        END LOOP;
    END LOOP;
    
    RETURN;
END;
$$;

-- Function: Detect anomalies in time series data
CREATE OR REPLACE FUNCTION detect_metric_anomalies(
    p_metric TEXT,
    p_days_back INTEGER DEFAULT 30,
    p_std_threshold DECIMAL DEFAULT 2.0
)
RETURNS TABLE (
    date_value DATE,
    actual_value DECIMAL(12,2),
    expected_value DECIMAL(12,2),
    z_score DECIMAL(8,4),
    is_anomaly BOOLEAN,
    anomaly_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH daily_metrics AS (
        SELECT 
            date_val,
            CASE p_metric
                WHEN 'subscriptions' THEN (
                    SELECT COUNT(*)::DECIMAL(12,2)
                    FROM subscriptions s
                    WHERE DATE(s.created_at) = date_val
                )
                WHEN 'revenue' THEN (
                    SELECT COALESCE(SUM(s.amount), 0)::DECIMAL(12,2)
                    FROM subscriptions s
                    WHERE DATE(s.current_period_start) = date_val
                    AND s.status = 'active'
                )
                ELSE 0
            END as value
        FROM generate_series(
            CURRENT_DATE - INTERVAL '1 day' * p_days_back,
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date_val
    ),
    metric_stats AS (
        SELECT 
            AVG(value) as mean_value,
            STDDEV(value) as std_value
        FROM daily_metrics
        WHERE value IS NOT NULL
    ),
    anomaly_detection AS (
        SELECT 
            dm.date_val,
            dm.value,
            ms.mean_value as expected,
            CASE 
                WHEN ms.std_value > 0 THEN 
                    (dm.value - ms.mean_value) / ms.std_value
                ELSE 0
            END as z_score
        FROM daily_metrics dm
        CROSS JOIN metric_stats ms
        WHERE dm.value IS NOT NULL
    )
    SELECT 
        ad.date_val as date_value,
        ad.value as actual_value,
        ad.expected as expected_value,
        ad.z_score,
        (ABS(ad.z_score) > p_std_threshold) as is_anomaly,
        CASE 
            WHEN ad.z_score > p_std_threshold THEN 'Positive Anomaly (Above Normal)'
            WHEN ad.z_score < -p_std_threshold THEN 'Negative Anomaly (Below Normal)'
            ELSE 'Normal'
        END as anomaly_type
    FROM anomaly_detection ad
    ORDER BY ad.date_val DESC;
END;
$$;

-- Function: Generate business insights from analytics data
CREATE OR REPLACE FUNCTION generate_analytics_insights(
    p_analysis_period INTEGER DEFAULT 30
)
RETURNS TABLE (
    insight_category TEXT,
    insight_type TEXT,
    insight_message TEXT,
    confidence_score INTEGER,
    recommended_action TEXT,
    priority_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_growth DECIMAL;
    revenue_growth DECIMAL;
    churn_trend DECIMAL;
    conversion_rate DECIMAL;
BEGIN
    -- Calculate key growth metrics
    WITH current_period AS (
        SELECT 
            COUNT(*) as current_subscriptions,
            AVG(amount) as current_revenue
        FROM subscriptions
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * p_analysis_period
        AND status IN ('active', 'trialing')
    ),
    previous_period AS (
        SELECT 
            COUNT(*) as previous_subscriptions,
            AVG(amount) as previous_revenue
        FROM subscriptions
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * (p_analysis_period * 2)
        AND created_at < CURRENT_DATE - INTERVAL '1 day' * p_analysis_period
        AND status IN ('active', 'trialing')
    )
    SELECT 
        CASE 
            WHEN pp.previous_subscriptions > 0 THEN 
                ((cp.current_subscriptions - pp.previous_subscriptions)::DECIMAL / pp.previous_subscriptions) * 100
            ELSE 0
        END,
        CASE 
            WHEN pp.previous_revenue > 0 THEN 
                ((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue) * 100
            ELSE 0
        END
    INTO subscription_growth, revenue_growth
    FROM current_period cp, previous_period pp;
    
    -- Calculate churn trend
    SELECT 
        (COUNT(*) FILTER (WHERE status = 'cancelled' AND cancelled_at >= CURRENT_DATE - INTERVAL '1 day' * p_analysis_period)::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * p_analysis_period), 0)) * 100
    INTO churn_trend
    FROM subscriptions;
    
    -- Calculate trial conversion rate
    SELECT 
        (COUNT(*) FILTER (WHERE converted_at IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100
    INTO conversion_rate
    FROM trial_analytics
    WHERE trial_started_at >= CURRENT_DATE - INTERVAL '1 day' * p_analysis_period;
    
    -- Generate insights based on metrics
    
    -- Subscription Growth Insights
    IF subscription_growth > 20 THEN
        insight_category := 'Growth';
        insight_type := 'positive';
        insight_message := FORMAT('Excellent subscription growth of %.1f%% in the last %s days', subscription_growth, p_analysis_period);
        confidence_score := 95;
        recommended_action := 'Scale marketing efforts and ensure infrastructure can handle growth';
        priority_level := 'High';
        RETURN NEXT;
    ELSIF subscription_growth < -10 THEN
        insight_category := 'Growth';
        insight_type := 'warning';
        insight_message := FORMAT('Subscription growth declined by %.1f%% in the last %s days', ABS(subscription_growth), p_analysis_period);
        confidence_score := 90;
        recommended_action := 'Investigate causes and implement retention strategies';
        priority_level := 'Critical';
        RETURN NEXT;
    END IF;
    
    -- Revenue Insights
    IF revenue_growth > 15 THEN
        insight_category := 'Revenue';
        insight_type := 'positive';
        insight_message := FORMAT('Revenue per subscriber increased by %.1f%%', revenue_growth);
        confidence_score := 92;
        recommended_action := 'Analyze successful pricing strategies and replicate';
        priority_level := 'Medium';
        RETURN NEXT;
    ELSIF revenue_growth < -15 THEN
        insight_category := 'Revenue';
        insight_type := 'warning';
        insight_message := FORMAT('Revenue per subscriber decreased by %.1f%%', ABS(revenue_growth));
        confidence_score := 88;
        recommended_action := 'Review pricing strategy and customer satisfaction';
        priority_level := 'High';
        RETURN NEXT;
    END IF;
    
    -- Churn Insights
    IF churn_trend > 5 THEN
        insight_category := 'Retention';
        insight_type := 'critical';
        insight_message := FORMAT('Churn rate increased to %.1f%% - immediate attention required', churn_trend);
        confidence_score := 96;
        recommended_action := 'Implement customer success initiatives and exit surveys';
        priority_level := 'Critical';
        RETURN NEXT;
    ELSIF churn_trend < 2 THEN
        insight_category := 'Retention';
        insight_type := 'positive';
        insight_message := FORMAT('Low churn rate of %.1f%% indicates strong customer satisfaction', churn_trend);
        confidence_score := 89;
        recommended_action := 'Document and replicate retention best practices';
        priority_level := 'Low';
        RETURN NEXT;
    END IF;
    
    -- Conversion Rate Insights
    IF conversion_rate > 15 THEN
        insight_category := 'Conversion';
        insight_type := 'positive';
        insight_message := FORMAT('Trial conversion rate of %.1f%% exceeds industry benchmarks', conversion_rate);
        confidence_score := 93;
        recommended_action := 'Increase trial acquisition with current conversion funnel';
        priority_level := 'Medium';
        RETURN NEXT;
    ELSIF conversion_rate < 5 THEN
        insight_category := 'Conversion';
        insight_type := 'warning';
        insight_message := FORMAT('Low trial conversion rate of %.1f%% needs optimization', conversion_rate);
        confidence_score := 91;
        recommended_action := 'A/B test trial experience and onboarding flow';
        priority_level := 'High';
        RETURN NEXT;
    END IF;
    
    RETURN;
END;
$$;

-- Grant permissions for these functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_status ON subscriptions(created_at, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status, current_period_end);
CREATE INDEX IF NOT EXISTS idx_trial_analytics_started ON trial_analytics(trial_started_at, user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_metrics_date_mrr ON subscription_metrics(date DESC, mrr_amount);

-- Add helpful comments
COMMENT ON FUNCTION get_cohort_user_count IS 'Returns user count for cohort analysis based on specified dimension and date range';
COMMENT ON FUNCTION calculate_cohort_period_metrics IS 'Calculates retention, churn, and revenue metrics for cohort analysis periods';
COMMENT ON FUNCTION calculate_cohort_revenue_progression IS 'Generates revenue progression data for cohort lifetime value analysis';
COMMENT ON FUNCTION get_forecasting_data IS 'Prepares time series data with exogenous variables for ML forecasting models';
COMMENT ON FUNCTION calculate_correlation_matrix IS 'Calculates statistical correlations between business metrics with significance testing';
COMMENT ON FUNCTION detect_metric_anomalies IS 'Detects anomalies in time series data using statistical methods';
COMMENT ON FUNCTION generate_analytics_insights IS 'Generates automated business insights and recommendations from analytics data';