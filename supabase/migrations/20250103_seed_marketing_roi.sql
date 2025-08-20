-- Seed data for Marketing ROI Analysis (Story 8.5)
-- This script populates initial data for testing and demonstration

-- Insert default attribution models
INSERT INTO marketing_attribution_models (clinic_id, model_name, model_type, description, attribution_windows, weight_configuration, is_default, is_active) 
SELECT 
  c.id as clinic_id,
  'First Touch Attribution',
  'first_touch',
  'Gives 100% credit to the first marketing touchpoint in the customer journey',
  '{"impression": 30, "click": 90, "conversion": 1}'::jsonb,
  '{"first_touch": 1.0}'::jsonb,
  true,
  true
FROM clinics c
WHERE NOT EXISTS (
  SELECT 1 FROM marketing_attribution_models 
  WHERE clinic_id = c.id AND model_type = 'first_touch'
);

INSERT INTO marketing_attribution_models (clinic_id, model_name, model_type, description, attribution_windows, weight_configuration, is_default, is_active) 
SELECT 
  c.id as clinic_id,
  'Last Touch Attribution',
  'last_touch',
  'Gives 100% credit to the last marketing touchpoint before conversion',
  '{"impression": 7, "click": 30, "conversion": 1}'::jsonb,
  '{"last_touch": 1.0}'::jsonb,
  false,
  true
FROM clinics c
WHERE NOT EXISTS (
  SELECT 1 FROM marketing_attribution_models 
  WHERE clinic_id = c.id AND model_type = 'last_touch'
);

INSERT INTO marketing_attribution_models (clinic_id, model_name, model_type, description, attribution_windows, weight_configuration, is_default, is_active) 
SELECT 
  c.id as clinic_id,
  'Linear Attribution',
  'linear',
  'Distributes credit equally across all touchpoints in the customer journey',
  '{"impression": 30, "click": 90, "conversion": 1}'::jsonb,
  '{"equal_weight": true}'::jsonb,
  false,
  true
FROM clinics c
WHERE NOT EXISTS (
  SELECT 1 FROM marketing_attribution_models 
  WHERE clinic_id = c.id AND model_type = 'linear'
);

-- Sample marketing touchpoints for demonstration
-- (This would typically be populated by tracking scripts)
INSERT INTO marketing_touchpoints (
  patient_id, 
  campaign_id, 
  clinic_id, 
  touchpoint_type, 
  channel, 
  source, 
  medium,
  campaign_name,
  touchpoint_value,
  position_in_journey,
  session_id,
  occurred_at
)
SELECT 
  p.id as patient_id,
  mc.id as campaign_id,
  p.clinic_id,
  'impression',
  'social_media',
  'facebook',
  'paid_social',
  'Beauty Treatment Promotion',
  0,
  1,
  'demo_session_' || p.id::text,
  now() - interval '30 days' + (random() * interval '25 days')
FROM patients p
JOIN marketing_campaigns mc ON mc.clinic_id = p.clinic_id
WHERE p.created_at > now() - interval '90 days'
  AND NOT EXISTS (
    SELECT 1 FROM marketing_touchpoints 
    WHERE patient_id = p.id AND touchpoint_type = 'impression'
  )
LIMIT 50;

