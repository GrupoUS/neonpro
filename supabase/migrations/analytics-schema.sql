-- =========================================
-- NeonPro Analytics Schema V1.0
-- Advanced Analytics Views and Functions
-- 
-- Creates optimized views and materialized views
-- for healthcare analytics and reporting
-- =========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =========================================
-- ANALYTICS VIEWS
-- =========================================

-- Patient Metrics Comprehensive View
CREATE OR REPLACE VIEW patient_metrics_view AS
SELECT 
    -- Patient Demographics
    p.id,
    p.email,
    p.full_name,
    p.date_of_birth,
    EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
    p.gender,
    p.phone,
    p.created_at,
    p.updated_at,
    
    -- Activity Metrics
    CASE 
        WHEN p.updated_at > (CURRENT_DATE - INTERVAL '90 days') THEN 'active'
        WHEN p.updated_at > (CURRENT_DATE - INTERVAL '365 days') THEN 'inactive'
        ELSE 'dormant'
    END as status,
    
    -- Appointment Metrics
    COALESCE(a.total_appointments, 0) as total_appointments,
    COALESCE(a.completed_appointments, 0) as completed_appointments,
    COALESCE(a.cancelled_appointments, 0) as cancelled_appointments,
    COALESCE(a.no_show_appointments, 0) as no_show_appointments,
    
    -- Treatment Metrics
    COALESCE(t.total_treatments, 0) as total_treatments,
    COALESCE(t.completed_treatments, 0) as completed_treatments,
    COALESCE(t.active_treatments, 0) as active_treatments,
    
    -- Financial Metrics
    COALESCE(f.total_spent, 0) as total_spent,
    COALESCE(f.total_paid, 0) as total_paid,
    COALESCE(f.pending_amount, 0) as pending_amount,
    COALESCE(f.avg_ticket, 0) as avg_ticket,
    
    -- Satisfaction Metrics
    COALESCE(s.avg_satisfaction, 0) as avg_satisfaction,
    COALESCE(s.total_evaluations, 0) as total_evaluations,
    COALESCE(s.last_evaluation, NULL) as last_evaluation,
    
    -- Engagement Metrics
    CASE 
        WHEN p.created_at > (CURRENT_DATE - INTERVAL '30 days') THEN 'new'
        WHEN a.last_appointment > (CURRENT_DATE - INTERVAL '90 days') THEN 'engaged'
        WHEN a.last_appointment > (CURRENT_DATE - INTERVAL '365 days') THEN 'at_risk'
        ELSE 'lost'
    END as engagement_status,
    
    -- Dates
    a.first_appointment,
    a.last_appointment,
    
    -- Lifetime Value Calculation
    CASE 
        WHEN p.created_at > (CURRENT_DATE - INTERVAL '365 days') THEN 
            COALESCE(f.total_spent, 0) * 2 -- Projeção simples para novos pacientes
        ELSE 
            COALESCE(f.total_spent, 0)
    END as estimated_lifetime_value

FROM profiles p

-- Appointment aggregations
LEFT JOIN (
    SELECT 
        patient_id,
        COUNT(*) as total_appointments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_appointments,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments,
        COUNT(*) FILTER (WHERE status = 'no_show') as no_show_appointments,
        MIN(date) as first_appointment,
        MAX(date) as last_appointment
    FROM appointments 
    GROUP BY patient_id
) a ON p.id = a.patient_id

-- Treatment aggregations  
LEFT JOIN (
    SELECT 
        patient_id,
        COUNT(*) as total_treatments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_treatments,
        COUNT(*) FILTER (WHERE status IN ('active', 'in_progress')) as active_treatments
    FROM treatments
    GROUP BY patient_id
) t ON p.id = t.patient_id

-- Financial aggregations
LEFT JOIN (
    SELECT 
        patient_id,
        SUM(total_amount) as total_spent,
        SUM(paid_amount) as total_paid,
        SUM(total_amount - paid_amount) as pending_amount,
        AVG(total_amount) as avg_ticket
    FROM invoices
    WHERE status != 'cancelled'
    GROUP BY patient_id
) f ON p.id = f.patient_id

-- Satisfaction aggregations
LEFT JOIN (
    SELECT 
        patient_id,
        AVG(overall_rating) as avg_satisfaction,
        COUNT(*) as total_evaluations,
        MAX(created_at) as last_evaluation
    FROM patient_evaluations
    GROUP BY patient_id
) s ON p.id = s.patient_id;