-- Sample ROI calculations
INSERT INTO marketing_roi_calculations (
  campaign_id,
  clinic_id,
  attribution_model_id,
  calculation_period_start,
  calculation_period_end,
  total_investment,
  total_revenue,
  roi_percentage,
  roas,
  conversions_count,
  clicks_count,
  impressions_count,
  cost_per_click,
  cost_per_conversion,
  conversion_rate,
  customer_acquisition_cost,
  customer_lifetime_value,
  ltv_cac_ratio,
  payback_period_days,
  profit_margin
)
SELECT 
  mc.id as campaign_id,
  mc.clinic_id,
  mam.id as attribution_model_id,
  date_trunc('month', now() - interval '1 month') as calculation_period_start,
  date_trunc('month', now()) - interval '1 day' as calculation_period_end,
  (random() * 5000 + 1000)::decimal(15,2) as total_investment,
  (random() * 15000 + 3000)::decimal(15,2) as total_revenue,
  (random() * 300 + 50)::decimal(8,4) as roi_percentage,
  (random() * 5 + 2)::decimal(8,4) as roas,
  (random() * 50 + 10)::integer as conversions_count,
  (random() * 500 + 100)::integer as clicks_count,
  (random() * 5000 + 1000)::integer as impressions_count,
  (random() * 10 + 2)::decimal(10,4) as cost_per_click,
  (random() * 200 + 50)::decimal(10,2) as cost_per_conversion,
  (random() * 0.1 + 0.02)::decimal(8,4) as conversion_rate,
  (random() * 300 + 100)::decimal(10,2) as customer_acquisition_cost,
  (random() * 2000 + 800)::decimal(12,2) as customer_lifetime_value,
  (random() * 5 + 2)::decimal(8,4) as ltv_cac_ratio,
  (random() * 180 + 30)::integer as payback_period_days,
  (random() * 0.4 + 0.2)::decimal(8,4) as profit_margin
FROM marketing_campaigns mc
JOIN marketing_attribution_models mam ON mam.clinic_id = mc.clinic_id AND mam.is_default = true
WHERE mc.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM marketing_roi_calculations 
    WHERE campaign_id = mc.id 
    AND calculation_period_start = date_trunc('month', now() - interval '1 month')
  )
LIMIT 20;

-- Sample treatment ROI analysis
INSERT INTO treatment_roi_analysis (
  clinic_id,
  treatment_type,
  analysis_period_start,
  analysis_period_end,
  total_treatments_count,
  total_marketing_investment,
  total_revenue,
  total_cost,
  gross_profit,
  profit_margin,
  roi_percentage,
  average_treatment_value,
  marketing_cost_per_treatment,
  customer_acquisition_cost,
  customer_lifetime_value,
  repeat_customer_rate,
  referral_rate,
  profitability_score,
  ranking_position
)
SELECT 
  c.id as clinic_id,
  treatment_types.name as treatment_type,
  date_trunc('month', now() - interval '3 months') as analysis_period_start,
  date_trunc('month', now()) - interval '1 day' as analysis_period_end,
  (random() * 100 + 20)::integer as total_treatments_count,
  (random() * 3000 + 500)::decimal(15,2) as total_marketing_investment,
  (random() * 12000 + 3000)::decimal(15,2) as total_revenue,
  (random() * 6000 + 1500)::decimal(15,2) as total_cost,
  (random() * 6000 + 1500)::decimal(15,2) as gross_profit,
  (random() * 0.4 + 0.3)::decimal(8,4) as profit_margin,
  (random() * 200 + 100)::decimal(8,4) as roi_percentage,
  (random() * 500 + 200)::decimal(10,2) as average_treatment_value,
  (random() * 100 + 25)::decimal(10,2) as marketing_cost_per_treatment,
  (random() * 200 + 80)::decimal(10,2) as customer_acquisition_cost,
  (random() * 1500 + 600)::decimal(12,2) as customer_lifetime_value,
  (random() * 0.4 + 0.2)::decimal(8,4) as repeat_customer_rate,
  (random() * 0.3 + 0.1)::decimal(8,4) as referral_rate,
  (random() * 5 + 5)::decimal(5,2) as profitability_score,
  row_number() OVER (PARTITION BY c.id ORDER BY random() * 200 + 100 DESC) as ranking_position
FROM clinics c
CROSS JOIN (
  VALUES 
    ('Botox'),
    ('Facial Harmonization'),
    ('Laser Hair Removal'),
    ('Chemical Peeling'),
    ('Microneedling'),
    ('Hydrafacial'),
    ('Body Contouring'),
    ('Lip Filler')
) AS treatment_types(name)
WHERE NOT EXISTS (
  SELECT 1 FROM treatment_roi_analysis 
  WHERE clinic_id = c.id 
  AND treatment_type = treatment_types.name
  AND analysis_period_start = date_trunc('month', now() - interval '3 months')
);

-- Sample ROI alerts
INSERT INTO marketing_roi_alerts (
  clinic_id,
  campaign_id,
  alert_type,
  severity,
  title,
  description,
  threshold_value,
  current_value,
  recommended_action,
  alert_data
)
SELECT 
  mc.clinic_id,
  mc.id as campaign_id,
  alert_types.type as alert_type,
  alert_types.severity,
  alert_types.title,
  alert_types.description,
  alert_types.threshold_value,
  alert_types.current_value,
  alert_types.recommended_action,
  alert_types.alert_data
FROM marketing_campaigns mc
CROSS JOIN (
  VALUES 
    ('low_roi', 'medium', 'ROI Below Target', 'Campaign ROI is significantly below the 150% target threshold', 150.0, 85.5, 'Consider optimizing targeting or creative assets', '{"target_roi": 150, "improvement_suggestions": ["audience_refinement", "creative_optimization"]}'::jsonb),
    ('high_cac', 'high', 'High Customer Acquisition Cost', 'CAC has increased by 40% compared to last month', 200.0, 285.0, 'Review and optimize marketing channels and targeting', '{"previous_cac": 180, "increase_percentage": 40}'::jsonb),
    ('budget_overspend', 'critical', 'Budget Overspend Alert', 'Campaign has exceeded allocated budget by 25%', 5000.0, 6250.0, 'Immediate budget adjustment or campaign pause required', '{"budget_allocated": 5000, "spend_percentage": 125}'::jsonb)
) AS alert_types(type, severity, title, description, threshold_value, current_value, recommended_action, alert_data)
WHERE mc.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM marketing_roi_alerts 
    WHERE campaign_id = mc.id 
    AND alert_type = alert_types.type
  )
LIMIT 10;

-- Sample forecasting data
INSERT INTO marketing_roi_forecasting (
  clinic_id,
  campaign_id,
  forecast_type,
  forecast_period_start,
  forecast_period_end,
  historical_data_period,
  forecasting_model,
  predicted_values,
  confidence_intervals,
  accuracy_metrics
)
SELECT 
  mc.clinic_id,
  mc.id as campaign_id,
  'roi_projection',
  date_trunc('month', now()),
  date_trunc('month', now() + interval '3 months') - interval '1 day',
  90, -- 90 days of historical data
  'linear_regression',
  jsonb_build_object(
    'month_1_roi', round((random() * 100 + 120)::numeric, 2),
    'month_2_roi', round((random() * 100 + 130)::numeric, 2),
    'month_3_roi', round((random() * 100 + 140)::numeric, 2),
    'projected_revenue', round((random() * 10000 + 5000)::numeric, 2),
    'projected_investment', round((random() * 3000 + 1500)::numeric, 2)
  ),
  jsonb_build_object(
    'lower_bound', round((random() * 50 + 100)::numeric, 2),
    'upper_bound', round((random() * 50 + 180)::numeric, 2),
    'confidence_level', 0.95
  ),
  jsonb_build_object(
    'mae', round((random() * 10 + 5)::numeric, 2),
    'rmse', round((random() * 15 + 8)::numeric, 2),
    'r_squared', round((random() * 0.3 + 0.7)::numeric, 3)
  )
FROM marketing_campaigns mc
WHERE mc.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM marketing_roi_forecasting 
    WHERE campaign_id = mc.id 
    AND forecast_type = 'roi_projection'
  )
LIMIT 15;

-- Verify the data insertion
SELECT 
  'Attribution Models' as table_name, 
  count(*) as records_inserted 
FROM marketing_attribution_models
UNION ALL
SELECT 
  'ROI Calculations', 
  count(*) 
FROM marketing_roi_calculations
UNION ALL
SELECT 
  'Marketing Touchpoints', 
  count(*) 
FROM marketing_touchpoints
UNION ALL
SELECT 
  'ROI Alerts', 
  count(*) 
FROM marketing_roi_alerts
UNION ALL
SELECT 
  'ROI Forecasting', 
  count(*) 
FROM marketing_roi_forecasting
UNION ALL
SELECT 
  'Treatment ROI Analysis', 
  count(*) 
FROM treatment_roi_analysis;