-- Clinical Performance View
CREATE OR REPLACE VIEW clinical_performance_view AS
SELECT 
    -- Professional Info
    pr.id as professional_id,
    pr.full_name as professional_name,
    pr.specialty,
    
    -- Period aggregation (last 30 days)
    DATE_TRUNC('month', CURRENT_DATE) as period,
    
    -- Appointment Metrics
    COUNT(a.*) as total_appointments,
    COUNT(a.*) FILTER (WHERE a.status = 'completed') as completed_appointments,
    COUNT(a.*) FILTER (WHERE a.status = 'cancelled') as cancelled_appointments,
    COUNT(a.*) FILTER (WHERE a.status = 'no_show') as no_show_appointments,
    
    -- Treatment Metrics
    COUNT(t.*) as total_treatments,
    COUNT(t.*) FILTER (WHERE t.status = 'completed') as completed_treatments,
    AVG(t.duration_minutes) as avg_treatment_duration,
    
    -- Financial Performance
    SUM(i.total_amount) as total_revenue,
    AVG(i.total_amount) as avg_ticket,
    SUM(i.paid_amount) as collected_revenue,
    
    -- Satisfaction Metrics
    AVG(e.overall_rating) as avg_satisfaction,
    AVG(e.professional_rating) as avg_professional_rating,
    COUNT(e.*) as total_evaluations,
    
    -- Efficiency Metrics
    ROUND(
        COUNT(a.*) FILTER (WHERE a.status = 'completed')::numeric / 
        NULLIF(COUNT(a.*), 0) * 100, 2
    ) as completion_rate,
    
    ROUND(
        COUNT(a.*) FILTER (WHERE a.status = 'no_show')::numeric / 
        NULLIF(COUNT(a.*), 0) * 100, 2
    ) as no_show_rate,
    
    -- Quality Metrics
    ROUND(
        COUNT(t.*) FILTER (WHERE t.status = 'completed')::numeric / 
        NULLIF(COUNT(t.*), 0) * 100, 2
    ) as treatment_success_rate

FROM profiles pr
LEFT JOIN appointments a ON pr.id = a.professional_id 
    AND a.date >= (CURRENT_DATE - INTERVAL '30 days')
LEFT JOIN treatments t ON a.id = t.appointment_id
LEFT JOIN invoices i ON a.patient_id = i.patient_id 
    AND i.created_at >= (CURRENT_DATE - INTERVAL '30 days')
LEFT JOIN patient_evaluations e ON a.patient_id = e.patient_id 
    AND e.created_at >= (CURRENT_DATE - INTERVAL '30 days')

WHERE pr.role = 'professional'
GROUP BY pr.id, pr.full_name, pr.specialty;

-- Treatment Effectiveness View
CREATE OR REPLACE VIEW treatment_effectiveness_view AS
SELECT 
    -- Treatment Info
    t.id as treatment_id,
    t.type as treatment_type,
    t.name as treatment_name,
    t.status,
    t.start_date,
    t.end_date,
    t.duration_minutes,
    
    -- Patient Info
    p.id as patient_id,
    p.full_name as patient_name,
    p.age,
    p.gender,
    
    -- Professional Info
    pr.id as professional_id,
    pr.full_name as professional_name,
    pr.specialty,
    
    -- Results Metrics
    tb.baseline_score,
    tr.result_score,
    (tr.result_score - tb.baseline_score) as improvement_score,
    
    CASE 
        WHEN tr.result_score > tb.baseline_score THEN 'improved'
        WHEN tr.result_score = tb.baseline_score THEN 'stable'
        ELSE 'declined'
    END as outcome_category,
    
    -- Satisfaction
    e.overall_rating,
    e.treatment_rating,
    e.result_satisfaction,
    
    -- Financial
    i.total_amount as treatment_cost,
    i.paid_amount as amount_paid,
    
    -- Time Metrics
    CASE 
        WHEN t.end_date IS NOT NULL THEN 
            t.end_date - t.start_date
        ELSE 
            CURRENT_DATE - t.start_date
    END as treatment_duration_days

FROM treatments t
JOIN profiles p ON t.patient_id = p.id
JOIN appointments a ON t.appointment_id = a.id
JOIN profiles pr ON a.professional_id = pr.id
LEFT JOIN treatment_baselines tb ON t.id = tb.treatment_id
LEFT JOIN treatment_results tr ON t.id = tr.treatment_id
LEFT JOIN patient_evaluations e ON t.patient_id = e.patient_id 
    AND e.treatment_id = t.id
LEFT JOIN invoices i ON t.patient_id = i.patient_id 
    AND i.treatment_id = t.id;

-- =========================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =========================================

-- Daily KPIs Materialized View (Refreshed Daily)
CREATE MATERIALIZED VIEW daily_kpis AS
SELECT 
    DATE(created_at) as date,
    'patients' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as new_today,
    
    -- Calculate moving averages
    AVG(COUNT(*)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg,
    
    AVG(COUNT(*)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW  
    ) as thirty_day_avg

FROM profiles 
WHERE role = 'patient'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
    DATE(date) as date,
    'appointments' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE date::date = CURRENT_DATE) as new_today,
    
    AVG(COUNT(*)) OVER (
        ORDER BY DATE(date) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg,
    
    AVG(COUNT(*)) OVER (
        ORDER BY DATE(date) 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as thirty_day_avg

FROM appointments
GROUP BY DATE(date)

UNION ALL

SELECT 
    DATE(created_at) as date,
    'revenue' as metric_type,
    SUM(total_amount)::int as total_count,
    SUM(total_amount) FILTER (WHERE created_at::date = CURRENT_DATE)::int as new_today,
    
    AVG(SUM(total_amount)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg,
    
    AVG(SUM(total_amount)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as thirty_day_avg

FROM invoices
WHERE status != 'cancelled'
GROUP BY DATE(created_at);

-- Monthly Trends Materialized View
CREATE MATERIALIZED VIEW monthly_trends AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    
    -- Patient Metrics
    COUNT(*) FILTER (WHERE role = 'patient') as new_patients,
    COUNT(*) FILTER (WHERE role = 'professional') as new_professionals,
    
    -- Growth Rates
    (COUNT(*) FILTER (WHERE role = 'patient') - 
     LAG(COUNT(*) FILTER (WHERE role = 'patient')) OVER (ORDER BY DATE_TRUNC('month', created_at))
    )::float / NULLIF(LAG(COUNT(*) FILTER (WHERE role = 'patient')) OVER (ORDER BY DATE_TRUNC('month', created_at)), 0) * 100 as patient_growth_rate

FROM profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- =========================================
-- ANALYTICS FUNCTIONS
-- =========================================

-- Function to execute dynamic analytics queries safely
CREATE OR REPLACE FUNCTION execute_analytics_query(
    query_text TEXT,
    query_params JSONB DEFAULT '[]'::jsonb
) RETURNS TABLE(result JSONB) AS $$
DECLARE
    safe_query TEXT;
BEGIN
    -- Basic SQL injection prevention
    IF query_text ~* '(delete|drop|alter|create|insert|update|grant|revoke)' THEN
        RAISE EXCEPTION 'Unsafe query operation detected';
    END IF;
    
    -- Execute read-only analytics query
    RETURN QUERY EXECUTE query_text;
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Analytics query failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW daily_kpis;
    REFRESH MATERIALIZED VIEW monthly_trends;
    
    -- Log the refresh
    INSERT INTO system_logs (action, details, created_at)
    VALUES ('analytics_refresh', 'Materialized views refreshed', NOW());
    
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Analytics performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON appointments(professional_id, date);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_status ON treatments(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_created ON invoices(patient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_patient_created ON patient_evaluations(patient_id, created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_complex 
ON appointments(patient_id, professional_id, status, date);

CREATE INDEX IF NOT EXISTS idx_analytics_treatments_complex 
ON treatments(patient_id, appointment_id, status, start_date);

-- =========================================
-- AUTOMATED REFRESH SCHEDULE
-- =========================================

-- Note: In production, schedule this via cron or pg_cron:
-- SELECT cron.schedule('refresh-analytics', '0 1 * * *', 'SELECT refresh_analytics_views();');

COMMENT ON VIEW patient_metrics_view IS 'Comprehensive patient analytics with demographics, activity, and financial metrics';
COMMENT ON VIEW clinical_performance_view IS 'Professional performance metrics and KPIs';
COMMENT ON VIEW treatment_effectiveness_view IS 'Treatment outcomes and effectiveness analysis';
COMMENT ON MATERIALIZED VIEW daily_kpis IS 'Daily aggregated KPIs for dashboard display';
COMMENT ON MATERIALIZED VIEW monthly_trends IS 'Monthly trends and growth rate analysis';
COMMENT ON FUNCTION refresh_analytics_views() IS 'Refreshes all materialized views for analytics';